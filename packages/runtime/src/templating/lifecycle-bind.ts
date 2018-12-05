import { Writable } from '../../kernel';
import { Hooks, IView, State } from '../lifecycle';
import { IScope, LifecycleFlags } from '../observation';
import { ICustomAttribute } from './custom-attribute';
import { ICustomElement } from './custom-element';

/*@internal*/
export function $bindAttribute(this: Writable<ICustomAttribute>, flags: LifecycleFlags, scope: IScope): void {
  flags |= LifecycleFlags.fromBind;

  if (this.$state & State.isBound) {
    if (this.$scope === scope) {
      return;
    }

    this.$unbind(flags);
  }
  const lifecycle = this.$lifecycle;
  lifecycle.beginBind();
  // add isBinding flag
  this.$state |= State.isBinding;

  const hooks = this.$hooks;

  if (hooks & Hooks.hasBound) {
    lifecycle.enqueueBound(this);
  }

  this.$scope = scope;

  if (hooks & Hooks.hasBinding) {
    this.binding(flags);
  }

  // add isBound flag and remove isBinding flag
  this.$state |= State.isBound;
  this.$state &= ~State.isBinding;

  lifecycle.endBind(flags);
}

/*@internal*/
export function $bindElement(this: Writable<ICustomElement>, flags: LifecycleFlags): void {
  if (this.$state & State.isBound) {
    return;
  }
  const lifecycle = this.$lifecycle;
  lifecycle.beginBind();
  // add isBinding flag
  this.$state |= State.isBinding;

  const hooks = this.$hooks;
  flags |= LifecycleFlags.fromBind;

  if (hooks & Hooks.hasBound) {
    lifecycle.enqueueBound(this);
  }

  if (hooks & Hooks.hasBinding) {
    this.binding(flags);
  }

  const scope = this.$scope;
  let current = this.$bindableHead;
  while (current !== null) {
    current.$bind(flags, scope);
    current = current.$nextBind;
  }

  // add isBound flag and remove isBinding flag
  this.$state |= State.isBound;
  this.$state &= ~State.isBinding;

  lifecycle.endBind(flags);
}

/*@internal*/
export function $bindView(this: Writable<IView>, flags: LifecycleFlags, scope: IScope): void {
  flags |= LifecycleFlags.fromBind;

  if (this.$state & State.isBound) {
    if (this.$scope === scope) {
      return;
    }

    this.$unbind(flags);
  }
  // add isBinding flag
  this.$state |= State.isBinding;

  this.$scope = scope;
  let current = this.$bindableHead;
  while (current !== null) {
    current.$bind(flags, scope);
    current = current.$nextBind;
  }

  // add isBound flag and remove isBinding flag
  this.$state |= State.isBound;
  this.$state &= ~State.isBinding;
}

/*@internal*/
export function $unbindAttribute(this: Writable<ICustomAttribute>, flags: LifecycleFlags): void {
  if (this.$state & State.isBound) {
    const lifecycle = this.$lifecycle;
    lifecycle.beginUnbind();
    // add isUnbinding flag
    this.$state |= State.isUnbinding;

    const hooks = this.$hooks;
    flags |= LifecycleFlags.fromUnbind;

    if (hooks & Hooks.hasUnbound) {
      lifecycle.enqueueUnbound(this);
    }

    if (hooks & Hooks.hasUnbinding) {
      this.unbinding(flags);
    }

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);

    lifecycle.endUnbind(flags);
  }
}

/*@internal*/
export function $unbindElement(this: Writable<ICustomElement>, flags: LifecycleFlags): void {
  if (this.$state & State.isBound) {
    const lifecycle = this.$lifecycle;
    lifecycle.beginUnbind();
    // add isUnbinding flag
    this.$state |= State.isUnbinding;

    const hooks = this.$hooks;
    flags |= LifecycleFlags.fromUnbind;

    if (hooks & Hooks.hasUnbound) {
      lifecycle.enqueueUnbound(this);
    }

    if (hooks & Hooks.hasUnbinding) {
      this.unbinding(flags);
    }

    let current = this.$bindableTail;
    while (current !== null) {
      current.$unbind(flags);
      current = current.$prevBind;
    }

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);

    lifecycle.endUnbind(flags);
  }
}

/*@internal*/
export function $unbindView(this: Writable<IView>, flags: LifecycleFlags): void {
  if (this.$state & State.isBound) {
    // add isUnbinding flag
    this.$state |= State.isUnbinding;

    flags |= LifecycleFlags.fromUnbind;

    let current = this.$bindableTail;
    while (current !== null) {
      current.$unbind(flags);
      current = current.$prevBind;
    }

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);
    this.$scope = null;
  }
}
