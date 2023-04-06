import { emptyArray, IContainer, IServiceLocator, IDisposable, Key } from '@aurelia/kernel';
import { IBinding, subscriberCollection } from '@aurelia/runtime';
import { CustomElement, findElementControllerFor } from '../resources/custom-element';
import { ILifecycleHooks, lifecycleHooks } from './lifecycle-hooks';
import { createError, def, isString } from '../utilities';
import { instanceRegistration } from '../utilities-di';
import { type ICustomElementViewModel, type ICustomElementController } from './controller';

import type { IIndexable, Constructable } from '@aurelia/kernel';
import type { ISubscriberCollection } from '@aurelia/runtime';
import type { INode } from '../dom';

export type PartialChildrenDefinition = {
  callback?: PropertyKey;
  name?: PropertyKey;
  options?: MutationObserverInit;
  query?: (controller: ICustomElementController) => ArrayLike<Node>;
  filter?: (node: Node, controller?: ICustomElementController | null, viewModel?: ICustomElementViewModel) => boolean;
  map?: (node: Node, controller?: ICustomElementController | null, viewModel?: ICustomElementViewModel) => unknown;
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
 * @param selector - The CSS element selector for filtering children
 */
export function children(selector: string): PropertyDecorator;
/**
 * Decorator: Decorator: Specifies an array property that synchronizes its items with child content nodes of the element.
 *
 * @param target - The class
 * @param prop - The property name
 */
export function children(target: {}, prop: string): void;
export function children(configOrTarget?: PartialChildrenDefinition | {} | string, prop?: string): void | PropertyDecorator | ClassDecorator {
  let config: PartialChildrenDefinition;

  const dependenciesKey = 'dependencies';
  function decorator($target: {}, $prop: symbol | string, desc?: PropertyDescriptor): void {
    if (arguments.length > 1) {
      // Non invocation:
      // - @children
      // Invocation with or w/o opts:
      // - @children()
      // - @children({...opts})
      config.name = $prop as string;
    }

    if (typeof $target === 'function' || typeof desc?.value !== 'undefined') {
      throw new Error(`Invalid usage. @children can only be used on a field`);
    }

    const target = ($target as object).constructor as Constructable;

    let dependencies = CustomElement.getAnnotation(target, dependenciesKey) as Key[] | undefined;
    if (dependencies == null) {
      CustomElement.annotate(target, dependenciesKey, dependencies = []);
    }
    dependencies.push(new ChildrenLifecycleHooks(config as PartialChildrenDefinition & { name: PropertyKey }));
  }

  if (arguments.length > 1) {
    // Non invocation:
    // - @children
    config = {};
    decorator(configOrTarget!, prop!);
    return;
  } else if (isString(configOrTarget)) {
    // Direct call:
    // - @children('div')(Foo)
    config = {
      filter: (node: Node) => node.nodeType === 1 && (node as Element).matches(configOrTarget),
      map: el => el
    };
    return decorator;
  }

  // Invocation with or w/o opts:
  // - @children()
  // - @children({...opts})
  config = configOrTarget === void 0 ? {} : configOrTarget;
  return decorator;
}

export interface ChildrenBinding extends ISubscriberCollection { }

/**
 * A binding for observing & notifying the children of a custom element.
 */
export class ChildrenBinding implements IBinding {
  /** @internal */
  private readonly _callback: () => void;
  /** @internal */
  private _children: unknown[] = (void 0)!;
  /** @internal */
  private readonly _observer: MutationObserver;
  /** @internal */
  private readonly _host: HTMLElement;
  /** @internal */
  private readonly _controller: ICustomElementController;
  /** @internal */
  private readonly _query = defaultChildQuery;
  /** @internal */
  private readonly _filter = defaultChildFilter;
  /** @internal */
  private readonly _map = defaultChildMap;
  /** @internal */
  private readonly _options?: MutationObserverInit;

  public isBound = false;
  public readonly obj: ICustomElementViewModel;

  public constructor(
    controller: ICustomElementController,
    obj: ICustomElementViewModel,
    public readonly key: PropertyKey,
    cbName: PropertyKey,
    query = defaultChildQuery,
    filter = defaultChildFilter,
    map = defaultChildMap,
    options: MutationObserverInit = childObserverOptions,
  ) {
    this._controller = controller;
    this._callback = (this.obj = obj as IIndexable)[cbName] as typeof ChildrenBinding.prototype._callback;
    this._host = controller.host;
    this._query = query;
    this._filter = filter;
    this._map = map;
    this._options = options;
    this._observer = new controller.host.ownerDocument.defaultView!.MutationObserver(() => {
      this._onChildrenChanged();
    });
    def(
      this.obj,
      this.key,
      {
        enumerable: true,
        configurable: true,
        get: Object.assign(() => this.getValue(), { getObserver: () => this }),
        set: () => { return; },
      }
    );
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
    this._observer.observe(this._host, this._options);
    this._children = this._getNodes();
  }

  public unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
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
    throw notImplemented('get');
  }

  public useScope() {
    /* not implemented */
  }

  public limit(): IDisposable {
    throw notImplemented('limit');
  }

  /** @internal */
  // freshly retrieve the children everytime
  // in case this observer is not observing
  private _getNodes() {
    return filterChildren(this._controller, this._query, this._filter, this._map);
  }
}
subscriberCollection(ChildrenBinding);

const childObserverOptions = { childList: true };
const notImplemented = (name: string) => createError(`Method "${name}": not implemented`);

const defaultChildQuery = (controller: ICustomElementController): ArrayLike<INode> => controller.host.childNodes;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultChildFilter = (node: INode, controller?: ICustomElementController | null, viewModel?: any): boolean =>
  // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
  !!viewModel;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const defaultChildMap = (node: INode, controller?: ICustomElementController | null, viewModel?: any): any => viewModel;

const forOpts = { optional: true } as const;

const filterChildren = (
  controller: ICustomElementController,
  query: typeof defaultChildQuery,
  filter: typeof defaultChildFilter,
  map: typeof defaultChildMap
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): any[] => {
  const nodes = query(controller);
  const ii = nodes.length;
  const children: unknown[] = [];

  let node: INode;
  let $controller: ICustomElementController | null;
  let viewModel: ICustomElementViewModel | null;
  let i = 0;
  for (; i < ii; ++i) {
    node = nodes[i];
    $controller = findElementControllerFor(node, forOpts);
    viewModel = $controller?.viewModel ?? null;

    if (filter(node, $controller, viewModel)) {
      children.push(map(node, $controller, viewModel));
    }
  }

  return children;
};

class ChildrenLifecycleHooks {
  public constructor(
    private readonly def: PartialChildrenDefinition & { name: PropertyKey },
  ) {}

  public register(c: IContainer) {
    instanceRegistration(ILifecycleHooks, this).register(c);
  }

  public hydrating(vm: object, controller: ICustomElementController) {
    const def = this.def;
    controller.addBinding(new ChildrenBinding(
      controller,
      controller.viewModel,
      def.name,
      def.callback ?? `${String(def.name)}Changed`,
      def.query ?? defaultChildQuery,
      def.filter ?? defaultChildFilter,
      def.map ?? defaultChildMap,
      def.options ?? childObserverOptions,
    ));
  }
}

lifecycleHooks()(ChildrenLifecycleHooks);
