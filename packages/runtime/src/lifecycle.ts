import { Omit } from '@aurelia/kernel';
import { INode } from './dom';
import { LifecycleFlags, IChangeTracker, IScope } from './observation';
import { IConnectableBinding } from './binding/connectable';

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
   * - `flags & LifecycleFlags.fromFlushChanges` (only occurs in conjunction with updateTargetInstance): the update was queued to a `LinkedChangeList` which is now being flushed
   *
   * @description
   * This is the first "create" lifecycle hook of the hooks that can occur multiple times per instance,
   * and the third lifecycle hook (after `render` and `created`) of the very first Lifecycle.
   */
  binding?(flags: LifecycleFlags): void;
}

export interface ILifecycleBound extends IHooks, IState {
  /*@internal*/$boundFlags?: LifecycleFlags;
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
   * - `flags & LifecycleFlags.fromFlushChanges` (only occurs in conjunction with updateTargetInstance): the update was queued to a `LinkedChangeList` which is now being flushed
   *
   * @description
   * This is the second "create" lifecycle hook (after `binding`) of the hooks that can occur multiple times per instance,
   * and the fourth lifecycle hook (after `render`, `created` and `binding`) of the very first Lifecycle.
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
  /*@internal*/$unboundFlags?: LifecycleFlags;
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
  attaching?(): void;
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
  attached?(): void;
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
  detaching?(): void;
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
  detached?(): void;
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
  caching?(): void;
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
  $cache(): void;
}

export interface ICachable extends ILifecycleCache { }

export interface ILifecycleAttach {
  $attach(): void;
}

export interface ILifecycleDetach {
  $detach(): void;
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
  $mount(): void;
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
  $unmount(): boolean | void;
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

export const Lifecycle = {
  encapsulationSource: <INode>null,

  mountHead: <ILifecycleMount>null,
  mountTail: <ILifecycleMount>null,
  queueMount(requestor: ILifecycleMount): void {
    if (Lifecycle.mountHead === null) {
      Lifecycle.mountHead = requestor;
    } else {
      Lifecycle.mountTail.$nextMount = requestor;
    }
    Lifecycle.mountTail = requestor;
  },

  queueAttachedCallback(requestor: ILifecycleAttached): void {
    if (Lifecycle.attachedHead === null) {
      Lifecycle.attachedHead = requestor;
    } else {
      Lifecycle.attachedTail.$nextAttached = requestor;
    }
    Lifecycle.attachedTail = requestor;
  },

  attachDepth: 0,
  attachedHead: <ILifecycleAttached>null,
  attachedTail: <ILifecycleAttached>null,
  beginAttach(): void {
    ++Lifecycle.attachDepth;
  },

  endAttach(): void {
    if (--Lifecycle.attachDepth === 0) {
      // flush before starting the attach lifecycle to ensure batched collection changes are propagated to repeaters
      Lifecycle.flush();

      let currentMount = Lifecycle.mountHead;
      const lastMount = Lifecycle.mountTail;
      Lifecycle.mountHead = Lifecycle.mountTail = null;
      let nextMount: typeof currentMount;

      while (currentMount) {
        if (currentMount === lastMount) {
          // patch all Binding.targetObserver.targets (DOM objects) synchronously just before mounting the root
          Lifecycle.patch(LifecycleFlags.fromFlushChanges);
        }
        currentMount.$mount();
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
      Lifecycle.connect(LifecycleFlags.mustEvaluate);

      let currentAttached = Lifecycle.attachedHead;
      Lifecycle.attachedHead = Lifecycle.attachedTail = null;
      let nextAttached: typeof currentAttached;

      while (currentAttached) {
        currentAttached.attached();
        nextAttached = currentAttached.$nextAttached;
        currentAttached.$nextAttached = null;
        currentAttached = nextAttached;
      }
    }
  },

  unmountHead: <ILifecycleUnmount>null,
  unmountTail: <ILifecycleUnmount>null,
  queueUnmount(requestor: ILifecycleUnmount): void {
    if (Lifecycle.unmountHead === null) {
      Lifecycle.unmountHead = requestor;
    } else {
      Lifecycle.unmountTail.$nextUnmount = requestor;
    }
    Lifecycle.unmountTail = requestor;
  },

  queueDetachedCallback(requestor: ILifecycleDetached): void {
    if (Lifecycle.detachedHead === null) {
      Lifecycle.detachedHead = requestor;
    } else {
      Lifecycle.detachedTail.$nextDetached = requestor;
    }
    Lifecycle.detachedTail = requestor;
  },

  detachDepth: 0,
  detachedHead: <ILifecycleDetached>null, //LOL
  detachedTail: <ILifecycleDetached>null,
  beginDetach(): void {
    ++Lifecycle.detachDepth;
  },

  endDetach(): void {
    if (--Lifecycle.detachDepth === 0) {
      Lifecycle.flush();

      let currentUnmount = Lifecycle.unmountHead;
      Lifecycle.unmountHead = Lifecycle.unmountTail = null;
      let nextUnmount: typeof currentUnmount;

      while (currentUnmount) {
        currentUnmount.$unmount();
        nextUnmount = currentUnmount.$nextUnmount;
        currentUnmount.$nextUnmount = null;
        currentUnmount = nextUnmount;
      }

      let currentDetached = Lifecycle.detachedHead;
      Lifecycle.detachedHead = Lifecycle.detachedTail = null;
      let nextDetached: typeof currentDetached;

      while (currentDetached) {
        currentDetached.detached();
        nextDetached = currentDetached.$nextDetached;
        currentDetached.$nextDetached = null;
        currentDetached = nextDetached;
      }
    }
  },

  boundDepth: 0,
  boundHead: <ILifecycleBound>null,
  boundTail: <ILifecycleBound>null,
  queueBound(requestor: ILifecycleBound, flags: LifecycleFlags): void {
    requestor.$boundFlags = flags;
    requestor.$nextBound = null;
    if (Lifecycle.boundHead === null) {
      Lifecycle.boundHead = requestor;
    } else {
      Lifecycle.boundTail.$nextBound = requestor;
    }
    Lifecycle.boundTail = requestor;
    ++Lifecycle.boundDepth;
  },
  unqueueBound(): void {
    if (--Lifecycle.boundDepth === 0) {
      let current = Lifecycle.boundHead;
      let next: ILifecycleBound;
      Lifecycle.boundHead = Lifecycle.boundTail = null;
      while (current !== null) {
        current.bound(current.$boundFlags);
        next = current.$nextBound;
        // Note: we're intentionally not resetting $boundFlags because it's not an object reference
        // so it can't cause memory leaks. Save some cycles. It's somewhat unclean, but it's fine really.
        current.$nextBound = null;
        current = next;
      }
    }
  },

  unboundDepth: 0,
  unboundHead: <ILifecycleUnbound>null,
  unboundTail: <ILifecycleUnbound>null,
  queueUnbound(requestor: ILifecycleUnbound, flags: LifecycleFlags): void {
    requestor.$unboundFlags = flags;
    requestor.$nextUnbound = null;
    if (Lifecycle.unboundHead === null) {
      Lifecycle.unboundHead = requestor;
    } else {
      Lifecycle.unboundTail.$nextUnbound = requestor;
    }
    Lifecycle.unboundTail = requestor;
    ++Lifecycle.unboundDepth;
  },
  unqueueUnbound(): void {
    if (--Lifecycle.unboundDepth === 0) {
      let current = Lifecycle.unboundHead;
      let next: ILifecycleUnbound;
      Lifecycle.unboundHead = Lifecycle.unboundTail = null;
      while (current !== null) {
        current.unbound(current.$unboundFlags);
        next = current.$nextUnbound;
        current.$nextUnbound = null;
        current = next;
      }
    }
  },

  flushed: <Promise<void>>null,
  promise: Promise.resolve(),
  flushDepth: 0,
  flushHead: <IChangeTracker>null,
  flushTail: <IChangeTracker>null,
  queueFlush(requestor: IChangeTracker): Promise<void> {
    if (Lifecycle.flushDepth === 0) {
      Lifecycle.flushed = Lifecycle.promise.then(Lifecycle.flush);
    }
    if (requestor.$nextFlush) {
      return Lifecycle.flushed;
    }
    requestor.$nextFlush = marker;
    if (Lifecycle.flushTail === null) {
      Lifecycle.flushHead = requestor;
    } else {
      Lifecycle.flushTail.$nextFlush = requestor;
    }
    Lifecycle.flushTail = requestor;
    ++Lifecycle.flushDepth;
    return Lifecycle.flushed;
  },

  flush(): void {
    while (Lifecycle.flushDepth > 0) {
      let current = Lifecycle.flushHead;
      Lifecycle.flushHead = Lifecycle.flushTail = null;
      let next: typeof current;
      Lifecycle.flushDepth = 0;
      while (current && current !== marker) {
        next = current.$nextFlush;
        current.$nextFlush = null;
        current.flush();
        current = next;
      }
    }
  },

  connectHead: <IConnectableBinding>null,
  connectTail: <IConnectableBinding>null,
  queueConnect(requestor: IConnectableBinding, flags: LifecycleFlags): void {
    requestor.$nextConnect = null;
    requestor.$connectFlags = flags;
    if (Lifecycle.connectTail === null) {
      Lifecycle.connectHead = requestor;
    } else {
      Lifecycle.connectTail.$nextConnect = requestor;
    }
    Lifecycle.connectTail = requestor;
  },

  connect(flags: LifecycleFlags): void {
    // if we're telling the lifecycle to perform the connect calls, assume it's the last call
    // and reset the linked list
    let current = Lifecycle.connectHead;
    Lifecycle.connectHead = Lifecycle.connectTail = null;
    let next: typeof current;
    while (current !== null) {
      current.connect(current.$connectFlags | flags);
      next = current.$nextConnect;
      current.$nextConnect = null;
      current = next;
    }
  },

  patch(flags: LifecycleFlags): void {
    // otherwise keep the links intact because we still need to connect at a later point in time
    let current = Lifecycle.connectHead;
    while (current !== null) {
      current.patch(current.$connectFlags | flags);
      current = current.$nextConnect;
    }
  }
};
