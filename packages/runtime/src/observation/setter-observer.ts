import { AccessorType, LifecycleFlags } from '../observation.js';
import { subscriberCollection } from './subscriber-collection.js';
import { def } from '../utilities-objects.js';

import type { IIndexable } from '@aurelia/kernel';
import type { IAccessor, IObserver, InterceptorFunc, ISubscriber, ISubscribable, ISubscriberCollection } from '../observation.js';

export interface SetterObserver extends IObserver, ISubscriberCollection {}

/**
 * Observer for the mutation of object property value employing getter-setter strategy.
 * This is used for observing object properties that has no decorator.
 */
export class SetterObserver {
  public currentValue: unknown = void 0;
  public oldValue: unknown = void 0;

  public inBatch: boolean = false;
  public observing: boolean = false;
  // todo(bigopon): tweak the flag based on typeof obj (array/set/map/iterator/proxy etc...)
  public type: AccessorType = AccessorType.Observer;

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
      this.currentValue = newValue;
      this.subs.notify(newValue, currentValue, flags);
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

export interface SetterNotifier extends ISubscriberCollection {}

export class SetterNotifier implements IAccessor, ISubscribable {
  // ideally, everything is an object,
  // probably this flag is redundant, just None?
  public type: AccessorType = AccessorType.Observer;

  /**
   * @internal
   */
  public v: unknown = void 0;

  // todo(bigopon): remove flag aware assignment in ast, move to the decorator itself
  public constructor(
    private readonly s?: InterceptorFunc
  ) {}

  public getValue(): unknown {
    return this.v;
  }

  public setValue(value: unknown, flags: LifecycleFlags): void {
    if (typeof this.s === 'function') {
      value = this.s(value);
    }
    const oldValue = this.v;
    if (!Object.is(value, oldValue)) {
      this.v = value;
      this.subs.notify(value, oldValue, flags);
    }
  }
}

subscriberCollection(SetterObserver);
subscriberCollection(SetterNotifier);
