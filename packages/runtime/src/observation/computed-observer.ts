import {
  LifecycleFlags,
  AccessorType,
  IObserver,
  Collection,
  CollectionObserver,
} from '../observation';
import { subscriberCollection } from './subscriber-collection';
import { enterConnectable, exitConnectable } from './connectable-switcher';
import { connectable } from '../binding/connectable';
import { wrap, unwrap } from './proxy-observation';
import { def, isFunction } from '../utilities-objects';
import { withFlushQueue } from './flush-queue';

import type {
  ISubscriber,
  ICollectionSubscriber,
  ISubscriberCollection,
  IConnectable,
} from '../observation';
import type { IConnectableBinding } from '../binding/connectable';
import { createObserver, IObserverLocator, ObservableGetter } from './observer-locator';
import type { FlushQueue, IFlushable, IWithFlushQueue } from './flush-queue';
import { IDirtyChecker } from './dirty-checker';
import { getArrayObserver } from './array-observer';
import { getMapObserver } from './map-observer';
import { getSetObserver } from './set-observer';

export interface ComputedObserver extends IConnectableBinding, ISubscriberCollection { }

export class ComputedObserver implements
  IObserver,
  IConnectableBinding,
  ISubscriber,
  ICollectionSubscriber,
  ISubscriberCollection,
  IWithFlushQueue,
  IFlushable {

  public static create(
    obj: object,
    key: PropertyKey,
    descriptor: PropertyDescriptor,
    observerLocator: IObserverLocator,
    useProxy: boolean,
    dirtyChecker: IDirtyChecker | null = null,
  ): ComputedObserver {
    const getter = descriptor.get!;
    const setter = descriptor.set;
    const observer = new ComputedObserver(obj, getter, setter, useProxy, observerLocator, dirtyChecker);
    const $get = ((/* Computed Observer */) => observer.getValue()) as ObservableGetter;
    $get.getObserver = () => observer;
    def(obj, key, {
      enumerable: descriptor.enumerable,
      configurable: true,
      get: $get,
      set: (/* Computed Observer */v) => {
        observer.setValue(v, LifecycleFlags.none);
      },
    });

    return observer;
  }

  public interceptor = this;

  public type: AccessorType = AccessorType.Observer;
  public readonly queue!: FlushQueue;

  /** @internal */
  private _value: unknown = void 0;
  /** @internal */
  private _oldValue: unknown = void 0;

  // todo: maybe use a counter allow recursive call to a certain level
  /** @internal */
  private _isRunning: boolean = false;

  /** @internal */
  private _isDirty: boolean = false;

  /** @internal */
  private readonly _obj: object;

  public readonly get: (watcher: IConnectable) => unknown;

  public readonly set: undefined | ((v: unknown) => void);

  /** @internal */
  private readonly _useProxy: boolean;

  /**
   * A semi-private property used by connectable mixin
   */
  public readonly oL: IObserverLocator;

  public constructor(
    obj: object,
    get: (watcher: IConnectable) => unknown,
    set: undefined | ((v: unknown) => void),
    useProxy: boolean,
    observerLocator: IObserverLocator,
    private readonly _dirtyChecker: IDirtyChecker | null,
  ) {
    this._obj = obj;
    this.get = get;
    this.set = set;
    this._useProxy = useProxy;
    this.oL = observerLocator;
  }

  public getValue() {
    if (this.subs.count === 0) {
      return this.get.call(this._obj, this);
    }
    if (this._isDirty) {
      this.compute();
      this._isDirty = false;
    }
    return this._value;
  }

  // deepscan-disable-next-line
  public setValue(v: unknown, _flags: LifecycleFlags): void {
    if (isFunction(this.set)) {
      if (v !== this._value) {
        // setting running true as a form of batching
        this._isRunning = true;
        this.set.call(this._obj, v);
        this._isRunning = false;

        this.run();
      }
    } else {
      if (__DEV__)
        throw new Error(`AUR0221: Property is readonly`);
      else
        throw new Error(`AUR0221`);
    }
  }

  public handleChange(): void {
    this._isDirty = true;
    if (this.subs.count > 0) {
      this.run();
    }
  }

  public handleCollectionChange(): void {
    this._isDirty = true;
    if (this.subs.count > 0) {
      this.run();
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    // in theory, a collection subscriber could be added before a property subscriber
    // and it should be handled similarly in subscribeToCollection
    // though not handling for now, and wait until the merge of normal + collection subscription
    if (this.subs.add(subscriber) && this.subs.count === 1) {
      this.compute();
      this._isDirty = false;
    }
  }

  public unsubscribe(subscriber: ISubscriber): void {
    if (this.subs.remove(subscriber) && this.subs.count === 0) {
      this._isDirty = true;
      this.obs.clearAll();
    }
  }

  public flush(): void {
    oV = this._oldValue;
    this._oldValue = this._value;
    this.subs.notify(this._value, oV, LifecycleFlags.none);
  }

  private run(): void {
    if (this._isRunning) {
      return;
    }
    const oldValue = this._value;
    const newValue = this.compute();

    this._isDirty = false;

    if (!Object.is(newValue, oldValue)) {
      this._oldValue = oldValue;
      this.queue.add(this);
    }
  }

  private compute(): unknown {
    this._isRunning = true;
    this.obs.version++;
    try {
      enterConnectable(this);
      return this._value = unwrap(this.get.call(this._useProxy ? wrap(this._obj) : this._obj, this));
    } finally {
      this.obs.clear();
      this._isRunning = false;
      exitConnectable(this);
    }
  }

  public observe(obj: object, key: PropertyKey): void {
    const observer = createObserver(obj, key, this._dirtyChecker);
    this.obs.add(observer);
  }

  public observeCollection(obj: Collection): void {
    let obs: CollectionObserver;
    if (obj instanceof Array) {
      obs = getArrayObserver(obj);
    } else if (obj instanceof Set) {
      obs = getSetObserver(obj);
    } else if (obj instanceof Map) {
      obs = getMapObserver(obj);
    } else {
      if (__DEV__)
        throw new Error(`AUR0210: Unrecognised collection type.`);
      else
        throw new Error(`AUR0210`);
    }
    this.obs.add(obs);
  }
}

connectable(ComputedObserver);
subscriberCollection(ComputedObserver);
withFlushQueue(ComputedObserver);

// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV: unknown = void 0;
