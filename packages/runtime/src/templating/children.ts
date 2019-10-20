/* eslint-disable @typescript-eslint/no-use-before-define */
import { Constructable, Protocol, Metadata, firstDefined, getPrototypeChain } from '@aurelia/kernel';
import { INode } from '../dom';
import { IController, IViewModel } from '../lifecycle';
import { IElementProjector } from '../resources/custom-element';

export type PartialChildrenDefinition<TNode extends INode = INode> = {
  callback?: string;
  property?: string;
  options?: MutationObserverInit;
  query?: (projector: IElementProjector<TNode>) => ArrayLike<TNode>;
  filter?: (node: TNode, controller?: IController<TNode>, viewModel?: IViewModel<TNode>) => boolean;
  map?: (node: TNode, controller?: IController<TNode>, viewModel?: IViewModel<TNode>) => any;
};

/**
 * Decorator: Specifies custom behavior for an array children property that synchronizes its items with child content nodes of the element.
 *
 * @param config - The overrides
 */
export function children(config?: PartialChildrenDefinition): PropertyDecorator;
/**
 * Decorator: Specifies an array property on a class that synchronizes its items with child content nodes of the element.
 *
 * @param prop - The property name
 */
export function children(prop: string): ClassDecorator;
/**
 * Decorator: Decorator: Specifies an array property that synchronizes its items with child content nodes of the element.
 *
 * @param target - The class
 * @param prop - The property name
 */
export function children(target: {}, prop: string): void;
export function children(configOrTarget?: PartialChildrenDefinition | {}, prop?: string): void | PropertyDecorator | ClassDecorator {
  let config: PartialChildrenDefinition;

  function decorator($target: {}, $prop: symbol | string): void {
    if (arguments.length > 1) {
      // Non invocation:
      // - @children
      // Invocation with or w/o opts:
      // - @children()
      // - @children({...opts})
      config.property = $prop as string;
    }

    Metadata.define(Children.name, ChildrenDefinition.create($prop as string, config), $target.constructor, $prop);
    Protocol.annotation.appendTo($target.constructor as Constructable, Children.keyFrom($prop as string));
  }

  if (arguments.length > 1) {
    // Non invocation:
    // - @children
    config = {};
    decorator(configOrTarget!, prop!);
    return;
  } else if (typeof configOrTarget === 'string') {
    // ClassDecorator
    // - @children('bar')
    // Direct call:
    // - @children('bar')(Foo)
    config = {};
    return decorator;
  }

  // Invocation with or w/o opts:
  // - @children()
  // - @children({...opts})
  config = configOrTarget === void 0 ? {} : configOrTarget;
  return decorator;
}

function isChildrenObserverAnnotation(key: string): boolean {
  return key.startsWith(Children.name);
}

export const Children = {
  name: Protocol.annotation.keyFor('children-observer'),
  keyFrom(name: string): string {
    return `${Children.name}:${name}`;
  },
  from(...childrenObserverLists: readonly (ChildrenDefinition | Record<string, PartialChildrenDefinition> | readonly string[] | undefined)[]): Record<string, ChildrenDefinition> {
    const childrenObservers: Record<string, ChildrenDefinition> = {};

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const isArray = Array.isArray as <T>(arg: unknown) => arg is readonly T[];

    function addName(name: string): void {
      childrenObservers[name] = ChildrenDefinition.create(name);
    }

    function addDescription(name: string, def: PartialChildrenDefinition): void {
      childrenObservers[name] = ChildrenDefinition.create(name, def);
    }

    function addList(maybeList: ChildrenDefinition | Record<string, PartialChildrenDefinition> | readonly string[] | undefined): void {
      if (isArray(maybeList)) {
        maybeList.forEach(addName);
      } else if (maybeList instanceof ChildrenDefinition) {
        childrenObservers[maybeList.property] = maybeList;
      } else if (maybeList !== void 0) {
        Object.keys(maybeList).forEach(name => addDescription(name, maybeList));
      }
    }

    childrenObserverLists.forEach(addList);

    return childrenObservers;
  },
  getAll(Type: Constructable): readonly ChildrenDefinition[] {
    const propStart = Children.name.length + 1;
    const defs: ChildrenDefinition[] = [];
    const prototypeChain = getPrototypeChain(Type);

    let iProto = prototypeChain.length;
    let iDefs = 0;
    let keys: string[];
    let keysLen: number;
    let Class: Constructable;
    while (--iProto >= 0) {
      Class = prototypeChain[iProto];
      keys = Protocol.annotation.getKeys(Class).filter(isChildrenObserverAnnotation);
      keysLen = keys.length;
      for (let i = 0; i < keysLen; ++i) {
        defs[iDefs++] = Metadata.getOwn(Children.name, Class, keys[i].slice(propStart));
      }
    }
    return defs;
  },
};

export class ChildrenDefinition<TNode extends INode = INode> {
  private constructor(
    public readonly callback: string,
    public readonly property: string,
    public readonly options?: MutationObserverInit,
    public readonly query?: (projector: IElementProjector<TNode>) => ArrayLike<TNode>,
    public readonly filter?: (node: TNode, controller?: IController<TNode>, viewModel?: IViewModel<TNode>) => boolean,
    public readonly map?: (node: TNode, controller?: IController<TNode>, viewModel?: IViewModel<TNode>) => any,
  ) {}

  public static create<TNode extends INode = INode>(prop: string, def: PartialChildrenDefinition<TNode> = {}): ChildrenDefinition<TNode> {
    return new ChildrenDefinition(
      firstDefined(def.callback, `${prop}Changed`),
      firstDefined(def.property, prop),
      def.options,
      def.query,
      def.filter,
      def.map,
    );
  }
}
