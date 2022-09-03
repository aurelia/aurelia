import { Constructable, IContainer, IRegistry, Key } from '@aurelia/kernel';
import {
  HydrateElementInstruction,
  isInstruction,
  SetAttributeInstruction,
  IInstruction,
  SetPropertyInstruction,
} from './renderer';
import { IPlatform } from './platform';
import { CustomElementDefinition, CustomElementType, generateElementName, getElementDefinition, isElementType } from './resources/custom-element';
import { IViewFactory } from './templating/view';
import { IRendering } from './templating/rendering';
import { isString } from './utilities';

import type { ISyntheticView } from './templating/controller';

export function createElement<C extends Constructable = Constructable>(
  p: IPlatform,
  tagOrType: string | C,
  props?: Record<string, string | IInstruction>,
  children?: ArrayLike<unknown>
): RenderPlan {
  if (isString(tagOrType)) {
    return createElementForTag(p, tagOrType, props, children);
  }
  if (isElementType(tagOrType)) {
    return createElementForType(p, tagOrType, props, children);
  }
  throw new Error(`Invalid Tag or Type.`);
}

/**
 * RenderPlan. Todo: describe goal of this class
 */
export class RenderPlan {
  /** @internal */ private _lazyDef?: CustomElementDefinition = void 0;

  public constructor(
    // 2 following props accessed in the test, can't mangle
    // todo: refactor tests
    /** @internal */ private readonly node: Node,
    /** @internal */ private readonly instructions: IInstruction[][],
    /** @internal */ private readonly _dependencies: Key[]
  ) {}

  public get definition(): CustomElementDefinition {
    if (this._lazyDef === void 0) {
      this._lazyDef = CustomElementDefinition.create({
        name: generateElementName(),
        template: this.node,
        needsCompile: isString(this.node),
        instructions: this.instructions,
        dependencies: this._dependencies,
      });
    }
    return this._lazyDef;
  }

  public createView(parentContainer: IContainer): ISyntheticView {
    return this.getViewFactory(parentContainer).create();
  }

  public getViewFactory(parentContainer: IContainer): IViewFactory {
    return parentContainer.root.get(IRendering).getViewFactory(
      this.definition,
      parentContainer.createChild().register(...this._dependencies)
    );
  }

  /** @internal */
  public mergeInto(parent: Node & ParentNode, instructions: IInstruction[][], dependencies: Key[]): void {
    parent.appendChild(this.node);
    instructions.push(...this.instructions);
    dependencies.push(...this._dependencies);
  }
}

function createElementForTag(p: IPlatform, tagName: string, props?: Record<string, string | IInstruction>, children?: ArrayLike<unknown>): RenderPlan {
  const instructions: IInstruction[] = [];
  const allInstructions: IInstruction[][] = [];
  const dependencies: IRegistry[] = [];
  const element = p.document.createElement(tagName);
  let hasInstructions = false;

  if (props) {
    Object.keys(props)
      .forEach(to => {
        const value = props[to];

        if (isInstruction(value)) {
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
    addChildren(p, element, children, allInstructions, dependencies);
  }

  return new RenderPlan(element, allInstructions, dependencies);
}

function createElementForType(
  p: IPlatform,
  Type: CustomElementType,
  props?: Record<string, unknown>,
  children?: ArrayLike<unknown>,
): RenderPlan {
  const definition = getElementDefinition(Type);
  const instructions: IInstruction[] = [];
  const allInstructions = [instructions];
  const dependencies: Key[] = [];
  const childInstructions: IInstruction[] = [];
  const bindables = definition.bindables;
  const element = p.document.createElement(definition.name);
  element.className = 'au';

  if (!dependencies.includes(Type)) {
    dependencies.push(Type);
  }

  instructions.push(new HydrateElementInstruction(definition, void 0, childInstructions, null, false, void 0));

  if (props) {
    Object.keys(props)
      .forEach(to => {
        const value = props[to] as IInstruction | string;

        if (isInstruction(value)) {
          childInstructions.push(value);
        } else {
          if (bindables[to] === void 0) {
            childInstructions.push(new SetAttributeInstruction(value, to));
          } else {
            childInstructions.push(new SetPropertyInstruction(value, to));
          }
        }
      });
  }

  if (children) {
    addChildren(p, element, children, allInstructions, dependencies);
  }

  return new RenderPlan(element, allInstructions, dependencies);
}

function addChildren<T extends HTMLElement>(
  p: IPlatform,
  parent: T,
  children: ArrayLike<unknown>,
  allInstructions: IInstruction[][],
  dependencies: Key[],
): void {
  for (let i = 0, ii = children.length; i < ii; ++i) {
    const current = children[i];

    switch (typeof current) {
      case 'string':
        parent.appendChild(p.document.createTextNode(current));
        break;
      case 'object':
        if (current instanceof p.Node) {
          parent.appendChild(current);
        } else if ('mergeInto' in (current as RenderPlan)) {
          (current as RenderPlan).mergeInto(parent, allInstructions, dependencies);
        }
    }
  }
}
