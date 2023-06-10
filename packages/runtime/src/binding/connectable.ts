import { def, defineHiddenProp, ensureProto, isArray, isMap, isSet } from '../utilities';
import { getArrayObserver } from '../observation/array-observer';
import { getSetObserver } from '../observation/set-observer';
import { getMapObserver } from '../observation/map-observer';

import type { Class } from '@aurelia/kernel';
import type {
  IConnectable,
  ISubscribable,
  ISubscriber,
  IBinding,
  Collection,
  CollectionObserver,
  ICollectionSubscriber,
  ICollectionSubscribable,
} from '../observation';
import type { IObserverLocator } from '../observation/observer-locator';
import { ErrorNames, createMappedError } from '../errors';

export interface IConnectableBinding extends IConnectable, IBinding, ISubscriber, ICollectionSubscriber {
  oL: IObserverLocator;
  /**
   * A record storing observers that are currently subscribed to by this binding
   */
  obs: BindingObserverRecord;
}

function getObserverRecord(this: IConnectableBinding): BindingObserverRecord {
  return defineHiddenProp(this, 'obs', new BindingObserverRecord(this));
}
function observe(this: IConnectableBinding, obj: object, key: PropertyKey): void {
  this.obs.add(this.oL.getObserver(obj, key));
}
function observeCollection(this: IConnectableBinding, collection: Collection): void {
  let obs: CollectionObserver;
  if (isArray(collection)) {
    obs = getArrayObserver(collection);
  } else if (isSet(collection)) {
    obs = getSetObserver(collection);
  } else if (isMap(collection)) {
    obs = getMapObserver(collection);
  } else {
    throw createMappedError(ErrorNames.non_recognisable_collection_type, collection);
  }
  this.obs.add(obs);
}

function subscribeTo(this: IConnectableBinding, subscribable: ISubscribable | ICollectionSubscribable): void {
  this.obs.add(subscribable);
}

function noopHandleChange() {
  throw createMappedError(ErrorNames.method_not_implemented, 'handleChange');
}

function noopHandleCollectionChange() {
  throw createMappedError(ErrorNames.method_not_implemented, 'handleCollectionChange');
}

type ObservationRecordImplType = {
  version: number;
  count: number;
} & Record<string, unknown>;

export interface BindingObserverRecord extends ObservationRecordImplType { }
export class BindingObserverRecord {
  public version: number = 0;
  public count: number = 0;
  // a map of the observers (subscribables) that the owning binding of this record
  // is currently subscribing to. The values are the version of the observers,
  // as the observers version may need to be changed during different evaluation
  /** @internal */
  public o = new Map<ISubscribable | ICollectionSubscribable, number>();
  /** @internal */
  public readonly b: IConnectableBinding;

  public constructor(b: IConnectableBinding) {
    this.b = b;
  }

  /**
   * Add, and subscribe to a given observer
   */
  public add(observer: ISubscribable | ICollectionSubscribable): void {
    if (!this.o.has(observer)) {
      observer.subscribe(this.b);
      ++this.count;
    }
    this.o.set(observer, this.version);
  }

  /**
   * Unsubscribe the observers that are not up to date with the record version
   */
  public clear(): void {
    this.o.forEach(unsubscribeStale, this);
    this.count = this.o.size;
  }

  public clearAll() {
    this.o.forEach(unsubscribeAll, this);
    this.o.clear();
    this.count = 0;
  }
}

function unsubscribeAll(this: BindingObserverRecord, version: number, subscribable: ISubscribable | ICollectionSubscribable) {
  subscribable.unsubscribe(this.b);
}

function unsubscribeStale(this: BindingObserverRecord, version: number, subscribable: ISubscribable | ICollectionSubscribable) {
  if (this.version !== version) {
    subscribable.unsubscribe(this.b);
    this.o.delete(subscribable);
  }
}

type Connectable = { oL: IObserverLocator } & IConnectable & Partial<ISubscriber & ICollectionSubscriber>;
type DecoratableConnectable<TProto, TClass> = Class<TProto & Connectable, TClass>;
type DecoratedConnectable<TProto, TClass> = Class<TProto & Connectable, TClass>;

function connectableDecorator<TProto, TClass>(target: DecoratableConnectable<TProto, TClass>): DecoratedConnectable<TProto, TClass> {
  const proto = target.prototype;
  ensureProto(proto, 'observe', observe);
  ensureProto(proto, 'observeCollection', observeCollection);
  ensureProto(proto, 'subscribeTo', subscribeTo);
  def(proto, 'obs', { get: getObserverRecord });
  // optionally add these two methods to normalize a connectable impl
  // though don't override if it already exists
  ensureProto(proto, 'handleChange', noopHandleChange);
  ensureProto(proto, 'handleCollectionChange', noopHandleCollectionChange);

  return target;
}

export function connectable(): typeof connectableDecorator;
export function connectable<TProto, TClass>(target: DecoratableConnectable<TProto, TClass>): DecoratedConnectable<TProto, TClass>;
export function connectable<TProto, TClass>(target?: DecoratableConnectable<TProto, TClass>): DecoratedConnectable<TProto, TClass> | typeof connectableDecorator {
  return target == null ? connectableDecorator : connectableDecorator(target);
}
