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
import { IView, IViewFactory, ViewFactory } from './view';

type ChildType = ProtoRenderable | string | INode;

export function createElement(tagOrType: string | Constructable, props?: any, children?: ChildType[]): ProtoRenderable {
  if (typeof tagOrType === 'string') {
    return createElementForTag(tagOrType, props, children);
  } else {
    return createElementForType(tagOrType as ICustomElementType, props, children);
  }
}

export class ProtoRenderable {
  private definition: TemplateDefinition;

  constructor(
    public readonly node: INode,
    public readonly instructions: TargetedInstruction[][],
    public readonly dependencies: ReadonlyArray<any>
  ) {}

  public getElementTemplate(engine: IRenderingEngine, type?: ICustomElementType): ITemplate {
    return engine.getElementTemplate(this.createDefinition(), type);
  }

  public createView(engine: IRenderingEngine, parentContext?: IRenderContext): IView {
    return this.getViewFactory(engine, parentContext).create();
  }

  public getViewFactory(engine: IRenderingEngine, parentContext?: IRenderContext): IViewFactory {
    return engine.getViewFactory(this.createDefinition(), parentContext);
  }

  public createDefinition(): TemplateDefinition {
    return this.definition || (this.definition = {
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
}

function createElementForTag(tagName: string, props?: any, children?: ChildType[]): ProtoRenderable {
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

  return new ProtoRenderable(element, allInstructions, dependencies);
}

function createElementForType(Type: ICustomElementType, props?: any, children?: ChildType[]): ProtoRenderable {
  const tagName = Type.description.name;
  const instructions: TargetedInstruction[] = [];
  const allInstructions = [instructions];
  const dependencies = [];
  const childInstructions = [];
  const bindables = Type.description.bindables;
  const element = DOM.createElement(tagName);

  DOM.setAttribute(element, 'class', 'au');

  dependencies.push(Type);
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

  return new ProtoRenderable(element, allInstructions, dependencies);
}

function addChildren(parent: INode, children: ChildType[], allInstructions: TargetedInstruction[][], dependencies: any[]): void {
  children.forEach(x => {
    if (typeof x === 'string') {
      // create text node and append
    } else if (DOM.isNodeInstance(x)) {
      DOM.appendChild(parent, x);
    } else {
      DOM.appendChild(parent, x.node);
      allInstructions.push(...x.instructions);
      dependencies.push(...x.dependencies);
    }
  });
}
