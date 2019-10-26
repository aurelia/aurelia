import { LifecycleFlags } from '../flags';
import { ISubscriberCollection } from '../observation';
import { subscriberCollection } from './subscriber-collection';

export interface CollectionLengthObserver extends ISubscriberCollection {}

@subscriberCollection()
export class CollectionLengthObserver {
  public currentValue: number;
  public constructor(
    public obj: unknown[],
  ) {
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
