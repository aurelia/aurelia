import { DI, IContainer, IDisposable, Immutable, inject, InterfaceSymbol, IResolver, IServiceLocator, Omit, PLATFORM, Registration } from '@aurelia/kernel';
import { IConnectableBinding } from './binding/connectable';
import { ITargetedInstruction, TemplateDefinition, TemplatePartDefinitions } from './definitions';
import { INode, INodeSequence, IRenderLocation } from './dom';
import { IChangeTracker, IScope, LifecycleFlags } from './observation';

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
  readonly $nodes: INodeSequence;

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
  render(renderable: IRenderable, targets: ArrayLike<INode>, templateDefinition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void;
  beginComponentOperation(renderable: IRenderable, target: INode, instruction: Immutable<ITargetedInstruction>, factory?: IViewFactory, parts?: TemplatePartDefinitions, location?: IRenderLocation, locationIsContainer?: boolean): IDisposable;
}

export interface IView extends IBindScope, IRenderable, IAttach, IMountable {
  readonly cache: IViewCache;
  readonly isFree: boolean;
  readonly location: IRenderLocation;

  hold(location: IRenderLocation, flags: LifecycleFlags): void;
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
  attaching?(flags: LifecycleFlags): void;
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
  $attach(flags: LifecycleFlags): void;
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
  endBind(flags: LifecycleFlags): void;

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
  endUnbind(flags: LifecycleFlags): void;
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
  endAttach(flags: LifecycleFlags): void;

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
   * Close / shrink a detach batch for invoking queued `$unmount` and `detached` callbacks.
   * @param flags The flags that will be passed into the `$unmount` and `detached` callbacks.
   *
   * Flags during detach are primarily for optimization purposes, and to control whether a
   * component should be unmounted or not (the default is to only unmount root nodes).
   * If unsure which flags to provide, it's OK to use `LifecycleFlags.none` (or simply `0`).
   * This default will work, but is generally less efficient.
   */
  endDetach(flags: LifecycleFlags): void;
}

export interface ILifecycle extends IBindLifecycle, IAttachLifecycle { }

export const ILifecycle = DI.createInterface<ILifecycle>().withDefault(x => x.singleton(Lifecycle));
export const IFlushLifecycle = ILifecycle as InterfaceSymbol<IFlushLifecycle>;
export const IBindLifecycle = ILifecycle as InterfaceSymbol<IBindLifecycle>;
export const IAttachLifecycle = ILifecycle as InterfaceSymbol<IAttachLifecycle>;

/*@internal*/
export class Lifecycle implements ILifecycle {
  /*@internal*/public flushDepth: number = 0;
  /*@internal*/public bindDepth: number = 0;
  /*@internal*/public attachDepth: number = 0;
  /*@internal*/public detachDepth: number = 0;
  /*@internal*/public unbindDepth: number = 0;

  /*@internal*/public flushHead: IChangeTracker = null;
  /*@internal*/public flushTail: IChangeTracker = null;

  /*@internal*/public connectHead: IConnectableBinding = null;
  /*@internal*/public connectTail: IConnectableBinding = null;

  /*@internal*/public patchHead: IConnectableBinding = null;
  /*@internal*/public patchTail: IConnectableBinding = null;

  /*@internal*/public boundHead: ILifecycleBound = null;
  /*@internal*/public boundTail: ILifecycleBound = null;

  /*@internal*/public mountHead: ILifecycleMount = null;
  /*@internal*/public mountTail: ILifecycleMount = null;

  /*@internal*/public attachedHead: ILifecycleAttached = null;
  /*@internal*/public attachedTail: ILifecycleAttached = null;

  /*@internal*/public unmountHead: ILifecycleUnmount = null;
  /*@internal*/public unmountTail: ILifecycleUnmount = null;

  /*@internal*/public detachedHead: ILifecycleDetached = null; //LOL
  /*@internal*/public detachedTail: ILifecycleDetached = null;

  /*@internal*/public unboundHead: ILifecycleUnbound = null;
  /*@internal*/public unboundTail: ILifecycleUnbound = null;

  /*@internal*/public flushed: Promise<void> = null;
  /*@internal*/public promise: Promise<void> = Promise.resolve();

  public enqueueFlush(requestor: IChangeTracker): Promise<void> {
    // Queue a flush() callback; the depth is just for debugging / testing purposes and has
    // no effect on execution. flush() will automatically be invoked when the promise resolves,
    // or it can be manually invoked synchronously.
    if (this.flushHead === null) {
      this.flushed = this.promise.then(() => this.processFlushQueue(LifecycleFlags.fromAsyncFlush));
    }
    if (requestor.$nextFlush === null) {
      requestor.$nextFlush = marker;
      if (this.flushTail === null) {
        this.flushHead = requestor;
      } else {
        this.flushTail.$nextFlush = requestor;
      }
      this.flushTail = requestor;
      ++this.flushDepth;
    }
    return this.flushed;
  }

  public processFlushQueue(flags: LifecycleFlags): void {
    flags |= LifecycleFlags.fromSyncFlush;
    // flush callbacks may lead to additional bind operations, so keep looping until
    // the flush head is null just in case
    while (this.flushHead !== null) {
      let current = this.flushHead;
      this.flushHead = this.flushTail = null;
      this.flushDepth = 0;
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
      if (this.boundHead === null) {
        this.boundHead = requestor;
      } else {
        this.boundTail.$nextBound = requestor;
      }
      this.boundTail = requestor;
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
      if (this.connectTail === null) {
        this.connectHead = requestor;
      } else {
        this.connectTail.$nextConnect = requestor;
      }
      this.connectTail = requestor;
    }
    // build a standard singly linked list for patch callbacks
    if (requestor.$nextPatch === null) {
      requestor.$nextPatch = marker;
      if (this.patchTail === null) {
        this.patchHead = requestor;
      } else {
        this.patchTail.$nextPatch = requestor;
      }
      this.patchTail = requestor;
    }
  }

  public processConnectQueue(flags: LifecycleFlags): void {
    // connects cannot lead to additional connects, so we don't need to loop here
    if (this.connectHead !== null) {
      let current = this.connectHead;
      this.connectHead = this.connectTail = null;
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
    // the patch head is null just in case
    while (this.patchHead !== null) {
      let current = this.patchHead;
      this.patchHead = this.patchTail = null;
      let next: typeof current;
      do {
        current.patch(flags);
        next = current.$nextPatch;
        current.$nextPatch = null;
        current = next;
      } while (current !== marker);
    }
  }

  public endBind(flags: LifecycleFlags): void {
    // close / shrink a bind batch
    if (--this.bindDepth === 0) {
      this.processBindQueue(flags);
    }
  }

  public processBindQueue(flags: LifecycleFlags): void {
    // flush before processing bound callbacks, but only if this is the initial bind;
    // no DOM is attached yet so we can safely let everything propagate
    if (flags & LifecycleFlags.fromStartTask) {
      this.processFlushQueue(flags | LifecycleFlags.fromSyncFlush);
    }
    // bound callbacks may lead to additional bind operations, so keep looping until
    // the bound head is null just in case
    while (this.boundHead !== null) {
      let current = this.boundHead;
      let next: ILifecycleBound;
      this.boundHead = this.boundTail = null;
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
      if (this.unboundHead === null) {
        this.unboundHead = requestor;
      } else {
        this.unboundTail.$nextUnbound = requestor;
      }
      this.unboundTail = requestor;
    }
  }

  public endUnbind(flags: LifecycleFlags): void {
    // close / shrink an unbind batch
    if (--this.unbindDepth === 0) {
      this.processUnbindQueue(flags);
    }
  }

  public processUnbindQueue(flags: LifecycleFlags): void {
    // unbound callbacks may lead to additional unbind operations, so keep looping until
    // the unbound head is null just in case
    while (this.unboundHead !== null) {
      let current = this.unboundHead;
      let next: ILifecycleUnbound;
      this.unboundHead = this.unboundTail = null;
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
      if (this.mountHead === null) {
        this.mountHead = requestor;
      } else {
        this.mountTail.$nextMount = requestor;
      }
      this.mountTail = requestor;
    }
  }

  public enqueueAttached(requestor: ILifecycleAttached): void {
    // This method is idempotent; adding the same item more than once has the same effect as
    // adding it once.
    // build a standard singly linked list for attached callbacks
    if (requestor.$nextAttached === null) {
      requestor.$nextAttached = marker;
      if (this.attachedHead === null) {
        this.attachedHead = requestor;
      } else {
        this.attachedTail.$nextAttached = requestor;
      }
      this.attachedTail = requestor;
    }
  }

  public endAttach(flags: LifecycleFlags): void {
    // close / shrink an attach batch
    if (--this.attachDepth === 0) {
      this.processAttachQueue(flags);
    }
  }

  public processAttachQueue(flags: LifecycleFlags): void {
    // flush and patch before starting the attach lifecycle to ensure batched collection changes are propagated to repeaters
    // and the DOM is updated
    this.processFlushQueue(flags | LifecycleFlags.fromSyncFlush);
    this.processPatchQueue(flags | LifecycleFlags.fromSyncFlush);

    if (this.mountHead !== null) {
      let currentMount = this.mountHead;
      this.mountHead = this.mountTail = null;
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

    if (this.attachedHead !== null) {
      let currentAttached = this.attachedHead;
      this.attachedHead = this.attachedTail = null;
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
      if (this.unmountHead === null) {
        this.unmountHead = requestor;
      } else {
        this.unmountTail.$nextUnmount = requestor;
      }
      this.unmountTail = requestor;
    }
  }

  public enqueueDetached(requestor: ILifecycleDetached): void {
    // This method is idempotent; adding the same item more than once has the same effect as
    // adding it once.
    // build a standard singly linked list for detached callbacks
    if (requestor.$nextDetached === null) {
      requestor.$nextDetached = marker;
      if (this.detachedHead === null) {
        this.detachedHead = requestor;
      } else {
        this.detachedTail.$nextDetached = requestor;
      }
      this.detachedTail = requestor;
    }
  }

  public endDetach(flags: LifecycleFlags): void {
    // close / shrink a detach batch
    if (--this.detachDepth === 0) {
      this.processDetachQueue(flags);
    }
  }

  public processDetachQueue(flags: LifecycleFlags): void {
    // flush before unmounting to ensure batched collection changes propagate to the repeaters,
    // which may lead to additional unmount operations
    // TODO: be a little more efficient here (use a flag to not propagate DOM changes, etc)
    this.processFlushQueue(flags | LifecycleFlags.fromFlush);

    if (this.unmountHead !== null) {
      let currentUnmount = this.unmountHead;
      this.unmountHead = this.unmountTail = null;
      let nextUnmount: typeof currentUnmount;

      do {
        currentUnmount.$unmount(flags);
        nextUnmount = currentUnmount.$nextUnmount;
        currentUnmount.$nextUnmount = null;
        currentUnmount = nextUnmount;
      } while (currentUnmount !== marker);
    }

    if (this.detachedHead !== null) {
      let currentDetached = this.detachedHead;
      this.detachedHead = this.detachedTail = null;
      let nextDetached: typeof currentDetached;

      do {
        currentDetached.detached(flags);
        nextDetached = currentDetached.$nextDetached;
        currentDetached.$nextDetached = null;
        currentDetached = nextDetached;
      } while (currentDetached !== marker);
    }
  }
}

@inject(ILifecycle)
export class CompositionCoordinator {
  public onSwapComplete: () => void = PLATFORM.noop;

  private currentView: IView = null;
  private scope: IScope;
  private isBound: boolean = false;
  private isAttached: boolean = false;

  constructor(public readonly $lifecycle: ILifecycle) {}

  public static register(container: IContainer): IResolver<CompositionCoordinator> {
    return Registration.transient(this, this).register(container, this);
  }

  public compose(value: IView, flags: LifecycleFlags): void {
    this.swap(value, flags);
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

  private swap(view: IView, flags: LifecycleFlags): void {
    if (this.currentView === view) {
      return;
    }

    const $lifecycle = this.$lifecycle;
    let currentView = this.currentView;
    if (currentView !== null) {
      if (this.isAttached) {
        $lifecycle.beginDetach();
        currentView.$detach(flags | LifecycleFlags.allowUnmount);
        $lifecycle.endDetach(flags);
      }
      if (this.isBound) {
        $lifecycle.beginUnbind();
        currentView.$unbind(flags);
        $lifecycle.endUnbind(flags);
      }
    }

    currentView = this.currentView = view;

    if (currentView !== null) {
      if (this.isBound) {
        $lifecycle.beginBind();
        currentView.$bind(flags, this.scope);
        $lifecycle.endBind(flags);
      }
      if (this.isAttached) {
        $lifecycle.beginAttach();
        currentView.$attach(flags);
        $lifecycle.endAttach(flags);
      }
    }

    this.onSwapComplete();
  }
}
