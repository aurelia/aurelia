import {
  ICoercionConfiguration,
  IObserver,
  InterceptorFunc,
  atObserver,
} from '../observation';
import { subscriberCollection } from './subscriber-collection';
import { enterConnectable, exitConnectable } from './connectable-switcher';
import { connectable } from './connectable';
import { wrap, unwrap } from './proxy-observation';
import { areEqual, isFunction } from '../utilities';

import type {
  AccessorType,
  ISubscriber,
  ICollectionSubscriber,
  ISubscriberCollection,
  IConnectable,
} from '../observation';
import type { IObserverLocatorBasedConnectable } from './connectable';
import type { IObserverLocator } from './observer-locator';
import { ErrorNames, createMappedError } from '../errors';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComputedGetterFn<T = any, R = any> = (this: T, obj: T, observer: IConnectable) => R;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface ComputedObserver<T extends object> extends IObserverLocatorBasedConnectable, ISubscriberCollection { }

export class ComputedObserver<T extends object> implements
  IObserver,
  IObserverLocatorBasedConnectable,
  ISubscriber,
  ICollectionSubscriber,
  ISubscriberCollection {

  public type: AccessorType = atObserver;

  /** @internal */
  private _value: unknown = void 0;

  // todo: maybe use a counter allow recursive call to a certain level
  /** @internal */
  private _isRunning: boolean = false;

  /** @internal */
  private _isDirty: boolean = false;

  /** @internal */
  private readonly _obj: T;

  /** @internal */
  private readonly _wrapped: T;

  /** @internal */
  private _callback?: (newValue: unknown, oldValue: unknown) => void = void 0;

  /** @internal */
  private _coercer?: InterceptorFunc = void 0;

  /** @internal */
  private _coercionConfig?: ICoercionConfiguration = void 0;

  /**
   * The getter this observer is wrapping
   */
  public readonly $get: ComputedGetterFn<T>;

  /**
   * The setter this observer is wrapping
   */
  public readonly $set: undefined | ((v: unknown) => void);

  /**
   * A semi-private property used by connectable mixin
   */
  public readonly oL: IObserverLocator;

  public constructor(
    obj: T,
    get: ComputedGetterFn<T>,
    set: undefined | ((v: unknown) => void),
    observerLocator: IObserverLocator,
    useProxy: boolean,
  ) {
    this._obj = obj;
    this._wrapped = useProxy ? wrap(obj) : obj;
    this.$get = get;
    this.$set = set;
    this.oL = observerLocator;
  }

  public init(value: unknown) {
    this._value = value;
    this._isDirty = false;
  }

  public getValue() {
    if (this.subs.count === 0) {
      return this.$get.call(this._obj, this._obj, this);
    }
    if (this._isDirty) {
      this.compute();
      this._isDirty = false;
    }
    return this._value;
  }

  // deepscan-disable-next-line
  public setValue(v: unknown): void {
    if (isFunction(this.$set)) {
      if (this._coercer !== void 0) {
        v = this._coercer.call(null, v, this._coercionConfig);
      }
      if (!areEqual(v, this._value)) {
        // setting running true as a form of batching
        this._isRunning = true;
        this.$set.call(this._obj, v);
        this._isRunning = false;

        this.run();
      }
    } else {
      throw createMappedError(ErrorNames.assign_readonly_readonly_property_from_computed);
    }
  }

  public useCoercer(coercer: InterceptorFunc, coercionConfig?: ICoercionConfiguration | undefined): boolean {
    this._coercer = coercer;
    this._coercionConfig = coercionConfig;
    return true;
  }

  public useCallback(callback: (newValue: unknown, oldValue: unknown) => void) {
    this._callback = callback;
    return true;
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

  private run(): void {
    if (this._isRunning) {
      return;
    }
    const oldValue = this._value;
    const newValue = this.compute();

    this._isDirty = false;

    if (!areEqual(newValue, oldValue)) {
      // todo: probably should set is running here too
      // to prevent depth first notification
      this._callback?.(newValue, oldValue);
      this.subs.notify(this._value, oldValue);
    }
  }

  private compute(): unknown {
    this._isRunning = true;
    this.obs.version++;
    try {
      enterConnectable(this);
      return this._value = unwrap(this.$get.call(this._wrapped, this._wrapped, this));
    } finally {
      this.obs.clear();
      this._isRunning = false;
      exitConnectable(this);
    }
  }
}

connectable(ComputedObserver, null!);
subscriberCollection(ComputedObserver);
