import { isArrayIndex } from '@aurelia/kernel';
import { AccessorType, CollectionKind, LifecycleFlags } from '../observation.js';
import { subscriberCollection } from './subscriber-collection.js';
import { ensureProto } from '../utilities-objects.js';

import type { Constructable } from '@aurelia/kernel';
import type {
  ICollectionObserver,
  IndexMap,
  ISubscriber,
  ISubscriberCollection,
  ICollectionSubscriber,
  IObserver,
} from '../observation.js';

export interface CollectionLengthObserver extends ISubscriberCollection {}

export class CollectionLengthObserver {
  public value: number;
  public readonly type: AccessorType = AccessorType.Array;
  public readonly obj: unknown[];

  public constructor(
    public readonly owner: ICollectionObserver<CollectionKind.array>,
  ) {
    this.value = (this.obj = owner.collection).length;
  }

  public getValue(): number {
    return this.obj.length;
  }

  public setValue(newValue: number, flags: LifecycleFlags): void {
    const currentValue = this.value;
    // if in the template, length is two-way bound directly
    // then there's a chance that the new value is invalid
    // add a guard so that we don't accidentally broadcast invalid values
    if (newValue !== currentValue && isArrayIndex(newValue)) {
      if ((flags & LifecycleFlags.noFlush) === 0) {
        this.obj.length = newValue;
      }
      this.value = newValue;
      this.subs.notify(newValue, currentValue, flags | LifecycleFlags.updateTarget);
    }
  }

  public handleCollectionChange(_: IndexMap, flags: LifecycleFlags) {
    const oldValue = this.value;
    const value = this.obj.length;
    if ((this.value = value) !== oldValue) {
      this.subs.notify(value, oldValue, flags);
    }
  }
}

export interface CollectionSizeObserver extends ISubscriberCollection {}

export class CollectionSizeObserver {
  public value: number;
  public readonly type: AccessorType;
  public readonly obj: Set<unknown> | Map<unknown, unknown>;

  public constructor(
    public readonly owner: ICollectionObserver<CollectionKind.map | CollectionKind.set>,
  ) {
    this.value = (this.obj = owner.collection).size;
    this.type = this.obj instanceof Map ? AccessorType.Map : AccessorType.Set;
  }

  public getValue(): number {
    return this.obj.size;
  }

  public setValue(): void {
    throw new Error('Map/Set "size" is a readonly property');
  }

  public handleCollectionChange(_: IndexMap, flags: LifecycleFlags): void {
    const oldValue = this.value;
    const value = this.obj.size;
    this.value = value;
    if (value !== oldValue) {
      this.subs.notify(value, oldValue, flags);
    }
  }
}

interface CollectionLengthObserverImpl extends IObserver, ISubscriberCollection, ICollectionSubscriber {
  owner: ICollectionObserver<CollectionKind>;
}

function implementLengthObserver(klass: Constructable<CollectionLengthObserverImpl>) {
  const proto = klass.prototype as CollectionLengthObserverImpl;
  ensureProto(proto, 'subscribe', subscribe, true);
  ensureProto(proto, 'unsubscribe', unsubscribe, true);
  subscriberCollection(klass);
}

function subscribe(this: CollectionLengthObserverImpl, subscriber: ISubscriber): void {
  if (this.subs.add(subscriber) && this.subs.count === 1) {
    this.owner.subs.add(this);
  }
}

function unsubscribe(this: CollectionLengthObserverImpl, subscriber: ISubscriber): void {
  if (this.subs.remove(subscriber) && this.subs.count === 0) {
    this.owner.subs.remove(this);
  }
}

implementLengthObserver(CollectionLengthObserver);
implementLengthObserver(CollectionSizeObserver);
