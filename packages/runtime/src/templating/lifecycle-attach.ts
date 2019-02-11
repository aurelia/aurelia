import { Profiler, Tracer, Writable } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import {
  allowUnmount,
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
  isNotAttached,
  isNotMounted,
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
  if (isAttached(this)) { return; }
  if (Profiler.enabled) { enter(); }
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$attach', slice.call(arguments)); }

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
  if (isAttached(this)) { return; }
  if (Profiler.enabled) { enter(); }
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$attach', slice.call(arguments)); }

  flags |= LifecycleFlags.fromAttach;
  this.$lifecycle.beginAttach();
  setAttachingState(this);
  if (hasAttachingHook(this)) {
    this.attaching(flags);
  }

  attachComponents(this.$componentHead, flags);
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
  if (isAttached(this)) { return; }
  if (Tracer.enabled) { Tracer.enter('IView', '$attach', slice.call(arguments)); }

  flags |= LifecycleFlags.fromAttach;
  this.$lifecycle.beginAttach();
  setAttachingState(this);
  attachComponents(this.$componentHead, flags);
  this.$lifecycle.enqueueMount(this);
  setAttachedState(this);
  this.$lifecycle.endAttach(flags);

  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
// tslint:disable-next-line:no-ignored-initial-value
export function $detachAttribute(this: Writable<IAttachable>, flags: LifecycleFlags): void {
  if (isNotAttached(this)) { return; }
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$detach', slice.call(arguments)); }

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

  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
// tslint:disable-next-line:no-ignored-initial-value
export function $detachElement(this: Writable<IAttachable & IMountableComponent>, flags: LifecycleFlags): void {
  if (isNotAttached(this)) { return; }
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$detach', slice.call(arguments)); }

  flags |= LifecycleFlags.fromDetach;
  this.$lifecycle.beginDetach();
  setDetachingState(this);

  if (allowUnmount(flags)) {
    this.$lifecycle.enqueueUnmount(this);
    flags |= LifecycleFlags.parentUnmountQueued;
  }

  if (hasDetachingHook(this)) {
    this.detaching(flags);
  }

  detachComponents(this.$componentTail, flags);
  if (hasDetachedHook(this)) {
    this.$lifecycle.enqueueDetached(this as Required<typeof this>);
  }

  setNotAttachedState(this);
  this.$lifecycle.endDetach(flags);

  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $detachView(this: Writable<IAttachable & IMountableComponent>, flags: LifecycleFlags): void {
  if (isNotAttached(this)) { return; }
  if (Tracer.enabled) { Tracer.enter('IView', '$detach', slice.call(arguments)); }

  flags |= LifecycleFlags.fromDetach;
  this.$lifecycle.beginDetach();
  setDetachingState(this);

  if (allowUnmount(flags)) {
    this.$lifecycle.enqueueUnmount(this);
    flags |= LifecycleFlags.parentUnmountQueued;
  }

  detachComponents(this.$componentTail, flags);
  setNotAttachedState(this);
  this.$lifecycle.endDetach(flags);

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
  if (isMounted(this)) { return; }
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$mount', slice.call(arguments)); }

  setMountedState(this);
  this.$projector.project(this.$nodes);

  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $unmountElement(this: Writable<ICustomElement & IAttachable>, flags: LifecycleFlags): void {
  if (isNotMounted(this)) { return; }
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$unmount', slice.call(arguments)); }

  setNotMountedState(this);
  this.$projector.take(this.$nodes);

  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $mountView(this: Writable<IView>, flags: LifecycleFlags): void {
  if (isMounted(this)) { return; }
  if (Tracer.enabled) { Tracer.enter('IView', '$mount', slice.call(arguments)); }

  setMountedState(this);
  this.$nodes.insertBefore(this.location);

  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $unmountView(this: Writable<IView>, flags: LifecycleFlags): boolean {
  if (isNotMounted(this)) { return false; }
  if (Tracer.enabled) { Tracer.enter('IView', '$unmount', slice.call(arguments)); }

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

function attachComponents(component: IComponent, flags: LifecycleFlags): void {
  while (component !== null) {
    component.$attach(flags);
    component = component.$nextComponent;
  }
}

function detachComponents(component: IComponent, flags: LifecycleFlags): void {
  while (component !== null) {
    component.$detach(flags);
    component = component.$prevComponent;
  }
}
