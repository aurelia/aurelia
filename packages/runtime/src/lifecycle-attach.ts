import { Writable } from '@aurelia/kernel';
import { Hooks, Lifecycle, State } from './lifecycle';
import { ICustomAttribute, ICustomElement } from './lifecycle-render';
import { IView } from './templating/view';

/*@internal*/
export function $attachAttribute(this: Writable<ICustomAttribute>): void {
  if (this.$state & State.isAttached) {
    return;
  }
  Lifecycle.beginAttach();
  // add isAttaching flag
  this.$state |= State.isAttaching;

  const hooks = this.$hooks;

  if (hooks & Hooks.hasAttaching) {
    this.attaching();
  }

  // add isAttached flag, remove isAttaching flag
  this.$state |= State.isAttached;
  this.$state &= ~State.isAttaching;

  if (hooks & Hooks.hasAttached) {
    Lifecycle.queueAttachedCallback(<Required<typeof this>>this);
  }
  Lifecycle.endAttach();
}

/*@internal*/
export function $attachElement(this: Writable<ICustomElement>): void {
  if (this.$state & State.isAttached) {
    return;
  }
  Lifecycle.beginAttach();
  // add isAttaching flag
  this.$state |= State.isAttaching;

  const hooks = this.$hooks;

  if (hooks & Hooks.hasAttaching) {
    this.attaching();
  }

  let current = this.$attachableHead;
  while (current !== null) {
    current.$attach();
    current = current.$nextAttach;
  }

  Lifecycle.queueMount(this);
  // add isAttached flag, remove isAttaching flag
  this.$state |= State.isAttached;
  this.$state &= ~State.isAttaching;

  if (hooks & Hooks.hasAttached) {
    Lifecycle.queueAttachedCallback(<Required<typeof this>>this);
  }
  Lifecycle.endAttach();
}

/*@internal*/
export function $attachView(this: Writable<IView>): void {
  if (this.$state & State.isAttached) {
    return;
  }
  // add isAttaching flag
  this.$state |= State.isAttaching;

  let current = this.$attachableHead;
  while (current !== null) {
    current.$attach();
    current = current.$nextAttach;
  }

  if (this.$state & State.needsMount) {
    Lifecycle.queueMount(this);
  }

  // add isAttached flag, remove isAttaching flag
  this.$state |= State.isAttached;
  this.$state &= ~State.isAttaching;
}

/*@internal*/
export function $detachAttribute(this: Writable<ICustomAttribute>): void {
  if (this.$state & State.isAttached) {
    Lifecycle.beginDetach();
    // add isDetaching flag
    this.$state |= State.isDetaching;

    const hooks = this.$hooks;
    if (hooks & Hooks.hasDetaching) {
      this.detaching();
    }

    // remove isAttached and isDetaching flags
    this.$state &= ~(State.isAttached | State.isDetaching);

    if (hooks & Hooks.hasDetached) {
      Lifecycle.queueDetachedCallback(<Required<typeof this>>this);
    }
    Lifecycle.endDetach();
  }
}

/*@internal*/
export function $detachElement(this: Writable<ICustomElement>): void {
  if (this.$state & State.isAttached) {
    Lifecycle.beginDetach();
    // add isDetaching flag
    this.$state |= State.isDetaching;

    const hooks = this.$hooks;
    if (hooks & Hooks.hasDetaching) {
      this.detaching();
    }

    Lifecycle.queueUnmount(this);

    let current = this.$attachableTail;
    while (current !== null) {
      current.$detach();
      current = current.$prevAttach;
    }

    // remove isAttached and isDetaching flags
    this.$state &= ~(State.isAttached | State.isDetaching);

    if (hooks & Hooks.hasDetached) {
      Lifecycle.queueDetachedCallback(<Required<typeof this>>this);
    }
    Lifecycle.endDetach();
  }
}

/*@internal*/
export function $detachView(this: Writable<IView>): void {
  if (this.$state & State.isAttached) {
    // add isDetaching flag
    this.$state |= State.isDetaching;

    Lifecycle.queueUnmount(this);

    let current = this.$attachableTail;
    while (current !== null) {
      current.$detach();
      current = current.$prevAttach;
    }

    // remove isAttached and isDetaching flags
    this.$state &= ~(State.isAttached | State.isDetaching);
  }
}

/*@internal*/
export function $cacheAttribute(this: Writable<ICustomAttribute>): void {
  if (this.$hooks & Hooks.hasCaching) {
    this.caching();
  }
}

/*@internal*/
export function $cacheElement(this: Writable<ICustomElement>): void {
  if (this.$hooks & Hooks.hasCaching) {
    this.caching();
  }

  let current = this.$attachableTail;
  while (current !== null) {
    current.$cache();
    current = current.$prevAttach;
  }
}

/*@internal*/
export function $cacheView(this: Writable<IView>): void {
  let current = this.$attachableTail;
  while (current !== null) {
    current.$cache();
    current = current.$prevAttach;
  }
}

/*@internal*/
export function $mountElement(this: Writable<ICustomElement>): void {
  this.$projector.project(this.$nodes);
}

/*@internal*/
export function $unmountElement(this: Writable<ICustomElement>): void {
  this.$projector.take(this.$nodes);
}

/*@internal*/
export function $mountView(this: Writable<IView>): void {
  this.$state &= ~State.needsMount;
  this.$nodes.insertBefore(this.location);
}

/*@internal*/
export function $unmountView(this: Writable<IView>): boolean {
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
