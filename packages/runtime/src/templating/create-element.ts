import { Constructable, IIndexable } from '../../kernel';
import { buildTemplateDefinition, isTargetedInstruction, TargetedInstruction, TargetedInstructionType, TemplateDefinition } from '../definitions';
import { DOM, INode } from '../dom';
import { IRenderContext, IView, IViewFactory } from '../lifecycle';
import { ICustomElementType } from './custom-element';
import { IRenderingEngine, ITemplate } from './lifecycle-render';

type ChildType = RenderPlan | string | INode;

export function createElement(tagOrType: string | Constructable, props?: IIndexable, children?: ArrayLike<ChildType>): RenderPlan {
  if (typeof tagOrType === 'string') {
    return createElementForTag(tagOrType, props, children);
  } else {
    return createElementForType(tagOrType as ICustomElementType, props, children);
  }
}

export class RenderPlan {
  private lazyDefinition: TemplateDefinition;

  constructor(
    private readonly node: INode,
    private readonly instructions: TargetedInstruction[][],
    private readonly dependencies: ReadonlyArray<any>
  ) {}

  public get definition(): TemplateDefinition {
    return this.lazyDefinition || (this.lazyDefinition =
      buildTemplateDefinition(null, null, this.node, null, typeof this.node === 'string', null, this.instructions, this.dependencies));
  }

  public getElementTemplate(engine: IRenderingEngine, Type?: ICustomElementType): ITemplate {
    return engine.getElementTemplate(this.definition, Type);
  }

  public createView(engine: IRenderingEngine, parentContext?: IRenderContext): IView {
    return this.getViewFactory(engine, parentContext).create();
  }

  public getViewFactory(engine: IRenderingEngine, parentContext?: IRenderContext): IViewFactory {
    return engine.getViewFactory(this.definition, parentContext);
  }

  /*@internal*/
  public mergeInto(parent: INode, instructions: TargetedInstruction[][], dependencies: any[]): void {
    DOM.appendChild(parent, this.node);
    instructions.push(...this.instructions);
    dependencies.push(...this.dependencies);
  }
}

function createElementForTag(tagName: string, props?: IIndexable, children?: ArrayLike<ChildType>): RenderPlan {
  const instructions: TargetedInstruction[] = [];
  const allInstructions = [];
  const dependencies = [];
  const element = DOM.createElement(tagName);
  let hasInstructions = false;

  if (props) {
    Object.keys(props)
      .forEach(to => {
        const value = props[to];

        if (isTargetedInstruction(value)) {
          hasInstructions = true;
          instructions.push(value);
        } else {
          DOM.setAttribute(element, to, value);
        }
      });
  }

  if (hasInstructions) {
    DOM.setAttribute(element, 'class', 'au');
    allInstructions.push(instructions);
  }

  if (children) {
    addChildren(element, children, allInstructions, dependencies);
  }

  return new RenderPlan(element, allInstructions, dependencies);
}

function createElementForType(Type: ICustomElementType, props?: IIndexable, children?: ArrayLike<ChildType>): RenderPlan {
  const tagName = Type.description.name;
  const instructions: TargetedInstruction[] = [];
  const allInstructions = [instructions];
  const dependencies = [];
  const childInstructions = [];
  const bindables = Type.description.bindables;
  const element = DOM.createElement(tagName);

  DOM.setAttribute(element, 'class', 'au');

  if (!dependencies.includes(Type)) {
    dependencies.push(Type);
  }

  instructions.push({
    type: TargetedInstructionType.hydrateElement,
    res: tagName,
    instructions: childInstructions
  });

  if (props) {
    Object.keys(props)
      .forEach(to => {
        const value = props[to];

        if (isTargetedInstruction(value)) {
          childInstructions.push(value);
        } else {
          const bindable = bindables[to];

          if (bindable) {
            childInstructions.push({
              type: TargetedInstructionType.setProperty,
              to,
              value
            });
          } else {
            childInstructions.push({
              type: TargetedInstructionType.setAttribute,
              to,
              value
            });
          }
        }
      });
  }

  if (children) {
    addChildren(element, children, allInstructions, dependencies);
  }

  return new RenderPlan(element, allInstructions, dependencies);
}

function addChildren(parent: INode, children: ArrayLike<ChildType>, allInstructions: TargetedInstruction[][], dependencies: any[]): void {
  for (let i = 0, ii = children.length; i < ii; ++i) {
    const current = children[i];

    if (typeof current === 'string') {
      DOM.appendChild(parent, DOM.createTextNode(current));
    } else if (DOM.isNodeInstance(current)) {
      DOM.appendChild(parent, current);
    } else {
      current.mergeInto(parent, allInstructions, dependencies);
    }
  }
}
