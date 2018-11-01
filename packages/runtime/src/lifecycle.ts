import { Omit } from '@aurelia/kernel';
import { INode } from './dom';
import { BindingFlags, IScope, IChangeTracker } from './observation';

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

export interface ILifecycleCreated {
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

export interface ILifecycleBinding {
  /**
   * Called at the start of `$bind`, before this instance and its children (if any) are bound.
   *
   * - `this.$isBound` is false.
   * - `this.$scope` is initialized.
   *
   * @param flags Contextual information about the lifecycle, such as what triggered it.
   * Some uses for this hook:
   * - `flags & BindingFlags.fromStartTask`: the Aurelia app is starting (this is the initial bind)
   * - `flags & BindingFlags.fromBind`: this is a normal `$bind` lifecycle
   * - `flags & BindingFlags.updateTargetInstance`: this `$bind` was triggered by some upstream observer and is not a real `$bind` lifecycle
   * - `flags & BindingFlags.fromFlushChanges` (only occurs in conjunction with updateTargetInstance): the update was queued to a `LinkedChangeList` which is now being flushed
   *
   * @description
   * This is the first "create" lifecycle hook of the hooks that can occur multiple times per instance,
   * and the third lifecycle hook (after `render` and `created`) of the very first Lifecycle.
   */
  binding?(flags: BindingFlags): void;
}

export interface ILifecycleBound {
  /*@internal*/$boundFlags?: BindingFlags;
  /*@internal*/$nextBound?: ILifecycleBound;

  /**
   * Called at the end of `$bind`, after this instance and its children (if any) are bound.
   *
   * - `$isBound` is true.
   * - `this.$scope` is initialized.
   *
   * @param flags Contextual information about the lifecycle, such as what triggered it.
   * Some uses for this hook:
   * - `flags & BindingFlags.fromStartTask`: the Aurelia app is starting (this is the initial bind)
   * - `flags & BindingFlags.fromBind`: this is a normal `$bind` lifecycle
   * - `flags & BindingFlags.updateTargetInstance`: this `$bind` was triggered by some upstream observer and is not a real `$bind` lifecycle
   * - `flags & BindingFlags.fromFlushChanges` (only occurs in conjunction with updateTargetInstance): the update was queued to a `LinkedChangeList` which is now being flushed
   *
   * @description
   * This is the second "create" lifecycle hook (after `binding`) of the hooks that can occur multiple times per instance,
   * and the fourth lifecycle hook (after `render`, `created` and `binding`) of the very first Lifecycle.
   */
  bound?(flags: BindingFlags): void;
}

export interface ILifecycleUnbinding {
  /**
   * Called at the start of `$unbind`, before this instance and its children (if any) are unbound.
   *
   * - `this.$isBound` is true.
   * - `this.$scope` is still available.
   *
   * @param flags Contextual information about the lifecycle, such as what triggered it.
   * Some uses for this hook:
   * - `flags & BindingFlags.fromBind`: the component is just switching scope
   * - `flags & BindingFlags.fromUnbind`: the component is really disposing
   * - `flags & BindingFlags.fromStopTask`: the Aurelia app is stopping
   *
   * @description
   * This is the fourth "cleanup" lifecycle hook (after `detaching`, `caching` and `detached`)
   *
   * Last opportunity to perform any source or target updates before the bindings are disconnected.
   *
   */
  unbinding?(flags: BindingFlags): void;
}

export interface ILifecycleUnbound {
  /*@internal*/$unboundFlags?: BindingFlags;
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
   * - `flags & BindingFlags.fromBind`: the component is just switching scope
   * - `flags & BindingFlags.fromUnbind`: the component is really disposing
   * - `flags & BindingFlags.fromStopTask`: the Aurelia app is stopping
   *
   * @description
   * This is the fifth (and last) "cleanup" lifecycle hook (after `detaching`, `caching`, `detached`
   * and `unbinding`).
   *
   * The lifecycle either ends here, or starts at `$bind` again.
   */
  unbound?(flags: BindingFlags): void;
}

export interface ILifecycleAttaching {
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

export interface ILifecycleAttached {
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

export interface ILifecycleDetaching {
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

export interface ILifecycleDetached {
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

export interface ILifecycleCaching {
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
export interface IHooks extends
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

export interface IState {
  $state: State;
}

export interface ILifecycleCache {
  $cache(): void;
}

export interface ICachable extends ILifecycleCache, IState { }

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
export interface IMountable extends ILifecycleMount, ILifecycleUnmount, IState { }

export interface ILifecycleUnbind {
  $unbind(flags: BindingFlags): void;
}

export interface ILifecycleBind {
  $bind(flags: BindingFlags, scope?: IScope): void;
}

export interface ILifecycleBindSelf {
  $bind(flags: BindingFlags): void;
}

export interface ILifecycleBindScope {
  $bind(flags: BindingFlags, scope: IScope): void;
}

export interface IBind extends ILifecycleBind, ILifecycleUnbind, IState {
  /*@internal*/$nextBind: IBindSelf | IBindScope;
  /*@internal*/$prevBind: IBindSelf | IBindScope;
}

export interface IBindScope extends Omit<IBind, '$bind'>, ILifecycleBindScope { }

export interface IBindSelf extends Omit<IBind, '$bind'>, ILifecycleBindSelf { }

const marker = Object.freeze(Object.create(null));

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
      Lifecycle.flush();

      let currentMount = Lifecycle.mountHead;
      Lifecycle.mountHead = Lifecycle.mountTail = null;
      let nextMount: typeof currentMount;

      while (currentMount) {
        currentMount.$mount();
        nextMount = currentMount.$nextMount;
        currentMount.$nextMount = null;
        currentMount = nextMount;
      }

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
  queueBound(requestor: ILifecycleBound, flags: BindingFlags): void {
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
  queueUnbound(requestor: ILifecycleUnbound, flags: BindingFlags): void {
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
        current.flushChanges();
        current = next;
      }
    }
  }
};
