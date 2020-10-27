import { ISubscriberCollection, AccessorType, LifecycleFlags } from '../observation';
import { subscriberCollection } from './subscriber-collection';
import { ITask } from '@aurelia/kernel';

export interface CollectionSizeObserver extends ISubscriberCollection {}

@subscriberCollection()
export class CollectionSizeObserver {
  public currentValue: number;
  public type: AccessorType = AccessorType.Obj;
  public task: ITask | null = null;

  public constructor(
    public obj: Set<unknown> | Map<unknown, unknown>,
  ) {
    this.currentValue = obj.size;
  }
  public getValue(): number {
    return this.obj.size;
  }
  public setValue(newValue: number, flags: LifecycleFlags): void {
    const { currentValue } = this;
    if (newValue !== currentValue) {
      this.currentValue = newValue;
      this.callSubscribers(newValue, currentValue, flags | LifecycleFlags.updateTarget);
    }
  }
}
