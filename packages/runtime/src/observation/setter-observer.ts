import { AccessorType, LifecycleFlags } from '../observation';
import { subscriberCollection } from './subscriber-collection';
import { def, isFunction } from '../utilities-objects';

import type { IIndexable } from '@aurelia/kernel';
import type {
  IAccessor,
  InterceptorFunc,
  ISubscriber,
  ISubscriberCollection,
} from '../observation';
import { FlushQueue, IFlushable, IWithFlushQueue, withFlushQueue } from './flush-queue';

// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV: unknown = void 0;

export interface SetterObserver extends IAccessor, ISubscriberCollection {}

/**
 * Observer for the mutation of object property value employing getter-setter strategy.
 * This is used for observing object properties that has no decorator.
 */
export class SetterObserver implements IWithFlushQueue, IFlushable {
  // todo(bigopon): tweak the flag based on typeof obj (array/set/map/iterator/proxy etc...)
  public type: AccessorType = AccessorType.Observer;

  /** @internal */
  private _value: unknown = void 0;
  /** @internal */
  private _oldValue: unknown = void 0;
  /** @internal */
  private _observing: boolean = false;
  public readonly queue!: FlushQueue;

  /** @internal */
  private f: LifecycleFlags = LifecycleFlags.none;
  private readonly _obj: IIndexable;
  private readonly _key: string;

  public constructor(
    obj: IIndexable,
    key: string,
  ) {
    this._obj = obj;
    this._key = key;
  }

  public getValue(): unknown {
    return this._value;
  }

  public setValue(newValue: unknown, flags: LifecycleFlags): void {
    if (this._observing) {
      if (Object.is(newValue, this._value)) {
        return;
      }
      this._oldValue = this._value;
      this._value = newValue;
      this.f = flags;
      this.queue.add(this);
    } else {
      // If subscribe() has been called, the target property descriptor is replaced by these getter/setter methods,
      // so calling obj[propertyKey] will actually return this.value.
      // However, if subscribe() was not yet called (indicated by !this.observing), the target descriptor
      // is unmodified and we need to explicitly set the property value.
      // This will happen in one-time, to-view and two-way bindings during $bind, meaning that the $bind will not actually update the target value.
      // This wasn't visible in vCurrent due to connect-queue always doing a delayed update, so in many cases it didn't matter whether $bind updated the target or not.
      this._obj[this._key] = newValue;
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    if (this._observing === false) {
      this.start();
    }

    this.subs.add(subscriber);
  }

  public flush(): void {
    oV = this._oldValue;
    this._oldValue = this._value;
    this.subs.notify(this._value, oV, this.f);
  }

  public start(): this {
    if (this._observing === false) {
      this._observing = true;
      this._value = this._obj[this._key];
      def(
        this._obj,
        this._key,
        {
          enumerable: true,
          configurable: true,
          get: (/* Setter Observer */) => this.getValue(),
          set: (/* Setter Observer */value) => {
            this.setValue(value, LifecycleFlags.none);
          },
        },
      );
    }
    return this;
  }

  public stop(): this {
    if (this._observing) {
      def(this._obj, this._key, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: this._value,
      });
      this._observing = false;
      // todo(bigopon/fred): add .removeAllSubscribers()
    }
    return this;
  }
}

type ChangeHandlerCallback = (this: object, value: unknown, oldValue: unknown, flags: LifecycleFlags) => void;

export interface SetterNotifier extends IAccessor, ISubscriberCollection {}

export class SetterNotifier implements IAccessor, IWithFlushQueue, IFlushable {
  public readonly type: AccessorType = AccessorType.Observer;
  public readonly queue!: FlushQueue;

  /** @internal */
  private _value: unknown = void 0;
  /** @internal */
  private _oldValue: unknown = void 0;
  /** @internal */
  private f: LifecycleFlags = LifecycleFlags.none;
  /** @internal */
  private readonly cb?: ChangeHandlerCallback;
  /** @internal */
  private readonly _obj: object;
  /** @internal */
  private readonly _setter: InterceptorFunc | undefined;
  /** @internal */
  private readonly _hasSetter: boolean;

  public constructor(
    obj: object,
    callbackKey: PropertyKey,
    set: InterceptorFunc | undefined,
    initialValue: unknown,
  ) {
    this._obj = obj;
    this._setter = set;
    this._hasSetter = isFunction(set);
    const callback = (obj as IIndexable)[callbackKey as string];
    this.cb = isFunction(callback) ? callback as ChangeHandlerCallback : void 0;
    this._value = initialValue;
  }

  public getValue(): unknown {
    return this._value;
  }

  public setValue(value: unknown, flags: LifecycleFlags): void {
    if (this._hasSetter) {
      value = this._setter!(value, null);
    }
    if (!Object.is(value, this._value)) {
      this._oldValue = this._value;
      this._value = value;
      this.f = flags;
      this.cb?.call(this._obj, this._value, this._oldValue, flags);
      this.queue.add(this);
    }
  }

  public flush(): void {
    oV = this._oldValue;
    this._oldValue = this._value;
    this.subs.notify(this._value, oV, this.f);
  }
}

subscriberCollection(SetterObserver);
subscriberCollection(SetterNotifier);
withFlushQueue(SetterObserver);
withFlushQueue(SetterNotifier);
