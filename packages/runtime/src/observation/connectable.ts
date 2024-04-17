import { type Constructable } from '@aurelia/kernel';
import { def, defineHiddenProp, ensureProto, isArray, isMap, isSet } from '../utilities';
import { getArrayObserver } from './array-observer';
import { getSetObserver } from './set-observer';
import { getMapObserver } from './map-observer';

import type {
  IConnectable,
  ISubscribable,
  ISubscriber,
  Collection,
  CollectionObserver,
  ICollectionSubscriber,
  ICollectionSubscribable,
} from '../observation';
import type { IObserverLocator } from './observer-locator';
import { ErrorNames, createMappedError } from '../errors';

export interface IObserverLocatorBasedConnectable extends IConnectable, ISubscriber, ICollectionSubscriber {
  oL: IObserverLocator;
  /**
   * A record storing observers that are currently subscribed to by this binding
   */
  obs: IObserverRecord;
}

export interface IObserverRecord {
  version: number;
  count: number;
  add(observer: ISubscribable | ICollectionSubscribable): void;
  clear(): void;
  clearAll(): void;
}

export type DecoratedConnectable<T extends Partial<IConnectable>> = Constructable<T & IConnectable & ISubscriber & ICollectionSubscriber>;

const connectableDecorator = /*@__PURE__*/ (() => {
  class BindingObserverRecord implements IObserverRecord {
    public version: number = 0;
    public count: number = 0;
    // a map of the observers (subscribables) that the owning binding of this record
    // is currently subscribing to. The values are the version of the observers,
    // as the observers version may need to be changed during different evaluation
    /** @internal */
    public o = new Map<ISubscribable | ICollectionSubscribable, number>();
    /** @internal */
    public readonly b: IObserverLocatorBasedConnectable;

    public constructor(b: IObserverLocatorBasedConnectable) {
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

  function getObserverRecord(this: IObserverLocatorBasedConnectable): BindingObserverRecord {
    return defineHiddenProp(this, 'obs', new BindingObserverRecord(this));
  }
  function observe(this: IObserverLocatorBasedConnectable, obj: object, key: PropertyKey): void {
    this.obs.add(this.oL.getObserver(obj, key));
  }
  function observeCollection(this: IObserverLocatorBasedConnectable, collection: Collection): void {
    let observer: CollectionObserver;
    if (isArray(collection)) {
      observer = getArrayObserver(collection);
    } else if (isSet(collection)) {
      observer = getSetObserver(collection);
    } else if (isMap(collection)) {
      observer = getMapObserver(collection);
    } else {
      throw createMappedError(ErrorNames.non_recognisable_collection_type, collection);
    }
    this.obs.add(observer);
  }

  function subscribeTo(this: IObserverLocatorBasedConnectable, subscribable: ISubscribable | ICollectionSubscribable): void {
    this.obs.add(subscribable);
  }

  function noopHandleChange() {
    throw createMappedError(ErrorNames.method_not_implemented, 'handleChange');
  }

  function noopHandleCollectionChange() {
    throw createMappedError(ErrorNames.method_not_implemented, 'handleCollectionChange');
  }

  return function connectableDecorator<T extends Partial<IConnectable>, C extends Constructable<T>>(target: C, _context: ClassDecoratorContext<C>): DecoratedConnectable<T> {
    const proto = target.prototype;
    ensureProto(proto, 'observe', observe);
    ensureProto(proto, 'observeCollection', observeCollection);
    ensureProto(proto, 'subscribeTo', subscribeTo);
    def(proto, 'obs', { get: getObserverRecord });
    // optionally add these two methods to normalize a connectable impl
    // though don't override if it already exists
    ensureProto(proto, 'handleChange', noopHandleChange);
    ensureProto(proto, 'handleCollectionChange', noopHandleCollectionChange);

    return target as unknown as DecoratedConnectable<T>;
  };
})();

export function connectable(): typeof connectableDecorator;
export function connectable<T extends Partial<IConnectable>, C extends Constructable<T>>(target: C, context: ClassDecoratorContext<C>): DecoratedConnectable<T>;
export function connectable<T extends Partial<IConnectable>, C extends Constructable<T>>(target?: C, context?: ClassDecoratorContext<C>): DecoratedConnectable<T> | typeof connectableDecorator {
  return target == null ? connectableDecorator : connectableDecorator(target, context!);
}
