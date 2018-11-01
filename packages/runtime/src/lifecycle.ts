import { Omit } from '@aurelia/kernel';
import { INode } from './dom';
import { BindingFlags, IChangeSet, IScope } from './observation';

export const enum LifecycleState {
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

export const enum LifecycleHooks {
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
   * and the third lifecycle hook (after `render` and `created`) of the very first lifecycle.
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
   * and the fourth lifecycle hook (after `render`, `created` and `binding`) of the very first lifecycle.
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
  attaching?(encapsulationSource: INode, lifecycle: ILifecycle): void;
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
  detaching?(lifecycle: ILifecycle): void;
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

export interface ILifecycleState {
  $state: LifecycleState;
}

export interface ILifecycleCache {
  $cache(): void;
}

export interface ICachable extends ILifecycleCache, ILifecycleState { }

export interface ILifecycleAttach {
  $attach(encapsulationSource: INode, lifecycle: ILifecycle): void;
}

export interface ILifecycleDetach {
  $detach(lifecycle: ILifecycle): void;
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
export interface IMountable extends ILifecycleMount, ILifecycleUnmount, ILifecycleState { }

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

export interface IBind extends ILifecycleBind, ILifecycleUnbind, ILifecycleState {
  /*@internal*/$nextBind: IBindSelf | IBindScope;
  /*@internal*/$prevBind: IBindSelf | IBindScope;
}

export interface IBindScope extends Omit<IBind, '$bind'>, ILifecycleBindScope { }

export interface IBindSelf extends Omit<IBind, '$bind'>, ILifecycleBindSelf { }

export interface ILifecycleController {
  detach(requestor: IAttach): ILifecycleController;
  endDetach(): void;
  attach(requestor: IAttach): ILifecycleController;
  endAttach(): void;
}

export interface ILifecycle {
  queueUnmount(requestor: ILifecycleUnmount): void;
  queueDetachedCallback(requestor: ILifecycleDetached): void;
  queueMount(requestor: ILifecycleMount): void;
  queueAttachedCallback(requestor: ILifecycleAttached): void;
}


/*@internal*/
export class LifecycleController implements ILifecycleController {
  public $nextMount: ILifecycleMount;
  public $nextAttached: ILifecycleAttached;

  public $nextUnmount: ILifecycleUnmount;
  public $nextDetached: ILifecycleDetached;

  public attachedHead: ILifecycleAttached;
  public attachedTail: ILifecycleAttached;
  public mountHead: ILifecycleMount;
  public mountTail: ILifecycleMount;

  public detachedHead: ILifecycleDetached; //LOL
  public detachedTail: ILifecycleDetached;
  public unmountHead: ILifecycleUnmount;
  public unmountTail: ILifecycleUnmount;

  public readonly changeSet: IChangeSet;
  public readonly encapsulationSource: INode;

  constructor(
    changeSet: IChangeSet,
    encapsulationSource?: INode
  ) {
    this.$nextMount = null;
    this.$nextAttached = null;

    this.$nextUnmount = null;
    this.$nextDetached = null;

    this.attachedHead = null;
    this.attachedTail = null;
    this.mountHead = null;
    this.mountTail = null;

    this.detachedHead = null;
    this.detachedTail = null;
    this.unmountHead = null;
    this.unmountTail = null;

    this.changeSet = changeSet;
    this.encapsulationSource = encapsulationSource === undefined ? null : encapsulationSource;
  }

  public attach(requestor: IAttach): ILifecycleController {
    requestor.$attach(this.encapsulationSource, this);
    return this;
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

  public endAttach(): void {
    Lifecycle.attach = this;
    this.changeSet.flushChanges();
    Lifecycle.attach = null;

    let currentMount = this.mountHead;
    this.mountHead = this.mountTail = null;
    let nextMount: typeof currentMount;

    while (currentMount) {
      currentMount.$mount();
      nextMount = currentMount.$nextMount;
      currentMount.$nextMount = null;
      currentMount = nextMount;
    }

    let currentAttached = this.attachedHead;
    this.attachedHead = this.attachedTail = null;
    let nextAttached: typeof currentAttached;

    while (currentAttached) {
      currentAttached.attached();
      nextAttached = currentAttached.$nextAttached;
      currentAttached.$nextAttached = null;
      currentAttached = nextAttached;
    }
  }


  public detach(requestor: IAttach): ILifecycleController {
    if (requestor.$state & LifecycleState.isAttached) {
      requestor.$detach(this);
    } else if (isUnmountable(requestor)) {
      this.queueUnmount(requestor);
    }

    return this;
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

  public endDetach(): void {
    Lifecycle.detach = this;
    this.changeSet.flushChanges();
    Lifecycle.detach = null;

    let currentUnmount = this.unmountHead;
    this.unmountHead = this.unmountTail = null;
    let nextUnmount: typeof currentUnmount;

    while (currentUnmount) {
      currentUnmount.$unmount();
      nextUnmount = currentUnmount.$nextUnmount;
      currentUnmount.$nextUnmount = null;
      currentUnmount = nextUnmount;
    }

    let currentDetached = this.detachedHead;
    this.detachedHead = this.detachedTail = null;
    let nextDetached: typeof currentDetached;

    while (currentDetached) {
      currentDetached.detached();
      nextDetached = currentDetached.$nextDetached;
      currentDetached.$nextDetached = null;
      currentDetached = nextDetached;
    }
  }
}

function isUnmountable(requestor: object): requestor is ILifecycleUnmount {
  return '$unmount' in requestor;
}


export const Lifecycle = {
  // TODO: this is just a temporary fix to get certain tests to pass.
  // When there is better test coverage in complex lifecycle scenarios,
  // this needs to be properly handled without abusing a global object
  /*@internal*/attach: <ILifecycleController>null,

  beginAttach(changeSet: IChangeSet, encapsulationSource: INode): ILifecycleController {
    if (Lifecycle.attach === null) {
      return new LifecycleController(changeSet, encapsulationSource);
    } else {
      return Lifecycle.attach;
    }
  },

  /*@internal*/detach: <ILifecycleController>null,

  beginDetach(changeSet: IChangeSet): ILifecycleController {
    if (Lifecycle.detach === null) {
      return new LifecycleController(changeSet, null);
    } else {
      return Lifecycle.detach;
    }
  },

  done: {
    done: true,
    canCancel(): boolean { return false; },
    // tslint:disable-next-line:no-empty
    cancel(): void {},
    wait(): Promise<void> { return Promise.resolve(); }
  }
};

export const BindLifecycle = {
  boundDepth: 0,
  boundHead: <ILifecycleBound>null,
  boundTail: <ILifecycleBound>null,
  queueBound(requestor: ILifecycleBound, flags: BindingFlags): void {
    requestor.$boundFlags = flags;
    requestor.$nextBound = null;
    if (BindLifecycle.boundHead === null) {
      BindLifecycle.boundHead = requestor;
    } else {
      BindLifecycle.boundTail.$nextBound = requestor;
    }
    BindLifecycle.boundTail = requestor;
    ++BindLifecycle.boundDepth;
  },
  unqueueBound(): void {
    if (--BindLifecycle.boundDepth === 0) {
      let current = BindLifecycle.boundHead;
      let next: ILifecycleBound;
      BindLifecycle.boundHead = BindLifecycle.boundTail = null;
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
    if (BindLifecycle.unboundHead === null) {
      BindLifecycle.unboundHead = requestor;
    } else {
      BindLifecycle.unboundTail.$nextUnbound = requestor;
    }
    BindLifecycle.unboundTail = requestor;
    ++BindLifecycle.unboundDepth;
  },
  unqueueUnbound(): void {
    if (--BindLifecycle.unboundDepth === 0) {
      let current = BindLifecycle.unboundHead;
      let next: ILifecycleUnbound;
      BindLifecycle.unboundHead = BindLifecycle.unboundTail = null;
      while (current !== null) {
        current.unbound(current.$unboundFlags);
        next = current.$nextUnbound;
        current.$nextUnbound = null;
        current = next;
      }
    }
  }
};
