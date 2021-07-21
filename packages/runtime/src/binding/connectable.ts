import { def, defineHiddenProp, ensureProto } from '../utilities-objects.js';
import { getArrayObserver } from '../observation/array-observer.js';
import { getSetObserver } from '../observation/set-observer.js';
import { getMapObserver } from '../observation/map-observer.js';

import type { Class, IServiceLocator } from '@aurelia/kernel';
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
  LifecycleFlags,
} from '../observation.js';
import type { IObserverLocator } from '../observation/observer-locator.js';

// TODO: add connect-queue (or something similar) back in when everything else is working, to improve startup time

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
  if (collection instanceof Array) {
    obs = getArrayObserver(collection);
  } else if (collection instanceof Set) {
    obs = getSetObserver(collection);
  } else if (collection instanceof Map) {
    obs = getMapObserver(collection);
  } else {
    throw new Error('Unrecognised collection type.');
  }
  this.obs.add(obs);
}

function subscribeTo(this: IConnectableBinding, subscribable: ISubscribable | ICollectionSubscribable): void {
  this.obs.add(subscribable);
}

function noopHandleChange() {
  throw new Error('method "handleChange" not implemented');
}

function noopHandleCollectionChange() {
  throw new Error('method "handleCollectionChange" not implemented');
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
  public slots: number = 0;

  public constructor(
    public binding: IConnectableBinding
  ) {
  }

  public handleChange(value: unknown, oldValue: unknown, flags: LifecycleFlags): unknown {
    return this.binding.interceptor.handleChange(value, oldValue, flags);
  }

  public handleCollectionChange(indexMap: IndexMap, flags: LifecycleFlags): void {
    this.binding.interceptor.handleCollectionChange(indexMap, flags);
  }

  /**
   * Add, and subscribe to a given observer
   */
  public add(observer: ISubscribable | ICollectionSubscribable): void {
    // find the observer.
    const observerSlots = this.slots;
    let i = observerSlots;

    // find the slot number of the observer
    while (i-- && this[`o${i}`] !== observer);

    // if we are not already observing, put the observer in an open slot and subscribe.
    if (i === -1) {
      i = 0;
      // go from the start, find an open slot number
      while (this[`o${i}`] !== void 0) {
        i++;
      }
      // store the reference to the observer and subscribe
      this[`o${i}`] = observer;
      observer.subscribe(this);
      // increment the slot count.
      if (i === observerSlots) {
        this.slots = i + 1;
      }
      ++this.count;
    }
    this[`v${i}`] = this.version;
  }

  /**
   * Unsubscribe the observers that are not up to date with the record version
   */
  public clear(all?: boolean): void {
    const slotCount = this.slots;
    let slotName: string;
    let observer: (ISubscribable | ICollectionSubscribable) & { [key: string]: number };
    let i = 0;
    if (all === true) {
      for (; i < slotCount; ++i) {
        slotName = `o${i}`;
        observer = this[slotName] as (ISubscribable | ICollectionSubscribable) & { [key: string]: number };
        if (observer !== void 0) {
          this[slotName] = void 0;
          observer.unsubscribe(this);
        }
      }
      this.count = this.slots = 0;
    } else {
      for (; i < slotCount; ++i) {
        if (this[`v${i}`] !== this.version) {
          slotName = `o${i}`;
          observer = this[slotName] as (ISubscribable | ICollectionSubscribable) & { [key: string]: number };
          if (observer !== void 0) {
            this[slotName] = void 0;
            observer.unsubscribe(this);
            this.count--;
          }
        }
      }
    }
  }
}

type Connectable = IConnectable & Partial<ISubscriber & ICollectionSubscriber>;
type DecoratableConnectable<TProto, TClass> = Class<TProto & Connectable, TClass>;
type DecoratedConnectable<TProto, TClass> = Class<TProto & Connectable, TClass>;

function connectableDecorator<TProto, TClass>(target: DecoratableConnectable<TProto, TClass>): DecoratedConnectable<TProto, TClass> {
  const proto = target.prototype;
  ensureProto(proto, 'observe', observe, true);
  ensureProto(proto, 'observeCollection', observeCollection, true);
  ensureProto(proto, 'subscribeTo', subscribeTo, true);
  def(proto, 'obs', { get: getObserverRecord });
  // optionally add these two methods to normalize a connectable impl
  ensureProto(proto, 'handleChange', noopHandleChange);
  ensureProto(proto, 'handleCollectionChange', noopHandleCollectionChange);

  return target;
}

export function connectable(): typeof connectableDecorator;
export function connectable<TProto, TClass>(target: DecoratableConnectable<TProto, TClass>): DecoratedConnectable<TProto, TClass>;
export function connectable<TProto, TClass>(target?: DecoratableConnectable<TProto, TClass>): DecoratedConnectable<TProto, TClass> | typeof connectableDecorator {
  return target == null ? connectableDecorator : connectableDecorator(target);
}

export type MediatedBinding<K extends string> = {
  [key in K]: (newValue: unknown, previousValue: unknown, flags: LifecycleFlags) => void;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface BindingMediator<K extends string> extends IConnectableBinding { }
export class BindingMediator<K extends string> implements IConnectableBinding {
  public interceptor = this;

  public constructor(
    public readonly key: K,
    public readonly binding: MediatedBinding<K>,
    public oL: IObserverLocator,
    public locator: IServiceLocator,
  ) {
  }

  public $bind(): void {
    throw new Error('Method not implemented.');
  }

  public $unbind(): void {
    throw new Error('Method not implemented.');
  }

  public handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void {
    this.binding[this.key](newValue, previousValue, flags);
  }
}

connectableDecorator(BindingMediator);
