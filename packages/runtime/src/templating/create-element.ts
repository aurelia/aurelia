import { Constructable, PLATFORM } from '@aurelia/kernel';
import { DOM, INode } from '../dom';
import { ICustomElementType } from './custom-element';
import {
  TargetedInstruction,
  TargetedInstructionType,
  TemplateDefinition
} from './instructions';
import { IRenderContext } from './render-context';
import { IRenderingEngine } from './rendering-engine';
import { ITemplate } from './template';
import { IView, IViewFactory } from './view';

type ChildType = PotentialRenderable | string | INode;

export function createElement(tagOrType: string | Constructable, props?: any, children?: ArrayLike<ChildType>): PotentialRenderable {
  if (typeof tagOrType === 'string') {
    return createElementForTag(tagOrType, props, children);
  } else {
    return createElementForType(tagOrType as ICustomElementType, props, children);
  }
}

export class PotentialRenderable {
  private lazyDefinition: TemplateDefinition;

  constructor(
    private readonly node: INode,
    private readonly instructions: TargetedInstruction[][],
    private readonly dependencies: ReadonlyArray<any>
  ) {}

  public get definition(): TemplateDefinition {
    return this.lazyDefinition || (this.lazyDefinition = {
      name: 'unnamed',
      templateOrNode: this.node,
      cache: 0,
      build: {
        required: false
      },
      dependencies: this.dependencies,
      instructions: this.instructions,
      bindables: {},
      containerless: false,
      hasSlots: false,
      shadowOptions: null,
      surrogates: PLATFORM.emptyArray
    });
  }

  public getElementTemplate(engine: IRenderingEngine, type?: ICustomElementType): ITemplate {
    return engine.getElementTemplate(this.definition, type);
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

function createElementForTag(tagName: string, props?: any, children?: ArrayLike<ChildType>): PotentialRenderable {
  const instructions: TargetedInstruction[] = [];
  const allInstructions = [instructions];
  const dependencies = [];
  const element = DOM.createElement(tagName);

  if (props) {
    Object.keys(props)
      .forEach(x => DOM.setAttribute(element, x, props[x]));
  }

  if (children) {
    addChildren(element, children, allInstructions, dependencies);
  }

  return new PotentialRenderable(element, allInstructions, dependencies);
}

function createElementForType(Type: ICustomElementType, props?: any, children?: ArrayLike<ChildType>): PotentialRenderable {
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
      .forEach(x => {
        const bindable = bindables[x];

        if (bindable) {
          childInstructions.push({
            type: TargetedInstructionType.setProperty,
            dest: x,
            value: props[x]
          });
        } else {
          childInstructions.push({
            type: TargetedInstructionType.setAttribute,
            dest: x,
            value: props[x]
          });
        }
      });
  }

  if (children) {
    addChildren(element, children, allInstructions, dependencies);
  }

  return new PotentialRenderable(element, allInstructions, dependencies);
}

function addChildren(parent: INode, children: ArrayLike<ChildType>, allInstructions: TargetedInstruction[][], dependencies: any[]): void {
  for (let i = 0, ii = children.length; i < ii; ++i) {
    const current = children[i];

    if (typeof current === 'string') {
      // create text node and append
    } else if (DOM.isNodeInstance(current)) {
      DOM.appendChild(parent, current);
    } else {
      current.mergeInto(parent, allInstructions, dependencies);
    }
  }
}
