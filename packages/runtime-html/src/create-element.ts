import { Constructable, IRegistry, Tracer } from '@aurelia/kernel';
import {
  buildTemplateDefinition,
  HydrateElementInstruction,
  ICustomElementType,
  IDOM,
  INode,
  IRenderContext,
  IRenderingEngine,
  ITemplate,
  IView,
  IViewFactory,
  TargetedInstructionType,
  TemplateDefinition
} from '@aurelia/runtime';
import { HTMLTargetedInstruction, isHTMLTargetedInstruction } from './definitions';
import { SetAttributeInstruction } from './instructions';

const slice = Array.prototype.slice;

export function createElement<T extends INode = Node>(dom: IDOM<T>, tagOrType: string | Constructable, props?: Record<string, string | HTMLTargetedInstruction>, children?: ArrayLike<unknown>): RenderPlan<T> {
  if (typeof tagOrType === 'string') {
    return createElementForTag(dom, tagOrType, props, children);
  } else {
    return createElementForType(dom, tagOrType as ICustomElementType<T>, props, children);
  }
}

export class RenderPlan<T extends INode = Node> {
  private readonly dom: IDOM<T>;
  private readonly dependencies: ReadonlyArray<IRegistry>;
  private readonly instructions: HTMLTargetedInstruction[][];
  private readonly node: T;

  private lazyDefinition: TemplateDefinition;

  constructor(
    dom: IDOM<T>,
    node: T,
    instructions: HTMLTargetedInstruction[][],
    dependencies: ReadonlyArray<IRegistry>
  ) {
    this.dom = dom;
    this.dependencies = dependencies;
    this.instructions = instructions;
    this.node = node;
  }

  public get definition(): TemplateDefinition {
    return this.lazyDefinition || (this.lazyDefinition =
      buildTemplateDefinition(null, null, this.node, null, typeof this.node === 'string', null, this.instructions, this.dependencies));
  }

  public getElementTemplate(engine: IRenderingEngine, Type?: ICustomElementType<T>): ITemplate<T> {
    return engine.getElementTemplate(this.dom, this.definition, Type);
  }

  public createView(engine: IRenderingEngine, parentContext?: IRenderContext): IView {
    return this.getViewFactory(engine, parentContext).create();
  }

  public getViewFactory(engine: IRenderingEngine, parentContext?: IRenderContext): IViewFactory {
    return engine.getViewFactory(this.dom, this.definition, parentContext);
  }

  /** @internal */
  public mergeInto(parent: T, instructions: HTMLTargetedInstruction[][], dependencies: IRegistry[]): void {
    this.dom.appendChild(parent, this.node);
    instructions.push(...this.instructions);
    dependencies.push(...this.dependencies);
  }
}

function createElementForTag<T extends INode>(dom: IDOM<T>, tagName: string, props?: Record<string, string | HTMLTargetedInstruction>, children?: ArrayLike<unknown>): RenderPlan<T> {
  if (Tracer.enabled) { Tracer.enter('createElementForTag', slice.call(arguments)); }
  const instructions: HTMLTargetedInstruction[] = [];
  const allInstructions: HTMLTargetedInstruction[][] = [];
  const dependencies: IRegistry[] = [];
  const element = dom.createElement(tagName);
  let hasInstructions = false;

  if (props) {
    Object.keys(props)
      .forEach(to => {
        const value = props[to];

        if (isHTMLTargetedInstruction(value)) {
          hasInstructions = true;
          instructions.push(value);
        } else {
          dom.setAttribute(element, to, value);
        }
      });
  }

  if (hasInstructions) {
    dom.makeTarget(element);
    allInstructions.push(instructions);
  }

  if (children) {
    addChildren(dom, element, children, allInstructions, dependencies);
  }

  if (Tracer.enabled) { Tracer.leave(); }
  return new RenderPlan(dom, element, allInstructions, dependencies);
}

function createElementForType<T extends INode>(dom: IDOM<T>, Type: ICustomElementType<T>, props?: object, children?: ArrayLike<unknown>): RenderPlan<T> {
  if (Tracer.enabled) { Tracer.enter('createElementForType', slice.call(arguments)); }
  const tagName = Type.description.name;
  const instructions: HTMLTargetedInstruction[] = [];
  const allInstructions = [instructions];
  const dependencies: IRegistry[] = [];
  const childInstructions: HTMLTargetedInstruction[] = [];
  const bindables = Type.description.bindables;
  const element = dom.createElement(tagName);

  dom.makeTarget(element);

  if (!dependencies.includes(Type)) {
    dependencies.push(Type);
  }

  instructions.push(new HydrateElementInstruction(tagName, childInstructions));

  if (props) {
    Object.keys(props)
      .forEach(to => {
        const value: HTMLTargetedInstruction | string = props[to];

        if (isHTMLTargetedInstruction(value)) {
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
            childInstructions.push(new SetAttributeInstruction(value, to));
          }
        }
      });
  }

  if (children) {
    addChildren(dom, element, children, allInstructions, dependencies);
  }

  if (Tracer.enabled) { Tracer.leave(); }
  return new RenderPlan<T>(dom, element, allInstructions, dependencies);
}

function addChildren<T extends INode>(dom: IDOM<T>, parent: T, children: ArrayLike<unknown>, allInstructions: HTMLTargetedInstruction[][], dependencies: IRegistry[]): void {
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
          (current as RenderPlan<T>).mergeInto(parent, allInstructions, dependencies);
        }
    }
  }
}
