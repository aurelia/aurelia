import { AccessorType, Collection, CollectionKind, IObserver } from '../observation';
import { subscriberCollection } from './subscriber-collection';
import { createError, ensureProto, isMap } from '../utilities-objects';

import type { Constructable } from '@aurelia/kernel';
import type {
  ICollectionObserver,
  IndexMap,
  ISubscriber,
  ISubscriberCollection,
  ICollectionSubscriber,
} from '../observation';

export interface CollectionLengthObserver extends ISubscriberCollection {}

export class CollectionLengthObserver implements IObserver, ICollectionSubscriber {
  public readonly type: AccessorType = AccessorType.Array;

  /** @internal */
  private _value: number;

  /** @internal */
  private readonly _obj: unknown[];

  public constructor(
    public readonly owner: ICollectionObserver<CollectionKind.array>,
  ) {
    this._value = (this._obj = owner.collection).length;
  }

  public getValue(): number {
    return this._obj.length;
  }

  public setValue(newValue: number): void {
    // if in the template, length is two-way bound directly
    // then there's a chance that the new value is invalid
    // add a guard so that we don't accidentally broadcast invalid values
    if (newValue !== this._value) {
      if (!Number.isNaN(newValue)) {
        this._obj.splice(newValue);
        this._value = this._obj.length;
        // todo: maybe use splice so that it'll notify everything properly
        // this._obj.length = newValue;
        // this.subs.notify(newValue, currentValue);
      } else if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn(`Invalid value "${newValue}" for array length`);
      }
    }
  }

  public handleCollectionChange(_arr: unknown[], _: IndexMap) {
    const oldValue = this._value;
    const value = this._obj.length;
    if ((this._value = value) !== oldValue) {
      this.subs.notify(this._value, oldValue);
    }
  }
}

export interface CollectionSizeObserver extends ISubscriberCollection {}

export class CollectionSizeObserver implements ICollectionSubscriber {
  public readonly type: AccessorType;

  /** @internal */
  private _value: number;

  /** @internal */
  private readonly _obj: Set<unknown> | Map<unknown, unknown>;

  public constructor(
    public readonly owner: ICollectionObserver<CollectionKind.map | CollectionKind.set>,
  ) {
    this._value = (this._obj = owner.collection).size;
    this.type = isMap(this._obj) ? AccessorType.Map : AccessorType.Set;
  }

  public getValue(): number {
    return this._obj.size;
  }

  public setValue(): void {
    if (__DEV__)
      throw createError(`AUR02: Map/Set "size" is a readonly property`);
    else
      throw createError(`AUR02`);
  }

  public handleCollectionChange(_collection: Collection,  _: IndexMap): void {
    const oldValue = this._value;
    const value = this._obj.size;
    if ((this._value = value) !== oldValue) {
      this.subs.notify(this._value, oldValue);
    }
  }
}

interface CollectionLengthObserverImpl extends ISubscriberCollection, ICollectionSubscriber {
  owner: ICollectionObserver<CollectionKind>;
}

function implementLengthObserver(klass: Constructable<ISubscriberCollection>) {
  const proto = klass.prototype as ISubscriberCollection;
  ensureProto(proto, 'subscribe', subscribe);
  ensureProto(proto, 'unsubscribe', unsubscribe);
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
