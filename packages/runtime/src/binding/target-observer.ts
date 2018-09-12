import { IIndexable, Primitive } from '@aurelia/kernel';
import { BindingFlags } from './binding-flags';
import { IChangeSet } from './change-set';
import { IBindingTargetAccessor, MutationKind } from './observation';
import { subscriberCollection } from './subscriber-collection';

type BindingTargetAccessor = IBindingTargetAccessor & {
  changeSet: IChangeSet;
  currentFlags: BindingFlags;
  oldValue?: IIndexable | Primitive;
  defaultValue: Primitive | IIndexable;
  flushChanges(): void;
  setValueCore(value: Primitive | IIndexable, flags: BindingFlags): void;
};

function setValue(this: BindingTargetAccessor, newValue: Primitive | IIndexable, flags: BindingFlags): Promise<void> {
  const currentValue = this.currentValue;
  newValue = newValue === null || newValue === undefined ? this.defaultValue : newValue;
  if (currentValue !== newValue) {
    this.currentValue = newValue;
    if (flags & BindingFlags.fromFlushChanges) {
      this.setValueCore(newValue, flags);
    } else {
      this.currentFlags = flags;
      return this.changeSet.add(this);
    }
  }
  return Promise.resolve();
}

const defaultFlushChangesFlags = BindingFlags.fromFlushChanges | BindingFlags.updateTargetInstance;

function flushChanges(this: BindingTargetAccessor): void {
  const currentValue = this.currentValue;
  // we're doing this check because a value could be set multiple times before a flush, and the final value could be the same as the original value
  // in which case the target doesn't need to be updated
  if (this.oldValue !== currentValue) {
    this.setValueCore(currentValue, this.currentFlags | defaultFlushChangesFlags);
    this.oldValue = this.currentValue;
  }
}

function dispose(this: BindingTargetAccessor): void {
  this.currentValue = null;
  this.oldValue = null;
  this.defaultValue = null;

  this.obj = null;
  this.propertyKey = '';

  this.changeSet = null;
}

export function targetObserver(defaultValue: Primitive | IIndexable = null): ClassDecorator {
  return function(target: Function): void {
    subscriberCollection(MutationKind.instance)(target);
    const proto = <BindingTargetAccessor>target.prototype;

    proto.currentValue = defaultValue;
    proto.oldValue = defaultValue;
    proto.defaultValue = defaultValue;

    proto.obj = null;
    proto.propertyKey = '';

    proto.setValue = proto.setValue || setValue;
    proto.flushChanges = proto.flushChanges || flushChanges;
    proto.dispose = proto.dispose || dispose;
    proto.changeSet = null;
  };
}
