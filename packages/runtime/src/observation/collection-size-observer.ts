import { AccessorType, LifecycleFlags } from '../observation.js';
import { subscriberCollection } from './subscriber-collection.js';

import type { ISubscriberCollection } from '../observation.js';

export interface CollectionSizeObserver extends ISubscriberCollection {}

@subscriberCollection()
export class CollectionSizeObserver {
  public currentValue: number;
  public type: AccessorType = AccessorType.Obj;

  public constructor(
    public obj: Set<unknown> | Map<unknown, unknown>,
  ) {
    this.currentValue = obj.size;
  }

  public getValue(): number {
    return this.obj.size;
  }

  public setValue(): void {
    throw new Error('collection "size" is a readonly property');
  }

  public notify(): void {
    const oldValue = this.currentValue;
    this.callSubscribers(this.currentValue = this.obj.size, oldValue, LifecycleFlags.updateTarget);
  }
}
