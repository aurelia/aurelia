import { PLATFORM, Profiler, Tracer, Writable } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import {
  AggregateContinuationTask,
  ContinuationTask,
  hasBindingHook,
  hasUnbindingHook,
  IBinding,
  IComponent,
  ILifecycleHooks,
  ILifecycleTask,
  IRenderable,
  isBound,
  isNotBound,
  LifecycleTask,
  PromiseOrTask
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
export function $bindAttribute(this: Writable<IBindable>, flags: LifecycleFlags, scope: IScope): ILifecycleTask {
  flags |= LifecycleFlags.fromBind;
  if (isBound(this.$state)) {
    if (this.$scope === scope) { return; }
    const task = this.$unbind(flags);
    if (!task.done) {
      // Short-circuit here and call bind again after the task is done.
      // Since we are now unbound, the normal path will be executed in that invocation.
      return new ContinuationTask(task, $bindAttribute, this, flags, scope);
    }
  }

  if (Profiler.enabled) { enter(); }
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$bind', slice.call(arguments)); }

  this.$scope = scope;
  this.$lifecycle.beginBind(this);

  if (hasBindingHook(this)) {
    const ret = this.binding(flags);
    if (ret !== void 0) {
      this.$lifecycle.enqueueBound(this);
      return new ContinuationTask(ret as PromiseOrTask, this.$lifecycle.endBind, this.$lifecycle, flags, this);
    }
  }

  this.$lifecycle.enqueueBound(this);
  this.$lifecycle.endBind(flags, this);

  if (Profiler.enabled) { leave(); }
  if (Tracer.enabled) { Tracer.leave(); }

  return LifecycleTask.done;
}

/** @internal */
export function $unbindAttribute(this: Writable<IBindable>, flags: LifecycleFlags): ILifecycleTask {
  if (isNotBound(this.$state)) { return; }
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$bind', slice.call(arguments)); }

  flags |= LifecycleFlags.fromUnbind;
  this.$lifecycle.beginUnbind(this);
  if (hasUnbindingHook(this)) {
    const ret = this.unbinding(flags);
    if (ret !== void 0) {
      this.$lifecycle.enqueueUnbound(this);
      return new ContinuationTask(ret as PromiseOrTask, this.$lifecycle.endUnbind, this.$lifecycle, flags, this);
    }
  }

  this.$lifecycle.enqueueUnbound(this);
  this.$lifecycle.endUnbind(flags, this);

  if (Tracer.enabled) { Tracer.leave(); }

  return LifecycleTask.done;
}

/** @internal */
export function $bindElement(this: Writable<IBindable>, flags: LifecycleFlags, parentScope: IScope | null): ILifecycleTask {
  if (isBound(this.$state)) { return; }
  if (Profiler.enabled) { enter(); }
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$bind', slice.call(arguments)); }

  flags |= LifecycleFlags.fromBind;
  const scope = this.$scope as Writable<IScope>;
  scope.parentScope = parentScope;
  this.$lifecycle.beginBind(this);
  bindBindings(this.$bindingHead, flags, scope);
  if (hasBindingHook(this)) {
    const ret = this.binding(flags);
    if (ret !== void 0) {
      return new ContinuationTask(ret as PromiseOrTask, bindElementContinuation, undefined, this, flags, scope);
    }
  }

  return bindElementContinuation(this, flags, scope);
}

function bindElementContinuation(target: Writable<IBindable>, flags: LifecycleFlags, scope: IScope | null): ILifecycleTask {
  const tasks = bindComponents(target.$componentHead, flags, scope);
  target.$lifecycle.enqueueBound(target);
  let task = LifecycleTask.done;

  if (tasks === PLATFORM.emptyArray) {
    target.$lifecycle.endBind(flags, target);
  } else {
    task = new AggregateContinuationTask(tasks, target.$lifecycle.endBind, target.$lifecycle, flags, target);
  }

  if (Profiler.enabled) { leave(); }
  if (Tracer.enabled) { Tracer.leave(); }

  return task;
}

/** @internal */
export function $unbindElement(this: Writable<IBindable>, flags: LifecycleFlags): ILifecycleTask {
  if (isNotBound(this.$state)) { return; }
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$bind', slice.call(arguments)); }

  flags |= LifecycleFlags.fromUnbind;
  this.$lifecycle.beginUnbind(this);
  if (hasUnbindingHook(this)) {
    const ret = this.unbinding(flags);
    if (ret !== void 0) {
      return new ContinuationTask(ret as PromiseOrTask, unbindElementContinuation, undefined, this, flags);
    }
  }

  return unbindElementContinuation(this, flags);
}

function unbindElementContinuation(target: Writable<IBindable>, flags: LifecycleFlags): ILifecycleTask {
  const tasks = unbindComponents(target.$componentTail, flags);
  target.$lifecycle.enqueueUnbound(target);
  if (tasks === PLATFORM.emptyArray) {
    return unbindElementContinuation$2(target, flags);
  }

  return new AggregateContinuationTask(tasks, unbindElementContinuation$2, undefined, target, flags);
}

function unbindElementContinuation$2(target: Writable<IBindable>, flags: LifecycleFlags): ILifecycleTask {
  unbindBindings(target.$bindingTail, flags);
  target.$lifecycle.endUnbind(flags, target);

  if (Tracer.enabled) { Tracer.leave(); }

  return LifecycleTask.done;
}

/** @internal */
export function $bindView(this: Writable<IBindable>, flags: LifecycleFlags, scope: IScope): ILifecycleTask {
  flags |= LifecycleFlags.fromBind;
  if (isBound(this.$state)) {
    if (this.$scope === scope) { return; }
    const unbindTask = this.$unbind(flags);
    if (!unbindTask.done) {
      // Same as $bindAttribute
      return new ContinuationTask(unbindTask, $bindView, this, flags, scope);
    }
  }

  if (Tracer.enabled) { Tracer.enter('IView', '$bind', slice.call(arguments)); }

  this.$scope = scope;
  this.$lifecycle.beginBind(this);
  bindBindings(this.$bindingHead, flags, scope);
  const tasks = bindComponents(this.$componentHead, flags, scope);
  let task = LifecycleTask.done;

  if (tasks === PLATFORM.emptyArray) {
    this.$lifecycle.endBind(flags, this);
  } else {
    task = new AggregateContinuationTask(tasks, this.$lifecycle.endBind, this.$lifecycle, flags, this);
  }

  if (Tracer.enabled) { Tracer.leave(); }

  return task;
}

/** @internal */
export function $lockedBind(this: IBindable, flags: LifecycleFlags): ILifecycleTask {
  if (isBound(this.$state)) { return; }
  if (Tracer.enabled) { Tracer.enter('IView', 'lockedBind', slice.call(arguments)); }

  flags |= LifecycleFlags.fromBind;
  const scope = this.$scope;
  this.$lifecycle.beginBind(this);
  bindBindings(this.$bindingHead, flags, scope);
  const tasks = bindComponents(this.$componentHead, flags, scope);
  let task = LifecycleTask.done;

  if (tasks === PLATFORM.emptyArray) {
    this.$lifecycle.endBind(flags, this);
  } else {
    task = new AggregateContinuationTask(tasks, this.$lifecycle.endBind, this.$lifecycle, flags, this);
  }

  if (Tracer.enabled) { Tracer.leave(); }

  return task;
}

/** @internal */
export function $unbindView(this: Writable<IBindable>, flags: LifecycleFlags): ILifecycleTask {
  if (isNotBound(this.$state)) { return; }
  if (Tracer.enabled) { Tracer.enter('IView', '$unbind', slice.call(arguments)); }

  flags |= LifecycleFlags.fromUnbind;
  this.$lifecycle.beginUnbind(this);
  const tasks = unbindComponents(this.$componentTail, flags);
  let task = LifecycleTask.done;

  if (tasks === PLATFORM.emptyArray) {
    unbindBindings(this.$bindingTail, flags);
    this.$scope = null;
    this.$lifecycle.endUnbind(flags, this);
  } else {
    task = new AggregateContinuationTask(tasks, unbindViewContinuation, undefined, this, flags);
  }

  if (Tracer.enabled) { Tracer.leave(); }

  return task;
}

function unbindViewContinuation(target: Writable<IBindable>, flags: LifecycleFlags): void {
  unbindBindings(target.$bindingTail, flags);
  target.$scope = null;
  target.$lifecycle.endUnbind(flags, target);

  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $lockedUnbind(this: IBindable, flags: LifecycleFlags): ILifecycleTask {
  if (isNotBound(this.$state)) { return; }
  if (Tracer.enabled) { Tracer.enter('IView', 'lockedUnbind', slice.call(arguments)); }

  flags |= LifecycleFlags.fromUnbind;
  this.$lifecycle.beginUnbind(this);
  const tasks = unbindComponents(this.$componentTail, flags);
  let task = LifecycleTask.done;

  if (tasks === PLATFORM.emptyArray) {
    unbindBindings(this.$bindingTail, flags);
    this.$lifecycle.endUnbind(flags, this);
  } else {
    task = new AggregateContinuationTask(tasks, lockedUnbindContinuation, undefined, this, flags);
  }

  if (Tracer.enabled) { Tracer.leave(); }

  return task;
}

function lockedUnbindContinuation(target: Writable<IBindable>, flags: LifecycleFlags): void {
  unbindBindings(target.$bindingTail, flags);
  target.$lifecycle.endUnbind(flags, target);

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

function bindComponents(component: IComponent, flags: LifecycleFlags, scope: IScope): ILifecycleTask[] {
  let tasks: ILifecycleTask[];
  let task: ILifecycleTask;
  while (component !== null) {
    task = component.$bind(flags, scope);
    if (!task.done) {
      if (tasks === undefined) {
        tasks = [];
      }
      tasks.push(task);
    }
    component = component.$nextComponent;
  }
  if (tasks === undefined) {
    return PLATFORM.emptyArray as ILifecycleTask[];
  }
  return tasks;
}

function unbindBindings(binding: IBinding, flags: LifecycleFlags): void {
  while (binding !== null) {
    binding.$unbind(flags);
    binding = binding.$prevBinding;
  }
}

function unbindComponents(component: IComponent, flags: LifecycleFlags): ILifecycleTask[] {
  let tasks: ILifecycleTask[];
  let task: ILifecycleTask;
  while (component !== null) {
    task = component.$unbind(flags);
    if (!task.done) {
      if (tasks === undefined) {
        tasks = [];
      }
      tasks.push(task);
    }
    component = component.$prevComponent;
  }
  if (tasks === undefined) {
    return PLATFORM.emptyArray as ILifecycleTask[];
  }
  return tasks;
}
