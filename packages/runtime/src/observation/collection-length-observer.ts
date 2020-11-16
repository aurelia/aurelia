import { ISubscriberCollection, AccessorType, LifecycleFlags } from '../observation.js';
import { subscriberCollection } from './subscriber-collection.js';

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
    if (newValue !== currentValue) {
      this.currentValue = newValue;
      this.callSubscribers(newValue, currentValue, flags | LifecycleFlags.updateTarget);
    }
  }
}
