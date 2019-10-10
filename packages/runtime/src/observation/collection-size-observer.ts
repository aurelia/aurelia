import { LifecycleFlags } from '../flags';
import { ISubscriberCollection } from '../observation';
import { subscriberCollection } from './subscriber-collection';

export interface CollectionSizeObserver extends ISubscriberCollection {}

@subscriberCollection()
export class CollectionSizeObserver {
  public currentValue: number;
  public obj: Set<unknown> | Map<unknown, unknown>;
  public constructor(obj: Set<unknown> | Map<unknown, unknown>) {
    this.obj = obj;
    this.currentValue = obj.size;
  }
  public getValue(): number {
    return this.obj.size;
  }
  public setValue(newValue: number, flags: LifecycleFlags): void {
    const { currentValue } = this;
    if (newValue !== currentValue) {
      this.currentValue = newValue;
      this.callSubscribers(newValue, currentValue, flags | LifecycleFlags.updateTargetInstance);
    }
  }
}
