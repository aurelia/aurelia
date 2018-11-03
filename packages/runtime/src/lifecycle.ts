import { DI, InterfaceSymbol, Omit } from '@aurelia/kernel';
import { IConnectableBinding } from './binding/connectable';
import { IChangeTracker, IScope, LifecycleFlags } from './observation';

export const enum State {
  none                  = 0b00000000000,
  isBinding             = 0b00000000001,
  isBound               = 0b00000000010,
  isAttaching           = 0b00000000100,
  isAttached            = 0b00000001000,
  isDetaching           = 0b00000010000,
  isUnbinding           = 0b00000100000,
  isCached              = 0b00001000000,
  needsMount            = 0b00010000000
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
  queueFlush(requestor: IChangeTracker): Promise<void>;
  flush(flags: LifecycleFlags): void;
}

export interface IBindLifecycle extends IFlushLifecycle {
  beginBind(): void;
  queueBound(requestor: ILifecycleBound): void;
  queueConnect(requestor: IConnectableBinding, flags: LifecycleFlags): void;
  connect(flags: LifecycleFlags): void;
  patch(flags: LifecycleFlags): void;
  endBind(flags: LifecycleFlags): void;

  beginUnbind(): void;
  queueUnbound(requestor: ILifecycleUnbound): void;
  endUnbind(flags: LifecycleFlags): void;
}

export interface IAttachLifecycle extends IFlushLifecycle {
  beginAttach(): void;
  queueMount(requestor: ILifecycleMount): void;
  queueAttachedCallback(requestor: ILifecycleAttached): void;
  endAttach(flags: LifecycleFlags): void;

  beginDetach(): void;
  queueUnmount(requestor: ILifecycleUnmount): void;
  queueDetachedCallback(requestor: ILifecycleDetached): void;
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

  public queueFlush(requestor: IChangeTracker): Promise<void> {
    if (this.flushDepth === 0) {
      this.flushed = this.promise.then(() => this.flush(LifecycleFlags.fromAsyncFlush));
    }
    if (requestor.$nextFlush) {
      return this.flushed;
    }
    requestor.$nextFlush = marker;
    if (this.flushTail === null) {
      this.flushHead = requestor;
    } else {
      this.flushTail.$nextFlush = requestor;
    }
    this.flushTail = requestor;
    ++this.flushDepth;
    return this.flushed;
  }

  public flush(flags: LifecycleFlags): void {
    while (this.flushDepth > 0) {
      let current = this.flushHead;
      this.flushHead = this.flushTail = null;
      let next: typeof current;
      this.flushDepth = 0;
      while (current && current !== marker) {
        next = current.$nextFlush;
        current.$nextFlush = null;
        current.flush(flags);
        current = next;
      }
    }
  }

  public beginBind(): void {
    ++this.bindDepth;
  }

  public queueBound(requestor: ILifecycleBound): void {
    requestor.$nextBound = null;
    if (this.boundHead === null) {
      this.boundHead = requestor;
    } else {
      this.boundTail.$nextBound = requestor;
    }
    this.boundTail = requestor;
  }

  public queueConnect(requestor: IConnectableBinding, flags: LifecycleFlags): void {
    requestor.$nextConnect = null;
    requestor.$connectFlags = flags;
    if (this.connectTail === null) {
      this.connectHead = requestor;
    } else {
      this.connectTail.$nextConnect = requestor;
    }
    this.connectTail = requestor;
  }

  public connect(flags: LifecycleFlags): void {
    // if we're telling the lifecycle to perform the connect calls, assume it's the last call
    // and reset the linked list
    let current = this.connectHead;
    this.connectHead = this.connectTail = null;
    let next: typeof current;
    while (current !== null) {
      current.connect(current.$connectFlags | flags);
      next = current.$nextConnect;
      current.$nextConnect = null;
      current = next;
    }
  }

  public patch(flags: LifecycleFlags): void {
    // otherwise keep the links intact because we still need to connect at a later point in time
    let current = this.connectHead;
    while (current !== null) {
      current.patch(current.$connectFlags | flags);
      current = current.$nextConnect;
    }
  }

  public endBind(flags: LifecycleFlags): void {
    if (--this.bindDepth === 0) {
      let current = this.boundHead;
      let next: ILifecycleBound;
      this.boundHead = this.boundTail = null;
      while (current !== null) {
        current.bound(flags);
        next = current.$nextBound;
        current.$nextBound = null;
        current = next;
      }
    }
  }

  public beginUnbind(): void {
    ++this.unbindDepth;
  }

  public queueUnbound(requestor: ILifecycleUnbound): void {
    requestor.$nextUnbound = null;
    if (this.unboundHead === null) {
      this.unboundHead = requestor;
    } else {
      this.unboundTail.$nextUnbound = requestor;
    }
    this.unboundTail = requestor;
  }

  public endUnbind(flags: LifecycleFlags): void {
    if (--this.unbindDepth === 0) {
      let current = this.unboundHead;
      let next: ILifecycleUnbound;
      this.unboundHead = this.unboundTail = null;
      while (current !== null) {
        current.unbound(flags);
        next = current.$nextUnbound;
        current.$nextUnbound = null;
        current = next;
      }
    }
  }

  public beginAttach(): void {
    ++this.attachDepth;
  }

  public queueMount(requestor: ILifecycleMount): void {
    if (this.mountHead === null) {
      this.mountHead = requestor;
    } else {
      this.mountTail.$nextMount = requestor;
    }
    this.mountTail = requestor;
  }

  public queueAttachedCallback(requestor: ILifecycleAttached): void {
    if (this.attachedHead === null) {
      this.attachedHead = requestor;
    } else {
      this.attachedTail.$nextAttached = requestor;
    }
    this.attachedTail = requestor;
  }

  public endAttach(flags: LifecycleFlags): void {
    if (--this.attachDepth === 0) {
      // flush before starting the attach lifecycle to ensure batched collection changes are propagated to repeaters
      this.flush(flags | LifecycleFlags.fromSyncFlush);

      let currentMount = this.mountHead;
      const lastMount = this.mountTail;
      this.mountHead = this.mountTail = null;
      let nextMount: typeof currentMount;

      while (currentMount) {
        if (currentMount === lastMount) {
          // patch all Binding.targetObserver.targets (DOM objects) synchronously just before mounting the root
          this.patch(LifecycleFlags.fromFlush);
        }
        currentMount.$mount(flags);
        nextMount = currentMount.$nextMount;
        currentMount.$nextMount = null;
        currentMount = nextMount;
      }
      // Connect all connect-queued bindings AFTER mounting is done, so that the DOM is visible asap,
      // but connect BEFORE running the attached callbacks to ensure any changes made during those callbacks
      // are still accounted for.
      // TODO: add a flag/option to further delay connect with a RAF callback (the tradeoff would be that we'd need
      // to run an additional patch cycle before that connect, which can be expensive and unnecessary in most real
      // world scenarios, but can significantly speed things up with nested, highly volatile data like in dbmonster)
      this.connect(LifecycleFlags.mustEvaluate);

      let currentAttached = this.attachedHead;
      this.attachedHead = this.attachedTail = null;
      let nextAttached: typeof currentAttached;

      while (currentAttached) {
        currentAttached.attached(flags);
        nextAttached = currentAttached.$nextAttached;
        currentAttached.$nextAttached = null;
        currentAttached = nextAttached;
      }
    }
  }

  public beginDetach(): void {
    ++this.detachDepth;
  }

  public queueUnmount(requestor: ILifecycleUnmount): void {
    if (this.unmountHead === null) {
      this.unmountHead = requestor;
    } else {
      this.unmountTail.$nextUnmount = requestor;
    }
    this.unmountTail = requestor;
  }

  public queueDetachedCallback(requestor: ILifecycleDetached): void {
    if (this.detachedHead === null) {
      this.detachedHead = requestor;
    } else {
      this.detachedTail.$nextDetached = requestor;
    }
    this.detachedTail = requestor;
  }

  public endDetach(flags: LifecycleFlags): void {
    if (--this.detachDepth === 0) {
      this.flush(flags | LifecycleFlags.fromSyncFlush);

      let currentUnmount = this.unmountHead;
      this.unmountHead = this.unmountTail = null;
      let nextUnmount: typeof currentUnmount;

      while (currentUnmount) {
        currentUnmount.$unmount(flags);
        nextUnmount = currentUnmount.$nextUnmount;
        currentUnmount.$nextUnmount = null;
        currentUnmount = nextUnmount;
      }

      let currentDetached = this.detachedHead;
      this.detachedHead = this.detachedTail = null;
      let nextDetached: typeof currentDetached;

      while (currentDetached) {
        currentDetached.detached(flags);
        nextDetached = currentDetached.$nextDetached;
        currentDetached.$nextDetached = null;
        currentDetached = nextDetached;
      }
    }
  }
}
