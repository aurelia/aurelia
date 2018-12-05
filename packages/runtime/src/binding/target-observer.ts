import { IIndexable, Primitive } from '../../kernel';
import { DOM } from '../dom';
import { ILifecycle } from '../lifecycle';
import { IBindingTargetAccessor, LifecycleFlags, MutationKind } from '../observation';
import { subscriberCollection } from './subscriber-collection';

type BindingTargetAccessor = IBindingTargetAccessor & {
  lifecycle: ILifecycle;
  currentFlags: LifecycleFlags;
  oldValue?: IIndexable | Primitive;
  defaultValue: Primitive | IIndexable;
  $nextFlush?: BindingTargetAccessor;
  flush(flags: LifecycleFlags): void;
  setValueCore(value: Primitive | IIndexable, flags: LifecycleFlags): void;
};

function setValue(this: BindingTargetAccessor, newValue: Primitive | IIndexable, flags: LifecycleFlags): Promise<void> {
  const currentValue = this.currentValue;
  newValue = newValue === null || newValue === undefined ? this.defaultValue : newValue;
  if (currentValue !== newValue) {
    this.currentValue = newValue;
    if ((flags & (LifecycleFlags.fromFlush | LifecycleFlags.fromBind)) &&
      !((flags & LifecycleFlags.doNotUpdateDOM) && DOM.isNodeInstance(this.obj))) {
      this.setValueCore(newValue, flags);
    } else {
      this.currentFlags = flags;
      return this.lifecycle.enqueueFlush(this);
    }
  }
  return Promise.resolve();
}

function flush(this: BindingTargetAccessor, flags: LifecycleFlags): void {
  if (flags & LifecycleFlags.doNotUpdateDOM) {
    if (DOM.isNodeInstance(this.obj)) {
      // re-queue the change so it will still propagate on flush when it's attached again
      this.lifecycle.enqueueFlush(this);
      return;
    }
  }
  const currentValue = this.currentValue;
  // we're doing this check because a value could be set multiple times before a flush, and the final value could be the same as the original value
  // in which case the target doesn't need to be updated
  if (this.oldValue !== currentValue) {
    this.setValueCore(currentValue, this.currentFlags | flags | LifecycleFlags.updateTargetInstance);
    this.oldValue = this.currentValue;
  }
}

function dispose(this: BindingTargetAccessor): void {
  this.currentValue = null;
  this.oldValue = null;
  this.defaultValue = null;

  this.obj = null;
  this.propertyKey = '';
}

export function targetObserver(defaultValue: Primitive | IIndexable = null): ClassDecorator {
  return function(target: Function): void {
    subscriberCollection(MutationKind.instance)(target);
    const proto = <BindingTargetAccessor>target.prototype;

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
