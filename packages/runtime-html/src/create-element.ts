import { Constructable, IRegistry, Tracer } from '@aurelia/kernel';
import {
  buildTemplateDefinition,
  HydrateElementInstruction,
  ICustomElementType,
  IDOM,
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

export function createElement(dom: IDOM, tagOrType: string | Constructable, props?: Record<string, string | HTMLTargetedInstruction>, children?: ArrayLike<unknown>): RenderPlan {
  if (typeof tagOrType === 'string') {
    return createElementForTag(dom, tagOrType, props, children);
  } else {
    return createElementForType(dom, tagOrType as ICustomElementType, props, children);
  }
}

export class RenderPlan {
  private readonly dom: IDOM;
  private readonly dependencies: ReadonlyArray<IRegistry>;
  private readonly instructions: HTMLTargetedInstruction[][];
  private readonly node: Node;

  private lazyDefinition: TemplateDefinition;

  constructor(dom: IDOM, node: Node, instructions: HTMLTargetedInstruction[][], dependencies: ReadonlyArray<IRegistry>) {
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
  public mergeInto(parent: Node, instructions: HTMLTargetedInstruction[][], dependencies: IRegistry[]): void {
    this.dom.appendChild(parent, this.node);
    instructions.push(...this.instructions);
    dependencies.push(...this.dependencies);
  }
}

function createElementForTag(dom: IDOM, tagName: string, props?: Record<string, string | HTMLTargetedInstruction>, children?: ArrayLike<unknown>): RenderPlan {
  if (Tracer.enabled) { Tracer.enter('createElementForTag', slice.call(arguments)); }
  const instructions: HTMLTargetedInstruction[] = [];
  const allInstructions: HTMLTargetedInstruction[][] = [];
  const dependencies: IRegistry[] = [];
  const element = dom.createElement(tagName) as HTMLElement;
  let hasInstructions = false;

  if (props) {
    Object.keys(props)
      .forEach(to => {
        const value = props[to];

        if (isHTMLTargetedInstruction(value)) {
          hasInstructions = true;
          instructions.push(value);
        } else {
          element.setAttribute(to, value);
        }
      });
  }

  if (hasInstructions) {
    element.className = 'au';
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
  const instructions: HTMLTargetedInstruction[] = [];
  const allInstructions = [instructions];
  const dependencies: IRegistry[] = [];
  const childInstructions: HTMLTargetedInstruction[] = [];
  const bindables = Type.description.bindables;
  const element = dom.createElement(tagName) as HTMLElement;

  element.className = 'au';

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
  return new RenderPlan(dom, element, allInstructions, dependencies);
}

function addChildren(dom: IDOM, parent: Node, children: ArrayLike<unknown>, allInstructions: HTMLTargetedInstruction[][], dependencies: IRegistry[]): void {
  for (let i = 0, ii = children.length; i < ii; ++i) {
    const current = children[i];

    switch (typeof current) {
      case 'string':
        parent.appendChild(dom.createTextNode(current) as Text);
        break;
      case 'object':
        if (dom.isNodeInstance(current)) {
          parent.appendChild(current as Node);
        } else if ('mergeInto' in (current as RenderPlan)) {
          (current as RenderPlan).mergeInto(parent, allInstructions, dependencies);
        }
    }
  }
}
