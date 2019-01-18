import { Tracer } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { ILifecycle } from '../lifecycle';
import { IBindingTargetAccessor, MutationKind } from '../observation';
import { subscriberCollection } from './subscriber-collection';

const slice = Array.prototype.slice;

type BindingTargetAccessor = IBindingTargetAccessor & {
  lifecycle: ILifecycle;
  currentFlags: LifecycleFlags;
  oldValue?: unknown;
  defaultValue: unknown;
  $nextFlush?: BindingTargetAccessor;
  flush(flags: LifecycleFlags): void;
  setValueCore(value: unknown, flags: LifecycleFlags): void;
};

function setValue(this: BindingTargetAccessor, newValue: unknown, flags: LifecycleFlags): Promise<void> {
  if (Tracer.enabled) { Tracer.enter(`${this['constructor'].name}.setValue`, slice.call(arguments)); }
  const currentValue = this.currentValue;
  newValue = newValue === null || newValue === undefined ? this.defaultValue : newValue;
  if (currentValue !== newValue) {
    this.currentValue = newValue;
    if ((flags & (LifecycleFlags.fromFlush | LifecycleFlags.fromBind)) &&
      !(this.isDOMObserver && (flags & LifecycleFlags.doNotUpdateDOM))) {
      this.setValueCore(newValue, flags);
    } else {
      this.currentFlags = flags;
      if (Tracer.enabled) { Tracer.leave(); }
      return this.lifecycle.enqueueFlush(this);
    }
  }
  if (Tracer.enabled) { Tracer.leave(); }
  return Promise.resolve();
}

function flush(this: BindingTargetAccessor, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter(`${this['constructor'].name}.flush`, slice.call(arguments)); }
  if (this.isDOMObserver && (flags & LifecycleFlags.doNotUpdateDOM)) {
    // re-queue the change so it will still propagate on flush when it's attached again
    this.lifecycle.enqueueFlush(this).catch(error => { throw error; });
    if (Tracer.enabled) { Tracer.leave(); }
    return;
  }
  const currentValue = this.currentValue;
  // we're doing this check because a value could be set multiple times before a flush, and the final value could be the same as the original value
  // in which case the target doesn't need to be updated
  if (this.oldValue !== currentValue) {
    this.setValueCore(currentValue, this.currentFlags | flags | LifecycleFlags.updateTargetInstance);
    this.oldValue = this.currentValue;
  }
  if (Tracer.enabled) { Tracer.leave(); }
}

function dispose(this: BindingTargetAccessor): void {
  this.currentValue = null;
  this.oldValue = null;
  this.defaultValue = null;

  this.obj = null;
  this.propertyKey = '';
}

export function targetObserver(defaultValue: unknown = null): ClassDecorator {
  // tslint:disable-next-line:ban-types // ClassDecorator expects it to be derived from Function
  return function(target: Function): void {
    subscriberCollection(MutationKind.instance)(target);
    const proto = target.prototype as BindingTargetAccessor;

    proto.$nextFlush = null;

    proto.currentValue = defaultValue;
    proto.oldValue = defaultValue;
    proto.defaultValue = defaultValue;

    proto.obj = null;
    proto.propertyKey = '';

    proto.setValue = proto.setValue || setValue;
    proto.flush = proto.flush || flush;
    proto.dispose = proto.dispose || dispose;
  };
}
