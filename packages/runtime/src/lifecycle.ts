import {
  DI,
  IContainer,
  IDisposable,
  Immutable,
  InterfaceSymbol,
  IResolver,
  IServiceLocator,
  PLATFORM,
  Registration,
  Tracer
} from '@aurelia/kernel';
import { ITargetedInstruction, TemplateDefinition, TemplatePartDefinitions } from './definitions';
import { INode, INodeSequence, IRenderLocation } from './dom';
import { Hooks, LifecycleFlags, State } from './flags';
import { IChangeTracker, IOverrideContext, IPatchable, IScope, ObserversLookup } from './observation';

const slice = Array.prototype.slice;
export interface IState {
  $state?: State;
  $lifecycle?: ILifecycle;
}

export interface IBinding {
  readonly $nextBinding: IBinding | null;
  readonly $prevBinding: IBinding | null;
  readonly locator: IServiceLocator;
  readonly $scope: IScope | null;
  readonly $state: State;
  $bind(flags: LifecycleFlags, scope: IScope): void;
  $unbind(flags: LifecycleFlags): void;
}

/**
 * An object containing the necessary information to render something for display.
 */
export interface IRenderable<T extends INode = INode> extends IState {
  /**
   * The Bindings that belong to this instance.
   */
  $bindingHead?: IBinding;
  $bindingTail?: IBinding;

  /**
   * The Views, CustomElements, CustomAttributes and other components that are children of this instance.
   */
  $componentHead?: IComponent;
  $componentTail?: IComponent;

  /**
   * The (dependency) context of this instance.
   *
   * Contains any dependencies required by this instance or its children.
   */
  readonly $context: IRenderContext<T>;

  /**
   * The nodes that represent the visible aspect of this instance.
   *
   * Typically this will be a sequence of `DOM` nodes contained in a `DocumentFragment`
   */
  readonly $nodes: INodeSequence<T>;

  /**
   * The binding scope that the `$bindables` of this instance will be bound to.
   *
   * This includes the `BindingContext` which can be either a user-defined view model instance, or a synthetic view model instantiated by a `templateController`
   */
  readonly $scope: IScope;
}

export const IRenderable = DI.createInterface<IRenderable>('IRenderable').noDefault();

export interface IRenderContext<T extends INode = INode> extends IServiceLocator {
  createChild(): IRenderContext<T>;
  render(flags: LifecycleFlags, renderable: IRenderable<T>, targets: ArrayLike<object>, templateDefinition: TemplateDefinition, host?: T, parts?: TemplatePartDefinitions): void;
  beginComponentOperation(renderable: IRenderable<T>, target: object, instruction: Immutable<ITargetedInstruction>, factory?: IViewFactory<T>, parts?: TemplatePartDefinitions, location?: IRenderLocation<T>, locationIsContainer?: boolean): IDisposable;
}

export interface IView<T extends INode = INode> extends IRenderable<T>, IMountableComponent {
  readonly cache: IViewCache<T>;
  readonly isFree: boolean;
  readonly location: IRenderLocation<T>;

  /**
   * Reserves this `IView` for mounting at a particular `IRenderLocation`.
   * Also marks this `IView` such that it cannot be returned to the cache until
   * it is released again.
   *
   * @param location The RenderLocation before which the view will be appended to the DOM.
   */
  hold(location: IRenderLocation<T>): void;

  /**
   * Marks this `IView` such that it can be returned to the cache when it is unmounted.
   *
   * If this `IView` is not currently attached, it will be unmounted immediately.
   *
   * @param flags The `LifecycleFlags` to pass to the unmount operation (only effective
   * if the view is already in detached state).
   *
   * @returns Whether this `IView` can/will be returned to cache
   */
  release(flags: LifecycleFlags): boolean;

  lockScope(scope: IScope): void;
}

export interface IViewCache<T extends INode = INode> {
  readonly isCaching: boolean;
  setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void;
  canReturnToCache(view: IView<T>): boolean;
  tryReturnToCache(view: IView<T>): boolean;
}

export interface IViewFactory<T extends INode = INode> extends IViewCache<T> {
  readonly name: string;
  create(flags?: LifecycleFlags): IView<T>;
}

export const IViewFactory = DI.createInterface<IViewFactory>('IViewFactory').noDefault();

/**
 * Defines optional lifecycle hooks that will be called only when they are implemented.
 */
export interface ILifecycleHooks extends IState {
  $hooks?: Hooks;
  /** @internal */$nextBound?: ILifecycleHooks;
  /** @internal */$nextUnbound?: ILifecycleHooks;
  /** @internal */$nextAttached?: ILifecycleHooks;
  /** @internal */$nextDetached?: ILifecycleHooks;

  /**
   * Called at the end of `$hydrate`.
   *
   * @description
   * This is the second and last "hydrate" lifecycle hook (after `render`). It happens only once per instance (contrary to bind/attach
   * which can happen many times per instance), though it can happen many times per type (once for each instance)
   *
   * This hook is called right before the `$bind` lifecycle starts, making this the last opportunity
   * for any high-level post processing on initialized properties.
   */
  created?(flags: LifecycleFlags): void;

  /**
   * Called at the start of `$bind`, before this instance and its children (if any) are bound.
   *
   * @description
   * This is the first "create" lifecycle hook of the hooks that can occur multiple times per instance,
   * and the third lifecycle hook (after `render` and `created`) of the very first this.lifecycle.
   */
  binding?(flags: LifecycleFlags): MaybePromiseOrTask;

  /**
   * Called at the end of `$bind`, after this instance and its children (if any) are bound.
   *
   * @description
   * This is the second "create" lifecycle hook (after `binding`) of the hooks that can occur multiple times per instance,
   * and the fourth lifecycle hook (after `render`, `created` and `binding`) of the very first this.lifecycle.
   */
  bound?(flags: LifecycleFlags): void;

  /**
   * Called at the start of `$unbind`, before this instance and its children (if any) are unbound.
   *
   * @description
   * This is the fourth "cleanup" lifecycle hook (after `detaching`, `caching` and `detached`)
   *
   * Last opportunity to perform any source or target updates before the bindings are disconnected.
   *
   */
  unbinding?(flags: LifecycleFlags): MaybePromiseOrTask;

  /**
   * Called at the end of `$unbind`, after this instance and its children (if any) are unbound.
   *
   * @description
   * This is the fifth (and last) "cleanup" lifecycle hook (after `detaching`, `caching`, `detached`
   * and `unbinding`).
   *
   * The lifecycle either ends here, or starts at `$bind` again.
   */
  unbound?(flags: LifecycleFlags): void;

  /**
   * Called at the start of `$attach`, before this instance and its children (if any) are attached.
   *
   * @description
   * This is the third "create" lifecycle hook (after `binding` and `bound`) of the hooks that can occur multiple times per instance,
   * and the fifth lifecycle hook (after `render`, `created`, `binding` and `bound`) of the very first lifecycle
   *
   * This is the time to add any (sync or async) tasks (e.g. animations) to the lifecycle that need to happen before
   * the nodes are added to the DOM.
   */
  attaching?(flags: LifecycleFlags): MaybePromiseOrTask;

  /**
   * Called at the end of `$attach`, after this instance and its children (if any) are attached.
   *
   * @description
   * This is the fourth (and last) "create" lifecycle hook (after `binding`, `bound` and `attaching`) of the hooks that can occur
   * multiple times per instance, and the sixth lifecycle hook (after `render`, `created`, `binding`, `bound` and `attaching`)
   * of the very first lifecycle
   *
   * This instance and its children (if any) can be assumed
   * to be fully initialized, bound, rendered, added to the DOM and ready for use.
   */
  attached?(flags: LifecycleFlags): void;

  /**
   * Called at the start of `$detach`, before this instance and its children (if any) are detached.
   *
   * @description
   * This is the first "cleanup" lifecycle hook.
   *
   * This is the time to add any (sync or async) tasks (e.g. animations) to the lifecycle that need to happen before
   * the nodes are removed from the DOM.
   */
  detaching?(flags: LifecycleFlags): MaybePromiseOrTask;

  /**
   * Called at the end of `$detach`, after this instance and its children (if any) are detached.
   *
   * @description
   * This is the third "cleanup" lifecycle hook (after `detaching` and `caching`).
   *
   * The `$nodes` are now removed from the DOM and the `View` (if possible) is returned to cache.
   *
   * If no `$unbind` lifecycle is queued, this is the last opportunity to make state changes before the lifecycle ends.
   */
  detached?(flags: LifecycleFlags): void;

  /**
   * Called during `$unmount` (which happens during `$detach`), specifically after the
   * `$nodes` are removed from the DOM, but before the view is actually added to the cache.
   *
   * @description
   * This is the second "cleanup" lifecycle hook.
   *
   * This lifecycle is invoked if and only if the `ViewFactory` that created the `View` allows the view to be cached.
   *
   * Usually this hook is not invoked unless you explicitly set the cache size to to something greater than zero
   * on the resource description.
   */
  caching?(flags: LifecycleFlags): void;
}

export interface IComponent extends IPatchable {
  readonly $nextComponent: IComponent | null;
  readonly $prevComponent: IComponent | null;
  /** @internal */$nextPatch?: IComponent;
  /** @internal */readonly $observers?: ObserversLookup<IOverrideContext>;
  $bind(flags: LifecycleFlags, scope?: IScope): ILifecycleTask;
  $unbind(flags: LifecycleFlags): ILifecycleTask;
  $attach(flags: LifecycleFlags): ILifecycleTask;
  $detach(flags: LifecycleFlags): ILifecycleTask;
  $cache(flags: LifecycleFlags): void;
}

export interface IMountableComponent extends IComponent {
  /** @internal */$nextMount?: IMountableComponent;
  /** @internal */$nextUnmount?: IMountableComponent;

  /**
   * Add the `$nodes` of this instance to the Host or RenderLocation that this instance is holding.
   */
  $mount(flags: LifecycleFlags): void;

  /**
   * Remove the `$nodes` of this instance from the Host or RenderLocation that this instance is holding, optionally returning them to a cache.
   * @returns
   * - `true` if the instance has been returned to the cache.
   * - `false` if the cache (typically ViewFactory) did not allow the instance to be cached.
   * - `undefined` (void) if the instance does not support caching. Functionally equivalent to `false`
   */
  $unmount(flags: LifecycleFlags): boolean | void;
}

const marker = Object.freeze(Object.create(null));

/*
 * Note: the lifecycle object ensures that certain callbacks are executed in a particular order that may
 * deviate from the order in which the component tree is walked.
 * The component tree is always walked in a top-down recursive fashion, for example:
 * {
 *   path: "1",
 *   children: [
 *     { path: "1.1", children: [
 *       { path: "1.1.1" },
 *       { path: "1.1.2" }
 *     ]},
 *     { path: "1.2", children: [
 *       { path: "1.2.1" },
 *       { path: "1.2.2" }
 *     ]}
 *   ]
 * }
 * The call chain would be: 1 -> 1.1 -> 1.1.1 -> 1.1.2 -> 1.2 -> 1.2.1 -> 1.2.2
 *
 * During mounting, for example, we want to mount the root component *last* (so that the DOM doesn't need to be updated
 * for each mount operation), and we want to invoke the detached callbacks in the same order that the components were mounted.
 * But all mounts need to happen before any of the detach callbacks are invoked, so we store the components in a LinkedList
 * whose execution is deferred until all the normal $attach/$detach calls have occurred.
 * In the example of attach, the call chains would look like this:
 * $attach: 1 -> 1.1 -> 1.1.1 -> 1.1.2 -> 1.2 -> 1.2.1 -> 1.2.2
 * $mount: 1.1.1 -> 1.1.2 -> 1.1 -> 1.2.1 -> 1.2.2 -> 1.2 -> 1
 * attached: 1.1.1 -> 1.1.2 -> 1.1 -> 1.2.1 -> 1.2.2 -> 1.2 -> 1
 *
 * Instead of (without the lifecycles):
 * $attach: 1, $mount: 1, detached: 1 -> $attach: 1.1, $mount: 1.1, detached: 1.1 -> etc..
 *
 * Furthermore, the lifecycle object tracks the call depth so that it will automatically run a list of operations
 * when the top-most component finishes execution, and components themselves don't need to worry about where in the
 * tree they reside.
 */

export interface ILifecycle {
  /**
   * Open up / expand a bind batch for enqueueing `bound` callbacks.
   *
   * When the top-most caller calls `endBind`, the `bound` callbacks will be invoked.
   *
   * Each `beginBind` *must* be matched by an `endBind`.
   */
  beginBind(requestor?: IState): void;

  /**
   * Open up / expand an unbind batch for enqueueing `unbound` callbacks.
   *
   * When the top-most caller calls `endUnbind`, the `unbound` callbacks will be invoked.
   *
   * Each `beginUnbind` *must* be matched by an `endUnbind`.
   */
  beginUnbind(requestor?: IState): void;

  /**
   * Open up / expand an attach batch for enqueueing `$mount` and `attached` callbacks.
   *
   * When the top-most caller calls `endAttach`, the `$mount` and `attached` callbacks
   * will be invoked (in that order).
   *
   * Each `beginAttach` *must* be matched by an `endAttach`.
   */
  beginAttach(requestor?: IState): void;

  /**
   * Open up / expand a detach batch for enqueueing `$unmount` and `detached` callbacks.
   *
   * When the top-most caller calls `endAttach`, the `$unmount` and `detached` callbacks
   * will be invoked (in that order).
   *
   * Each `beginAttach` *must* be matched by an `endAttach`.
   */
  beginDetach(requestor?: IState): void;

  /**
   * Close / shrink a bind batch for invoking queued `bound` callbacks.
   * @param flags The flags that will be passed into the `bound` callbacks.
   *
   * Flags during bind are primarily for optimization purposes, and to control whether
   * changes are batched or propagated synchronously.
   * If unsure which flags to provide, it's OK to use `LifecycleFlags.none` (or simply `0`)
   * This default will work, but is generally less efficient.
   */
  endBind(flags: LifecycleFlags, requestor?: IState): void;

  /**
   * Close / shrink an unbind batch for invoking queued `unbound` callbacks.
   * @param flags The flags that will be passed into the `unbound` callbacks.
   *
   * Flags during unbind are primarily for optimization purposes, and to control whether
   * changes are batched or propagated synchronously.
   * If unsure which flags to provide, it's OK to use `LifecycleFlags.none` (or simply `0`)
   * This default will work, but is generally less efficient.
   */
  endUnbind(flags: LifecycleFlags, requestor?: IState): void;

  /**
   * Close / shrink an attach batch for invoking queued `$mount` and `attached` callbacks.
   * @param flags The flags that will be passed into the `$mount` and `attached` callbacks.
   *
   * Flags during attach are primarily for optimization purposes.
   * If unsure which flags to provide, it's OK to use `LifecycleFlags.none` (or simply `0`)
   * This default will work, but is generally less efficient.
   */
  endAttach(flags: LifecycleFlags, requestor?: IState): void;

  /**
   * Close / shrink a detach batch for invoking queued `$unmount` and `detached` callbacks.
   * @param flags The flags that will be passed into the `$unmount` and `detached` callbacks.
   *
   * Flags during detach are primarily for optimization purposes, and to control whether a
   * component should be unmounted or not (the default is to only unmount root nodes).
   * If unsure which flags to provide, it's OK to use `LifecycleFlags.none` (or simply `0`).
   * This default will work, but is generally less efficient.
   */
  endDetach(flags: LifecycleFlags, requestor?: IState): void;

  /**
   * Add a `bound` callback to the queue, to be invoked when the current bind batch
   * is ended via `endBind` by the top-most caller.
   *
   * This method is idempotent; adding the same item more than once has the same effect as
   * adding it once.
   */
  enqueueBound(requestor: ILifecycleHooks): void;

  /**
   * Add an `unbound` callback to the queue, to be invoked when the current unbind batch
   * is ended via `endUnbind` by the top-most caller.
   *
   * This method is idempotent; adding the same item more than once has the same effect as
   * adding it once.
   */
  enqueueUnbound(requestor: ILifecycleHooks): void;

  /**
   * Add an `attached` callback to the queue, to be invoked when the current attach batch
   * is ended via `endAttach` by the top-most caller.
   *
   * This method is idempotent; adding the same item more than once has the same effect as
   * adding it once.
   */
  enqueueAttached(requestor: ILifecycleHooks): void;

  /**
   * Add a `detached` callback to the queue, to be invoked when the current detach batch
   * is ended via `endAttach` by the top-most caller.
   *
   * This method is idempotent; adding the same item more than once has the same effect as
   * adding it once.
   */
  enqueueDetached(requestor: ILifecycleHooks): void;

  processBindQueue(flags: LifecycleFlags): void;
  processUnbindQueue(flags: LifecycleFlags): void;

  processAttachQueue(flags: LifecycleFlags): void;
  processDetachQueue(flags: LifecycleFlags): void;

  /**
   * Add a `$mount` callback to the queue, to be invoked when the current attach batch
   * is ended via `endAttach` by the top-most caller.
   *
   * This method is idempotent; adding the same item more than once has the same effect as
   * adding it once.
   */
  enqueueMount(requestor: IMountableComponent): void;

  /**
   * Add a `$unmount` callback to the queue, to be invoked when the current detach batch
   * is ended via `endAttach` by the top-most caller.
   *
   * This method is idempotent; adding the same item more than once has the same effect as
   * adding it once.
   */
  enqueueUnmount(requestor: IMountableComponent): void;

  /**
   * Queue a flush() callback to be executed either on the next promise tick or on the next
   * bind lifecycle (if during startTask) or on the next attach lifecycle.
   *
   * This method is idempotent; adding the same item more than once has the same effect as
   * adding it once.
   *
   * This queue is primarily used by DOM target observers and collection observers.
   */
  enqueueFlush(requestor: IChangeTracker): Promise<void>;

  processFlushQueue(flags: LifecycleFlags): void;
}

export const ILifecycle = DI.createInterface<ILifecycle>('ILifecycle').withDefault(x => x.singleton(Lifecycle));

function noopHook(): ILifecycleTask {
  return LifecycleTask.done;
}

/** @internal */
export class Lifecycle implements ILifecycle {
  /** @internal */public bindDepth: number;
  /** @internal */public patchDepth: number;
  /** @internal */public attachDepth: number;
  /** @internal */public detachDepth: number;
  /** @internal */public unbindDepth: number;

  /** @internal */public flushHead: IChangeTracker;
  /** @internal */public flushTail: IChangeTracker;

  /** @internal */public boundHead: ILifecycleHooks;
  /** @internal */public boundTail: ILifecycleHooks;

  /** @internal */public mountHead: IMountableComponent;
  /** @internal */public mountTail: IMountableComponent;

  /** @internal */public attachedHead: ILifecycleHooks;
  /** @internal */public attachedTail: ILifecycleHooks;

  /** @internal */public unmountHead: IMountableComponent;
  /** @internal */public unmountTail: IMountableComponent;

  /** @internal */public detachedHead: ILifecycleHooks;
  /** @internal */public detachedTail: ILifecycleHooks;

  /** @internal */public unboundHead: ILifecycleHooks;
  /** @internal */public unboundTail: ILifecycleHooks;

  /** @internal */public flushed: Promise<void>;
  /** @internal */public promise: Promise<void>;

  /** @internal */public flushCount: number;
  /** @internal */public patchCount: number;
  /** @internal */public boundCount: number;
  /** @internal */public mountCount: number;
  /** @internal */public attachedCount: number;
  /** @internal */public unmountCount: number;
  /** @internal */public detachedCount: number;
  /** @internal */public unboundCount: number;

  // These are dummy properties to make the lifecycle conform to the interfaces
  // of the components it manages. This allows the lifecycle itself to be the first link
  // in the chain and removes the need for an additional null check on each addition.
  /** @internal */public $nextFlush: IChangeTracker;
  /** @internal */public flush: IChangeTracker['flush'];
  /** @internal */public $nextBound: ILifecycleHooks;
  /** @internal */public bound: ILifecycleHooks['bound'];
  /** @internal */public $nextMount: IMountableComponent;
  /** @internal */public $mount: IMountableComponent['$mount'];
  /** @internal */public $nextAttached: ILifecycleHooks;
  /** @internal */public attached: ILifecycleHooks['attached'];
  /** @internal */public $nextUnmount: IMountableComponent;
  /** @internal */public $unmount: IMountableComponent['$unmount'];
  /** @internal */public $nextDetached: ILifecycleHooks;
  /** @internal */public detached: ILifecycleHooks['detached'];
  /** @internal */public $unbind: IComponent['$unbind'];
  /** @internal */public $nextUnbound: ILifecycleHooks;
  /** @internal */public unbound: ILifecycleHooks['unbound'];

  /** @internal */public $state: State;

  constructor() {
    this.bindDepth = 0;
    this.patchDepth = 0;
    this.attachDepth = 0;
    this.detachDepth = 0;
    this.unbindDepth = 0;

    this.flushHead = this;
    this.flushTail = this;

    this.boundHead = this;
    this.boundTail = this;

    this.mountHead = this as unknown as IMountableComponent;
    this.mountTail = this as unknown as IMountableComponent;

    this.attachedHead = this;
    this.attachedTail = this;

    this.unmountHead = this as unknown as IMountableComponent;
    this.unmountTail = this as unknown as IMountableComponent;

    this.detachedHead = this; //LOL
    this.detachedTail = this;

    this.unboundHead = this;
    this.unboundTail = this;

    this.flushed = null;
    this.promise = Promise.resolve();

    this.flushCount = 0;
    this.patchCount = 0;
    this.boundCount = 0;
    this.mountCount = 0;
    this.attachedCount = 0;
    this.unmountCount = 0;
    this.detachedCount = 0;
    this.unboundCount = 0;

    this.$nextFlush = marker;
    this.flush = PLATFORM.noop;
    this.$nextBound = marker;
    this.bound = PLATFORM.noop;
    this.$nextMount = marker;
    this.$mount = PLATFORM.noop;
    this.$nextAttached = marker;
    this.attached = PLATFORM.noop;
    this.$nextUnmount = marker;
    this.$unmount = PLATFORM.noop;
    this.$nextDetached = marker;
    this.detached = PLATFORM.noop;
    this.$unbind = noopHook;
    this.$nextUnbound = marker;
    this.unbound = PLATFORM.noop;

    this.$state = State.none;
  }

  public static register(container: IContainer): IResolver<ILifecycle> {
    return Registration.singleton(ILifecycle, this).register(container);
  }

  public beginBind(requestor: IState = this): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle', 'beginBind', slice.call(arguments)); }
    requestor.$state = setBinding(requestor.$state);
    ++this.bindDepth;
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public beginUnbind(requestor: IState = this): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle', 'beginUnbind', slice.call(arguments)); }
    requestor.$state = setUnbinding(requestor.$state);
    ++this.unbindDepth;
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public beginAttach(requestor: IState = this): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle', 'beginAttach', slice.call(arguments)); }
    requestor.$state = setAttaching(requestor.$state);
    ++this.attachDepth;
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public beginDetach(requestor: IState = this): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle', 'beginDetach', slice.call(arguments)); }
    requestor.$state = setDetaching(requestor.$state);
    ++this.detachDepth;
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public endBind(flags: LifecycleFlags, requestor: IState = this): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle', 'endBind', slice.call(arguments)); }
    requestor.$state = setBound(requestor.$state);
    if (--this.bindDepth === 0) {
      this.processBindQueue(flags);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public endUnbind(flags: LifecycleFlags, requestor: IState = this): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle', 'endUnbind', slice.call(arguments)); }
    requestor.$state = setUnbound(requestor.$state);
    if (--this.unbindDepth === 0) {
      this.processUnbindQueue(flags);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public endAttach(flags: LifecycleFlags, requestor: IState = this): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle', 'endAttach', slice.call(arguments)); }
    requestor.$state = setAttached(requestor.$state);
    if (--this.attachDepth === 0) {
      this.processAttachQueue(flags);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public endDetach(flags: LifecycleFlags, requestor: IState = this): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle', 'endDetach', slice.call(arguments)); }
    requestor.$state = setDetached(requestor.$state);
    if (--this.detachDepth === 0) {
      this.processDetachQueue(flags);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public enqueueBound(requestor: ILifecycleHooks): void {
    if (hasBoundHook(requestor) && requestor.$nextBound === null) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'enqueueBound', slice.call(arguments)); }
      requestor.$nextBound = marker;
      this.boundTail.$nextBound = requestor;
      this.boundTail = requestor;
      ++this.boundCount;
      if (Tracer.enabled) { Tracer.leave(); }
    }
  }

  public enqueueUnbound(requestor: ILifecycleHooks): void {
    if (hasUnboundHook(requestor) && requestor.$nextUnbound === null) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'enqueueUnbound', slice.call(arguments)); }
      requestor.$nextUnbound = marker;
      this.unboundTail.$nextUnbound = requestor;
      this.unboundTail = requestor;
      ++this.unboundCount;
      if (Tracer.enabled) { Tracer.leave(); }
    }
  }

  public enqueueAttached(requestor: ILifecycleHooks): void {
    if (hasAttachedHook(requestor) && requestor.$nextAttached === null) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'enqueueAttached', slice.call(arguments)); }
      requestor.$nextAttached = marker;
      this.attachedTail.$nextAttached = requestor;
      this.attachedTail = requestor;
      ++this.attachedCount;
      if (Tracer.enabled) { Tracer.leave(); }
    }
  }

  public enqueueDetached(requestor: ILifecycleHooks): void {
    if (hasDetachedHook(requestor) && requestor.$nextDetached === null) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'enqueueDetached', slice.call(arguments)); }
      requestor.$nextDetached = marker;
      this.detachedTail.$nextDetached = requestor;
      this.detachedTail = requestor;
      ++this.detachedCount;
      if (Tracer.enabled) { Tracer.leave(); }
    }
  }

  public processBindQueue(flags: LifecycleFlags): void {
    // flush before processing bound callbacks, but only if this is the initial bind;
    // no DOM is attached yet so we can safely let everything propagate
    if (flags & LifecycleFlags.fromStartTask) {
      this.processFlushQueue(flags | LifecycleFlags.fromSyncFlush);
    }
    while (this.boundCount > 0) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'processBindQueue', slice.call(arguments)); }
      this.boundCount = 0;
      let current = this.boundHead.$nextBound;
      let next: ILifecycleHooks;
      this.boundHead = this.boundTail = this;
      do {
        current.bound(flags);
        next = current.$nextBound;
        current.$nextBound = null;
        current = next;
      } while (current !== marker);
      if (Tracer.enabled) { Tracer.leave(); }
    }
  }

  public processUnbindQueue(flags: LifecycleFlags): void {
    while (this.unboundCount > 0) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'processUnbindQueue', slice.call(arguments)); }
      this.unboundCount = 0;
      let current = this.unboundHead.$nextUnbound;
      let next: ILifecycleHooks;
      this.unboundHead = this.unboundTail = this;
      do {
        current.unbound(flags);
        next = current.$nextUnbound;
        current.$nextUnbound = null;
        current = next;
      } while (current !== marker);
      if (Tracer.enabled) { Tracer.leave(); }
    }
  }

  public processAttachQueue(flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle', 'processAttachQueue', slice.call(arguments)); }
    // flush and patch before starting the attach lifecycle to ensure batched collection changes are propagated to repeaters
    // and the DOM is updated
    this.processFlushQueue(flags | LifecycleFlags.fromSyncFlush);
    // TODO: prevent duplicate updates coming from the patch queue (or perhaps it's just not needed in its entirety?)
    //this.processPatchQueue(flags | LifecycleFlags.fromSyncFlush);

    if (this.mountCount > 0) {
      this.mountCount = 0;
      let currentMount = this.mountHead.$nextMount;
      this.mountHead = this.mountTail = this as unknown as IMountableComponent;
      let nextMount: typeof currentMount;

      do {
        currentMount.$mount(flags);
        nextMount = currentMount.$nextMount;
        currentMount.$nextMount = null;
        currentMount = nextMount;
      } while (currentMount !== marker);
    }

    if (this.attachedCount > 0) {
      this.attachedCount = 0;
      let currentAttached = this.attachedHead.$nextAttached;
      this.attachedHead = this.attachedTail = this;
      let nextAttached: typeof currentAttached;

      do {
        currentAttached.attached(flags);
        nextAttached = currentAttached.$nextAttached;
        currentAttached.$nextAttached = null;
        currentAttached = nextAttached;
      } while (currentAttached !== marker);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public processDetachQueue(flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle', 'processDetachQueue', slice.call(arguments)); }
    // flush before unmounting to ensure batched collection changes propagate to the repeaters,
    // which may lead to additional unmount operations
    this.processFlushQueue(flags | LifecycleFlags.fromFlush | LifecycleFlags.doNotUpdateDOM);

    if (this.unmountCount > 0) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'processUnmountQueue', slice.call(arguments)); }
      this.unmountCount = 0;
      let currentUnmount = this.unmountHead.$nextUnmount;
      this.unmountHead = this.unmountTail = this as unknown as IMountableComponent;
      let nextUnmount: typeof currentUnmount;

      do {
        currentUnmount.$unmount(flags);
        nextUnmount = currentUnmount.$nextUnmount;
        currentUnmount.$nextUnmount = null;
        currentUnmount = nextUnmount;
      } while (currentUnmount !== marker);
      if (Tracer.enabled) { Tracer.leave(); }
    }

    if (this.detachedCount > 0) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'processDetachedQueue', slice.call(arguments)); }
      this.detachedCount = 0;
      let currentDetached = this.detachedHead.$nextDetached;
      this.detachedHead = this.detachedTail = this;
      let nextDetached: typeof currentDetached;

      do {
        currentDetached.detached(flags);
        nextDetached = currentDetached.$nextDetached;
        currentDetached.$nextDetached = null;
        currentDetached = nextDetached;
      } while (currentDetached !== marker);
      if (Tracer.enabled) { Tracer.leave(); }
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public enqueueMount(requestor: IMountableComponent): void {
    if (requestor.$nextMount === null) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'enqueueMount', slice.call(arguments)); }
      requestor.$nextMount = marker;
      this.mountTail.$nextMount = requestor;
      this.mountTail = requestor;
      ++this.mountCount;
      if (Tracer.enabled) { Tracer.leave(); }
    }
  }

  public enqueueUnmount(requestor: IMountableComponent): void {
    if (requestor.$nextUnmount === null) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'enqueueUnmount', slice.call(arguments)); }
      requestor.$nextUnmount = marker;
      this.unmountTail.$nextUnmount = requestor;
      this.unmountTail = requestor;
      ++this.unmountCount;
      if (Tracer.enabled) { Tracer.leave(); }
    }
    // this is a temporary solution until a cleaner method surfaces.
    // if an item being queued for unmounting is already in the mount queue,
    // remove it from the mount queue (this can occur in some very exotic situations
    // and should be dealt with in a less hacky way)
    if (requestor.$nextMount !== null) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'dequeueMount', slice.call(arguments)); }
      let current = this.mountHead;
      let next = current.$nextMount;
      while (next !== requestor) {
        current = next;
        next = current.$nextMount;
      }
      current.$nextMount = next.$nextMount;
      next.$nextMount = null;
      if (this.mountTail === next) {
        this.mountTail = this as unknown as IMountableComponent;
      }
      --this.mountCount;
      if (Tracer.enabled) { Tracer.leave(); }
    }
  }

  public enqueueFlush(requestor: IChangeTracker): Promise<void> {
    // Queue a flush() callback; the depth is just for debugging / testing purposes and has
    // no effect on execution. flush() will automatically be invoked when the promise resolves,
    // or it can be manually invoked synchronously.
    if (this.flushHead === this) {
      this.flushed = this.promise.then(() => { this.processFlushQueue(LifecycleFlags.fromAsyncFlush); });
    }
    if (requestor.$nextFlush === null) {
      if (Tracer.enabled) { Tracer.enter('Lifecycle', 'enqueueFlush', slice.call(arguments)); }
      requestor.$nextFlush = marker;
      this.flushTail.$nextFlush = requestor;
      this.flushTail = requestor;
      ++this.flushCount;
      if (Tracer.enabled) { Tracer.leave(); }
    }
    return this.flushed;
  }

  public processFlushQueue(flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle', 'processFlushQueue', slice.call(arguments)); }
    flags |= LifecycleFlags.fromSyncFlush;
    // flush callbacks may lead to additional flush operations, so keep looping until
    // the flush head is back to `this` (though this will typically happen in the first iteration)
    while (this.flushCount > 0) {
      let current = this.flushHead.$nextFlush;
      this.flushHead = this.flushTail = this;
      this.flushCount = 0;
      let next: typeof current;
      do {
        next = current.$nextFlush;
        current.$nextFlush = null;
        current.flush(flags);
        current = next;
      } while (current !== marker);
      // doNotUpdateDOM will cause DOM updates to be re-queued which results in an infinite loop
      // unless we break here
      // Note that breaking on this flag is still not the ideal solution; future improvement would
      // be something like a separate DOM queue and a non-DOM queue, but for now this fixes the infinite
      // loop without breaking anything (apart from the edgiest of edge cases which are not yet tested)
      if (flags & LifecycleFlags.doNotUpdateDOM) {
        break;
      }
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

export type PromiseOrTask = Promise<unknown> | ILifecycleTask;
export type MaybePromiseOrTask = void | PromiseOrTask;

export class CompositionCoordinator {
  public static readonly inject: ReadonlyArray<InterfaceSymbol> = [ILifecycle];

  public readonly $lifecycle: ILifecycle;

  public onSwapComplete: () => void;

  private currentView: IView;
  private isAttached: boolean;
  private isBound: boolean;
  private queue: (IView | PromiseSwap)[] | null;
  private scope: IScope;
  private swapTask: ILifecycleTask;

  constructor($lifecycle: ILifecycle) {
    this.$lifecycle = $lifecycle;

    this.onSwapComplete = PLATFORM.noop;

    this.currentView = null;
    this.isAttached = false;
    this.isBound = false;
    this.queue = null;
    this.swapTask = LifecycleTask.done;
  }

  public static register(container: IContainer): IResolver<CompositionCoordinator> {
    return Registration.transient(this, this).register(container, this);
  }

  public compose(value: IView | Promise<IView>, flags: LifecycleFlags): ILifecycleTask {
    if (this.swapTask.done) {
      if (value instanceof Promise) {
        this.enqueue(new PromiseSwap(this, value));
        this.processNext();
      } else {
        this.swap(value, flags);
      }
    } else {
      if (value instanceof Promise) {
        this.enqueue(new PromiseSwap(this, value));
      } else {
        this.enqueue(value);
      }

      if (this.swapTask.canCancel()) {
        this.swapTask.cancel();
      }
    }
    return this.swapTask;
  }

  public binding(flags: LifecycleFlags, scope: IScope): ILifecycleTask {
    this.scope = scope;
    this.isBound = true;

    if (this.currentView !== null) {
      return this.currentView.$bind(flags, scope);
    }
    return LifecycleTask.done;
  }

  public attaching(flags: LifecycleFlags): ILifecycleTask {
    this.isAttached = true;

    if (this.currentView !== null) {
      return this.currentView.$attach(flags);
    }
    return LifecycleTask.done;
  }

  public detaching(flags: LifecycleFlags): ILifecycleTask {
    this.isAttached = false;

    if (this.currentView !== null) {
      return this.currentView.$detach(flags);
    }
    return LifecycleTask.done;
  }

  public unbinding(flags: LifecycleFlags): ILifecycleTask {
    this.isBound = false;

    if (this.currentView !== null) {
      return this.currentView.$unbind(flags);
    }
    return LifecycleTask.done;
  }

  public caching(flags: LifecycleFlags): void {
    this.currentView = null;
  }

  private enqueue(view: IView | PromiseSwap): void {
    if (Tracer.enabled) { Tracer.enter('CompositionCoordinator', 'enqueue', slice.call(arguments)); }
    if (this.queue === null) {
      this.queue = [];
    }

    this.queue.push(view);
    if (Tracer.enabled) { Tracer.leave(); }
  }

  private swap(view: IView, flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('CompositionCoordinator', 'swap', slice.call(arguments)); }
    if (this.currentView === view) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }

    const $lifecycle = this.$lifecycle;
    const swapTask = new AggregateLifecycleTask();

    let task: ILifecycleTask;
    let currentView = this.currentView;
    if (currentView === null) {
      task = LifecycleTask.done;
    } else {
      $lifecycle.beginDetach(currentView);
      task = currentView.$detach(flags);
      if (task.done) {
        task = unbindAfterDetach($lifecycle, currentView, flags);
      } else {
        task = new ContinuationTask(task, unbindAfterDetach, undefined, $lifecycle, currentView, flags);
      }
    }
    swapTask.addTask(task);

    currentView = this.currentView = view;

    if (currentView === null) {
      task = LifecycleTask.done;
    } else {
      if (this.isBound) {
        $lifecycle.beginBind(currentView);
        task = currentView.$bind(flags, this.scope);
        if (task.done) {
          $lifecycle.endBind(flags, currentView);
        } else {
          task = new ContinuationTask(task, $lifecycle.endBind, $lifecycle, flags, currentView);
        }
      }
      if (this.isAttached) {
        if (task.done) {
          task = attachAfterBind($lifecycle, currentView, flags);
        } else {
          task = new ContinuationTask(task, attachAfterBind, undefined, $lifecycle, currentView, flags);
        }
      } else {
        task = LifecycleTask.done;
      }
    }
    swapTask.addTask(task);

    if (swapTask.done) {
      this.swapTask = LifecycleTask.done;
      this.onSwapComplete();
    } else {
      this.swapTask = swapTask;
      this.swapTask.wait().then(() => {
        this.onSwapComplete();
        this.processNext();
      }).catch(error => { throw error; });
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  private processNext(): void {
    if (Tracer.enabled) { Tracer.enter('CompositionCoordinator', 'processNext', slice.call(arguments)); }
    if (this.queue !== null && this.queue.length > 0) {
      const next = this.queue.pop();
      this.queue.length = 0;

      if (PromiseSwap.is(next)) {
        this.swapTask = next.start();
      } else {
        this.swap(next, LifecycleFlags.fromLifecycleTask);
      }
    } else {
      this.swapTask = LifecycleTask.done;
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

function unbindAfterDetach(lifecycle: ILifecycle, view: IView, flags: LifecycleFlags): ILifecycleTask {
  lifecycle.endDetach(flags, view);
  lifecycle.beginUnbind(view);
  const task = view.$unbind(flags);
  if (task.done) {
    lifecycle.endUnbind(flags, view);
    return task;
  }

  return new ContinuationTask(task, lifecycle.endUnbind, lifecycle, flags, view);
}

function attachAfterBind(lifecycle: ILifecycle, view: IView, flags: LifecycleFlags): ILifecycleTask {
  lifecycle.beginAttach(view);
  const task = view.$attach(flags);
  if (task.done) {
    lifecycle.endAttach(flags, view);
    return task;
  }

  return new ContinuationTask(task, lifecycle.endAttach, lifecycle, flags, view);
}

export const LifecycleTask = {
  done: {
    done: true,
    canCancel(): boolean { return false; },
    cancel(): void { return; },
    wait(): Promise<unknown> { return Promise.resolve(); }
  }
};

export interface ILifecycleTask<T = unknown> {
  readonly done: boolean;
  canCancel(): boolean;
  cancel(): void;
  wait(): Promise<T>;
}

export class AggregateLifecycleTask implements ILifecycleTask<void> {
  public done: boolean;

  private readonly tasks: ILifecycleTask[];
  private resolve: () => void;
  private waiter: Promise<void>;

  constructor() {
    this.done = true;

    this.resolve = null;
    this.tasks = [];
    this.waiter = null;
  }

  public addTask(task: ILifecycleTask): void {
    if (!task.done) {
      if (Tracer.enabled) { Tracer.enter('AggregateLifecycleTask', 'addTask', slice.call(arguments)); }
      this.done = false;
      this.tasks.push(task);
      task.wait().then(() => { this.tryComplete(); }).catch(error => { throw error; });
      if (Tracer.enabled) { Tracer.leave(); }
    }
  }

  public removeTask(task: ILifecycleTask): void {
    if (Tracer.enabled) { Tracer.enter('AggregateLifecycleTask', 'removeTask', slice.call(arguments)); }
    if (task.done) {
      const idx = this.tasks.indexOf(task);
      if (idx !== -1) {
        this.tasks.splice(idx, 1);
      }
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public canCancel(): boolean {
    if (this.done) {
      return false;
    }

    return this.tasks.every(x => x.canCancel());
  }

  public cancel(): void {
    if (this.canCancel()) {
      this.tasks.forEach(x => { x.cancel(); });
      this.done = false;
    }
  }

  public wait(): Promise<void> {
    if (this.waiter === null) {
      if (this.done) {
        this.waiter = Promise.resolve();
      } else {
        // tslint:disable-next-line:promise-must-complete
        this.waiter = new Promise((resolve) => this.resolve = resolve);
      }
    }

    return this.waiter;
  }

  private tryComplete(): void {
    if (this.done) {
      return;
    }

    if (this.tasks.every(x => x.done)) {
      this.complete();
    }
  }

  private complete(): void {
    if (Tracer.enabled) { Tracer.enter('AggregateLifecycleTask', 'complete', slice.call(arguments)); }

    this.done = true;
    if (this.resolve !== null) {
      this.resolve();
    }

    if (Tracer.enabled) { Tracer.leave(); }
  }
}

/** @internal */
export class PromiseSwap implements ILifecycleTask<IView> {
  public done: boolean;

  private readonly coordinator: CompositionCoordinator;
  private isCancelled: boolean;
  private promise: Promise<IView>;

  constructor(coordinator: CompositionCoordinator, promise: Promise<IView>) {
    this.coordinator = coordinator;
    this.done = false;
    this.isCancelled = false;
    this.promise = promise;
  }

  public static is(object: object): object is PromiseSwap {
    return 'start' in object;
  }

  public start(): ILifecycleTask<IView | unknown> {
    if (this.isCancelled) {
      return LifecycleTask.done;
    }

    this.promise = this.promise.then(x => {
      this.onResolve(x);
      return x;
    });

    return this;
  }

  public canCancel(): boolean {
    return !this.done;
  }

  public cancel(): void {
    if (this.canCancel()) {
      this.isCancelled = true;
    }
  }

  public wait(): Promise<IView> {
    return this.promise;
  }

  private onResolve(value: IView): void {
    if (this.isCancelled) {
      return;
    }

    this.done = true;
    this.coordinator.compose(value, LifecycleFlags.fromLifecycleTask);
  }
}

export class PromiseTask<T = void> implements ILifecycleTask<T> {
  public done: boolean;

  private isCancelled: boolean;
  private readonly promise: Promise<T>;
  private readonly callback: (result?: T) => void;

  constructor(promise: Promise<T>, callback: ((result?: T) => void) = null) {
    this.done = false;
    this.isCancelled = false;
    this.callback = callback;
    this.promise = promise.then(value => {
      if (this.isCancelled === true) {
        return;
      }
      this.done = true;
      if (this.callback !== null) {
        this.callback(value);
      }
      return value;
    });
  }

  public canCancel(): boolean {
    return !this.done;
  }

  public cancel(): void {
    if (this.canCancel()) {
      this.isCancelled = true;
    }
  }

  public wait(): Promise<T> {
    return this.promise;
  }
}

export class ContinuationTask<TArgs extends unknown[]> implements ILifecycleTask {

  public done: boolean;

  private hasStarted: boolean;
  private isCancelled: boolean;
  private readonly promise: Promise<unknown>;

  constructor(
    antecedent: Promise<unknown> | ILifecycleTask,
    next: (...args: TArgs) => MaybePromiseOrTask,
    context: unknown,
    ...args: TArgs
  ) {
    this.done = false;
    this.hasStarted = false;
    this.isCancelled = false;

    const promise = (antecedent as Promise<unknown>).then instanceof Function
      ? antecedent as Promise<unknown>
      : (antecedent as ILifecycleTask).wait();

    this.promise = promise.then(() => {
      if (this.isCancelled === true) {
        return;
      }
      this.hasStarted = true;
      const nextResult = next.call(context, ...args) as MaybePromiseOrTask;
      if (nextResult === void 0) {
        this.done = true;
      } else {
        const nextPromise = (nextResult as Promise<unknown>).then instanceof Function
          ? nextResult as Promise<unknown>
          : (nextResult as ILifecycleTask).wait();
        return nextPromise.then(() => {
          this.done = true;
        });
      }
    });
  }

  public canCancel(): boolean {
    return !this.hasStarted;
  }

  public cancel(): void {
    if (this.canCancel()) {
      this.isCancelled = true;
    }
  }

  public wait(): Promise<unknown> {
    return this.promise;
  }
}

export class AggregateContinuationTask<TArgs extends unknown[]> implements ILifecycleTask {
  public done: boolean;

  private hasStarted: boolean;
  private isCancelled: boolean;
  private readonly promise: Promise<unknown>;

  constructor(
    antecedents: ILifecycleTask[],
    next: (...args: TArgs) => void | ILifecycleTask,
    context: unknown,
    ...args: TArgs
  ) {
    this.done = false;
    this.hasStarted = false;
    this.isCancelled = false;
    this.promise = Promise.all(antecedents.map(t => t.wait())).then(() => {
      if (this.isCancelled === true) {
        return;
      }
      this.hasStarted = true;
      const nextResult = next.call(context, ...args) as undefined | ILifecycleTask;
      if (nextResult === void 0) {
        this.done = true;
      } else {
        return nextResult.wait().then(() => {
          this.done = true;
        });
      }
    });
  }

  public canCancel(): boolean {
    return !this.hasStarted;
  }

  public cancel(): void {
    if (this.canCancel()) {
      this.isCancelled = true;
    }
  }

  public wait(): Promise<unknown> {
    return this.promise;
  }
}

export function allowUnmount(flags: LifecycleFlags): boolean {
  // Only unmount if either:
  // - No parent view/element is queued for unmount yet, or
  // - Aurelia is stopping (in which case all nodes need to return to their fragments for a clean mount on next start)
  return (((flags & LifecycleFlags.parentUnmountQueued) ^ LifecycleFlags.parentUnmountQueued) | (flags & LifecycleFlags.fromStopTask)) > 0;
}

export function isBinding(state: State): boolean {
  return (state & State.isBinding) === State.isBinding;
}
export function isBound(state: State): boolean {
  return (state & State.isBound) === State.isBound;
}
export function isNotBound(state: State): boolean {
  return (state & State.isBound) === 0;
}
export function isAttaching(state: State): boolean {
  return (state & State.isAttaching) === State.isAttaching;
}
export function isAttached(state: State): boolean {
  return (state & State.isAttached) === State.isAttached;
}
export function isNotAttached(state: State): boolean {
  return (state & State.isAttached) === 0;
}
export function isMounted(state: State): boolean {
  return (state & State.isMounted) === State.isMounted;
}
export function isNotMounted(state: State): boolean {
  return (state & State.isMounted) === 0;
}
export function isDetaching(state: State): boolean {
  return (state & State.isDetaching) === State.isDetaching;
}
export function isUnbinding(state: State): boolean {
  return (state & State.isUnbinding) === State.isUnbinding;
}
export function isCached(state: State): boolean {
  return (state & State.isCached) === State.isCached;
}
export function isContainerless(state: State): boolean {
  return (state & State.isContainerless) === State.isContainerless;
}
export function isPatching(state: State): boolean {
  return (state & State.isPatching) === State.isPatching;
}
export function isHydrated(state: State): boolean {
  return (state & State.isHydrated) === State.isHydrated;
}

export function setBinding(state: State): State {
  return state | State.isBinding;
}
export function setBound(state: State): State {
  return (state & ~State.isBinding) | State.isBound;
}
export function setAttaching(state: State): State {
  return state | State.isAttaching;
}
export function setAttached(state: State): State {
  return (state & ~State.isAttaching) | State.isAttached;
}
export function setDetached(state: State): State {
  return state & ~(State.isAttached | State.isAttaching);
}
export function setMounted(state: State): State {
  return state | State.isMounted;
}
export function setNotMounted(state: State): State {
  return state & ~State.isMounted;
}
export function setDetaching(state: State): State {
  return state | State.isDetaching;
}
export function setUnbinding(state: State): State {
  return state | State.isUnbinding;
}
export function setUnbound(state: State): State {
  return state & ~(State.isBound | State.isUnbinding);
}
export function setCached(state: State): State {
  return state | State.isCached;
}
export function setNotCached(state: State): State {
  return state & ~State.isCached;
}
export function setContainerless(state: State): State {
  return state | State.isContainerless;
}
export function setPatching(state: State): State {
  return state | State.isPatching;
}
export function setNotPatching(state: State): State {
  return state & ~State.isPatching;
}
export function setHydrated(state: State): State {
  return state | State.isHydrated;
}

export function hasRenderHook<T extends ILifecycleHooks & { render?(...args: unknown[]): unknown }>(obj: T): obj is T & Required<Pick<T, 'render'>> {
  return (obj.$hooks & Hooks.hasRender) === Hooks.hasRender;
}
export function hasCreatedHook<T extends ILifecycleHooks>(obj: T): obj is T & Required<Pick<ILifecycleHooks, 'created'>> {
  return (obj.$hooks & Hooks.hasCreated) === Hooks.hasCreated;
}
export function hasBindingHook<T extends ILifecycleHooks>(obj: T): obj is T & Required<Pick<ILifecycleHooks, 'binding'>> {
  return (obj.$hooks & Hooks.hasBinding) === Hooks.hasBinding;
}
export function hasBoundHook<T extends ILifecycleHooks>(obj: T): obj is T & Required<Pick<ILifecycleHooks, 'bound'>> {
  return (obj.$hooks & Hooks.hasBound) === Hooks.hasBound;
}
export function hasUnbindingHook<T extends ILifecycleHooks>(obj: T): obj is T & Required<Pick<ILifecycleHooks, 'unbinding'>> {
  return (obj.$hooks & Hooks.hasUnbinding) === Hooks.hasUnbinding;
}
export function hasUnboundHook<T extends ILifecycleHooks>(obj: T): obj is T & Required<Pick<ILifecycleHooks, 'unbound'>> {
  return (obj.$hooks & Hooks.hasUnbound) === Hooks.hasUnbound;
}
export function hasAttachingHook<T extends ILifecycleHooks>(obj: T): obj is T & Required<Pick<ILifecycleHooks, 'attaching'>> {
  return (obj.$hooks & Hooks.hasAttaching) === Hooks.hasAttaching;
}
export function hasAttachedHook<T extends ILifecycleHooks>(obj: T): obj is T & Required<Pick<ILifecycleHooks, 'attached'>> {
  return (obj.$hooks & Hooks.hasAttached) === Hooks.hasAttached;
}
export function hasDetachingHook<T extends ILifecycleHooks>(obj: T): obj is T & Required<Pick<ILifecycleHooks, 'detaching'>> {
  return (obj.$hooks & Hooks.hasDetaching) === Hooks.hasDetaching;
}
export function hasDetachedHook<T extends ILifecycleHooks>(obj: T): obj is T & Required<Pick<ILifecycleHooks, 'detached'>> {
  return (obj.$hooks & Hooks.hasDetached) === Hooks.hasDetached;
}
export function hasCachingHook<T extends ILifecycleHooks>(obj: T): obj is T & Required<Pick<ILifecycleHooks, 'caching'>> {
  return (obj.$hooks & Hooks.hasCaching) === Hooks.hasCaching;
}

export function hasAsyncWork(value: MaybePromiseOrTask): value is PromiseOrTask {
  return !(value === void 0 || (value as ILifecycleTask).done === true);
}
