import { Writable } from '@aurelia/kernel';
import { Hooks, Lifecycle, State } from './lifecycle';
import { ICustomAttribute, ICustomElement } from './lifecycle-render';
import { BindingFlags, IScope } from './observation';
import { IView } from './templating/view';

/*@internal*/
export function $bindAttribute(this: Writable<ICustomAttribute>, flags: BindingFlags, scope: IScope): void {
  flags |= BindingFlags.fromBind;

  if (this.$state & State.isBound) {
    if (this.$scope === scope) {
      return;
    }

    this.$unbind(flags);
  }
  // add isBinding flag
  this.$state |= State.isBinding;

  const hooks = this.$hooks;

  if (hooks & Hooks.hasBound) {
    Lifecycle.queueBound(this, flags);
  }

  this.$scope = scope;

  if (hooks & Hooks.hasBinding) {
    this.binding(flags);
  }

  // add isBound flag and remove isBinding flag
  this.$state |= State.isBound;
  this.$state &= ~State.isBinding;

  if (hooks & Hooks.hasBound) {
    Lifecycle.unqueueBound();
  }
}

/*@internal*/
export function $bindElement(this: Writable<ICustomElement>, flags: BindingFlags): void {
  if (this.$state & State.isBound) {
    return;
  }
  // add isBinding flag
  this.$state |= State.isBinding;

  const hooks = this.$hooks;
  flags |= BindingFlags.fromBind;

  if (hooks & Hooks.hasBound) {
    Lifecycle.queueBound(this, flags);
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

  if (hooks & Hooks.hasBound) {
    Lifecycle.unqueueBound();
  }
}

/*@internal*/
export function $bindView(this: Writable<IView>, flags: BindingFlags, scope: IScope): void {
  flags |= BindingFlags.fromBind;

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
export function $unbindAttribute(this: Writable<ICustomAttribute>, flags: BindingFlags): void {
  if (this.$state & State.isBound) {
    // add isUnbinding flag
    this.$state |= State.isUnbinding;

    const hooks = this.$hooks;
    flags |= BindingFlags.fromUnbind;

    if (hooks & Hooks.hasUnbound) {
      Lifecycle.queueUnbound(this, flags);
    }

    if (hooks & Hooks.hasUnbinding) {
      this.unbinding(flags);
    }

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);

    if (hooks & Hooks.hasUnbound) {
      Lifecycle.unqueueUnbound();
    }
  }
}

/*@internal*/
export function $unbindElement(this: Writable<ICustomElement>, flags: BindingFlags): void {
  if (this.$state & State.isBound) {
    // add isUnbinding flag
    this.$state |= State.isUnbinding;

    const hooks = this.$hooks;
    flags |= BindingFlags.fromUnbind;

    if (hooks & Hooks.hasUnbound) {
      Lifecycle.queueUnbound(this, flags);
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

    if (hooks & Hooks.hasUnbound) {
      Lifecycle.unqueueUnbound();
    }
  }
}

/*@internal*/
export function $unbindView(this: Writable<IView>, flags: BindingFlags): void {
  if (this.$state & State.isBound) {
    // add isUnbinding flag
    this.$state |= State.isUnbinding;

    flags |= BindingFlags.fromUnbind;

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
