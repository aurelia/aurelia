import { Writable } from '@aurelia/kernel';
import { INode } from '../dom.interfaces';
import { Hooks, IView, State } from '../lifecycle';
import { LifecycleFlags } from '../observation';
import { ICustomAttribute } from './custom-attribute';
import { ICustomElement } from './custom-element';

/*@internal*/
// tslint:disable-next-line:no-ignored-initial-value
export function $attachAttribute(this: Writable<ICustomAttribute>, flags: LifecycleFlags, encapsulationSource?: INode): void {
  if (this.$state & State.isAttached) {
    return;
  }
  const lifecycle = this.$lifecycle;
  lifecycle.beginAttach();
  // add isAttaching flag
  this.$state |= State.isAttaching;
  flags |= LifecycleFlags.fromAttach;

  const hooks = this.$hooks;

  if (hooks & Hooks.hasAttaching) {
    this.attaching(flags, encapsulationSource);
  }

  // add isAttached flag, remove isAttaching flag
  this.$state |= State.isAttached;
  this.$state &= ~State.isAttaching;

  if (hooks & Hooks.hasAttached) {
    lifecycle.enqueueAttached(this as Required<typeof this>);
  }
  lifecycle.endAttach(flags);
}

/*@internal*/
// tslint:disable-next-line:no-ignored-initial-value
export function $attachElement(this: Writable<ICustomElement>, flags: LifecycleFlags, encapsulationSource?: INode): void {
  if (this.$state & State.isAttached) {
    return;
  }
  const lifecycle = this.$lifecycle;
  lifecycle.beginAttach();
  // add isAttaching flag
  this.$state |= State.isAttaching;
  flags |= LifecycleFlags.fromAttach;

  const hooks = this.$hooks;
  encapsulationSource = this.$projector.provideEncapsulationSource(encapsulationSource === undefined ? this.$host : encapsulationSource);

  if (hooks & Hooks.hasAttaching) {
    this.attaching(flags, encapsulationSource);
  }

  let current = this.$attachableHead;
  while (current !== null) {
    current.$attach(flags, encapsulationSource);
    current = current.$nextAttach;
  }

  lifecycle.enqueueMount(this);

  // add isAttached flag, remove isAttaching flag
  this.$state |= State.isAttached;
  this.$state &= ~State.isAttaching;

  if (hooks & Hooks.hasAttached) {
    lifecycle.enqueueAttached(this as Required<typeof this>);
  }
  lifecycle.endAttach(flags);
}

/*@internal*/
export function $attachView(this: Writable<IView>, flags: LifecycleFlags, encapsulationSource?: INode): void {
  if (this.$state & State.isAttached) {
    return;
  }
  // add isAttaching flag
  this.$state |= State.isAttaching;
  flags |= LifecycleFlags.fromAttach;

  let current = this.$attachableHead;
  while (current !== null) {
    current.$attach(flags, encapsulationSource);
    current = current.$nextAttach;
  }

  this.$lifecycle.enqueueMount(this);

  // add isAttached flag, remove isAttaching flag
  this.$state |= State.isAttached;
  this.$state &= ~State.isAttaching;
}

/*@internal*/
// tslint:disable-next-line:no-ignored-initial-value
export function $detachAttribute(this: Writable<ICustomAttribute>, flags: LifecycleFlags): void {
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
      lifecycle.enqueueDetached(this as Required<typeof this>);
    }
    lifecycle.endDetach(flags);
  }
}

/*@internal*/
// tslint:disable-next-line:no-ignored-initial-value
export function $detachElement(this: Writable<ICustomElement>, flags: LifecycleFlags): void {
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

    let current = this.$attachableTail;
    while (current !== null) {
      current.$detach(flags);
      current = current.$prevAttach;
    }

    // remove isAttached and isDetaching flags
    this.$state &= ~(State.isAttached | State.isDetaching);

    if (hooks & Hooks.hasDetached) {
      lifecycle.enqueueDetached(this as Required<typeof this>);
    }
    lifecycle.endDetach(flags);
  }
}

/*@internal*/
export function $detachView(this: Writable<IView>, flags: LifecycleFlags): void {
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

    let current = this.$attachableTail;
    while (current !== null) {
      current.$detach(flags);
      current = current.$prevAttach;
    }

    // remove isAttached and isDetaching flags
    this.$state &= ~(State.isAttached | State.isDetaching);
  }
}

/*@internal*/
export function $cacheAttribute(this: Writable<ICustomAttribute>, flags: LifecycleFlags): void {
  flags |= LifecycleFlags.fromCache;
  if (this.$hooks & Hooks.hasCaching) {
    this.caching(flags);
  }
}

/*@internal*/
export function $cacheElement(this: Writable<ICustomElement>, flags: LifecycleFlags): void {
  flags |= LifecycleFlags.fromCache;
  if (this.$hooks & Hooks.hasCaching) {
    this.caching(flags);
  }

  let current = this.$attachableTail;
  while (current !== null) {
    current.$cache(flags);
    current = current.$prevAttach;
  }
}

/*@internal*/
export function $cacheView(this: Writable<IView>, flags: LifecycleFlags): void {
  flags |= LifecycleFlags.fromCache;
  let current = this.$attachableTail;
  while (current !== null) {
    current.$cache(flags);
    current = current.$prevAttach;
  }
}

/*@internal*/
export function $mountElement(this: Writable<ICustomElement>, flags: LifecycleFlags): void {
  if (!(this.$state & State.isMounted)) {
    this.$state |= State.isMounted;
    this.$projector.project(this.$nodes);
  }
}

/*@internal*/
export function $unmountElement(this: Writable<ICustomElement>, flags: LifecycleFlags): void {
  if (this.$state & State.isMounted) {
    this.$state &= ~State.isMounted;
    this.$projector.take(this.$nodes);
  }
}

/*@internal*/
export function $mountView(this: Writable<IView>, flags: LifecycleFlags): void {
  if (!(this.$state & State.isMounted)) {
    this.$state |= State.isMounted;
    this.$nodes.insertBefore(this.location);
  }
}

/*@internal*/
export function $unmountView(this: Writable<IView>, flags: LifecycleFlags): boolean {
  if (this.$state & State.isMounted) {
    this.$state &= ~State.isMounted;
    this.$nodes.remove();

    if (this.isFree) {
      this.isFree = false;
      if (this.cache.tryReturnToCache(this)) {
        this.$state |= State.isCached;
        return true;
      }
    }
    return false;
  }
  return false;
}
