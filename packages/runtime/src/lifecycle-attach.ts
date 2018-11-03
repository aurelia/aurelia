import { Writable } from '@aurelia/kernel';
import { Hooks, State } from './lifecycle';
import { ICustomAttribute, ICustomElement } from './lifecycle-render';
import { LifecycleFlags } from './observation';
import { IView } from './templating/view';

/*@internal*/
export function $attachAttribute(this: Writable<ICustomAttribute>, flags: LifecycleFlags): void {
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
    this.attaching(flags);
  }

  // add isAttached flag, remove isAttaching flag
  this.$state |= State.isAttached;
  this.$state &= ~State.isAttaching;

  if (hooks & Hooks.hasAttached) {
    lifecycle.queueAttachedCallback(<Required<typeof this>>this);
  }
  lifecycle.endAttach(flags);
}

/*@internal*/
export function $attachElement(this: Writable<ICustomElement>, flags: LifecycleFlags): void {
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
    this.attaching(flags);
  }

  let current = this.$attachableHead;
  while (current !== null) {
    current.$attach(flags);
    current = current.$nextAttach;
  }

  lifecycle.queueMount(this);
  // add isAttached flag, remove isAttaching flag
  this.$state |= State.isAttached;
  this.$state &= ~State.isAttaching;

  if (hooks & Hooks.hasAttached) {
    lifecycle.queueAttachedCallback(<Required<typeof this>>this);
  }
  lifecycle.endAttach(flags);
}

/*@internal*/
export function $attachView(this: Writable<IView>, flags: LifecycleFlags): void {
  if (this.$state & State.isAttached) {
    return;
  }
  // add isAttaching flag
  this.$state |= State.isAttaching;
  flags |= LifecycleFlags.fromAttach;

  let current = this.$attachableHead;
  while (current !== null) {
    current.$attach(flags);
    current = current.$nextAttach;
  }

  if (this.$state & State.needsMount) {
    this.$lifecycle.queueMount(this);
  }

  // add isAttached flag, remove isAttaching flag
  this.$state |= State.isAttached;
  this.$state &= ~State.isAttaching;
}

/*@internal*/
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
      lifecycle.queueDetachedCallback(<Required<typeof this>>this);
    }
    lifecycle.endDetach(flags);
  }
}

/*@internal*/
export function $detachElement(this: Writable<ICustomElement>, flags: LifecycleFlags): void {
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

    lifecycle.queueUnmount(this);

    let current = this.$attachableTail;
    while (current !== null) {
      current.$detach(flags);
      current = current.$prevAttach;
    }

    // remove isAttached and isDetaching flags
    this.$state &= ~(State.isAttached | State.isDetaching);

    if (hooks & Hooks.hasDetached) {
      lifecycle.queueDetachedCallback(<Required<typeof this>>this);
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

    this.$lifecycle.queueUnmount(this);

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
  this.$projector.project(this.$nodes);
}

/*@internal*/
export function $unmountElement(this: Writable<ICustomElement>, flags: LifecycleFlags): void {
  this.$projector.take(this.$nodes);
}

/*@internal*/
export function $mountView(this: Writable<IView>, flags: LifecycleFlags): void {
  this.$state &= ~State.needsMount;
  this.$nodes.insertBefore(this.location);
}

/*@internal*/
export function $unmountView(this: Writable<IView>, flags: LifecycleFlags): boolean {
  this.$state |= State.needsMount;
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
