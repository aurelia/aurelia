/* eslint-disable @typescript-eslint/no-use-before-define */
import { Constructable, Protocol, Metadata } from '@aurelia/kernel';
import { ChildrenObserverSource, firstDefined } from '../definitions';
import { INode } from '../dom';
import { IController, IViewModel } from '../lifecycle';
import { IElementProjector } from '../resources/custom-element';

export type PartialChildrenObserverDefinition<TNode extends INode = INode> = {
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
export function children(config?: ChildrenObserverSource): PropertyDecorator | ClassDecorator;
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
export function children(configOrTarget?: ChildrenObserverSource | {}, prop?: string): void | PropertyDecorator | ClassDecorator {
  let config: PartialChildrenObserverDefinition;

  function decorator($target: {}, $prop: symbol | string): void {
    if (arguments.length > 1) {
      // Non invocation:
      // - @children
      // Invocation with or w/o opts:
      // - @children()
      // - @children({...opts})
      config.property = $prop as string;
    }

    Metadata.define(ChildrenObserver.name, ChildrenObserverDefinition.create($prop as string, config), $target, $prop);
    Protocol.annotation.appendTo($target.constructor as Constructable, ChildrenObserver.keyFrom($prop as string));
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
  return key.startsWith(ChildrenObserver.name);
}

export const ChildrenObserver = {
  name: Protocol.annotation.keyFor('children-observer'),
  keyFrom(name: string): string {
    return `${ChildrenObserver.name}:${name}`;
  },
  from(...childrenObserverLists: readonly (ChildrenObserverDefinition | Record<string, PartialChildrenObserverDefinition> | readonly string[] | undefined)[]): Record<string, ChildrenObserverDefinition> {
    const childrenObservers: Record<string, ChildrenObserverDefinition> = {};

    // eslint-disable-next-line @typescript-eslint/unbound-method
    const isArray = Array.isArray as <T>(arg: unknown) => arg is readonly T[];

    function addName(name: string): void {
      childrenObservers[name] = ChildrenObserverDefinition.create(name);
    }

    function addDescription(name: string, def: PartialChildrenObserverDefinition): void {
      childrenObservers[name] = ChildrenObserverDefinition.create(name, def);
    }

    function addList(maybeList: ChildrenObserverDefinition | Record<string, PartialChildrenObserverDefinition> | readonly string[] | undefined): void {
      if (isArray(maybeList)) {
        maybeList.forEach(addName);
      } else if (maybeList instanceof ChildrenObserverDefinition) {
        Object.keys(maybeList).forEach(name => addDescription(name, maybeList));
      } else if (maybeList !== void 0) {
        Object.keys(maybeList).forEach(name => addDescription(name, maybeList));
      }
    }

    childrenObserverLists.forEach(addList);

    return childrenObservers;
  },
  getAll(Type: Constructable): readonly ChildrenObserverDefinition[] {
    const propStart = ChildrenObserver.name.length + 1;
    const keys = Protocol.annotation.getKeys(Type).filter(isChildrenObserverAnnotation);
    const len = keys.length;
    const defs: ChildrenObserverDefinition[] = Array(len);
    for (let i = 0; i < len; ++i) {
      defs[i] = Metadata.getOwn(ChildrenObserver.name, Type, keys[i].slice(propStart));
    }
    return defs;
  },
};

export class ChildrenObserverDefinition<TNode extends INode = INode> {
  private constructor(
    public readonly callback: string,
    public readonly property: string,
    public readonly options?: MutationObserverInit,
    public readonly query?: (projector: IElementProjector<TNode>) => ArrayLike<TNode>,
    public readonly filter?: (node: TNode, controller?: IController<TNode>, viewModel?: IViewModel<TNode>) => boolean,
    public readonly map?: (node: TNode, controller?: IController<TNode>, viewModel?: IViewModel<TNode>) => any,
  ) {}

  public static create<TNode extends INode = INode>(prop: string, def: PartialChildrenObserverDefinition<TNode> = {}): ChildrenObserverDefinition<TNode> {
    return new ChildrenObserverDefinition(
      firstDefined(def.callback, `${prop}Changed`),
      firstDefined(def.property, prop),
      def.options,
      def.query,
      def.filter,
      def.map,
    );
  }
}
