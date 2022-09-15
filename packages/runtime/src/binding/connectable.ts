import { def, defineHiddenProp, ensureProto, isArray } from '../utilities-objects';
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
  IndexMap,
  ICollectionSubscribable,
} from '../observation';
import type { IObserverLocator } from '../observation/observer-locator';

export interface IObserverLocatorBasedConnectable extends IBinding, ISubscriber, ICollectionSubscriber {
  oL: IObserverLocator;
}

export interface IConnectableBinding extends IObserverLocatorBasedConnectable, IConnectable {
  /**
   * A record storing observers that are currently subscribed to by this binding
   */
  obs: BindingObserverRecord;
}

function observe(this: IConnectableBinding, obj: object, key: PropertyKey): void {
  const observer = this.oL.getObserver(obj, key);
  /* Note: we need to cast here because we can indeed get an accessor instead of an observer,
   *  in which case the call to observer.subscribe will throw. It's not very clean and we can solve this in 2 ways:
   *  1. Fail earlier: only let the locator resolve observers from .getObserver, and throw if no branches are left (e.g. it would otherwise return an accessor)
   *  2. Fail silently (without throwing): give all accessors a no-op subscribe method
   *
   * We'll probably want to implement some global configuration (like a "strict" toggle) so users can pick between enforced correctness vs. ease-of-use
   */
  this.obs.add(observer);
}
function getObserverRecord(this: IConnectableBinding): BindingObserverRecord {
  return defineHiddenProp(this, 'obs', new BindingObserverRecord(this));
}

function observeCollection(this: IConnectableBinding, collection: Collection): void {
  let obs: CollectionObserver;
  if (isArray(collection)) {
    obs = getArrayObserver(collection);
  } else if (collection instanceof Set) {
    obs = getSetObserver(collection);
  } else if (collection instanceof Map) {
    obs = getMapObserver(collection);
  } else {
    if (__DEV__)
      throw new Error(`AUR0210: Unrecognised collection type.`);
    else
      throw new Error(`AUR0210`);
  }
  this.obs.add(obs);
}

function subscribeTo(this: IConnectableBinding, subscribable: ISubscribable | ICollectionSubscribable): void {
  this.obs.add(subscribable);
}

function noopHandleChange() {
  if (__DEV__)
    throw new Error(`AUR2011: method "handleChange" not implemented`);
  else
    throw new Error(`AUR2011:handleChange`);
}

function noopHandleCollectionChange() {
  if (__DEV__)
    throw new Error(`AUR2011: method "handleCollectionChange" not implemented`);
  else
    throw new Error(`AUR2011:handleCollectionChange`);
}

type ObservationRecordImplType = {
  version: number;
  count: number;
  binding: IConnectableBinding;
} & Record<string, unknown>;

export interface BindingObserverRecord extends ObservationRecordImplType { }
export class BindingObserverRecord implements ISubscriber, ICollectionSubscriber {
  public version: number = 0;
  public count: number = 0;
  /** @internal */
  // a map of the observers (subscribables) that the owning binding of this record
  // is currently subscribing to. The values are the version of the observers,
  // as the observers version may need to be changed during different evaluation
  public o = new Map<ISubscribable | ICollectionSubscribable, number>();
  /** @internal */
  private readonly b: IConnectableBinding;

  public constructor(b: IConnectableBinding) {
    this.b = b;
  }

  public handleChange(value: unknown, oldValue: unknown): unknown {
    return this.b.interceptor.handleChange(value, oldValue);
  }

  public handleCollectionChange(indexMap: IndexMap): void {
    this.b.interceptor.handleCollectionChange(indexMap);
  }

  /**
   * Add, and subscribe to a given observer
   */
  public add(observer: ISubscribable | ICollectionSubscribable): void {
    if (!this.o.has(observer)) {
      observer.subscribe(this);
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
  subscribable.unsubscribe(this);
}

function unsubscribeStale(this: BindingObserverRecord, version: number, subscribable: ISubscribable | ICollectionSubscribable) {
  if (this.version !== version) {
    subscribable.unsubscribe(this);
    this.o.delete(subscribable);
  }
}

type Connectable = IConnectable & Partial<ISubscriber & ICollectionSubscriber>;
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
