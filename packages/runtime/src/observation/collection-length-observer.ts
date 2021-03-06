import { isArrayIndex } from '@aurelia/kernel';
import { AccessorType, CollectionKind, LifecycleFlags } from '../observation.js';
import { subscriberCollection } from './subscriber-collection.js';
import { ensureProto } from '../utilities-objects.js';
import { withFlushQueue } from './flush-queue.js';

import type { Constructable } from '@aurelia/kernel';
import type {
  ICollectionObserver,
  IndexMap,
  ISubscriber,
  ISubscriberCollection,
  ICollectionSubscriber,
} from '../observation.js';
import type { FlushQueue, IFlushable, IWithFlushQueue } from './flush-queue.js';

export interface CollectionLengthObserver extends ISubscriberCollection {}

export class CollectionLengthObserver implements IWithFlushQueue, ICollectionSubscriber, IFlushable {

  public value: number;
  private oldvalue: number;
  private f: LifecycleFlags = LifecycleFlags.none;

  public readonly type: AccessorType = AccessorType.Array;
  public readonly obj: unknown[];
  // available via withFlushQueue mixin
  public readonly queue!: FlushQueue;

  public constructor(
    public readonly owner: ICollectionObserver<CollectionKind.array>,
  ) {
    this.value = this.oldvalue = (this.obj = owner.collection).length;
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
      this.oldvalue = currentValue;
      this.f = flags;
      this.queue.add(this);
      // this.subs.notify(newValue, currentValue, flags);
    }
  }

  public handleCollectionChange(_: IndexMap, flags: LifecycleFlags) {
    const oldValue = this.value;
    const value = this.obj.length;
    if ((this.value = value) !== oldValue) {
      this.oldvalue = oldValue;
      this.f = flags;
      this.queue.add(this);
      // this.subs.notify(value, oldValue, flags);
    }
  }

  public flush(): void {
    this.subs.notify(this.value, this.oldvalue, this.f);
    this.oldvalue = this.value;
  }
}

export interface CollectionSizeObserver extends ISubscriberCollection {}

export class CollectionSizeObserver implements ICollectionSubscriber, IFlushable {
  public value: number;
  private oldvalue: number;
  private f: LifecycleFlags = LifecycleFlags.none;

  public readonly type: AccessorType;
  public readonly obj: Set<unknown> | Map<unknown, unknown>;

  public constructor(
    public readonly owner: ICollectionObserver<CollectionKind.map | CollectionKind.set>,
  ) {
    this.value = this.oldvalue = (this.obj = owner.collection).size;
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
    if ((this.value = value) !== oldValue) {
      this.oldvalue = oldValue;
      this.f = flags;
      // this.subs.notify(value, oldValue, flags);
    }
  }

  public flush(): void {
    this.subs.notify(this.value, this.oldvalue, this.f);
    this.oldvalue = this.value;
  }
}

interface CollectionLengthObserverImpl extends ISubscriberCollection, ICollectionSubscriber {
  owner: ICollectionObserver<CollectionKind>;
}

function implementLengthObserver(klass: Constructable<ISubscriberCollection>) {
  const proto = klass.prototype as ISubscriberCollection;
  ensureProto(proto, 'subscribe', subscribe, true);
  ensureProto(proto, 'unsubscribe', unsubscribe, true);
  withFlushQueue(klass);
  subscriberCollection(klass);
}

function subscribe(this: CollectionLengthObserverImpl, subscriber: ISubscriber): void {
  if (this.subs.add(subscriber) && this.subs.count === 1) {
    this.owner.subscribe(this);
  }
}

function unsubscribe(this: CollectionLengthObserverImpl, subscriber: ISubscriber): void {
  if (this.subs.remove(subscriber) && this.subs.count === 0) {
    this.owner.subscribe(this);
  }
}

implementLengthObserver(CollectionLengthObserver);
implementLengthObserver(CollectionSizeObserver);
