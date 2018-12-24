import { Constructable, IRegistry, Tracer } from '@aurelia/kernel';
import {
  buildTemplateDefinition,
  isTargetedInstruction,
  TargetedInstruction,
  TargetedInstructionType,
  TemplateDefinition
} from '../definitions';
import { IDOM } from '../dom';
import { INode } from '../dom.interfaces';
import { IRenderContext, IView, IViewFactory } from '../lifecycle';
import { ICustomElementType } from '../resources/custom-element';
import { IRenderingEngine, ITemplate } from './lifecycle-render';

const slice = Array.prototype.slice;

export function createElement(dom: IDOM, tagOrType: string | Constructable, props?: Record<string, string | TargetedInstruction>, children?: ArrayLike<unknown>): RenderPlan {
  if (typeof tagOrType === 'string') {
    return createElementForTag(dom, tagOrType, props, children);
  } else {
    return createElementForType(dom, tagOrType as ICustomElementType, props, children);
  }
}

export class RenderPlan {
  private readonly dom: IDOM;
  private readonly dependencies: ReadonlyArray<IRegistry>;
  private readonly instructions: TargetedInstruction[][];
  private readonly node: INode;

  private lazyDefinition: TemplateDefinition;

  constructor(dom: IDOM, node: INode, instructions: TargetedInstruction[][], dependencies: ReadonlyArray<IRegistry>) {
    this.dom = dom;
    this.dependencies = dependencies;
    this.instructions = instructions;
    this.node = node;
  }

  public get definition(): TemplateDefinition {
    return this.lazyDefinition || (this.lazyDefinition =
      buildTemplateDefinition(null, null, this.node, null, typeof this.node === 'string', null, this.instructions, this.dependencies));
  }

  public getElementTemplate(engine: IRenderingEngine, Type?: ICustomElementType): ITemplate {
    return engine.getElementTemplate(this.dom, this.definition, Type);
  }

  public createView(engine: IRenderingEngine, parentContext?: IRenderContext): IView {
    return this.getViewFactory(engine, parentContext).create();
  }

  public getViewFactory(engine: IRenderingEngine, parentContext?: IRenderContext): IViewFactory {
    return engine.getViewFactory(this.dom, this.definition, parentContext);
  }

  /** @internal */
  public mergeInto(parent: INode, instructions: TargetedInstruction[][], dependencies: IRegistry[]): void {
    this.dom.appendChild(parent, this.node);
    instructions.push(...this.instructions);
    dependencies.push(...this.dependencies);
  }
}

function createElementForTag(dom: IDOM, tagName: string, props?: Record<string, string | TargetedInstruction>, children?: ArrayLike<unknown>): RenderPlan {
  if (Tracer.enabled) { Tracer.enter('createElementForTag', slice.call(arguments)); }
  const instructions: TargetedInstruction[] = [];
  const allInstructions: TargetedInstruction[][] = [];
  const dependencies: IRegistry[] = [];
  const element = dom.createElement(tagName);
  let hasInstructions = false;

  if (props) {
    Object.keys(props)
      .forEach(to => {
        const value = props[to];

        if (isTargetedInstruction(value)) {
          hasInstructions = true;
          instructions.push(value);
        } else {
          dom.setAttribute(element, to, value);
        }
      });
  }

  if (hasInstructions) {
    dom.setAttribute(element, 'class', 'au');
    allInstructions.push(instructions);
  }

  if (children) {
    addChildren(dom, element, children, allInstructions, dependencies);
  }

  if (Tracer.enabled) { Tracer.leave(); }
  return new RenderPlan(dom, element, allInstructions, dependencies);
}

function createElementForType(dom: IDOM, Type: ICustomElementType, props?: object, children?: ArrayLike<unknown>): RenderPlan {
  if (Tracer.enabled) { Tracer.enter('createElementForType', slice.call(arguments)); }
  const tagName = Type.description.name;
  const instructions: TargetedInstruction[] = [];
  const allInstructions = [instructions];
  const dependencies: IRegistry[] = [];
  const childInstructions: TargetedInstruction[] = [];
  const bindables = Type.description.bindables;
  const element = dom.createElement(tagName);

  dom.setAttribute(element, 'class', 'au');

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
        const value: TargetedInstruction | string = props[to];

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
    addChildren(dom, element, children, allInstructions, dependencies);
  }

  if (Tracer.enabled) { Tracer.leave(); }
  return new RenderPlan(dom, element, allInstructions, dependencies);
}

function addChildren(dom: IDOM, parent: INode, children: ArrayLike<unknown>, allInstructions: TargetedInstruction[][], dependencies: IRegistry[]): void {
  for (let i = 0, ii = children.length; i < ii; ++i) {
    const current = children[i];

    switch (typeof current) {
      case 'string':
        dom.appendChild(parent, dom.createTextNode(current));
        break;
      case 'object':
        if (dom.isNodeInstance(current)) {
          dom.appendChild(parent, current);
        } else if ('mergeInto' in (current as RenderPlan)) {
          (current as RenderPlan).mergeInto(parent, allInstructions, dependencies);
        }
    }
  }
}
