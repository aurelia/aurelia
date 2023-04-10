import { type ICustomElementViewModel, type ICustomElementController, IHydrationContext } from './controller';
import { CustomElement, type CustomElementDefinition } from '../resources/custom-element';
import { createInterface, instanceRegistration } from '../utilities-di';
import { type IRateLimitOptions, type Scope, ISubscribable } from '@aurelia/runtime';
import { Constructable, emptyArray, Key, type IContainer, type IDisposable, type IIndexable, type IServiceLocator } from '@aurelia/kernel';
import { ILifecycleHooks, lifecycleHooks } from './lifecycle-hooks';
import { def, objectAssign, safeString } from '../utilities';

export type PartialSlottedDefinition = {
  callback?: PropertyKey;
  name?: PropertyKey;
  slotName?: string;
  query?: string;
  // options?: MutationObserverInit;
  // query?: (controller: ICustomElementController) => ArrayLike<Node>;
  // filter?: (node: Node, controller?: ICustomElementController | null, viewModel?: ICustomElementViewModel) => boolean;
  // map?: (node: Node, controller?: ICustomElementController | null, viewModel?: ICustomElementViewModel) => unknown;
};

export type IProjections = Record<string, CustomElementDefinition>;
export const IProjections = createInterface<IProjections>("IProjections");

export interface ISlotsInfo {
  /**
   * Name of the slots to which content are projected.
   */
  readonly projectedSlots: readonly string[];
}
export const ISlotsInfo = createInterface<ISlotsInfo>('ISlotsInfo');
export class SlotsInfo implements ISlotsInfo {
  public constructor(
    public readonly projectedSlots: string[],
  ) { }
}

export interface ISlot {
  readonly name: string;
  readonly nodes: readonly Node[];
  subscribe(subscriber: ISlotSubscriber): void;
  unsubscribe(subscriber: ISlotSubscriber): void;
}

export interface ISlotSubscriber {
  handleSlotChange(slot: ISlot, nodes: Node[]): void;
}

export interface IProjectionSubscriber {
  handleNodesChange(nodes: Node[]): void;
}

export interface ISlotWatcher {
  watch(slot: ISlot): void;
  unwatch(slot: ISlot): void;
  subscribe(subscriber: IProjectionSubscriber): void;
  unsubscribe(subscriber: IProjectionSubscriber): void;
}
export const ISlotWatcher = createInterface<ISlotWatcher>('ISlotWatcher');

// 1. on hydrating, create a slot watcher (binding) & register with hydration context
// 2. on slot with projection created, optionally retrieve the slot watcher
//  2.a if there's NOT a watcher, do nothing
//  2.b else register the slot

// 1. au-slot should start listening to mutation when attaching
// 2. au-slot should stop listening to mutation when detaching
// 3. au-slot should notify slot watcher on mutation

class SlotWatcherBinding implements ISlotWatcher, ISlotSubscriber, ISubscribable<IProjectionSubscriber> {

  public static create(
    controller: ICustomElementController,
    name: PropertyKey,
    callbackName: PropertyKey,
    query: string,
  ) {
    const obj = controller.viewModel;
    const slotWatcher = new SlotWatcherBinding(controller, obj, callbackName, query);
    def(obj, name, {
      enumerable: true,
      configurable: true,
      get: objectAssign((/* SlotWatcherBinding */) => slotWatcher.getValue(), { getObserver: () => slotWatcher }),
      set: (/* SlotWatcherBinding */) => {/* nothing */}
    });

    return slotWatcher;
  }

  /** @internal */
  private readonly _controller: ICustomElementController;
  /** @internal */
  private readonly _obj: ICustomElementViewModel;
  /** @internal */
  private readonly _callback: (nodes: readonly Node[]) => void;
  /** @internal */
  private readonly _query: string;
  /** @internal */
  private readonly _slots = new Set<ISlot>();
  /** @internal */
  private readonly _subs = new Set<IProjectionSubscriber>();

  /** @internal */
  private _nodes: Node[] = emptyArray;

  public isBound: boolean = false;

  private constructor(
    controller: ICustomElementController,
    obj: ICustomElementViewModel,
    callback: PropertyKey,
    query: string,
  ) {
    this._controller = controller;
    this._callback = (this._obj = obj as IIndexable)[callback] as typeof SlotWatcherBinding.prototype._callback;
    this._query = query;
  }

  public bind() {
    this.isBound = true;
  }

  public unbind(): void {
    this.isBound = false;
  }

  public getValue() {
    return this._nodes;
  }

  public setValue() {
    /* nothing */
  }

  public watch(slot: ISlot): void {
    if (!this._slots.has(slot)) {
      this._slots.add(slot);
      slot.subscribe(this);
    }
  }

  public unwatch(slot: ISlot): void {
    if (this._slots.delete(slot)) {
      slot.unsubscribe(this);
    }
  }

  public handleSlotChange(_slot: ISlot, _nodes: Node[]): void {
    const $nodes: Node[] = [];
    for (const $slot of this._slots) {
      for (const node of $slot.nodes) {
        if (node.nodeType === 1 && (this._query === '*' || (node as Element).matches(this._query))) {
          $nodes.push(node);
        }
      }
      // $nodes = $nodes.concat($slot.nodes);
    }
    if ($nodes.length !== this._nodes.length || $nodes.some((n, i) => n !== this._nodes[i])) {
      this._nodes = $nodes;
      this._callback?.call(this._obj, $nodes);
      const subs = new Set(this._subs);
      for (const sub of subs) {
        sub.handleNodesChange($nodes);
      }
    }
  }

  public subscribe(subscriber: IProjectionSubscriber): void {
    this._subs.add(subscriber);
  }

  public unsubscribe(subscriber: IProjectionSubscriber): void {
    this._subs.delete(subscriber);
  }

  public get(): ReturnType<IServiceLocator['get']> {
    throw new Error('not implemented');
  }

  public useScope(_scope: Scope): void {
    /* not needed */
  }

  public limit(_opts: IRateLimitOptions): IDisposable {
    throw new Error('not implemented');
  }
}

class SlottedLifecycleHooks {
  public constructor(
    private readonly def: PartialSlottedDefinition & { name: PropertyKey },
  ) {}

  public register(c: IContainer) {
    instanceRegistration(ILifecycleHooks, this).register(c);
  }

  public hydrating(vm: object, controller: ICustomElementController) {
    const def = this.def;
    const watcher = SlotWatcherBinding.create(
      controller,
      def.name,
      def.callback ?? `${safeString(def.name)}Changed`,
      def.query ?? '*'
    );
    instanceRegistration(ISlotWatcher, watcher).register(controller.container.get(IHydrationContext).controller.container);
    controller.addBinding(watcher);
  }
}

lifecycleHooks()(SlottedLifecycleHooks);

export function slotted(query: string) {
  const dependenciesKey = 'dependencies';
  function decorator($target: {}, $prop: symbol | string, desc?: PropertyDescriptor): void {
    const config: PartialSlottedDefinition = {
      query,
    };
    if (arguments.length > 1) {
      // Non invocation:
      // - @slotted
      // Invocation with or w/o opts:
      // - @slotted()
      // - @slotted({...opts})
      config.name = $prop as string;
    }

    if (typeof $target === 'function' || typeof desc?.value !== 'undefined') {
      throw new Error(`Invalid usage. @slotted can only be used on a field`);
    }

    const target = ($target as object).constructor as Constructable;

    let dependencies = CustomElement.getAnnotation(target, dependenciesKey) as Key[] | undefined;
    if (dependencies == null) {
      CustomElement.annotate(target, dependenciesKey, dependencies = []);
    }
    dependencies.push(new SlottedLifecycleHooks(config as PartialSlottedDefinition & { name: PropertyKey }));
  }

  return decorator;
}
