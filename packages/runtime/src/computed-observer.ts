import {
  ICoercionConfiguration,
  IObserver,
  InterceptorFunc,
  atObserver,
} from './interfaces';
import { subscriberCollection } from './subscriber-collection';
import { enterConnectable, exitConnectable } from './connectable-switcher';
import { connectable } from './connectable';
import { wrap, unwrap } from './proxy-observation';
import { areEqual, isFunction } from '@aurelia/kernel';

import type {
  AccessorType,
  ISubscriber,
  ICollectionSubscriber,
  ISubscriberCollection,
  IConnectable,
} from './interfaces';
import type { IObserverLocatorBasedConnectable } from './connectable';
import type { IObserverLocator } from './observer-locator';
import { ErrorNames, createMappedError } from './errors';
import { queueTask } from './queue';

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
  static {
    connectable(ComputedObserver, null!);
    subscriberCollection(ComputedObserver, null!);
  }

  public type: AccessorType = atObserver;

  /** @internal */
  private _oldValue: unknown = void 0;

  /** @internal */
  private _value: unknown = void 0;

  /** @internal */
  private _notified = false;

  // todo: maybe use a counter allow recursive call to a certain level
  /** @internal */
  private _isQueued: boolean = false;

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

  /** @internal */
  private readonly _flush: 'sync' | 'async';

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
    flush: 'sync' | 'async' = 'async',
  ) {
    this._obj = obj;
    this._wrapped = wrap(obj);
    this.$get = get;
    this.$set = set;
    this.oL = observerLocator;
    this._flush = flush;
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
      this._notified = false;
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
        this.$set.call(this._obj, v);
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

  public handleDirty(): void {
    if (!this._isDirty) {
      this._isDirty = true;
      this.subs.notifyDirty();
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
      // start collecting dependencies
      this._oldValue = this.compute();
      this._isDirty = false;
      this._notified = false;
    }
  }

  public unsubscribe(subscriber: ISubscriber): void {
    if (this.subs.remove(subscriber) && this.subs.count === 0) {
      this._isDirty = true;
      this.obs.clearAll();
      this._oldValue = void 0;
      this._notified = true;
    }
  }

  private run(): void {
    if (this._flush === 'sync') {
      this._run();
      return;
    }

    if (this._isQueued) {
      return;
    }
    this._isQueued = true;
    queueTask(() => {
      this._isQueued = false;
      this._run();
    });
  }

  /** @internal */
  private _run() {
    const currValue = this._value;
    const oldValue = this._oldValue;
    const newValue = this.compute();

    this._isDirty = false;

    // there's case where the _value property was updated without notifying subscribers
    // such is the case when this computed observer value was requested
    // before the dependencies of this observer notify it of their changes
    //
    // if we are to notify whenever we are computing new value, it'd cause a depth first & potentially circular update
    // (subscriber of this observer requests value -> this observer re-computes -> subscribers gets updated)
    // so we are only notifying subscribers when it's the actual notify phase

    if (!this._notified || !areEqual(newValue, currValue)) {
      // todo: wrong timing, this should be after notify
      this._callback?.(newValue, oldValue);
      this.subs.notify(newValue, oldValue);
      this._oldValue = this._value = newValue;
      this._notified = true;
    }
  }

  private compute(): unknown {
    this._isDirty = false;

    let value: unknown;
    this.obs.version++;
    try {
      enterConnectable(this);
      value = unwrap(this.$get.call(this._wrapped, this._wrapped, this));
    } catch (e) {
      this._isDirty = true;
      throw e;
    } finally {
      this.obs.clear();
      exitConnectable(this);
    }

    if (this._isDirty) {
      throw createMappedError(ErrorNames.computed_mutating, this.$get.name ?? this.$get.toString());
    }

    return this._value = value;
  }
}
