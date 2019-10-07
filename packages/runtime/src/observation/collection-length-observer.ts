import { LifecycleFlags } from '../flags';
import { ISubscriberCollection } from '../observation';
import { subscriberCollection } from './subscriber-collection';

export interface CollectionLengthObserver extends ISubscriberCollection {}

@subscriberCollection()
export class CollectionLengthObserver {
  public currentValue: number;
  public obj: unknown[];
  public constructor(obj: unknown[]) {
    this.obj = obj;
    this.currentValue = obj.length;
  }
  public getValue(): number {
    return this.obj.length;
  }
  public setValue(newValue: number, flags: LifecycleFlags): void {
    const { currentValue } = this;
    if (newValue !== currentValue) {
      this.currentValue = newValue;
      this.callSubscribers(newValue, currentValue, flags | LifecycleFlags.updateTargetInstance);
    }
  }
}
