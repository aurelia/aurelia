import { Constructable, IRegistry, Tracer } from '@aurelia/kernel';
import { buildTemplateDefinition, isTargetedInstruction, ITargetedInstruction, TargetedInstruction, TargetedInstructionType, TemplateDefinition } from '../definitions';
import { DOM } from '../dom';
import { INode } from '../dom.interfaces';
import { IRenderContext, IView, IViewFactory } from '../lifecycle';
import { ICustomElementType } from './custom-element';
import { IRenderingEngine, ITemplate } from './lifecycle-render';

const slice = Array.prototype.slice;

export function createElement(tagOrType: string | Constructable, props?: object, children?: ArrayLike<unknown>): RenderPlan {
  if (typeof tagOrType === 'string') {
    return createElementForTag(tagOrType, props as Record<string, string | ITargetedInstruction>, children);
  } else {
    return createElementForType(tagOrType as ICustomElementType, props, children);
  }
}

export class RenderPlan {
  private readonly dependencies: ReadonlyArray<IRegistry>;
  private readonly instructions: TargetedInstruction[][];
  private readonly node: INode;

  private lazyDefinition: TemplateDefinition;

  constructor(node: INode, instructions: TargetedInstruction[][], dependencies: ReadonlyArray<IRegistry>) {
    this.dependencies = dependencies;
    this.instructions = instructions;
    this.node = node;
  }

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

  /** @internal */
  public mergeInto(parent: INode, instructions: TargetedInstruction[][], dependencies: IRegistry[]): void {
    DOM.appendChild(parent, this.node);
    instructions.push(...this.instructions);
    dependencies.push(...this.dependencies);
  }
}

function createElementForTag(tagName: string, props?: Record<string, string | ITargetedInstruction>, children?: ArrayLike<unknown>): RenderPlan {
  if (Tracer.enabled) { Tracer.enter('createElementForTag', slice.call(arguments)); }
  const instructions: TargetedInstruction[] = [];
  const allInstructions: TargetedInstruction[][] = [];
  const dependencies: IRegistry[] = [];
  const element = DOM.createElement(tagName);
  let hasInstructions = false;

  if (props) {
    Object.keys(props)
      .forEach(to => {
        const value = props[to];

        if (isTargetedInstruction(value as ITargetedInstruction)) {
          hasInstructions = true;
          instructions.push(value as TargetedInstruction);
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

  if (Tracer.enabled) { Tracer.leave(); }
  return new RenderPlan(element, allInstructions, dependencies);
}

function createElementForType(Type: ICustomElementType, props?: object, children?: ArrayLike<unknown>): RenderPlan {
  if (Tracer.enabled) { Tracer.enter('createElementForType', slice.call(arguments)); }
  const tagName = Type.description.name;
  const instructions: TargetedInstruction[] = [];
  const allInstructions = [instructions];
  const dependencies: IRegistry[] = [];
  const childInstructions: TargetedInstruction[] = [];
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
        const value: unknown = props[to];

        if (isTargetedInstruction(value as ITargetedInstruction)) {
          childInstructions.push(value as TargetedInstruction);
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

  if (Tracer.enabled) { Tracer.leave(); }
  return new RenderPlan(element, allInstructions, dependencies);
}

function addChildren(parent: INode, children: ArrayLike<unknown>, allInstructions: TargetedInstruction[][], dependencies: IRegistry[]): void {
  for (let i = 0, ii = children.length; i < ii; ++i) {
    const current = children[i];

    switch (typeof current) {
      case 'string':
        DOM.appendChild(parent, DOM.createTextNode(current));
        break;
      case 'object':
        if (DOM.isNodeInstance(current)) {
          DOM.appendChild(parent, current);
        } else if ('mergeInto' in (current as RenderPlan)) {
          (current as RenderPlan).mergeInto(parent, allInstructions, dependencies);
        }
    }
  }
}
