import { Protocol, Metadata, firstDefined, getPrototypeChain, IIndexable } from '@aurelia/kernel';
import { LifecycleFlags, subscriberCollection } from '@aurelia/runtime';
import { CustomElement } from '../resources/custom-element.js';

import type { Constructable } from '@aurelia/kernel';
import type { ISubscriberCollection, IAccessor, ISubscribable, ISubscriber, IObserver } from '@aurelia/runtime';
import type { INode } from '../dom.js';
import type { ICustomElementViewModel, ICustomElementController } from './controller.js';

export type PartialChildrenDefinition = {
  callback?: string;
  property?: string;
  options?: MutationObserverInit;
  query?: (controller: ICustomElementController) => ArrayLike<Node>;
  filter?: (node: Node, controller?: ICustomElementController | null, viewModel?: ICustomElementViewModel) => boolean;
  map?: (node: Node, controller?: ICustomElementController | null, viewModel?: ICustomElementViewModel) => any;
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

const childObserverOptions = { childList: true };
export class ChildrenDefinition {
  private constructor(
    public readonly callback: string,
    public readonly property: string,
    public readonly options?: MutationObserverInit,
    public readonly query?: (controller: ICustomElementController) => ArrayLike<Node>,
    public readonly filter?: (node: Node, controller?: ICustomElementController | null, viewModel?: ICustomElementViewModel) => boolean,
    public readonly map?: (node: Node, controller?: ICustomElementController | null, viewModel?: ICustomElementViewModel) => any,
  ) {}

  public static create(prop: string, def: PartialChildrenDefinition = {}): ChildrenDefinition {
    return new ChildrenDefinition(
      firstDefined(def.callback, `${prop}Changed`),
      firstDefined(def.property, prop),
      def.options ?? childObserverOptions,
      def.query,
      def.filter,
      def.map,
    );
  }
}

export interface ChildrenObserver extends
  IAccessor,
  ISubscribable,
  ISubscriberCollection,
  IObserver { }

/** @internal */
@subscriberCollection()
export class ChildrenObserver {
  public observing: boolean = false;

  private readonly callback: () => void;
  private children: any[] = (void 0)!;

  public constructor(
    private readonly controller: ICustomElementController,
    public readonly obj: IIndexable,
    public readonly propertyKey: string,
    cbName: string,
    private readonly query = defaultChildQuery,
    private readonly filter = defaultChildFilter,
    private readonly map = defaultChildMap,
    private readonly options?: MutationObserverInit
  ) {
    this.callback = obj[cbName] as typeof ChildrenObserver.prototype.callback;
    Reflect.defineProperty(
      this.obj,
      this.propertyKey,
      {
        enumerable: true,
        configurable: true,
        get: () => this.getValue(),
        set: () => { return; },
      }
    );
  }

  public getValue(): any[] {
    this.tryStartObserving();
    return this.children;
  }

  public setValue(newValue: unknown): void { /* do nothing */ }

  public subscribe(subscriber: ISubscriber): void {
    this.tryStartObserving();
    this.subs.add(subscriber);
  }

  private tryStartObserving() {
    if (!this.observing) {
      this.observing = true;
      this.children = filterChildren(this.controller, this.query, this.filter, this.map);
      const obs = new this.controller.host.ownerDocument.defaultView!.MutationObserver(() => { this.onChildrenChanged(); });
      obs.observe(this.controller.host, this.options);
    }
  }

  private onChildrenChanged(): void {
    this.children = filterChildren(this.controller, this.query, this.filter, this.map);

    if (this.callback !== void 0) {
      this.callback.call(this.obj);
    }

    this.subs.notify(this.children, undefined, LifecycleFlags.none);
  }
}

function defaultChildQuery(controller: ICustomElementController): ArrayLike<INode> {
  return controller.host.childNodes;
}

function defaultChildFilter(node: INode, controller?: ICustomElementController | null, viewModel?: any): boolean {
  return !!viewModel;
}

function defaultChildMap(node: INode, controller?: ICustomElementController | null, viewModel?: any): any {
  return viewModel;
}

const forOpts = { optional: true } as const;

/** @internal */
export function filterChildren(
  controller: ICustomElementController,
  query: typeof defaultChildQuery,
  filter: typeof defaultChildFilter,
  map: typeof defaultChildMap
): any[] {
  const nodes = query(controller);
  const children = [];

  for (let i = 0, ii = nodes.length; i < ii; ++i) {
    const node = nodes[i];
    const $controller = CustomElement.for(node, forOpts);
    const viewModel = $controller?.viewModel ?? null;

    if (filter(node, $controller, viewModel)) {
      children.push(map(node, $controller, viewModel));
    }
  }

  return children;
}
