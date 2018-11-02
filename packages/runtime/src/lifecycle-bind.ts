import { Writable } from '@aurelia/kernel';
import { Hooks, Lifecycle, State } from './lifecycle';
import { ICustomAttribute, ICustomElement } from './lifecycle-render';
import { IScope, LifecycleFlags } from './observation';
import { IView } from './templating/view';

/*@internal*/
export function $bindAttribute(this: Writable<ICustomAttribute>, flags: LifecycleFlags, scope: IScope): void {
  flags |= LifecycleFlags.fromBind;

  if (this.$state & State.isBound) {
    if (this.$scope === scope) {
      return;
    }

    this.$unbind(flags);
  }
  Lifecycle.beginBind();
  // add isBinding flag
  this.$state |= State.isBinding;

  const hooks = this.$hooks;

  if (hooks & Hooks.hasBound) {
    Lifecycle.queueBound(this);
  }

  this.$scope = scope;

  if (hooks & Hooks.hasBinding) {
    this.binding(flags);
  }

  // add isBound flag and remove isBinding flag
  this.$state |= State.isBound;
  this.$state &= ~State.isBinding;

  Lifecycle.endBind(flags);
}

/*@internal*/
export function $bindElement(this: Writable<ICustomElement>, flags: LifecycleFlags): void {
  if (this.$state & State.isBound) {
    return;
  }
  Lifecycle.beginBind();
  // add isBinding flag
  this.$state |= State.isBinding;

  const hooks = this.$hooks;
  flags |= LifecycleFlags.fromBind;

  if (hooks & Hooks.hasBound) {
    Lifecycle.queueBound(this);
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

  Lifecycle.endBind(flags);
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
    Lifecycle.beginUnbind();
    // add isUnbinding flag
    this.$state |= State.isUnbinding;

    const hooks = this.$hooks;
    flags |= LifecycleFlags.fromUnbind;

    if (hooks & Hooks.hasUnbound) {
      Lifecycle.queueUnbound(this);
    }

    if (hooks & Hooks.hasUnbinding) {
      this.unbinding(flags);
    }

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);

    Lifecycle.endUnbind(flags);
  }
}

/*@internal*/
export function $unbindElement(this: Writable<ICustomElement>, flags: LifecycleFlags): void {
  if (this.$state & State.isBound) {
    Lifecycle.beginUnbind();
    // add isUnbinding flag
    this.$state |= State.isUnbinding;

    const hooks = this.$hooks;
    flags |= LifecycleFlags.fromUnbind;

    if (hooks & Hooks.hasUnbound) {
      Lifecycle.queueUnbound(this);
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

    Lifecycle.endUnbind(flags);
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
