import { Profiler, Tracer, Writable } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import {
  hasBindingHook,
  hasBoundHook,
  hasUnbindingHook,
  hasUnboundHook,
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

  let binding = this.$bindingHead;
  while (binding !== null) {
    binding.$bind(flags, scope);
    binding = binding.$nextBinding;
  }

  if (hasBindingHook(this)) {
    this.binding(flags);
  }

  let component = this.$componentHead;
  while (component !== null) {
    component.$bind(flags, scope);
    component = component.$nextComponent;
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

  let component = this.$componentTail;
  while (component !== null) {
    component.$unbind(flags);
    component = component.$prevComponent;
  }

  if (hasUnboundHook(this)) {
    this.$lifecycle.enqueueUnbound(this);
  }

  let binding = this.$bindingTail;
  while (binding !== null) {
    binding.$unbind(flags);
    binding = binding.$prevBinding;
  }

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
