import { emptyArray, isString, type IContainer, type IServiceLocator, Key, IIndexable } from '@aurelia/kernel';
import { subscriberCollection , type ISubscriberCollection } from '@aurelia/runtime';
import { findElementControllerFor } from '../resources/custom-element';
import { ILifecycleHooks, lifecycleHooks } from './lifecycle-hooks';
import { def, objectAssign, safeString } from '../utilities';
import { instanceRegistration } from '../utilities-di';
import { type ICustomElementViewModel, type ICustomElementController } from './controller';
import { createMutationObserver } from '../utilities-dom';

import { ErrorNames, createMappedError } from '../errors';
import { getAnnotationKeyFor } from '../utilities-metadata';
import { IBinding } from '../binding/interfaces-bindings';

/**
 * An interface describing options to observe the children elements of a custom element host
 */
export type PartialChildrenDefinition<TQuery extends string = string> = {
  query?: TQuery;
  callback?: PropertyKey;
  name?: PropertyKey;
  filter?: (node: TQuery extends '$all' ? Node : HTMLElement, viewModel: ICustomElementViewModel | null) => boolean;
  map?: (node: TQuery extends '$all' ? Node : HTMLElement, viewModel: ICustomElementViewModel | null) => unknown;
};

/**
 * Decorator: Specifies custom behavior for an array children property that synchronizes its items with child content nodes of the element.
 *
 * @param config - The overrides
 */
export function children<TThis, TValue, TQuery extends string>(config?: PartialChildrenDefinition<TQuery>): (target: undefined, context: ClassFieldDecoratorContext<TThis,TValue>) => void;
/**
 * Decorator: Specifies an array property on a class that synchronizes its items with child content nodes of the element.
 *
 * @param selector - The CSS element selector for filtering children. Use `$all` to select everything including non element nodes.
 * If nothing is provided, it defaults to `*`, which means all elements
 */
export function children<TThis, TValue>(selector: string): (target: undefined, context: ClassFieldDecoratorContext<TThis,TValue>) => void;
/**
 * Decorator: Decorator: Specifies an array property that synchronizes its items with child content nodes of the element.
 *
 * @param target - The class
 * @param prop - The property name
 */
export function children<TThis, TValue>(target: undefined, context: ClassFieldDecoratorContext<TThis,TValue>): void;
export function children<TThis, TValue, TQuery extends string>(configOrTarget?: PartialChildrenDefinition<TQuery> | string | undefined, context?: ClassFieldDecoratorContext<TThis,TValue>): void | ((target: undefined, context: ClassFieldDecoratorContext<TThis,TValue>) => void) {
  if (!children.mixed) {
    children.mixed = true;
    subscriberCollection(ChildrenBinding, null!);
    lifecycleHooks()(ChildrenLifecycleHooks, null!);
  }
  let config: PartialChildrenDefinition;

  const dependenciesKey = getAnnotationKeyFor('dependencies');
  function decorator(_target: undefined, context: ClassFieldDecoratorContext): void {
    switch (context.kind) {
      case 'field':
        config.name = context.name;
        break;
    }

    const dependencies = (context.metadata[dependenciesKey] ??= []) as Key[];
    dependencies.push(new ChildrenLifecycleHooks(config as PartialChildrenDefinition & { name: PropertyKey } ?? {}));
  }

  if (arguments.length > 1) {
    // Non invocation:
    // - @children
    config = {};
    decorator(configOrTarget as undefined, context!);
    return;
  } else if (isString(configOrTarget)) {
    // Direct call:
    // - @children('div')(Foo)
    config = {
      query: configOrTarget,
      // filter: (node: Node) => isElement(node) && node.matches(configOrTarget),
      // map: el => el
    };
    return decorator;
  }

  // Invocation with or w/o opts:
  // - @children()
  // - @children({...opts})
  config = configOrTarget === void 0 ? {} : configOrTarget;
  return decorator;
}
children.mixed = false;

export interface ChildrenBinding extends ISubscriberCollection { }

/**
 * A binding for observing & notifying the children of a custom element.
 */
export class ChildrenBinding implements IBinding {
  /** @internal */
  private readonly _callback: undefined | (() => void);
  /** @internal */
  private _children: unknown[] = (void 0)!;
  /** @internal */
  private readonly _observer: MutationObserver;
  /** @internal */
  private readonly _host: HTMLElement;
  /** @internal */
  private readonly _query: string;
  /** @internal */
  private readonly _filter?: (node: Node, viewModel: ICustomElementViewModel | null) => boolean;
  /** @internal */
  private readonly _map?: (node: Node, viewModel: ICustomElementViewModel | null) => unknown;

  public isBound = false;
  public readonly obj: ICustomElementViewModel;

  public constructor(
    host: HTMLElement,
    obj: ICustomElementViewModel,
    callback: undefined | (() => void),
    query: string,
    filter?: (node: Node, viewModel: ICustomElementViewModel | null) => boolean,
    map?: (node: Node, viewModel: ICustomElementViewModel | null) => unknown,
  ) {
    this.obj = obj;
    this._callback = callback;
    this._query = query;
    this._filter = filter;
    this._map = map;
    this._observer = createMutationObserver(this._host = host, () => {
      this._onChildrenChanged();
    });
  }

  public getValue(): unknown[] {
    return this.isBound ? this._children : this._getNodes();
  }

  public setValue(_value: unknown): void { /* do nothing */ }

  public bind(): void {
    if (this.isBound) {
      return;
    }
    this.isBound = true;
    this._observer.observe(this._host, { childList: true });
    this._children = this._getNodes();
  }

  public unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    // prevent memory leaks
    this._observer.takeRecords();
    this._observer.disconnect();
    this._children = emptyArray;
  }

  /** @internal */
  private _onChildrenChanged(): void {
    this._children = this._getNodes();

    this._callback?.call(this.obj);
    this.subs.notify(this._children, undefined);
  }

  public get(): ReturnType<IServiceLocator['get']> {
    throw createMappedError(ErrorNames.method_not_implemented, 'get');
  }

  /** @internal */
  // freshly retrieve the children everytime
  // in case this observer is not observing
  private _getNodes() {
    const query = this._query;
    const filter = this._filter;
    const map = this._map;
    const nodes = query === '$all' ? this._host.childNodes : this._host.querySelectorAll(`:scope > ${query}`);
    const ii = nodes.length;
    const results: unknown[] = [];
    const findControllerOptions = { optional: true };
    let $controller: ICustomElementController | null;
    let viewModel: ICustomElementViewModel | null;
    let i = 0;
    let node: Node;
    while (ii > i) {
      node = nodes[i];
      $controller = findElementControllerFor(node, findControllerOptions);
      viewModel = $controller?.viewModel ?? null;
      if (filter == null ? true : filter(node, viewModel)) {
        results.push(map == null ? viewModel ?? node : map(node, viewModel));
      }
      ++i;
    }
    return results;
  }
}

class ChildrenLifecycleHooks {
  public constructor(
    private readonly _def: PartialChildrenDefinition & { name: PropertyKey },
  ) {}

  public register(c: IContainer) {
    instanceRegistration(ILifecycleHooks, this).register(c);
  }

  public hydrating(vm: IIndexable, controller: ICustomElementController) {
    const $def = this._def;
    const query = $def.query ?? '*';
    const childrenObserver = new ChildrenBinding(
      controller.host,
      vm,
      vm[$def.callback ?? `${safeString($def.name)}Changed`] as () => void,
      query,
      $def.filter as PartialChildrenDefinition<'$all'>['filter'],
      $def.map as PartialChildrenDefinition<'$all'>['map'],
    );
    if (/[\s>]/.test(query)) {
      throw createMappedError(ErrorNames.children_invalid_query, query);
    }
    def(vm, $def.name, {
      enumerable: true,
      configurable: true,
      get: objectAssign((/* ChildrenBinding */) => childrenObserver.getValue(), { getObserver: () => childrenObserver }),
      set: (/* ChildrenBinding */) => {
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn(`[DEV:aurelia] property ${safeString($def.name)} decorated with @children is readonly`);
        }
      },
    });
    controller.addBinding(childrenObserver);
  }
}

/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/ban-ts-comment */
function testChildrenDecorator() {
  class MyEl {
    @children({
      filter: (element) => element.getAttribute('hey') == null,
      map: el => el.style
    })
    @children({
      map: node => node.style
    })
    @children({
      query: '$all',
      // @ts-expect-error
      map: node => node.style
    })
    public nodes: unknown[] = [];
  }
}
