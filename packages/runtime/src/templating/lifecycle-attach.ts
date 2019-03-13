import { Profiler, Tracer, Writable } from '@aurelia/kernel';
import { Hooks, LifecycleFlags, State } from '../flags';
import { IComponent, ILifecycleHooks, IMountableComponent, IRenderable, IView } from '../lifecycle';
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
export function $attachAttribute(this: Required<IAttachable>, flags: LifecycleFlags): void {
  if (Profiler.enabled) { enter(); }
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$attach', slice.call(arguments)); }
  if (this.$state & State.isAttached) {
    if (Profiler.enabled) { leave(); }
    if (Tracer.enabled) { Tracer.leave(); }
    return;
  }
  const lifecycle = this.$lifecycle;
  lifecycle.beginAttach();
  // add isAttaching flag
  this.$state |= State.isAttaching;
  flags |= LifecycleFlags.fromAttach;

  const hooks = this.$hooks;

  if (hooks & Hooks.hasAttaching) {
    this.attaching(flags);
  }

  // add isAttached flag, remove isAttaching flag
  this.$state |= State.isAttached;
  this.$state &= ~State.isAttaching;

  if (hooks & Hooks.hasAttached) {
    lifecycle.enqueueAttached(this);
  }
  lifecycle.endAttach(flags);
  if (Profiler.enabled) { leave(); }
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
// tslint:disable-next-line:no-ignored-initial-value
export function $attachElement(this: Required<IAttachable & IMountableComponent>, flags: LifecycleFlags): void {
  if (Profiler.enabled) { enter(); }
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$attach', slice.call(arguments)); }
  if (this.$state & State.isAttached) {
    if (Profiler.enabled) { leave(); }
    if (Tracer.enabled) { Tracer.leave(); }
    return;
  }
  const lifecycle = this.$lifecycle;
  lifecycle.beginAttach();
  // add isAttaching flag
  this.$state |= State.isAttaching;
  flags |= LifecycleFlags.fromAttach;

  const hooks = this.$hooks;

  if (hooks & Hooks.hasAttaching) {
    this.attaching(flags);
  }

  let current = this.$componentHead as Required<IComponent>;
  while (current != null) {
    current.$attach(flags);
    current = current.$nextComponent as Required<IComponent>;
  }

  lifecycle.enqueueMount(this);

  // add isAttached flag, remove isAttaching flag
  this.$state |= State.isAttached;
  this.$state &= ~State.isAttaching;

  if (hooks & Hooks.hasAttached) {
    lifecycle.enqueueAttached(this);
  }
  lifecycle.endAttach(flags);
  if (Profiler.enabled) { leave(); }
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $attachView(this: Required<IAttachable & IMountableComponent>, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter('IView', '$attach', slice.call(arguments)); }
  if (this.$state & State.isAttached) {
    if (Tracer.enabled) { Tracer.leave(); }
    return;
  }
  // add isAttaching flag
  this.$state |= State.isAttaching;
  flags |= LifecycleFlags.fromAttach;

  let current = this.$componentHead as Required<IComponent>;
  while (current != null) {
    current.$attach(flags);
    current = current.$nextComponent as Required<IComponent>;
  }

  this.$lifecycle.enqueueMount(this);

  // add isAttached flag, remove isAttaching flag
  this.$state |= State.isAttached;
  this.$state &= ~State.isAttaching;
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
// tslint:disable-next-line:no-ignored-initial-value
export function $detachAttribute(this: Required<IAttachable>, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$detach', slice.call(arguments)); }
  if (this.$state & State.isAttached) {
    const lifecycle = this.$lifecycle;
    lifecycle.beginDetach();
    // add isDetaching flag
    this.$state |= State.isDetaching;
    flags |= LifecycleFlags.fromDetach;

    const hooks = this.$hooks;
    if (hooks & Hooks.hasDetaching) {
      this.detaching(flags);
    }

    // remove isAttached and isDetaching flags
    this.$state &= ~(State.isAttached | State.isDetaching);

    if (hooks & Hooks.hasDetached) {
      lifecycle.enqueueDetached(this);
    }
    lifecycle.endDetach(flags);
  }
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
// tslint:disable-next-line:no-ignored-initial-value
export function $detachElement(this: Required<IAttachable & IMountableComponent>, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$detach', slice.call(arguments)); }
  if (this.$state & State.isAttached) {
    const lifecycle = this.$lifecycle;
    lifecycle.beginDetach();
    // add isDetaching flag
    this.$state |= State.isDetaching;
    flags |= LifecycleFlags.fromDetach;

    // Only unmount if either:
    // - No parent view/element is queued for unmount yet, or
    // - Aurelia is stopping (in which case all nodes need to return to their fragments for a clean mount on next start)
    if (((flags & LifecycleFlags.parentUnmountQueued) ^ LifecycleFlags.parentUnmountQueued) | (flags & LifecycleFlags.fromStopTask)) {
      lifecycle.enqueueUnmount(this);
      flags |= LifecycleFlags.parentUnmountQueued;
    }

    const hooks = this.$hooks;
    if (hooks & Hooks.hasDetaching) {
      this.detaching(flags);
    }

    let current = this.$componentTail as Required<IComponent>;
    while (current != null) {
      current.$detach(flags);
      current = current.$prevComponent as Required<IComponent>;
    }

    // remove isAttached and isDetaching flags
    this.$state &= ~(State.isAttached | State.isDetaching);

    if (hooks & Hooks.hasDetached) {
      lifecycle.enqueueDetached(this);
    }
    lifecycle.endDetach(flags);
  }
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $detachView(this: Required<IAttachable & IMountableComponent>, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter('IView', '$detach', slice.call(arguments)); }
  if (this.$state & State.isAttached) {
    // add isDetaching flag
    this.$state |= State.isDetaching;
    flags |= LifecycleFlags.fromDetach;

    // Only unmount if either:
    // - No parent view/element is queued for unmount yet, or
    // - Aurelia is stopping (in which case all nodes need to return to their fragments for a clean mount on next start)
    if (((flags & LifecycleFlags.parentUnmountQueued) ^ LifecycleFlags.parentUnmountQueued) | (flags & LifecycleFlags.fromStopTask)) {
      this.$lifecycle.enqueueUnmount(this);
      flags |= LifecycleFlags.parentUnmountQueued;
    }

    let current = this.$componentTail as Required<IComponent>;
    while (current != null) {
      current.$detach(flags);
      current = current.$prevComponent as Required<IComponent>;
    }

    // remove isAttached and isDetaching flags
    this.$state &= ~(State.isAttached | State.isDetaching);
  }
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $cacheAttribute(this: Required<IAttachable>, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$cache', slice.call(arguments)); }
  flags |= LifecycleFlags.fromCache;
  if (this.$hooks & Hooks.hasCaching) {
    this.caching(flags);
  }
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $cacheElement(this: Required<IAttachable>, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$cache', slice.call(arguments)); }
  flags |= LifecycleFlags.fromCache;
  if (this.$hooks & Hooks.hasCaching) {
    this.caching(flags);
  }

  let current = this.$componentTail as Required<IComponent>;
  while (current != null) {
    current.$cache(flags);
    current = current.$prevComponent as Required<IComponent>;
  }
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $cacheView(this: Required<IAttachable>, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter('IView', '$cache', slice.call(arguments)); }
  flags |= LifecycleFlags.fromCache;
  let current = this.$componentTail as Required<IComponent>;
  while (current != null) {
    current.$cache(flags);
    current = current.$prevComponent as Required<IComponent>;
  }
}

/** @internal */
export function $mountElement(this: Required<ICustomElement & IAttachable>, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$mount', slice.call(arguments)); }
  if (!(this.$state & State.isMounted)) {
    this.$state |= State.isMounted;
    this.$projector.project(this.$nodes);
  }
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $unmountElement(this: Required<ICustomElement & IAttachable>, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$unmount', slice.call(arguments)); }
  if (this.$state & State.isMounted) {
    this.$state &= ~State.isMounted;
    this.$projector.take(this.$nodes);
  }
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $mountView(this: Required<IView>, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter('IView', '$mount', slice.call(arguments)); }
  if (!(this.$state & State.isMounted)) {
    this.$state |= State.isMounted;
    this.$nodes.insertBefore(this.location);
  }
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $unmountView(this: Required<IView>, flags: LifecycleFlags): boolean {
  if (Tracer.enabled) { Tracer.enter('IView', '$unmount', slice.call(arguments)); }
  if (this.$state & State.isMounted) {
    this.$state &= ~State.isMounted;
    this.$nodes.remove();

    if (this.isFree) {
      (this as Writable<typeof this>).isFree = false;
      if (this.cache.tryReturnToCache(this)) {
        this.$state |= State.isCached;
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
