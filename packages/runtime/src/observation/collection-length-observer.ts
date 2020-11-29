import { isArrayIndex } from '@aurelia/kernel';
import { AccessorType, LifecycleFlags } from '../observation.js';
import { subscriberCollection } from './subscriber-collection.js';

import type { ISubscriberCollection } from '../observation.js';

export interface CollectionLengthObserver extends ISubscriberCollection {}

@subscriberCollection()
export class CollectionLengthObserver {
  public currentValue: number;
  public type: AccessorType = AccessorType.Array;

  public constructor(
    public obj: unknown[],
  ) {
    this.currentValue = obj.length;
  }
  public getValue(): number {
    return this.obj.length;
  }
  public setValue(newValue: number, flags: LifecycleFlags): void {
    const currentValue = this.currentValue;
    if (newValue !== currentValue && isArrayIndex(newValue)) {
      if ((flags & LifecycleFlags.noFlush) === 0) {
        this.obj.length  = newValue;
      }
      this.currentValue = newValue;
      this.callSubscribers(newValue, currentValue, flags | LifecycleFlags.updateTarget);
    }
  }
}
