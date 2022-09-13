import { isArrayIndex } from '@aurelia/kernel';
import { AccessorType, CollectionKind, LifecycleFlags } from '../observation';
import { subscriberCollection } from './subscriber-collection';
import { ensureProto } from '../utilities-objects';
import { withFlushQueue } from './flush-queue';

import type { Constructable } from '@aurelia/kernel';
import type {
  ICollectionObserver,
  IndexMap,
  ISubscriber,
  ISubscriberCollection,
  ICollectionSubscriber,
} from '../observation';
import type { FlushQueue, IFlushable, IWithFlushQueue } from './flush-queue';

export interface CollectionLengthObserver extends ISubscriberCollection {}

export class CollectionLengthObserver implements IWithFlushQueue, ICollectionSubscriber, IFlushable {
  public readonly type: AccessorType = AccessorType.Array;

  /** @internal */
  private _value: number;

  /** @internal */
  private _oldvalue: number;

  /** @internal */
  private f: LifecycleFlags = LifecycleFlags.none;

  /** @internal */
  private readonly _obj: unknown[];
  // available via withFlushQueue mixin
  public readonly queue!: FlushQueue;

  public constructor(
    public readonly owner: ICollectionObserver<CollectionKind.array>,
  ) {
    this._value = this._oldvalue = (this._obj = owner.collection).length;
  }

  public getValue(): number {
    return this._obj.length;
  }

  public setValue(newValue: number, flags: LifecycleFlags): void {
    const currentValue = this._value;
    // if in the template, length is two-way bound directly
    // then there's a chance that the new value is invalid
    // add a guard so that we don't accidentally broadcast invalid values
    if (newValue !== currentValue && isArrayIndex(newValue)) {
      if ((flags & LifecycleFlags.noFlush) === 0) {
        this._obj.length = newValue;
      }
      this._value = newValue;
      this._oldvalue = currentValue;
      this.f = flags;
      this.queue.add(this);
    }
  }

  public handleCollectionChange(_: IndexMap, flags: LifecycleFlags) {
    const oldValue = this._value;
    const value = this._obj.length;
    if ((this._value = value) !== oldValue) {
      this._oldvalue = oldValue;
      this.f = flags;
      this.queue.add(this);
    }
  }

  public flush(): void {
    oV = this._oldvalue;
    this._oldvalue = this._value;
    this.subs.notify(this._value, oV, this.f);
  }
}

export interface CollectionSizeObserver extends ISubscriberCollection {}

export class CollectionSizeObserver implements ICollectionSubscriber, IFlushable {
  public readonly type: AccessorType;

  public readonly queue!: FlushQueue;

  /** @internal */
  private _value: number;

  /** @internal */
  private _oldvalue: number;

  /** @internal */
  private f: LifecycleFlags = LifecycleFlags.none;

  /** @internal */
  private readonly _obj: Set<unknown> | Map<unknown, unknown>;

  public constructor(
    public readonly owner: ICollectionObserver<CollectionKind.map | CollectionKind.set>,
  ) {
    this._value = this._oldvalue = (this._obj = owner.collection).size;
    this.type = this._obj instanceof Map ? AccessorType.Map : AccessorType.Set;
  }

  public getValue(): number {
    return this._obj.size;
  }

  public setValue(): void {
    if (__DEV__)
      throw new Error(`AUR02: Map/Set "size" is a readonly property`);
    else
      throw new Error(`AUR02`);
  }

  public handleCollectionChange(_: IndexMap, flags: LifecycleFlags): void {
    const oldValue = this._value;
    const value = this._obj.size;
    if ((this._value = value) !== oldValue) {
      this._oldvalue = oldValue;
      this.f = flags;
      this.queue.add(this);
    }
  }

  public flush(): void {
    oV = this._oldvalue;
    this._oldvalue = this._value;
    this.subs.notify(this._value, oV, this.f);
  }
}

interface CollectionLengthObserverImpl extends ISubscriberCollection, ICollectionSubscriber {
  owner: ICollectionObserver<CollectionKind>;
}

function implementLengthObserver(klass: Constructable<ISubscriberCollection>) {
  const proto = klass.prototype as ISubscriberCollection;
  ensureProto(proto, 'subscribe', subscribe);
  ensureProto(proto, 'unsubscribe', unsubscribe);
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

// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV: unknown = void 0;
