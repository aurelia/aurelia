import { Tracer } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { ILifecycle } from '../lifecycle';
import { IBatchChangeTracker, IBindingTargetAccessor, IRAFChangeTracker } from '../observation';
import { subscriberCollection } from './subscriber-collection';

const slice = Array.prototype.slice;

type BindingTargetAccessor = IBindingTargetAccessor & IBatchChangeTracker & IRAFChangeTracker & {
  lifecycle: ILifecycle;
  currentFlags: LifecycleFlags;
  oldValue?: unknown;
  defaultValue: unknown;
  setValueCore(value: unknown, flags: LifecycleFlags): void;
};

function setValue(this: BindingTargetAccessor, newValue: unknown, flags: LifecycleFlags): void {
  const currentValue = this.currentValue;
  newValue = newValue === null || newValue === undefined ? this.defaultValue : newValue;
  if (currentValue !== newValue) {
    if (Tracer.enabled) { Tracer.enter(this['constructor'].name, 'setValue', slice.call(arguments)); }
    this.oldValue = this.currentValue;
    this.currentValue = newValue;
    if (this.isDOMObserver) {
      this.lifecycle.enqueueRAF(this);
    } else if ((flags & (LifecycleFlags.fromFlush | LifecycleFlags.fromBind)) > 0) {
      this.setValueCore(newValue, flags);
    } else {
      this.currentFlags = flags;
      this.lifecycle.enqueueBatch(this);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

function flushBatch(this: BindingTargetAccessor, flags: LifecycleFlags): void {
  if (Tracer.enabled) { Tracer.enter(this['constructor'].name, 'flushBatch', slice.call(arguments)); }
  const currentValue = this.currentValue;
  // we're doing this check because a value could be set multiple times before a flushBatch, and the final value could be the same as the original value
  // in which case the target doesn't need to be updated
  if (this.oldValue !== currentValue) {
    this.setValueCore(currentValue, this.currentFlags | flags | LifecycleFlags.updateTargetInstance);
    this.oldValue = this.currentValue;
  }
  if (Tracer.enabled) { Tracer.leave(); }
}

export function targetObserver(defaultValue: unknown = null): ClassDecorator {
  // tslint:disable-next-line:ban-types // ClassDecorator expects it to be derived from Function
  return function(target: Function): void {
    subscriberCollection()(target);
    const proto = target.prototype as BindingTargetAccessor;

    if (proto.setValue === void 0) {
      proto.setValue = setValue;
    }
    if (proto.flushBatch === void 0) {
      proto.flushBatch = flushBatch;
    }
    if (proto.flushRAF === void 0) {
      proto.flushRAF = flushBatch;
    }
  };
}
