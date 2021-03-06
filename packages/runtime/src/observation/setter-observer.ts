import { AccessorType, LifecycleFlags } from '../observation.js';
import { subscriberCollection } from './subscriber-collection.js';
import { def } from '../utilities-objects.js';

import type { IIndexable } from '@aurelia/kernel';
import type {
  IAccessor,
  InterceptorFunc,
  ISubscriber,
  ISubscriberCollection,
} from '../observation.js';
import { FlushQueue, IFlushable, IWithFlushQueue, withFlushQueue } from './flush-queue.js';

export interface SetterObserver extends IAccessor, ISubscriberCollection {}

/**
 * Observer for the mutation of object property value employing getter-setter strategy.
 * This is used for observing object properties that has no decorator.
 */
export class SetterObserver implements IWithFlushQueue, IFlushable {
  public currentValue: unknown = void 0;
  public oldValue: unknown = void 0;

  public observing: boolean = false;
  // todo(bigopon): tweak the flag based on typeof obj (array/set/map/iterator/proxy etc...)
  public type: AccessorType = AccessorType.Observer;
  public readonly queue!: FlushQueue;

  private f: LifecycleFlags = LifecycleFlags.none;

  public constructor(
    public readonly obj: IIndexable,
    public readonly propertyKey: string,
  ) {
  }

  public getValue(): unknown {
    return this.currentValue;
  }

  public setValue(newValue: unknown, flags: LifecycleFlags): void {
    if (this.observing) {
      const currentValue = this.currentValue;
      if (Object.is(newValue, currentValue)) {
        return;
      }
      this.currentValue = newValue;
      this.oldValue = currentValue;
      this.f = flags;
      this.queue.add(this);
      // this.subs.notify(newValue, currentValue, flags);
    } else {
      // If subscribe() has been called, the target property descriptor is replaced by these getter/setter methods,
      // so calling obj[propertyKey] will actually return this.currentValue.
      // However, if subscribe() was not yet called (indicated by !this.observing), the target descriptor
      // is unmodified and we need to explicitly set the property value.
      // This will happen in one-time, to-view and two-way bindings during $bind, meaning that the $bind will not actually update the target value.
      // This wasn't visible in vCurrent due to connect-queue always doing a delayed update, so in many cases it didn't matter whether $bind updated the target or not.
      this.obj[this.propertyKey] = newValue;
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    if (this.observing === false) {
      this.start();
    }

    this.subs.add(subscriber);
  }

  public flush(): void {
    this.subs.notify(this.currentValue, this.oldValue, this.f);
    this.oldValue = this.currentValue;
  }

  public start(): this {
    if (this.observing === false) {
      this.observing = true;
      this.currentValue = this.obj[this.propertyKey];
      def(
        this.obj,
        this.propertyKey,
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
    if (this.observing) {
      def(this.obj, this.propertyKey, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: this.currentValue,
      });
      this.observing = false;
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

  /**
   * @internal
   */
  private v: unknown = void 0;
  /**
   * @internal
   */
  private oV: unknown = void 0;
  /**
   * @internal
   */
  private f: LifecycleFlags = LifecycleFlags.none;
  /**
   * @internal
   */
  private readonly cb?: ChangeHandlerCallback;
  /**
   * @internal
   */
  private readonly obj: object;
  /**
   * @internal
   */
  private readonly s: InterceptorFunc | undefined;

  public constructor(
    obj: object,
    callbackKey: PropertyKey,
    set: InterceptorFunc | undefined,
    initialValue: unknown,
  ) {
    this.obj = obj;
    this.s = set;
    const callback = (obj as IIndexable)[callbackKey as string];
    this.cb = typeof callback === 'function' ? callback as ChangeHandlerCallback : void 0;
    this.v = initialValue;
  }

  public getValue(): unknown {
    return this.v;
  }

  public setValue(value: unknown, flags: LifecycleFlags): void {
    if (typeof this.s === 'function') {
      value = this.s(value);
    }
    if (!Object.is(value, this.v)) {
      this.oV = this.v;
      this.v = value;
      this.cb?.call(this.obj, this.v, this.oV, flags);
      this.queue.add(this);
    }
  }

  public flush(): void {
    this.subs.notify(this.v, this.oV, this.f);
    this.oV = this.v;
  }
}

subscriberCollection(SetterObserver);
subscriberCollection(SetterNotifier);
withFlushQueue(SetterObserver);
withFlushQueue(SetterNotifier);
