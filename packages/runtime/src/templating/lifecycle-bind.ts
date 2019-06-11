import { Profiler, Tracer, Writable } from '@aurelia/kernel';
import { Hooks, LifecycleFlags, State } from '../flags';
import { IComponent, ILifecycleHooks, IRenderable } from '../lifecycle';
import { IPatchable, IScope } from '../observation';
import { patchProperties } from '../observation/patch-properties';

const slice = Array.prototype.slice;

const { enter, leave } = Profiler.createTimer('BindLifecycle');

interface IBindable extends IRenderable, ILifecycleHooks, IComponent {
  constructor: {
    description?: { name: string };
    name: string;
  };
}

/** @internal */
export function $bindAttribute(this: Writable<IBindable>, flags: LifecycleFlags, scope: IScope): void {
  if (Profiler.enabled) { enter(); }
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$bind', slice.call(arguments)); }
  flags |= LifecycleFlags.fromBind;

  if (this.$state & State.isBound) {
    if (this.$scope === scope) {
      if (Profiler.enabled) { leave(); }
      if (Tracer.enabled) { Tracer.leave(); }
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
  if (Profiler.enabled) { leave(); }
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $bindElement(this: Writable<IBindable>, flags: LifecycleFlags, parentScope: IScope | null): void {
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$bind', slice.call(arguments)); }
  if (Profiler.enabled) { enter(); }
  if (this.$state & State.isBound) {
    if (Profiler.enabled) { leave(); }
    if (Tracer.enabled) { Tracer.leave(); }
    return;
  }
  const scope: Writable<IScope> = this.$scope;
  scope.parentScope = parentScope;

  const lifecycle = this.$lifecycle;
  lifecycle.beginBind();
  // add isBinding flag
  this.$state |= State.isBinding;

  const hooks = this.$hooks;
  flags |= LifecycleFlags.fromBind;

  if (hooks & Hooks.hasBound) {
    lifecycle.enqueueBound(this);
  }

  let binding = this.$bindingHead;
  while (binding !== null) {
    binding.$bind(flags, scope);
    binding = binding.$nextBinding;
  }

  if (hooks & Hooks.hasBinding) {
    this.binding(flags);
  }

  let component = this.$componentHead;
  while (component !== null) {
    component.$bind(flags, scope);
    component = component.$nextComponent;
  }

  // add isBound flag and remove isBinding flag
  this.$state |= State.isBound;
  this.$state &= ~State.isBinding;

  lifecycle.endBind(flags);
  if (Profiler.enabled) { leave(); }
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $bindView(this: Writable<IBindable>, flags: LifecycleFlags, scope: IScope): void {
  if (Tracer.enabled) { Tracer.enter('IView', '$bind', slice.call(arguments)); }
  flags |= LifecycleFlags.fromBind;

  if (this.$state & State.isBound) {
    if (this.$scope === scope) {
      if (Tracer.enabled) { Tracer.leave(); }
      return;
    }

    this.$unbind(flags);
  }
  // add isBinding flag
  this.$state |= State.isBinding;

  this.$scope = scope;

  let binding = this.$bindingHead;
  while (binding !== null) {
    binding.$bind(flags, scope);
    binding = binding.$nextBinding;
  }

  let component = this.$componentHead;
  while (component !== null) {
    component.$bind(flags, scope);
    component = component.$nextComponent;
  }

  // add isBound flag and remove isBinding flag
  this.$state |= State.isBound;
  this.$state &= ~State.isBinding;
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $lockedBind(this: IBindable, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter('IView', 'lockedBind', slice.call(arguments)); }
  flags |= LifecycleFlags.fromBind;

  if (this.$state & State.isBound) {
    if (Tracer.enabled) { Tracer.leave(); }
    return;
  }
  // add isBinding flag
  this.$state |= State.isBinding;

  const scope = this.$scope;

  let binding = this.$bindingHead;
  while (binding !== null) {
    binding.$bind(flags, scope);
    binding = binding.$nextBinding;
  }

  let component = this.$componentHead;
  while (component !== null) {
    component.$bind(flags, scope);
    component = component.$nextComponent;
  }

  // add isBound flag and remove isBinding flag
  this.$state |= State.isBound;
  this.$state &= ~State.isBinding;
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $unbindAttribute(this: Writable<IBindable>, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$bind', slice.call(arguments)); }
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
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $unbindElement(this: Writable<IBindable>, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$bind', slice.call(arguments)); }
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

    let component = this.$componentTail;
    while (component !== null) {
      component.$unbind(flags);
      component = component.$prevComponent;
    }

    let binding = this.$bindingTail;
    while (binding !== null) {
      binding.$unbind(flags);
      binding = binding.$prevBinding;
    }

    (this.$scope as Writable<IScope>).parentScope = null;

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);

    lifecycle.endUnbind(flags);
  }
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $unbindView(this: Writable<IBindable>, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter('IView', '$unbind', slice.call(arguments)); }
  if (this.$state & State.isBound) {
    // add isUnbinding flag
    this.$state |= State.isUnbinding;

    flags |= LifecycleFlags.fromUnbind;

    let component = this.$componentTail;
    while (component !== null) {
      component.$unbind(flags);
      component = component.$prevComponent;
    }

    let binding = this.$bindingTail;
    while (binding !== null) {
      binding.$unbind(flags);
      binding = binding.$prevBinding;
    }

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);
    this.$scope = null;
  }
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $lockedUnbind(this: IBindable, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter('IView', 'lockedUnbind', slice.call(arguments)); }
  if (this.$state & State.isBound) {
    // add isUnbinding flag
    this.$state |= State.isUnbinding;

    flags |= LifecycleFlags.fromUnbind;

    let component = this.$componentTail;
    while (component !== null) {
      component.$unbind(flags);
      component = component.$prevComponent;
    }

    let binding = this.$bindingTail;
    while (binding !== null) {
      binding.$unbind(flags);
      binding = binding.$prevBinding;
    }

    // remove isBound and isUnbinding flags
    this.$state &= ~(State.isBound | State.isUnbinding);
  }
  if (Tracer.enabled) { Tracer.leave(); }
}

export function $patch(this: IBindable, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$patch', slice.call(arguments)); }
  if (Profiler.enabled) { enter(); }

  patchProperties(this, flags);

  let component = this.$componentHead;
  while (component) {
    component.$patch(flags);
    component = component.$nextComponent;
  }

  let binding = this.$bindingHead;
  while (binding) {
    if ((binding as unknown as IPatchable).$patch !== undefined) {
      (binding as unknown as IPatchable).$patch(flags);
    }
    binding = binding.$nextBinding;
  }

  if (Profiler.enabled) { leave(); }
  if (Tracer.enabled) { Tracer.leave(); }
}
