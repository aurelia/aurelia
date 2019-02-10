import { Profiler, Tracer, Writable } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import {
  hasAttachedHook,
  hasAttachingHook,
  hasCachingHook,
  hasDetachedHook,
  hasDetachingHook,
  IComponent,
  ILifecycleHooks,
  IMountableComponent,
  IRenderable,
  isAttached,
  isMounted,
  IView,
  setAttachedState,
  setAttachingState,
  setCachedState,
  setDetachingState,
  setMountedState,
  setNotAttachedState,
  setNotMountedState
} from '../lifecycle';
import { ICustomElement } from '../resources/custom-element';

interface IAttachable extends IRenderable, ILifecycleHooks, IComponent {
  constructor: {
    description?: { name: string };
    name: string;
  };
}

const slice = Array.prototype.slice;

const { enter, leave } = Profiler.createTimer('AttachLifecycle');

/** @internal */
// tslint:disable-next-line:no-ignored-initial-value
export function $attachAttribute(this: Writable<IAttachable>, flags: LifecycleFlags): void {
  if (Profiler.enabled) { enter(); }
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$attach', slice.call(arguments)); }
  if (isAttached(this)) {
    if (Profiler.enabled) { leave(); }
    if (Tracer.enabled) { Tracer.leave(); }
    return;
  }

  flags |= LifecycleFlags.fromAttach;
  this.$lifecycle.beginAttach();
  setAttachingState(this);

  if (hasAttachingHook(this)) {
    this.attaching(flags);
  }

  if (hasAttachedHook(this)) {
    this.$lifecycle.enqueueAttached(this as Required<typeof this>);
  }

  setAttachedState(this);
  this.$lifecycle.endAttach(flags);

  if (Profiler.enabled) { leave(); }
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
// tslint:disable-next-line:no-ignored-initial-value
export function $attachElement(this: Writable<IAttachable & IMountableComponent>, flags: LifecycleFlags): void {
  if (Profiler.enabled) { enter(); }
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$attach', slice.call(arguments)); }
  if (isAttached(this)) {
    if (Profiler.enabled) { leave(); }
    if (Tracer.enabled) { Tracer.leave(); }
    return;
  }

  flags |= LifecycleFlags.fromAttach;
  this.$lifecycle.beginAttach();
  setAttachingState(this);

  if (hasAttachingHook(this)) {
    this.attaching(flags);
  }

  let current = this.$componentHead;
  while (current !== null) {
    current.$attach(flags);
    current = current.$nextComponent;
  }

  this.$lifecycle.enqueueMount(this);
  if (hasAttachedHook(this)) {
    this.$lifecycle.enqueueAttached(this as Required<typeof this>);
  }

  setAttachedState(this);
  this.$lifecycle.endAttach(flags);

  if (Profiler.enabled) { leave(); }
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $attachView(this: Writable<IAttachable & IMountableComponent>, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter('IView', '$attach', slice.call(arguments)); }
  if (isAttached(this)) {
    if (Tracer.enabled) { Tracer.leave(); }
    return;
  }

  flags |= LifecycleFlags.fromAttach;
  this.$lifecycle.beginAttach();
  setAttachingState(this);

  let current = this.$componentHead;
  while (current !== null) {
    current.$attach(flags);
    current = current.$nextComponent;
  }

  this.$lifecycle.enqueueMount(this);
  setAttachedState(this);
  this.$lifecycle.endAttach(flags);

  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
// tslint:disable-next-line:no-ignored-initial-value
export function $detachAttribute(this: Writable<IAttachable>, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$detach', slice.call(arguments)); }
  if (isAttached(this)) {
    flags |= LifecycleFlags.fromDetach;
    this.$lifecycle.beginDetach();
    setDetachingState(this);

    if (hasDetachingHook(this)) {
      this.detaching(flags);
    }

    if (hasDetachedHook(this)) {
      this.$lifecycle.enqueueDetached(this as Required<typeof this>);
    }

    setNotAttachedState(this);
    this.$lifecycle.endDetach(flags);
  }
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
// tslint:disable-next-line:no-ignored-initial-value
export function $detachElement(this: Writable<IAttachable & IMountableComponent>, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$detach', slice.call(arguments)); }
  if (isAttached(this)) {
    flags |= LifecycleFlags.fromDetach;
    this.$lifecycle.beginDetach();
    setDetachingState(this);

    // Only unmount if either:
    // - No parent view/element is queued for unmount yet, or
    // - Aurelia is stopping (in which case all nodes need to return to their fragments for a clean mount on next start)
    if ((((flags & LifecycleFlags.parentUnmountQueued) ^ LifecycleFlags.parentUnmountQueued) | (flags & LifecycleFlags.fromStopTask)) > 0) {
      this.$lifecycle.enqueueUnmount(this);
      flags |= LifecycleFlags.parentUnmountQueued;
    }

    if (hasDetachingHook(this)) {
      this.detaching(flags);
    }

    let current = this.$componentTail;
    while (current !== null) {
      current.$detach(flags);
      current = current.$prevComponent;
    }

    if (hasDetachedHook(this)) {
      this.$lifecycle.enqueueDetached(this as Required<typeof this>);
    }

    setNotAttachedState(this);
    this.$lifecycle.endDetach(flags);
  }
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $detachView(this: Writable<IAttachable & IMountableComponent>, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter('IView', '$detach', slice.call(arguments)); }
  if (isAttached(this)) {
    flags |= LifecycleFlags.fromDetach;
    this.$lifecycle.beginDetach();
    setDetachingState(this);

    // Only unmount if either:
    // - No parent view/element is queued for unmount yet, or
    // - Aurelia is stopping (in which case all nodes need to return to their fragments for a clean mount on next start)
    if ((((flags & LifecycleFlags.parentUnmountQueued) ^ LifecycleFlags.parentUnmountQueued) | (flags & LifecycleFlags.fromStopTask)) > 0) {
      this.$lifecycle.enqueueUnmount(this);
      flags |= LifecycleFlags.parentUnmountQueued;
    }

    let current = this.$componentTail;
    while (current !== null) {
      current.$detach(flags);
      current = current.$prevComponent;
    }

    setNotAttachedState(this);
    this.$lifecycle.endDetach(flags);
  }
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $cacheAttribute(this: Writable<IAttachable>, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$cache', slice.call(arguments)); }
  flags |= LifecycleFlags.fromCache;
  if (hasCachingHook(this)) {
    this.caching(flags);
  }

  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $cacheElement(this: Writable<IAttachable>, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$cache', slice.call(arguments)); }
  flags |= LifecycleFlags.fromCache;
  if (hasCachingHook(this)) {
    this.caching(flags);
  }

  let current = this.$componentTail;
  while (current !== null) {
    current.$cache(flags);
    current = current.$prevComponent;
  }

  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $cacheView(this: Writable<IAttachable>, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter('IView', '$cache', slice.call(arguments)); }
  flags |= LifecycleFlags.fromCache;
  let current = this.$componentTail;
  while (current !== null) {
    current.$cache(flags);
    current = current.$prevComponent;
  }
}

/** @internal */
export function $mountElement(this: Writable<ICustomElement & IAttachable>, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$mount', slice.call(arguments)); }
  if (isMounted(this)) {
    if (Tracer.enabled) { Tracer.leave(); }
    return;
  }

  setMountedState(this);
  this.$projector.project(this.$nodes);
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $unmountElement(this: Writable<ICustomElement & IAttachable>, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$unmount', slice.call(arguments)); }
  if (isMounted(this)) {
    setNotMountedState(this);
    this.$projector.take(this.$nodes);
  }

  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $mountView(this: Writable<IView>, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter('IView', '$mount', slice.call(arguments)); }
  if (isMounted(this)) {
    if (Tracer.enabled) { Tracer.leave(); }
    return;
  }

  setMountedState(this);
  this.$nodes.insertBefore(this.location);
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $unmountView(this: Writable<IView>, flags: LifecycleFlags): boolean {
  if (Tracer.enabled) { Tracer.enter('IView', '$unmount', slice.call(arguments)); }
  if (isMounted(this)) {
    setNotMountedState(this);
    this.$nodes.remove();

    if (this.isFree) {
      this.isFree = false;
      if (this.cache.tryReturnToCache(this)) {
        setCachedState(this);
        if (Tracer.enabled) { Tracer.leave(); }
        return true;
      }
    }

    if (Tracer.enabled) { Tracer.leave(); }
    return false;
  }

  if (Tracer.enabled) { Tracer.leave(); }
  return false;
}
