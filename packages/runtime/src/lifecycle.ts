import { DI, IContainer, IDisposable, Immutable, inject, InterfaceSymbol, IResolver, IServiceLocator, Omit, PLATFORM, Registration } from '../kernel';
import { IConnectableBinding } from './binding/connectable';
import { ITargetedInstruction, TemplateDefinition, TemplatePartDefinitions } from './definitions';
import { IEncapsulationSource, INode, INodeSequence, IRenderLocation } from './dom';
import { IChangeTracker, IScope, LifecycleFlags } from './observation';
import { IFabricNode, IFabricRenderLocation, IFabricNodeSequence } from './three-dom';
import { I3VNode } from './three-vnode';

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
  needsMount            = 0b000100000000
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
export interface IRenderable extends IBindables, IAttachables, IState {

  /**
   * The (dependency) context of this instance.
   *
   * Contains any dependencies required by this instance or its children.
   */
  readonly $context: IRenderContext;

  /**
   * The nodes that represent the visible aspect of this instance.
   *
   * Typically this will be a sequence of `DOM` nodes contained in a `DocumentFragment`
   */
  readonly $nodes: IFabricNodeSequence;

  /**
   * The binding scope that the `$bindables` of this instance will be bound to.
   *
   * This includes the `BindingContext` which can be either a user-defined view model instance, or a synthetic view model instantiated by a `templateController`
   */
  readonly $scope: IScope;
}

export const IRenderable = DI.createInterface<IRenderable>().noDefault();

export interface IRenderContext extends IServiceLocator {
  createChild(): IRenderContext;
  render(renderable: IRenderable, targets: ArrayLike<I3VNode>, templateDefinition: TemplateDefinition, host?: I3VNode, parts?: TemplatePartDefinitions): void;
  beginComponentOperation(renderable: IRenderable, target: I3VNode, instruction: Immutable<ITargetedInstruction>, factory?: IViewFactory, parts?: TemplatePartDefinitions, location?: IFabricRenderLocation, locationIsContainer?: boolean): IDisposable;
}

export interface IView extends IBindScope, IRenderable, IAttach, IMountable {
  readonly cache: IViewCache;
  readonly isFree: boolean;
  readonly location: IFabricRenderLocation;

  hold(location: IFabricRenderLocation, flags: LifecycleFlags): void;
  release(flags: LifecycleFlags): boolean;

  lockScope(scope: IScope): void;
}

export interface IViewCache {
  readonly isCaching: boolean;
  setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void;
  canReturnToCache(view: IView): boolean;
  tryReturnToCache(view: IView): boolean;
}

export interface IViewFactory extends IViewCache {
  readonly name: string;
  create(): IView;
}

export const IViewFactory = DI.createInterface<IViewFactory>().noDefault();

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
  /*@internal*/$nextBound?: ILifecycleBound;

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
  /*@internal*/$nextUnbound?: ILifecycleUnbound;

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
  attaching?(flags: LifecycleFlags, encapsulationSource?: IEncapsulationSource): void;
}

export interface ILifecycleAttached extends IHooks, IState {
  /*@internal*/$nextAttached?: ILifecycleAttached;

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
  /*@internal*/$nextDetached?: ILifecycleDetached;

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
  $attach(flags: LifecycleFlags, encapsulationSource?: IEncapsulationSource): void;
}

export interface ILifecycleDetach {
  $detach(flags: LifecycleFlags): void;
}

export interface IAttach extends ILifecycleAttach, ILifecycleDetach, ICachable {
  /*@internal*/$nextAttach: IAttach;
  /*@internal*/$prevAttach: IAttach;
}

export interface ILifecycleMount {
  /*@internal*/$nextMount?: ILifecycleMount;

  /**
   * Add the `$nodes` of this instance to the Host or RenderLocation that this instance is holding.
   */
  $mount(flags: LifecycleFlags): void;
}

export interface ILifecycleUnmount {
  /*@internal*/$nextUnmount?: ILifecycleUnmount;

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

export interface ILifecycleBindSelf {
  $state?: State;
  $bind(flags: LifecycleFlags): void;
}

export interface ILifecycleBindScope {
  $state?: State;
  $bind(flags: LifecycleFlags, scope: IScope): void;
}

export interface IBind extends ILifecycleBind, ILifecycleUnbind {
  /*@internal*/$nextBind: IBindSelf | IBindScope;
  /*@internal*/$prevBind: IBindSelf | IBindScope;
}

export interface IBindScope extends Omit<IBind, '$bind'>, ILifecycleBindScope { }

export interface IBindSelf extends Omit<IBind, '$bind'>, ILifecycleBindSelf { }

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

export const ILifecycle = DI.createInterface<ILifecycle>().withDefault(x => x.singleton(Lifecycle));
export const IFlushLifecycle = ILifecycle as InterfaceSymbol<IFlushLifecycle>;
export const IBindLifecycle = ILifecycle as InterfaceSymbol<IBindLifecycle>;
export const IAttachLifecycle = ILifecycle as InterfaceSymbol<IAttachLifecycle>;

/*@internal*/
export class Lifecycle implements ILifecycle {
  /*@internal*/public bindDepth: number = 0;
  /*@internal*/public attachDepth: number = 0;
  /*@internal*/public detachDepth: number = 0;
  /*@internal*/public unbindDepth: number = 0;

  /*@internal*/public flushHead: IChangeTracker = this;
  /*@internal*/public flushTail: IChangeTracker = this;

  /*@internal*/public connectHead: IConnectableBinding = <IConnectableBinding><unknown>this; // this cast is safe because we know exactly which properties we'll use
  /*@internal*/public connectTail: IConnectableBinding = <IConnectableBinding><unknown>this;

  /*@internal*/public patchHead: IConnectableBinding = <IConnectableBinding><unknown>this;
  /*@internal*/public patchTail: IConnectableBinding = <IConnectableBinding><unknown>this;

  /*@internal*/public boundHead: ILifecycleBound = this;
  /*@internal*/public boundTail: ILifecycleBound = this;

  /*@internal*/public mountHead: ILifecycleMount = this;
  /*@internal*/public mountTail: ILifecycleMount = this;

  /*@internal*/public attachedHead: ILifecycleAttached = this;
  /*@internal*/public attachedTail: ILifecycleAttached = this;

  /*@internal*/public unmountHead: ILifecycleUnmount = this;
  /*@internal*/public unmountTail: ILifecycleUnmount = this;

  /*@internal*/public detachedHead: ILifecycleDetached = this; //LOL
  /*@internal*/public detachedTail: ILifecycleDetached = this;

  /*@internal*/public unbindAfterDetachHead: ILifecycleUnbindAfterDetach = this;
  /*@internal*/public unbindAfterDetachTail: ILifecycleUnbindAfterDetach = this;

  /*@internal*/public unboundHead: ILifecycleUnbound = this;
  /*@internal*/public unboundTail: ILifecycleUnbound = this;

  /*@internal*/public flushed: Promise<void> = null;
  /*@internal*/public promise: Promise<void> = Promise.resolve();

  /*@internal*/public flushCount: number = 0;
  /*@internal*/public connectCount: number = 0;
  /*@internal*/public patchCount: number = 0;
  /*@internal*/public boundCount: number = 0;
  /*@internal*/public mountCount: number = 0;
  /*@internal*/public attachedCount: number = 0;
  /*@internal*/public unmountCount: number = 0;
  /*@internal*/public detachedCount: number = 0;
  /*@internal*/public unbindAfterDetachCount: number = 0;
  /*@internal*/public unboundCount: number = 0;

  // These are dummy properties to make the lifecycle conform to the interfaces
  // of the components it manages. This allows the lifecycle itself to be the first link
  // in the chain and removes the need for an additional null check on each addition.
  /*@internal*/public $nextFlush: IChangeTracker = marker;
  /*@internal*/public flush: IChangeTracker['flush'] = PLATFORM.noop;
  /*@internal*/public $nextConnect: IConnectableBinding = marker;
  /*@internal*/public connect: IConnectableBinding['connect'] = PLATFORM.noop;
  /*@internal*/public $nextPatch: IConnectableBinding = marker;
  /*@internal*/public patch: IConnectableBinding['patch'] = PLATFORM.noop;
  /*@internal*/public $nextBound: ILifecycleBound = marker;
  /*@internal*/public bound: ILifecycleBound['bound'] = PLATFORM.noop;
  /*@internal*/public $nextMount: ILifecycleMount = marker;
  /*@internal*/public $mount: ILifecycleMount['$mount'] = PLATFORM.noop;
  /*@internal*/public $nextAttached: ILifecycleAttached = marker;
  /*@internal*/public attached: ILifecycleAttached['attached'] = PLATFORM.noop;
  /*@internal*/public $nextUnmount: ILifecycleUnmount = marker;
  /*@internal*/public $unmount: ILifecycleUnmount['$unmount'] = PLATFORM.noop;
  /*@internal*/public $nextDetached: ILifecycleDetached = marker;
  /*@internal*/public detached: ILifecycleDetached['detached'] = PLATFORM.noop;
  /*@internal*/public $nextUnbindAfterDetach: ILifecycleUnbindAfterDetach = marker;
  /*@internal*/public $unbind: ILifecycleUnbindAfterDetach['$unbind'] = PLATFORM.noop;
  /*@internal*/public $nextUnbound: ILifecycleUnbound = marker;
  /*@internal*/public unbound: ILifecycleUnbound['unbound'] = PLATFORM.noop;

  /*@internal*/public task: AggregateLifecycleTask = null;

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
    return this.flushed;
  }

  public processFlushQueue(flags: LifecycleFlags): void {
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
    }
  }

  public beginBind(): void {
    ++this.bindDepth;
  }

  public enqueueBound(requestor: ILifecycleBound): void {
    // build a standard singly linked list for bound callbacks
    if (requestor.$nextBound === null) {
      requestor.$nextBound = marker;
      this.boundTail.$nextBound = requestor;
      this.boundTail = requestor;
      ++this.boundCount;
    }
  }

  public enqueueConnect(requestor: IConnectableBinding): void {
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
  }

  public processConnectQueue(flags: LifecycleFlags): void {
    // connects cannot lead to additional connects, so we don't need to loop here
    if (this.connectCount > 0) {
      this.connectCount = 0;
      let current = this.connectHead.$nextConnect;
      this.connectHead = this.connectTail = <IConnectableBinding><unknown>this;
      let next: typeof current;
      do {
        current.connect(flags);
        next = current.$nextConnect;
        current.$nextConnect = null;
        current = next;
      } while (current !== marker);
    }
  }

  public processPatchQueue(flags: LifecycleFlags): void {
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
      this.patchHead = this.patchTail = <IConnectableBinding><unknown>this;
      let next: typeof current;
      do {
        current.patch(flags);
        next = current.$nextPatch;
        current.$nextPatch = null;
        current = next;
      } while (current !== marker);
    }
  }

  public endBind(flags: LifecycleFlags): ILifecycleTask {
    // close / shrink a bind batch
    if (--this.bindDepth === 0) {
      if (this.task !== null && !this.task.done) {
        this.task.owner = this;
        return this.task;
      }

      this.processBindQueue(flags);

      return LifecycleTask.done;
    }
  }

  public processBindQueue(flags: LifecycleFlags): void {
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
  }

  public beginUnbind(): void {
    // open up / expand an unbind batch; the very first caller will close it again with endUnbind
    ++this.unbindDepth;
  }

  public enqueueUnbound(requestor: ILifecycleUnbound): void {
    // This method is idempotent; adding the same item more than once has the same effect as
    // adding it once.
    // build a standard singly linked list for unbound callbacks
    if (requestor.$nextUnbound === null) {
      requestor.$nextUnbound = marker;
      this.unboundTail.$nextUnbound = requestor;
      this.unboundTail = requestor;
      ++this.unboundCount;
    }
  }

  public endUnbind(flags: LifecycleFlags): ILifecycleTask {
    // close / shrink an unbind batch
    if (--this.unbindDepth === 0) {
      if (this.task !== null && !this.task.done) {
        this.task.owner = this;
        return this.task;
      }

      this.processUnbindQueue(flags);

      return LifecycleTask.done;
    }
  }

  public processUnbindQueue(flags: LifecycleFlags): void {
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
  }

  public beginAttach(): void {
    // open up / expand an attach batch; the very first caller will close it again with endAttach
    ++this.attachDepth;
  }

  public enqueueMount(requestor: ILifecycleMount): void {
    // This method is idempotent; adding the same item more than once has the same effect as
    // adding it once.
    // build a standard singly linked list for mount callbacks
    if (requestor.$nextMount === null) {
      requestor.$nextMount = marker;
      this.mountTail.$nextMount = requestor;
      this.mountTail = requestor;
      ++this.mountCount;
    }
  }

  public enqueueAttached(requestor: ILifecycleAttached): void {
    // This method is idempotent; adding the same item more than once has the same effect as
    // adding it once.
    // build a standard singly linked list for attached callbacks
    if (requestor.$nextAttached === null) {
      requestor.$nextAttached = marker;
      this.attachedTail.$nextAttached = requestor;
      this.attachedTail = requestor;
      ++this.attachedCount;
    }
  }

  public endAttach(flags: LifecycleFlags): ILifecycleTask {
    // close / shrink an attach batch
    if (--this.attachDepth === 0) {
      if (this.task !== null && !this.task.done) {
        this.task.owner = this;
        return this.task;
      }

      this.processAttachQueue(flags);

      return LifecycleTask.done;
    }
  }

  public processAttachQueue(flags: LifecycleFlags): void {
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
  }

  public beginDetach(): void {
    // open up / expand a detach batch; the very first caller will close it again with endDetach
    ++this.detachDepth;
  }

  public enqueueUnmount(requestor: ILifecycleUnmount): void {
    // This method is idempotent; adding the same item more than once has the same effect as
    // adding it once.
    // build a standard singly linked list for unmount callbacks
    if (requestor.$nextUnmount === null) {
      requestor.$nextUnmount = marker;
      this.unmountTail.$nextUnmount = requestor;
      this.unmountTail = requestor;
      ++this.unmountCount;
    }
  }

  public enqueueDetached(requestor: ILifecycleDetached): void {
    // This method is idempotent; adding the same item more than once has the same effect as
    // adding it once.
    // build a standard singly linked list for detached callbacks
    if (requestor.$nextDetached === null) {
      requestor.$nextDetached = marker;
      this.detachedTail.$nextDetached = requestor;
      this.detachedTail = requestor;
      ++this.detachedCount;
    }
  }

  public enqueueUnbindAfterDetach(requestor: ILifecycleUnbindAfterDetach): void {
    // This method is idempotent; adding the same item more than once has the same effect as
    // adding it once.
    // build a standard singly linked list for unbindAfterDetach callbacks
    if (requestor.$nextUnbindAfterDetach === null) {
      requestor.$nextUnbindAfterDetach = marker;
      this.unbindAfterDetachTail.$nextUnbindAfterDetach = requestor;
      this.unbindAfterDetachTail = requestor;
      ++this.unbindAfterDetachCount;
    }
  }

  public endDetach(flags: LifecycleFlags): ILifecycleTask {
    // close / shrink a detach batch
    if (--this.detachDepth === 0) {
      if (this.task !== null && !this.task.done) {
        this.task.owner = this;
        return this.task;
      }

      this.processDetachQueue(flags);

      return LifecycleTask.done;
    }
  }

  public processDetachQueue(flags: LifecycleFlags): void {
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
  }
}

@inject(ILifecycle)
export class CompositionCoordinator {
  public onSwapComplete: () => void = PLATFORM.noop;

  private queue: (IView | PromiseSwap)[] = null;
  private swapTask: ILifecycleTask = LifecycleTask.done;

  private currentView: IView = null;
  private scope: IScope;
  private isBound: boolean = false;
  private isAttached: boolean = false;

  constructor(public readonly $lifecycle: ILifecycle) {}

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
      });
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
    // tslint:disable-next-line:no-empty
    cancel(): void {},
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
  public done: boolean = true;

  /*@internal*/
  public owner: Lifecycle = null;

  private tasks: ILifecycleTask[] = [];
  private waiter: Promise<void> = null;
  private resolve: () => void = null;

  public addTask(task: ILifecycleTask): void {
    if (!task.done) {
      this.done = false;
      this.tasks.push(task);
      task.wait().then(() => { this.tryComplete(); });
    }
  }

  public removeTask(task: ILifecycleTask): void {
    if (task.done) {
      const idx = this.tasks.indexOf(task);
      if (idx !== -1) {
        this.tasks.splice(idx, 1);
      }
    }
    if (this.tasks.length === 0) {
      if (this.owner !== null) {
        this.owner.finishTask(this);
        this.owner = null;
      }
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

/*@internal*/
export class PromiseSwap implements ILifecycleTask<IView> {
  public done: boolean = false;
  private isCancelled: boolean = false;

  constructor(
    private coordinator: CompositionCoordinator,
    private promise: Promise<IView>
  ) {}

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
  private promise: Promise<T>;
  private callback: (result?: T) => void;

  constructor(
    promise: Promise<T>,
    callback: (result?: T) => void
  ) {
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
