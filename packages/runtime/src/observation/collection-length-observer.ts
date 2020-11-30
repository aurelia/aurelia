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

interface CollectionLengthObserverImpl extends IObserver, ISubscriberCollection, ICollectionSubscriber {
  subCount: number;
  owner: ICollectionObserver<CollectionKind>;
}

function implementLengthObserver(klass: Constructable<CollectionLengthObserverImpl>) {
  const proto = klass.prototype as CollectionLengthObserverImpl;
  subscriberCollection()(klass);
  ensureProto(proto, 'subscribe', subscribe);
  ensureProto(proto, 'unsubscribe', unsubscribe)
}

function subscribe(this: CollectionLengthObserverImpl, subscriber: ISubscriber): void {
  if (this.addSubscriber(subscriber) && ++this.subCount === 1) {
    this.owner.addCollectionSubscriber(this);
  }
}

function unsubscribe(this: CollectionLengthObserverImpl, subscriber: ISubscriber): void {
  if (this.removeSubscriber(subscriber) && --this.subCount) {
    this.owner.removeCollectionSubscriber(this);
  }
}

export class CollectionLengthObserver {
  public value: number;
  public readonly type: AccessorType = AccessorType.Array;
  public readonly obj: unknown[];
  /**
   * @internal
   */
  public subCount: number = 0;

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
    if (newValue !== currentValue && isArrayIndex(newValue)) {
      if ((flags & LifecycleFlags.noFlush) === 0) {
        this.obj.length  = newValue;
      }
      this.value = newValue;
      this.callSubscribers(newValue, currentValue, flags | LifecycleFlags.updateTarget);
    }
  }

  public handleCollectionChange(_: IndexMap, flags: LifecycleFlags) {
    const oldValue = this.value;
    const value = this.obj.length;
    this.value = value;
    if (value !== oldValue) {
      this.callSubscribers(value, oldValue, flags);
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    if (this.addSubscriber(subscriber) && ++this.subCount === 1) {
      this.owner.addCollectionSubscriber(this);
    }
  }

  public unsubscribe(subscriber: ISubscriber): void {
    if (this.removeSubscriber(subscriber) && --this.subCount) {
      this.owner.removeCollectionSubscriber(this);
    }
  }
}

export interface CollectionSizeObserver extends ISubscriberCollection {}

export class CollectionSizeObserver {
  public value: number;
  public readonly type: AccessorType;
  public readonly obj: Set<unknown> | Map<unknown, unknown>;
  /**
   * @internal
   */
  public subCount: number = 0;

  public constructor(
    public readonly owner: ICollectionObserver<CollectionKind.map | CollectionKind.set>,
  ) {
    this.value = (this.obj = owner.collection).size;
    this.type = this.obj instanceof Map ? AccessorType.Map : AccessorType.Set
  }

  public getValue(): number {
    return this.obj.size;
  }

  public setValue(): void {
    throw new Error('Map/Set "size" is a readonly property');
  }

  public handleCollectionChange(_: IndexMap, flags: LifecycleFlags) {
    const oldValue = this.value;
    const value = this.obj.size;
    this.value = value;
    if (value !== oldValue) {
      this.callSubscribers(value, oldValue, flags);
    }
  }
}

implementLengthObserver(CollectionLengthObserver);
implementLengthObserver(CollectionSizeObserver);
