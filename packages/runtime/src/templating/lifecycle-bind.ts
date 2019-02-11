import { Profiler, Tracer, Writable } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import {
  hasBindingHook,
  hasBoundHook,
  hasUnbindingHook,
  hasUnboundHook,
  IBinding,
  IComponent,
  ILifecycleHooks,
  IRenderable,
  isBound,
  isNotBound,
  setBindingState,
  setBoundState,
  setNotBoundState,
  setUnbindingState
} from '../lifecycle';
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
  flags |= LifecycleFlags.fromBind;
  if (isBound(this)) {
    if (this.$scope === scope) { return; }
    this.$unbind(flags);
  }

  if (Profiler.enabled) { enter(); }
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$bind', slice.call(arguments)); }

  this.$scope = scope;
  this.$lifecycle.beginBind();
  setBindingState(this);
  if (hasBindingHook(this)) {
    this.binding(flags);
  }

  if (hasBoundHook(this)) {
    this.$lifecycle.enqueueBound(this);
  }

  setBoundState(this);
  this.$lifecycle.endBind(flags);

  if (Profiler.enabled) { leave(); }
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $bindElement(this: Writable<IBindable>, flags: LifecycleFlags, parentScope: IScope | null): void {
  if (isBound(this)) { return; }
  if (Profiler.enabled) { enter(); }
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$bind', slice.call(arguments)); }

  flags |= LifecycleFlags.fromBind;
  const scope = this.$scope as Writable<IScope>;
  scope.parentScope = parentScope;
  this.$lifecycle.beginBind();
  setBindingState(this);
  bindBindings(this.$bindingHead, flags, scope);
  if (hasBindingHook(this)) {
    this.binding(flags);
  }

  bindComponents(this.$componentHead, flags, scope);
  if (hasBoundHook(this)) {
    this.$lifecycle.enqueueBound(this);
  }

  setBoundState(this);
  this.$lifecycle.endBind(flags);

  if (Profiler.enabled) { leave(); }
  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $bindView(this: Writable<IBindable>, flags: LifecycleFlags, scope: IScope): void {
  flags |= LifecycleFlags.fromBind;
  if (isBound(this)) {
    if (this.$scope === scope) { return; }
    this.$unbind(flags);
  }

  if (Tracer.enabled) { Tracer.enter('IView', '$bind', slice.call(arguments)); }

  this.$scope = scope;
  this.$lifecycle.beginBind();
  setBindingState(this);
  bindBindings(this.$bindingHead, flags, scope);
  bindComponents(this.$componentHead, flags, scope);
  setBoundState(this);
  this.$lifecycle.endBind(flags);

  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $lockedBind(this: IBindable, flags: LifecycleFlags): void {
  if (isBound(this)) { return; }
  if (Tracer.enabled) { Tracer.enter('IView', 'lockedBind', slice.call(arguments)); }

  flags |= LifecycleFlags.fromBind;
  const scope = this.$scope;
  this.$lifecycle.beginBind();
  setBindingState(this);
  bindBindings(this.$bindingHead, flags, scope);
  bindComponents(this.$componentHead, flags, scope);
  setBoundState(this);
  this.$lifecycle.endBind(flags);

  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $unbindAttribute(this: Writable<IBindable>, flags: LifecycleFlags): void {
  if (isNotBound(this)) { return; }
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$bind', slice.call(arguments)); }

  flags |= LifecycleFlags.fromUnbind;
  this.$lifecycle.beginUnbind();
  setUnbindingState(this);
  if (hasUnbindingHook(this)) {
    this.unbinding(flags);
  }

  if (hasUnboundHook(this)) {
    this.$lifecycle.enqueueUnbound(this);
  }

  setNotBoundState(this);
  this.$lifecycle.endUnbind(flags);

  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $unbindElement(this: Writable<IBindable>, flags: LifecycleFlags): void {
  if (isNotBound(this)) { return; }
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$bind', slice.call(arguments)); }

  flags |= LifecycleFlags.fromUnbind;
  this.$lifecycle.beginUnbind();
  setUnbindingState(this);
  if (hasUnbindingHook(this)) {
    this.unbinding(flags);
  }

  unbindComponents(this.$componentTail, flags);
  if (hasUnboundHook(this)) {
    this.$lifecycle.enqueueUnbound(this);
  }

  unbindBindings(this.$bindingTail, flags);
  // tslint:disable-next-line:no-unnecessary-type-assertion // this is a false positive
  (this.$scope as Writable<IScope>).parentScope = null;
  setNotBoundState(this);
  this.$lifecycle.endUnbind(flags);

  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $unbindView(this: Writable<IBindable>, flags: LifecycleFlags): void {
  if (isNotBound(this)) { return; }
  if (Tracer.enabled) { Tracer.enter('IView', '$unbind', slice.call(arguments)); }

  flags |= LifecycleFlags.fromUnbind;
  this.$lifecycle.beginUnbind();
  setUnbindingState(this);
  unbindComponents(this.$componentTail, flags);
  unbindBindings(this.$bindingTail, flags);
  setNotBoundState(this);
  this.$scope = null;
  this.$lifecycle.endUnbind(flags);

  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $lockedUnbind(this: IBindable, flags: LifecycleFlags): void {
  if (isNotBound(this)) { return; }
  if (Tracer.enabled) { Tracer.enter('IView', 'lockedUnbind', slice.call(arguments)); }

  flags |= LifecycleFlags.fromUnbind;
  this.$lifecycle.beginUnbind();
  setUnbindingState(this);
  unbindComponents(this.$componentTail, flags);
  unbindBindings(this.$bindingTail, flags);
  setNotBoundState(this);
  this.$lifecycle.endUnbind(flags);

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

function bindBindings(binding: IBinding, flags: LifecycleFlags, scope: IScope): void {
  while (binding !== null) {
    binding.$bind(flags, scope);
    binding = binding.$nextBinding;
  }
}

function bindComponents(component: IComponent, flags: LifecycleFlags, scope: IScope): void {
  while (component !== null) {
    component.$bind(flags, scope);
    component = component.$nextComponent;
  }
}

function unbindBindings(binding: IBinding, flags: LifecycleFlags): void {
  while (binding !== null) {
    binding.$unbind(flags);
    binding = binding.$prevBinding;
  }
}

function unbindComponents(component: IComponent, flags: LifecycleFlags): void {
  while (component !== null) {
    component.$unbind(flags);
    component = component.$prevComponent;
  }
}
