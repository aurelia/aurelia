import {
  DI,
  IContainer,
  IDisposable,
  Immutable,
  InterfaceSymbol,
  IResolver,
  IServiceLocator,
  Omit,
  PLATFORM,
  Registration,
  Tracer
} from '@aurelia/kernel';
import { IConnectableBinding } from './binding/connectable';
import { ITargetedInstruction, TemplateDefinition, TemplatePartDefinitions } from './definitions';
import { INode, INodeSequence, IRenderLocation } from './dom';
import { IChangeTracker, IScope, LifecycleFlags } from './observation';

const slice = Array.prototype.slice;

export const enum State {
  none                  = 0b000000000000,
  isBinding             = 0b000000000001,
  isBound               = 0b000000000010,
  isAttaching           = 0b000000000100,
  isAttached            = 0b000000001000,
  isMounted             = 0b000000010000,
  isDetaching           = 0b000000100000,
  isUnbinding           = 0b000001000000,
  isCached              = 0b000010000000,
  isContainerless       = 0b000100000000
}

export const enum Hooks {
  none                   = 0b000000000001,
  hasCreated             = 0b000000000010,
  hasBinding             = 0b000000000100,
  hasBound               = 0b000000001000,
  hasAttaching           = 0b000000010000,
  hasAttached            = 0b000000100000,
  hasDetaching           = 0b000001000000,
  hasDetached            = 0b000010000000,
  hasUnbinding           = 0b000100000000,
  hasUnbound             = 0b001000000000,
  hasRender              = 0b010000000000,
  hasCaching             = 0b100000000000
}

export interface IHooks {
  $hooks?: Hooks;
}

export interface IState {
  $state?: State;
  $lifecycle?: ILifecycle;
}

export interface IBindables {
  /**
   * The Bindings, Views, CustomElements, CustomAttributes and other bindable components that belong to this instance.
   */
  $bindableHead?: IBindScope;
  $bindableTail?: IBindScope;
}

export interface IAttachables {

  /**
   * The Views, CustomElements, CustomAttributes and other attachable components that belong to this instance.
   */
  $attachableHead?: IAttach;
  $attachableTail?: IAttach;
}

/**
 * An object containing the necessary information to render something for display.
 */
export interface IRenderable<T extends INode = INode> extends IBindables, IAttachables, IState {

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
  render(renderable: IRenderable<T>, targets: ArrayLike<object>, templateDefinition: TemplateDefinition, host?: T, parts?: TemplatePartDefinitions): void;
  beginComponentOperation(renderable: IRenderable<T>, target: object, instruction: Immutable<ITargetedInstruction>, factory?: IViewFactory<T>, parts?: TemplatePartDefinitions, location?: IRenderLocation<T>, locationIsContainer?: boolean): IDisposable;
}

export interface IView<T extends INode = INode> extends IBindScope, IRenderable<T>, IAttach, IMountable {
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
  create(): IView<T>;
}

export const IViewFactory = DI.createInterface<IViewFactory>('IViewFactory').noDefault();

export interface ILifecycleCreated extends IHooks, IState {
  /**
   * Called at the end of `$hydrate`.
   *
   * The following key properties are now assigned and initialized (see `IRenderable` for more detail):
   * - `this.$bindables`
   * - `this.$attachables`
   * - `this.$scope` (null if this is a custom attribute, or contains the view model if this is a custom element)
   * - `this.$nodes`
   *
   * @description
   * This is the second and last "hydrate" lifecycle hook (after `render`). It happens only once per instance (contrary to bind/attach
   * which can happen many times per instance), though it can happen many times per type (once for each instance)
   *
   * This hook is called right before the `$bind` lifecycle starts, making this the last opportunity
   * for any high-level post processing on initialized properties.
   */
  created?(): void;
}

export interface ILifecycleBinding extends IHooks, IState {
  /**
   * Called at the start of `$bind`, before this instance and its children (if any) are bound.
   *
   * - `this.$isBound` is false.
   * - `this.$scope` is initialized.
   *
   * @param flags Contextual information about the lifecycle, such as what triggered it.
   * Some uses for this hook:
   * - `flags & LifecycleFlags.fromStartTask`: the Aurelia app is starting (this is the initial bind)
   * - `flags & LifecycleFlags.fromBind`: this is a normal `$bind` lifecycle
   * - `flags & LifecycleFlags.updateTargetInstance`: this `$bind` was triggered by some upstream observer and is not a real `$bind` lifecycle
   * - `flags & LifecycleFlags.fromFlush` (only occurs in conjunction with updateTargetInstance): the update was queued to a `LinkedChangeList` which is now being flushed
   *
   * @description
   * This is the first "create" lifecycle hook of the hooks that can occur multiple times per instance,
   * and the third lifecycle hook (after `render` and `created`) of the very first this.lifecycle.
   */
  binding?(flags: LifecycleFlags): void;
}

export interface ILifecycleBound extends IHooks, IState {
  /** @internal */$nextBound?: ILifecycleBound;

  /**
   * Called at the end of `$bind`, after this instance and its children (if any) are bound.
   *
   * - `$isBound` is true.
   * - `this.$scope` is initialized.
   *
   * @param flags Contextual information about the lifecycle, such as what triggered it.
   * Some uses for this hook:
   * - `flags & LifecycleFlags.fromStartTask`: the Aurelia app is starting (this is the initial bind)
   * - `flags & LifecycleFlags.fromBind`: this is a normal `$bind` lifecycle
   * - `flags & LifecycleFlags.updateTargetInstance`: this `$bind` was triggered by some upstream observer and is not a real `$bind` lifecycle
   * - `flags & LifecycleFlags.fromFlush` (only occurs in conjunction with updateTargetInstance): the update was queued to a `LinkedChangeList` which is now being flushed
   *
   * @description
   * This is the second "create" lifecycle hook (after `binding`) of the hooks that can occur multiple times per instance,
   * and the fourth lifecycle hook (after `render`, `created` and `binding`) of the very first this.lifecycle.
   */
  bound?(flags: LifecycleFlags): void;
}

export interface ILifecycleUnbinding extends IHooks, IState {
  /**
   * Called at the start of `$unbind`, before this instance and its children (if any) are unbound.
   *
   * - `this.$isBound` is true.
   * - `this.$scope` is still available.
   *
   * @param flags Contextual information about the lifecycle, such as what triggered it.
   * Some uses for this hook:
   * - `flags & LifecycleFlags.fromBind`: the component is just switching scope
   * - `flags & LifecycleFlags.fromUnbind`: the component is really disposing
   * - `flags & LifecycleFlags.fromStopTask`: the Aurelia app is stopping
   *
   * @description
   * This is the fourth "cleanup" lifecycle hook (after `detaching`, `caching` and `detached`)
   *
   * Last opportunity to perform any source or target updates before the bindings are disconnected.
   *
   */
  unbinding?(flags: LifecycleFlags): void;
}

export interface ILifecycleUnbound extends IHooks, IState {
  /** @internal */$nextUnbound?: ILifecycleUnbound;

  /**
   * Called at the end of `$unbind`, after this instance and its children (if any) are unbound.
   *
   * - `this.$isBound` is false at this point.
   *
   * - `this.$scope` may not be available anymore (unless it's a `@customElement`)
   *
   * @param flags Contextual information about the lifecycle, such as what triggered it.
   * Some uses for this hook:
   * - `flags & LifecycleFlags.fromBind`: the component is just switching scope
   * - `flags & LifecycleFlags.fromUnbind`: the component is really disposing
   * - `flags & LifecycleFlags.fromStopTask`: the Aurelia app is stopping
   *
   * @description
   * This is the fifth (and last) "cleanup" lifecycle hook (after `detaching`, `caching`, `detached`
   * and `unbinding`).
   *
   * The lifecycle either ends here, or starts at `$bind` again.
   */
  unbound?(flags: LifecycleFlags): void;
}

export interface ILifecycleAttaching extends IHooks, IState {
  /**
   * Called at the start of `$attach`, before this instance and its children (if any) are attached.
   *
   * `$isAttached` is false.
   *
   * @param encapsulationSource Ask Rob.
   * @param lifecycle Utility that encapsulates the attach sequence for a hierarchy of attachables and guarantees the correct attach order.
   *
   * @description
   * This is the third "create" lifecycle hook (after `binding` and `bound`) of the hooks that can occur multiple times per instance,
   * and the fifth lifecycle hook (after `render`, `created`, `binding` and `bound`) of the very first lifecycle
   *
   * This is the time to add any (sync or async) tasks (e.g. animations) to the lifecycle that need to happen before
   * the nodes are added to the DOM.
   */
  attaching?(flags: LifecycleFlags): void;
}

export interface ILifecycleAttached extends IHooks, IState {
  /** @internal */$nextAttached?: ILifecycleAttached;

  /**
   * Called at the end of `$attach`, after this instance and its children (if any) are attached.
   *
   * - `$isAttached` is true.
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
}

export interface ILifecycleDetaching extends IHooks, IState {
  /**
   * Called at the start of `$detach`, before this instance and its children (if any) are detached.
   *
   * - `$isAttached` is true.
   *
   * @param lifecycle Utility that encapsulates the detach sequence for a hierarchy of attachables and guarantees the correct detach order.
   *
   * @description
   * This is the first "cleanup" lifecycle hook.
   *
   * This is the time to add any (sync or async) tasks (e.g. animations) to the lifecycle that need to happen before
   * the nodes are removed from the DOM.
   */
  detaching?(flags: LifecycleFlags): void;
}

export interface ILifecycleDetached extends IHooks, IState {
  /** @internal */$nextDetached?: ILifecycleDetached;

  /**
   * Called at the end of `$detach`, after this instance and its children (if any) are detached.
   *
   * - `$isAttached` is false.
   *
   * @description
   * This is the third "cleanup" lifecycle hook (after `detaching` and `caching`).
   *
   * The `$nodes` are now removed from the DOM and the `View` (if possible) is returned to cache.
   *
   * If no `$unbind` lifecycle is queued, this is the last opportunity to make state changes before the lifecycle ends.
   */
  detached?(flags: LifecycleFlags): void;
}

export interface ILifecycleCaching extends IHooks, IState {
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

/**
 * Defines optional lifecycle hooks that will be called only when they are implemented.
 */
export interface ILifecycleHooks extends
  ILifecycleCreated,
  ILifecycleBinding,
  ILifecycleBound,
  ILifecycleUnbinding,
  ILifecycleUnbound,
  ILifecycleAttaching,
  ILifecycleAttached,
  ILifecycleDetaching,
  ILifecycleDetached,
  ILifecycleCaching { }

export interface ILifecycleCache {
  $cache(flags: LifecycleFlags): void;
}

export interface ICachable extends ILifecycleCache { }

export interface ILifecycleAttach {
  $attach(flags: LifecycleFlags): void;
}

export interface ILifecycleDetach {
  $detach(flags: LifecycleFlags): void;
}

export interface IAttach extends ILifecycleAttach, ILifecycleDetach, ICachable {
  /** @internal */$nextAttach: IAttach;
  /** @internal */$prevAttach: IAttach;
}

export interface ILifecycleMount {
  /** @internal */$nextMount?: ILifecycleMount;

  /**
   * Add the `$nodes` of this instance to the Host or RenderLocation that this instance is holding.
   */
  $mount(flags: LifecycleFlags): void;
}

export interface ILifecycleUnmount {
  /** @internal */$nextUnmount?: ILifecycleUnmount;

  /**
   * Remove the `$nodes` of this instance from the Host or RenderLocation that this instance is holding, optionally returning them to a cache.
   * @returns
   * - `true` if the instance has been returned to the cache.
   * - `false` if the cache (typically ViewFactory) did not allow the instance to be cached.
   * - `undefined` (void) if the instance does not support caching. Functionally equivalent to `false`
   */
  $unmount(flags: LifecycleFlags): boolean | void;
}
export interface IMountable extends ILifecycleMount, ILifecycleUnmount { }

export interface ILifecycleUnbind {
  $state?: State;
  $unbind(flags: LifecycleFlags): void;
}

export interface ILifecycleUnbindAfterDetach extends ILifecycleUnbind {
  $nextUnbindAfterDetach?: ILifecycleUnbindAfterDetach;
}

export interface ILifecycleBind {
  $state?: State;
  $bind(flags: LifecycleFlags, scope?: IScope): void;
}

export interface ILifecycleBindScope {
  $state?: State;
  $bind(flags: LifecycleFlags, scope: IScope): void;
}

export interface IBind extends ILifecycleBind, ILifecycleUnbind {
  /** @internal */$nextBind: IBindScope;
  /** @internal */$prevBind: IBindScope;
}

export interface IBindScope extends Omit<IBind, '$bind'>, ILifecycleBindScope { }

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

export interface IFlushLifecycle {
  processFlushQueue(flags: LifecycleFlags): void;

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
}

export interface IBindLifecycle extends IFlushLifecycle {
  processConnectQueue(flags: LifecycleFlags): void;
  processPatchQueue(flags: LifecycleFlags): void;
  processBindQueue(flags: LifecycleFlags): void;
  processUnbindQueue(flags: LifecycleFlags): void;

  /**
   * Open up / expand a bind batch for enqueueing `bound` callbacks.
   *
   * When the top-most caller calls `endBind`, the `bound` callbacks will be invoked.
   *
   * Each `beginBind` *must* be matched by an `endBind`.
   */
  beginBind(): void;

  /**
   * Add a `bound` callback to the queue, to be invoked when the current bind batch
   * is ended via `endBind` by the top-most caller.
   *
   * This method is idempotent; adding the same item more than once has the same effect as
   * adding it once.
   */
  enqueueBound(requestor: ILifecycleBound): void;

  /**
   * Add a `connect` callback to the queue, to be invoked *after* mounting and *before*
   * `detached` callbacks.
   *
   * This method is idempotent; adding the same item more than once has the same effect as
   * adding it once.
   */
  enqueueConnect(requestor: IConnectableBinding): void;

  /**
   * Close / shrink a bind batch for invoking queued `bound` callbacks.
   * @param flags The flags that will be passed into the `bound` callbacks.
   *
   * Flags during bind are primarily for optimization purposes, and to control whether
   * changes are batched or propagated synchronously.
   * If unsure which flags to provide, it's OK to use `LifecycleFlags.none` (or simply `0`)
   * This default will work, but is generally less efficient.
   */
  endBind(flags: LifecycleFlags): ILifecycleTask;

  /**
   * Open up / expand an unbind batch for enqueueing `unbound` callbacks.
   *
   * When the top-most caller calls `endUnbind`, the `unbound` callbacks will be invoked.
   *
   * Each `beginUnbind` *must* be matched by an `endUnbind`.
   */
  beginUnbind(): void;

  /**
   * Add an `unbound` callback to the queue, to be invoked when the current unbind batch
   * is ended via `endUnbind` by the top-most caller.
   *
   * This method is idempotent; adding the same item more than once has the same effect as
   * adding it once.
   */
  enqueueUnbound(requestor: ILifecycleUnbound): void;

  /**
   * Close / shrink an unbind batch for invoking queued `unbound` callbacks.
   * @param flags The flags that will be passed into the `unbound` callbacks.
   *
   * Flags during unbind are primarily for optimization purposes, and to control whether
   * changes are batched or propagated synchronously.
   * If unsure which flags to provide, it's OK to use `LifecycleFlags.none` (or simply `0`)
   * This default will work, but is generally less efficient.
   */
  endUnbind(flags: LifecycleFlags): ILifecycleTask;
}

export interface IAttachLifecycle extends IFlushLifecycle {
  processAttachQueue(flags: LifecycleFlags): void;
  processDetachQueue(flags: LifecycleFlags): void;

  /**
   * Open up / expand an attach batch for enqueueing `$mount` and `attached` callbacks.
   *
   * When the top-most caller calls `endAttach`, the `$mount` and `attached` callbacks
   * will be invoked (in that order).
   *
   * Each `beginAttach` *must* be matched by an `endAttach`.
   */
  beginAttach(): void;

  /**
   * Add a `$mount` callback to the queue, to be invoked when the current attach batch
   * is ended via `endAttach` by the top-most caller.
   *
   * This method is idempotent; adding the same item more than once has the same effect as
   * adding it once.
   */
  enqueueMount(requestor: ILifecycleMount): void;

  /**
   * Add an `attached` callback to the queue, to be invoked when the current attach batch
   * is ended via `endAttach` by the top-most caller.
   *
   * This method is idempotent; adding the same item more than once has the same effect as
   * adding it once.
   */
  enqueueAttached(requestor: ILifecycleAttached): void;

  /**
   * Close / shrink an attach batch for invoking queued `$mount` and `attached` callbacks.
   * @param flags The flags that will be passed into the `$mount` and `attached` callbacks.
   *
   * Flags during attach are primarily for optimization purposes.
   * If unsure which flags to provide, it's OK to use `LifecycleFlags.none` (or simply `0`)
   * This default will work, but is generally less efficient.
   */
  endAttach(flags: LifecycleFlags): ILifecycleTask;

  /**
   * Open up / expand a detach batch for enqueueing `$unmount` and `detached` callbacks.
   *
   * When the top-most caller calls `endAttach`, the `$unmount` and `detached` callbacks
   * will be invoked (in that order).
   *
   * Each `beginAttach` *must* be matched by an `endAttach`.
   */
  beginDetach(): void;

  /**
   * Add a `$unmount` callback to the queue, to be invoked when the current detach batch
   * is ended via `endAttach` by the top-most caller.
   *
   * This method is idempotent; adding the same item more than once has the same effect as
   * adding it once.
   */
  enqueueUnmount(requestor: ILifecycleUnmount): void;

  /**
   * Add a `detached` callback to the queue, to be invoked when the current detach batch
   * is ended via `endAttach` by the top-most caller.
   *
   * This method is idempotent; adding the same item more than once has the same effect as
   * adding it once.
   */
  enqueueDetached(requestor: ILifecycleDetached): void;

  /**
   * Add an `$unbind` callback to the queue, to be invoked when the current detach batch
   * is ended via `endAttach` by the top-most caller. The callback is invoked after all the
   * `$unmount` and `detached` callbacks are processed.
   *
   * This method is idempotent; adding the same item more than once has the same effect as
   * adding it once.
   */
  enqueueUnbindAfterDetach(requestor: ILifecycleUnbind): void;

  /**
   * Close / shrink a detach batch for invoking queued `$unmount` and `detached` callbacks.
   * @param flags The flags that will be passed into the `$unmount` and `detached` callbacks.
   *
   * Flags during detach are primarily for optimization purposes, and to control whether a
   * component should be unmounted or not (the default is to only unmount root nodes).
   * If unsure which flags to provide, it's OK to use `LifecycleFlags.none` (or simply `0`).
   * This default will work, but is generally less efficient.
   */
  endDetach(flags: LifecycleFlags): ILifecycleTask;
}

export interface ILifecycle extends IBindLifecycle, IAttachLifecycle {
  registerTask(task: ILifecycleTask): void;
  finishTask(task: ILifecycleTask): void;
}

export const ILifecycle = DI.createInterface<ILifecycle>('ILifecycle').withDefault(x => x.singleton(Lifecycle));

/** @internal */
export class Lifecycle implements ILifecycle {
  /** @internal */public bindDepth: number;
  /** @internal */public attachDepth: number;
  /** @internal */public detachDepth: number;
  /** @internal */public unbindDepth: number;

  /** @internal */public flushHead: IChangeTracker;
  /** @internal */public flushTail: IChangeTracker;

  /** @internal */public connectHead: IConnectableBinding;
  /** @internal */public connectTail: IConnectableBinding;

  /** @internal */public patchHead: IConnectableBinding;
  /** @internal */public patchTail: IConnectableBinding;

  /** @internal */public boundHead: ILifecycleBound;
  /** @internal */public boundTail: ILifecycleBound;

  /** @internal */public mountHead: ILifecycleMount;
  /** @internal */public mountTail: ILifecycleMount;

  /** @internal */public attachedHead: ILifecycleAttached;
  /** @internal */public attachedTail: ILifecycleAttached;

  /** @internal */public unmountHead: ILifecycleUnmount;
  /** @internal */public unmountTail: ILifecycleUnmount;

  /** @internal */public detachedHead: ILifecycleDetached;
  /** @internal */public detachedTail: ILifecycleDetached;

  /** @internal */public unbindAfterDetachHead: ILifecycleUnbindAfterDetach;
  /** @internal */public unbindAfterDetachTail: ILifecycleUnbindAfterDetach;

  /** @internal */public unboundHead: ILifecycleUnbound;
  /** @internal */public unboundTail: ILifecycleUnbound;

  /** @internal */public flushed: Promise<void>;
  /** @internal */public promise: Promise<void>;

  /** @internal */public flushCount: number;
  /** @internal */public connectCount: number;
  /** @internal */public patchCount: number;
  /** @internal */public boundCount: number;
  /** @internal */public mountCount: number;
  /** @internal */public attachedCount: number;
  /** @internal */public unmountCount: number;
  /** @internal */public detachedCount: number;
  /** @internal */public unbindAfterDetachCount: number;
  /** @internal */public unboundCount: number;

  // These are dummy properties to make the lifecycle conform to the interfaces
  // of the components it manages. This allows the lifecycle itself to be the first link
  // in the chain and removes the need for an additional null check on each addition.
  /** @internal */public $nextFlush: IChangeTracker;
  /** @internal */public flush: IChangeTracker['flush'];
  /** @internal */public $nextConnect: IConnectableBinding;
  /** @internal */public connect: IConnectableBinding['connect'];
  /** @internal */public $nextPatch: IConnectableBinding;
  /** @internal */public patch: IConnectableBinding['patch'];
  /** @internal */public $nextBound: ILifecycleBound;
  /** @internal */public bound: ILifecycleBound['bound'];
  /** @internal */public $nextMount: ILifecycleMount;
  /** @internal */public $mount: ILifecycleMount['$mount'];
  /** @internal */public $nextAttached: ILifecycleAttached;
  /** @internal */public attached: ILifecycleAttached['attached'];
  /** @internal */public $nextUnmount: ILifecycleUnmount;
  /** @internal */public $unmount: ILifecycleUnmount['$unmount'];
  /** @internal */public $nextDetached: ILifecycleDetached;
  /** @internal */public detached: ILifecycleDetached['detached'];
  /** @internal */public $nextUnbindAfterDetach: ILifecycleUnbindAfterDetach;
  /** @internal */public $unbind: ILifecycleUnbindAfterDetach['$unbind'];
  /** @internal */public $nextUnbound: ILifecycleUnbound;
  /** @internal */public unbound: ILifecycleUnbound['unbound'];

  /** @internal */public task: AggregateLifecycleTask | null;

  constructor() {
    this.bindDepth = 0;
    this.attachDepth = 0;
    this.detachDepth = 0;
    this.unbindDepth = 0;

    this.flushHead = this;
    this.flushTail = this;

    this.connectHead = this as unknown as IConnectableBinding; // this cast is safe because we know exactly which properties we'll use
    this.connectTail = this as unknown as IConnectableBinding;

    this.patchHead = this as unknown as IConnectableBinding;
    this.patchTail = this as unknown as IConnectableBinding;

    this.boundHead = this;
    this.boundTail = this;

    this.mountHead = this;
    this.mountTail = this;

    this.attachedHead = this;
    this.attachedTail = this;

    this.unmountHead = this;
    this.unmountTail = this;

    this.detachedHead = this; //LOL
    this.detachedTail = this;

    this.unbindAfterDetachHead = this;
    this.unbindAfterDetachTail = this;

    this.unboundHead = this;
    this.unboundTail = this;

    this.flushed = null;
    this.promise = Promise.resolve();

    this.flushCount = 0;
    this.connectCount = 0;
    this.patchCount = 0;
    this.boundCount = 0;
    this.mountCount = 0;
    this.attachedCount = 0;
    this.unmountCount = 0;
    this.detachedCount = 0;
    this.unbindAfterDetachCount = 0;
    this.unboundCount = 0;

    this.$nextFlush = marker;
    this.flush = PLATFORM.noop;
    this.$nextConnect = marker;
    this.connect = PLATFORM.noop;
    this.$nextPatch = marker;
    this.patch = PLATFORM.noop;
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
    this.$nextUnbindAfterDetach = marker;
    this.$unbind = PLATFORM.noop;
    this.$nextUnbound = marker;
    this.unbound = PLATFORM.noop;

    this.task = null;
  }

  public static register(container: IContainer): IResolver<ILifecycle> {
    return Registration.singleton(ILifecycle, this).register(container);
  }

  public registerTask(task: ILifecycleTask): void {
    if (this.task === null) {
      this.task = new AggregateLifecycleTask();
    }
    this.task.addTask(task);
  }

  public finishTask(task: ILifecycleTask): void {
    if (this.task !== null) {
      if (this.task === task) {
        this.task = null;
      } else {
        this.task.removeTask(task);
      }
    }
  }

  public enqueueFlush(requestor: IChangeTracker): Promise<void> {
    if (Tracer.enabled) { Tracer.enter('Lifecycle.enqueueFlush', slice.call(arguments)); }
    // Queue a flush() callback; the depth is just for debugging / testing purposes and has
    // no effect on execution. flush() will automatically be invoked when the promise resolves,
    // or it can be manually invoked synchronously.
    if (this.flushHead === this) {
      this.flushed = this.promise.then(() => { this.processFlushQueue(LifecycleFlags.fromAsyncFlush); });
    }
    if (requestor.$nextFlush === null) {
      requestor.$nextFlush = marker;
      this.flushTail.$nextFlush = requestor;
      this.flushTail = requestor;
      ++this.flushCount;
    }
    if (Tracer.enabled) { Tracer.leave(); }
    return this.flushed;
  }

  public processFlushQueue(flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle.processFlushQueue', slice.call(arguments)); }
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

  public beginBind(): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle.beginBind', slice.call(arguments)); }
    ++this.bindDepth;
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public enqueueBound(requestor: ILifecycleBound): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle.enqueueBound', slice.call(arguments)); }
    // build a standard singly linked list for bound callbacks
    if (requestor.$nextBound === null) {
      requestor.$nextBound = marker;
      this.boundTail.$nextBound = requestor;
      this.boundTail = requestor;
      ++this.boundCount;
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public enqueueConnect(requestor: IConnectableBinding): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle.enqueueConnect', slice.call(arguments)); }
    // enqueue connect and patch calls in separate lists so that they can be invoked
    // independently from eachother
    // TODO: see if we can eliminate/optimize some of this, because this is a relatively hot path
    // (first get all the necessary integration tests working, then look for optimizations)

    // build a standard singly linked list for connect callbacks
    if (requestor.$nextConnect === null) {
      requestor.$nextConnect = marker;
      this.connectTail.$nextConnect = requestor;
      this.connectTail = requestor;
      ++this.connectCount;
    }
    // build a standard singly linked list for patch callbacks
    if (requestor.$nextPatch === null) {
      requestor.$nextPatch = marker;
      this.patchTail.$nextPatch = requestor;
      this.patchTail = requestor;
      ++this.patchCount;
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public processConnectQueue(flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle.processConnectQueue', slice.call(arguments)); }
    // connects cannot lead to additional connects, so we don't need to loop here
    if (this.connectCount > 0) {
      this.connectCount = 0;
      let current = this.connectHead.$nextConnect;
      this.connectHead = this.connectTail = this as unknown as IConnectableBinding;
      let next: typeof current;
      do {
        current.connect(flags);
        next = current.$nextConnect;
        current.$nextConnect = null;
        current = next;
      } while (current !== marker);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public processPatchQueue(flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle.processPatchQueue', slice.call(arguments)); }
    // flush before patching, but only if this is the initial bind;
    // no DOM is attached yet so we can safely let everything propagate
    if (flags & LifecycleFlags.fromStartTask) {
      this.processFlushQueue(flags | LifecycleFlags.fromSyncFlush);
    }
    // patch callbacks may lead to additional bind operations, so keep looping until
    // the patch head is back to `this` (though this will typically happen in the first iteration)
    while (this.patchCount > 0) {
      this.patchCount = 0;
      let current = this.patchHead.$nextPatch;
      this.patchHead = this.patchTail = this as unknown as IConnectableBinding;
      let next: typeof current;
      do {
        current.patch(flags);
        next = current.$nextPatch;
        current.$nextPatch = null;
        current = next;
      } while (current !== marker);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public endBind(flags: LifecycleFlags): ILifecycleTask {
    if (Tracer.enabled) { Tracer.enter('Lifecycle.endBind', slice.call(arguments)); }
    // close / shrink a bind batch
    if (--this.bindDepth === 0) {
      if (this.task !== null && !this.task.done) {
        this.task.owner = this;
        if (Tracer.enabled) { Tracer.leave(); }
        return this.task;
      }

      this.processBindQueue(flags);

      if (Tracer.enabled) { Tracer.leave(); }
      return LifecycleTask.done;
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public processBindQueue(flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle.processBindQueue', slice.call(arguments)); }
    // flush before processing bound callbacks, but only if this is the initial bind;
    // no DOM is attached yet so we can safely let everything propagate
    if (flags & LifecycleFlags.fromStartTask) {
      this.processFlushQueue(flags | LifecycleFlags.fromSyncFlush);
    }
    // bound callbacks may lead to additional bind operations, so keep looping until
    // the bound head is back to `this` (though this will typically happen in the first iteration)
    while (this.boundCount > 0) {
      this.boundCount = 0;
      let current = this.boundHead.$nextBound;
      let next: ILifecycleBound;
      this.boundHead = this.boundTail = this;
      do {
        current.bound(flags);
        next = current.$nextBound;
        current.$nextBound = null;
        current = next;
      } while (current !== marker);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public beginUnbind(): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle.beginUnbind', slice.call(arguments)); }
    // open up / expand an unbind batch; the very first caller will close it again with endUnbind
    ++this.unbindDepth;
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public enqueueUnbound(requestor: ILifecycleUnbound): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle.enqueueUnbound', slice.call(arguments)); }
    // This method is idempotent; adding the same item more than once has the same effect as
    // adding it once.
    // build a standard singly linked list for unbound callbacks
    if (requestor.$nextUnbound === null) {
      requestor.$nextUnbound = marker;
      this.unboundTail.$nextUnbound = requestor;
      this.unboundTail = requestor;
      ++this.unboundCount;
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public endUnbind(flags: LifecycleFlags): ILifecycleTask {
    if (Tracer.enabled) { Tracer.enter('Lifecycle.endUnbind', slice.call(arguments)); }
    // close / shrink an unbind batch
    if (--this.unbindDepth === 0) {
      if (this.task !== null && !this.task.done) {
        this.task.owner = this;
        if (Tracer.enabled) { Tracer.leave(); }
        return this.task;
      }

      this.processUnbindQueue(flags);

      if (Tracer.enabled) { Tracer.leave(); }
      return LifecycleTask.done;
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public processUnbindQueue(flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle.processUnbindQueue', slice.call(arguments)); }
    // unbound callbacks may lead to additional unbind operations, so keep looping until
    // the unbound head is back to `this` (though this will typically happen in the first iteration)
    while (this.unboundCount > 0) {
      this.unboundCount = 0;
      let current = this.unboundHead.$nextUnbound;
      let next: ILifecycleUnbound;
      this.unboundHead = this.unboundTail = this;
      do {
        current.unbound(flags);
        next = current.$nextUnbound;
        current.$nextUnbound = null;
        current = next;
      } while (current !== marker);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public beginAttach(): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle.beginAttach', slice.call(arguments)); }
    // open up / expand an attach batch; the very first caller will close it again with endAttach
    ++this.attachDepth;
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public enqueueMount(requestor: ILifecycleMount): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle.enqueueMount', slice.call(arguments)); }
    // This method is idempotent; adding the same item more than once has the same effect as
    // adding it once.
    // build a standard singly linked list for mount callbacks
    if (requestor.$nextMount === null) {
      requestor.$nextMount = marker;
      this.mountTail.$nextMount = requestor;
      this.mountTail = requestor;
      ++this.mountCount;
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public enqueueAttached(requestor: ILifecycleAttached): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle.enqueueAttached', slice.call(arguments)); }
    // This method is idempotent; adding the same item more than once has the same effect as
    // adding it once.
    // build a standard singly linked list for attached callbacks
    if (requestor.$nextAttached === null) {
      requestor.$nextAttached = marker;
      this.attachedTail.$nextAttached = requestor;
      this.attachedTail = requestor;
      ++this.attachedCount;
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public endAttach(flags: LifecycleFlags): ILifecycleTask {
    if (Tracer.enabled) { Tracer.enter('Lifecycle.endAttach', slice.call(arguments)); }
    // close / shrink an attach batch
    if (--this.attachDepth === 0) {
      if (this.task !== null && !this.task.done) {
        this.task.owner = this;
        if (Tracer.enabled) { Tracer.leave(); }
        return this.task;
      }

      this.processAttachQueue(flags);

      if (Tracer.enabled) { Tracer.leave(); }
      return LifecycleTask.done;
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public processAttachQueue(flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle.processAttachQueue', slice.call(arguments)); }
    // flush and patch before starting the attach lifecycle to ensure batched collection changes are propagated to repeaters
    // and the DOM is updated
    this.processFlushQueue(flags | LifecycleFlags.fromSyncFlush);
    // TODO: prevent duplicate updates coming from the patch queue (or perhaps it's just not needed in its entirety?)
    //this.processPatchQueue(flags | LifecycleFlags.fromSyncFlush);

    if (this.mountCount > 0) {
      this.mountCount = 0;
      let currentMount = this.mountHead.$nextMount;
      this.mountHead = this.mountTail = this;
      let nextMount: typeof currentMount;

      do {
        currentMount.$mount(flags);
        nextMount = currentMount.$nextMount;
        currentMount.$nextMount = null;
        currentMount = nextMount;
      } while (currentMount !== marker);
    }
    // Connect all connect-queued bindings AFTER mounting is done, so that the DOM is visible asap,
    // but connect BEFORE running the attached callbacks to ensure any changes made during those callbacks
    // are still accounted for.
    // TODO: add a flag/option to further delay connect with a RAF callback (the tradeoff would be that we'd need
    // to run an additional patch cycle before that connect, which can be expensive and unnecessary in most real
    // world scenarios, but can significantly speed things up with nested, highly volatile data like in dbmonster)
    this.processConnectQueue(LifecycleFlags.mustEvaluate);

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

  public beginDetach(): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle.beginDetach', slice.call(arguments)); }
    // open up / expand a detach batch; the very first caller will close it again with endDetach
    ++this.detachDepth;
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public enqueueUnmount(requestor: ILifecycleUnmount): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle.enqueueUnmount', slice.call(arguments)); }
    // This method is idempotent; adding the same item more than once has the same effect as
    // adding it once.
    // build a standard singly linked list for unmount callbacks
    if (requestor.$nextUnmount === null) {
      requestor.$nextUnmount = marker;
      this.unmountTail.$nextUnmount = requestor;
      this.unmountTail = requestor;
      ++this.unmountCount;
    }
    // this is a temporary solution until a cleaner method surfaces.
    // if an item being queued for unmounting is already in the mount queue,
    // remove it from the mount queue (this can occur in some very exotic situations
    // and should be dealt with in a less hacky way)
    if ((requestor as ILifecycleMount & ILifecycleUnmount).$nextMount !== null) {
      let current = this.mountHead as ILifecycleMount & ILifecycleUnmount;
      let next = current.$nextMount as ILifecycleMount & ILifecycleUnmount;
      while (next !== requestor) {
        current = next;
        next = current.$nextMount as ILifecycleMount & ILifecycleUnmount;
      }
      current.$nextMount = next.$nextMount;
      next.$nextMount = null;
      if (this.mountTail === next) {
        this.mountTail = this;
      }
      --this.mountCount;
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public enqueueDetached(requestor: ILifecycleDetached): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle.enqueueDetached', slice.call(arguments)); }
    // This method is idempotent; adding the same item more than once has the same effect as
    // adding it once.
    // build a standard singly linked list for detached callbacks
    if (requestor.$nextDetached === null) {
      requestor.$nextDetached = marker;
      this.detachedTail.$nextDetached = requestor;
      this.detachedTail = requestor;
      ++this.detachedCount;
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public enqueueUnbindAfterDetach(requestor: ILifecycleUnbindAfterDetach): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle.enqueueUnbindAfterDetach', slice.call(arguments)); }
    // This method is idempotent; adding the same item more than once has the same effect as
    // adding it once.
    // build a standard singly linked list for unbindAfterDetach callbacks
    if (requestor.$nextUnbindAfterDetach === null) {
      requestor.$nextUnbindAfterDetach = marker;
      this.unbindAfterDetachTail.$nextUnbindAfterDetach = requestor;
      this.unbindAfterDetachTail = requestor;
      ++this.unbindAfterDetachCount;
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public endDetach(flags: LifecycleFlags): ILifecycleTask {
    if (Tracer.enabled) { Tracer.enter('Lifecycle.endDetach', slice.call(arguments)); }
    // close / shrink a detach batch
    if (--this.detachDepth === 0) {
      if (this.task !== null && !this.task.done) {
        this.task.owner = this;
        return this.task;
      }

      this.processDetachQueue(flags);

      if (Tracer.enabled) { Tracer.leave(); }
      return LifecycleTask.done;
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public processDetachQueue(flags: LifecycleFlags): void {
    if (Tracer.enabled) { Tracer.enter('Lifecycle.processDetachQueue', slice.call(arguments)); }
    // flush before unmounting to ensure batched collection changes propagate to the repeaters,
    // which may lead to additional unmount operations
    this.processFlushQueue(flags | LifecycleFlags.fromFlush | LifecycleFlags.doNotUpdateDOM);

    if (this.unmountCount > 0) {
      this.unmountCount = 0;
      let currentUnmount = this.unmountHead.$nextUnmount;
      this.unmountHead = this.unmountTail = this;
      let nextUnmount: typeof currentUnmount;

      do {
        currentUnmount.$unmount(flags);
        nextUnmount = currentUnmount.$nextUnmount;
        currentUnmount.$nextUnmount = null;
        currentUnmount = nextUnmount;
      } while (currentUnmount !== marker);
    }

    if (this.detachedCount > 0) {
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
    }

    if (this.unbindAfterDetachCount > 0) {
      this.beginUnbind();
      this.unbindAfterDetachCount = 0;
      let currentUnbind = this.unbindAfterDetachHead.$nextUnbindAfterDetach;
      this.unbindAfterDetachHead = this.unbindAfterDetachTail = this;
      let nextUnbind: typeof currentUnbind;

      do {
        currentUnbind.$unbind(flags);
        nextUnbind = currentUnbind.$nextUnbindAfterDetach;
        currentUnbind.$nextUnbindAfterDetach = null;
        currentUnbind = nextUnbind;
      } while (currentUnbind !== marker);
      this.endUnbind(flags);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

export class CompositionCoordinator {
  public static readonly inject: ReadonlyArray<InterfaceSymbol<unknown>> = [ILifecycle];

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

  public compose(value: IView | Promise<IView>, flags: LifecycleFlags): void {
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
  }

  public binding(flags: LifecycleFlags, scope: IScope): void {
    this.scope = scope;
    this.isBound = true;

    if (this.currentView !== null) {
      this.currentView.$bind(flags, scope);
    }
  }

  public attaching(flags: LifecycleFlags): void {
    this.isAttached = true;

    if (this.currentView !== null) {
      this.currentView.$attach(flags);
    }
  }

  public detaching(flags: LifecycleFlags): void {
    this.isAttached = false;

    if (this.currentView !== null) {
      this.currentView.$detach(flags);
    }
  }

  public unbinding(flags: LifecycleFlags): void {
    this.isBound = false;

    if (this.currentView !== null) {
      this.currentView.$unbind(flags);
    }
  }

  public caching(flags: LifecycleFlags): void {
    this.currentView = null;
  }

  private enqueue(view: IView | PromiseSwap): void {
    if (this.queue === null) {
      this.queue = [];
    }

    this.queue.push(view);
  }

  private swap(view: IView, flags: LifecycleFlags): void {
    if (this.currentView === view) {
      return;
    }

    const $lifecycle = this.$lifecycle;
    const swapTask = new AggregateLifecycleTask();

    let lifecycleTask: ILifecycleTask;
    let currentView = this.currentView;
    if (currentView === null) {
      lifecycleTask = LifecycleTask.done;
    } else {
      $lifecycle.enqueueUnbindAfterDetach(currentView);
      $lifecycle.beginDetach();
      currentView.$detach(flags);
      lifecycleTask = $lifecycle.endDetach(flags);
    }
    swapTask.addTask(lifecycleTask);

    currentView = this.currentView = view;

    if (currentView === null) {
      lifecycleTask = LifecycleTask.done;
    } else {
      if (this.isBound) {
        $lifecycle.beginBind();
        currentView.$bind(flags, this.scope);
        $lifecycle.endBind(flags);
      }
      if (this.isAttached) {
        $lifecycle.beginAttach();
        currentView.$attach(flags);
        lifecycleTask = $lifecycle.endAttach(flags);
      } else {
        lifecycleTask = LifecycleTask.done;
      }
    }
    swapTask.addTask(lifecycleTask);

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
  }

  private processNext(): void {
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
  }
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

  /** @internal */
  public owner: Lifecycle;

  private readonly tasks: ILifecycleTask[];
  private resolve: () => void;
  private waiter: Promise<void>;

  constructor() {
    this.done = true;

    this.owner = null;

    this.resolve = null;
    this.tasks = [];
    this.waiter = null;
  }

  public addTask(task: ILifecycleTask): void {
    if (!task.done) {
      this.done = false;
      this.tasks.push(task);
      task.wait().then(() => { this.tryComplete(); }).catch(error => { throw error; });
    }
  }

  public removeTask(task: ILifecycleTask): void {
    if (task.done) {
      const idx = this.tasks.indexOf(task);
      if (idx !== -1) {
        this.tasks.splice(idx, 1);
      }
    }
    if (this.tasks.length === 0 && this.owner !== null) {
      this.owner.finishTask(this);
      this.owner = null;
    }
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
      this.complete(true);
    }
  }

  private complete(notCancelled: boolean): void {
    this.done = true;

    if (notCancelled && this.owner !== null) {
      this.owner.processDetachQueue(LifecycleFlags.fromLifecycleTask);
      this.owner.processUnbindQueue(LifecycleFlags.fromLifecycleTask);
      this.owner.processBindQueue(LifecycleFlags.fromLifecycleTask);
      this.owner.processAttachQueue(LifecycleFlags.fromLifecycleTask);
    }
    this.owner.finishTask(this);

    if (this.resolve !== null) {
      this.resolve();
    }
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

// tslint:disable:jsdoc-format
/**
 * A general-purpose ILifecycleTask implementation that can be placed
 * before an attached, detached, bound or unbound hook during attaching,
 * detaching, binding or unbinding, respectively.
 *
 * The provided promise will be awaited before the corresponding lifecycle
 * hook (and any hooks following it) is invoked.
 *
 * The provided callback will be invoked after the promise is resolved
 * and before the next lifecycle hook.
 *
 * Example:
```ts
export class MyViewModel {
  private $lifecycle: ILifecycle; // set before created() hook
  private answer: number;

  public binding(flags: LifecycleFlags): void {
    // this.answer === undefined
    this.$lifecycle.registerTask(new PromiseTask(
      this.getAnswerAsync,
      answer => {
        this.answer = answer;
      }
    ));
  }

  public bound(flags: LifecycleFlags): void {
    // this.answer === 42
  }

  private getAnswerAsync(): Promise<number> {
    return Promise.resolve().then(() => 42);
  }
}
```
 */
// tslint:enable:jsdoc-format
export class PromiseTask<T = void> implements ILifecycleTask<T> {
  public done: boolean;

  private isCancelled: boolean;
  private readonly promise: Promise<T>;
  private readonly callback: (result?: T) => void;

  constructor(promise: Promise<T>, callback: (result?: T) => void) {
    this.done = false;
    this.isCancelled = false;
    this.callback = callback;
    this.promise = promise.then(value => {
      if (this.isCancelled === true) {
        return;
      }
      this.done = true;
      this.callback(value);
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
