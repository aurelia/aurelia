import { PLATFORM, Profiler, Tracer, Writable } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import {
  AggregateContinuationTask,
  allowUnmount,
  ContinuationTask,
  hasAttachingHook,
  hasCachingHook,
  hasDetachingHook,
  IComponent,
  ILifecycleHooks,
  ILifecycleTask,
  IMountableComponent,
  IRenderable,
  isAttached,
  isMounted,
  isNotAttached,
  isNotMounted,
  IView,
  LifecycleTask,
  PromiseOrTask,
  setCached,
  setMounted,
  setNotMounted
} from '../lifecycle';
import { ICustomElement } from '../resources/custom-element';

interface IAttachable extends IRenderable, ILifecycleHooks, IComponent {
  constructor: {
    description?: { name: string };
    name: string;
  };
}

const slice = Array.prototype.slice;

const { enter, leave } = Profiler.createTimer('AttachLifecycle');

/** @internal */
// tslint:disable-next-line:no-ignored-initial-value
export function $attachAttribute(this: Writable<IAttachable>, flags: LifecycleFlags): ILifecycleTask {
  if (isAttached(this.$state)) { return LifecycleTask.done; }

  if (Profiler.enabled) { enter(); }
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$attach', slice.call(arguments)); }

  flags |= LifecycleFlags.fromAttach;
  this.$lifecycle.beginAttach(this);
  if (hasAttachingHook(this)) {
    const ret = this.attaching(flags);
    if (ret !== void 0) {
      this.$lifecycle.enqueueAttached(this as Required<typeof this>);
      return new ContinuationTask(ret as PromiseOrTask, this.$lifecycle.endAttach, this.$lifecycle, flags, this);
    }
  }

  this.$lifecycle.enqueueAttached(this as Required<typeof this>);
  this.$lifecycle.endAttach(flags, this);

  if (Profiler.enabled) { leave(); }
  if (Tracer.enabled) { Tracer.leave(); }

  return LifecycleTask.done;
}

/** @internal */
// tslint:disable-next-line:no-ignored-initial-value
export function $detachAttribute(this: Writable<IAttachable>, flags: LifecycleFlags): ILifecycleTask {
  if (isNotAttached(this.$state)) { return LifecycleTask.done; }

  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$detach', slice.call(arguments)); }

  flags |= LifecycleFlags.fromDetach;
  this.$lifecycle.beginDetach(this);
  if (hasDetachingHook(this)) {
    const ret = this.detaching(flags);
    if (ret !== void 0) {
      this.$lifecycle.enqueueDetached(this as Required<typeof this>);
      return new ContinuationTask(ret as PromiseOrTask, this.$lifecycle.endDetach, this.$lifecycle, flags, this);
    }
  }

  this.$lifecycle.enqueueDetached(this as Required<typeof this>);
  this.$lifecycle.endDetach(flags, this);

  if (Tracer.enabled) { Tracer.leave(); }

  return LifecycleTask.done;
}

/** @internal */
// tslint:disable-next-line:no-ignored-initial-value
export function $attachElement(this: Writable<IAttachable & IMountableComponent>, flags: LifecycleFlags): ILifecycleTask {
  if (isAttached(this.$state)) { return LifecycleTask.done; }

  if (Profiler.enabled) { enter(); }
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$attach', slice.call(arguments)); }

  flags |= LifecycleFlags.fromAttach;
  this.$lifecycle.beginAttach(this);
  if (hasAttachingHook(this)) {
    const ret = this.attaching(flags);
    if (ret !== void 0) {
      return new ContinuationTask(ret as PromiseOrTask, attachElementContinuation, undefined, this, flags);
    }
  }

  return attachElementContinuation(this, flags);
}

function attachElementContinuation(target: Writable<IAttachable & IMountableComponent>, flags: LifecycleFlags): ILifecycleTask {
  const tasks = attachComponents(target.$componentHead, flags);
  target.$lifecycle.enqueueMount(target);
  target.$lifecycle.enqueueAttached(target as Required<typeof target>);
  let task = LifecycleTask.done;

  if (tasks === PLATFORM.emptyArray) {
    target.$lifecycle.endAttach(flags, target);
  } else {
    task = new AggregateContinuationTask(tasks, target.$lifecycle.endAttach, target.$lifecycle, flags, target);
  }

  if (Profiler.enabled) { leave(); }
  if (Tracer.enabled) { Tracer.leave(); }

  return task;
}

/** @internal */
// tslint:disable-next-line:no-ignored-initial-value
export function $detachElement(this: Writable<IAttachable & IMountableComponent>, flags: LifecycleFlags): ILifecycleTask {
  if (isNotAttached(this.$state)) { return LifecycleTask.done; }

  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$detach', slice.call(arguments)); }

  flags |= LifecycleFlags.fromDetach;
  this.$lifecycle.beginDetach(this);
  if (allowUnmount(flags)) {
    this.$lifecycle.enqueueUnmount(this);
    flags |= LifecycleFlags.parentUnmountQueued;
  }

  if (hasDetachingHook(this)) {
    const ret = this.detaching(flags);
    if (ret !== void 0) {
      return new ContinuationTask(ret as PromiseOrTask, detachElementContinuation, undefined, this, flags);
    }
  }

  return detachElementContinuation(this, flags);
}

function detachElementContinuation(target: Writable<IAttachable & IMountableComponent>, flags: LifecycleFlags): ILifecycleTask {
  const tasks = detachComponents(target.$componentTail, flags);
  target.$lifecycle.enqueueDetached(target as Required<typeof target>);
  if (tasks === PLATFORM.emptyArray) {
    target.$lifecycle.endDetach(flags, target);

    if (Tracer.enabled) { Tracer.leave(); }
    return LifecycleTask.done;
  }

  return new AggregateContinuationTask(tasks, target.$lifecycle.endDetach, target.$lifecycle, flags, target);
}

/** @internal */
export function $attachView(this: Writable<IAttachable & IMountableComponent>, flags: LifecycleFlags): ILifecycleTask {
  if (isAttached(this.$state)) { return LifecycleTask.done; }
  if (Tracer.enabled) { Tracer.enter('IView', '$attach', slice.call(arguments)); }

  flags |= LifecycleFlags.fromAttach;
  this.$lifecycle.beginAttach(this);
  const tasks = attachComponents(this.$componentHead, flags);
  this.$lifecycle.enqueueMount(this);
  let task = LifecycleTask.done;

  if (tasks === PLATFORM.emptyArray) {
    this.$lifecycle.endAttach(flags, this);
  } else {
    task = new AggregateContinuationTask(tasks, this.$lifecycle.endAttach, this.$lifecycle, flags, this);
  }

  if (Tracer.enabled) { Tracer.leave(); }

  return task;
}

/** @internal */
export function $detachView(this: Writable<IAttachable & IMountableComponent>, flags: LifecycleFlags): ILifecycleTask {
  if (isNotAttached(this.$state)) { return LifecycleTask.done; }
  if (Tracer.enabled) { Tracer.enter('IView', '$detach', slice.call(arguments)); }

  flags |= LifecycleFlags.fromDetach;
  this.$lifecycle.beginDetach(this);
  if (allowUnmount(flags)) {
    this.$lifecycle.enqueueUnmount(this);
    flags |= LifecycleFlags.parentUnmountQueued;
  }

  const tasks = detachComponents(this.$componentTail, flags);
  let task = LifecycleTask.done;
  if (tasks === PLATFORM.emptyArray) {
    this.$lifecycle.endDetach(flags, this);
  } else {
    task = new AggregateContinuationTask(tasks, this.$lifecycle.endDetach, this.$lifecycle, flags, this);
  }

  if (Tracer.enabled) { Tracer.leave(); }

  return task;
}

/** @internal */
export function $cacheAttribute(this: Writable<IAttachable>, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$cache', slice.call(arguments)); }

  flags |= LifecycleFlags.fromCache;
  if (hasCachingHook(this)) {
    this.caching(flags);
  }

  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $cacheElement(this: Writable<IAttachable>, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$cache', slice.call(arguments)); }

  flags |= LifecycleFlags.fromCache;
  if (hasCachingHook(this)) {
    this.caching(flags);
  }

  let current = this.$componentTail;
  while (current !== null) {
    current.$cache(flags);
    current = current.$prevComponent;
  }

  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $cacheView(this: Writable<IAttachable>, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter('IView', '$cache', slice.call(arguments)); }

  flags |= LifecycleFlags.fromCache;
  let current = this.$componentTail;
  while (current !== null) {
    current.$cache(flags);
    current = current.$prevComponent;
  }
}

/** @internal */
export function $mountElement(this: Writable<ICustomElement & IAttachable>): void {
  if (isMounted(this.$state)) { return; }
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$mount', slice.call(arguments)); }

  this.$state = setMounted(this.$state);
  this.$projector.project(this.$nodes);

  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $unmountElement(this: Writable<ICustomElement & IAttachable>): void {
  if (isNotMounted(this.$state)) { return; }
  if (Tracer.enabled) { Tracer.enter(this.constructor.description && this.constructor.description.name || this.constructor.name, '$unmount', slice.call(arguments)); }

  this.$state = setNotMounted(this.$state);
  this.$projector.take(this.$nodes);

  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $mountView(this: Writable<IView>): void {
  if (isMounted(this.$state)) { return; }
  if (Tracer.enabled) { Tracer.enter('IView', '$mount', slice.call(arguments)); }

  this.$state = setMounted(this.$state);
  this.$nodes.insertBefore(this.location);

  if (Tracer.enabled) { Tracer.leave(); }
}

/** @internal */
export function $unmountView(this: Writable<IView>): boolean {
  if (isNotMounted(this.$state)) { return false; }
  if (Tracer.enabled) { Tracer.enter('IView', '$unmount', slice.call(arguments)); }

  this.$state = setNotMounted(this.$state);
  this.$nodes.remove();

  if (this.isFree) {
    this.isFree = false;
    if (this.cache.tryReturnToCache(this)) {
      this.$state = setCached(this.$state);
      if (Tracer.enabled) { Tracer.leave(); }
      return true;
    }
  }

  if (Tracer.enabled) { Tracer.leave(); }
  return false;
}

function attachComponents(component: IComponent, flags: LifecycleFlags): ILifecycleTask[] {
  let tasks: ILifecycleTask[];
  let task: ILifecycleTask;
  while (component !== null) {
    task = component.$attach(flags);
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

function detachComponents(component: IComponent, flags: LifecycleFlags): ILifecycleTask[] {
  let tasks: ILifecycleTask[];
  let task: ILifecycleTask;
  while (component !== null) {
    task = component.$detach(flags);
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
