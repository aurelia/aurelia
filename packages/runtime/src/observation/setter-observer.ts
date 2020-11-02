import { IIndexable, ITask } from '@aurelia/kernel';
import { IPropertyObserver, ISubscriber, AccessorType, ISubscribable, IAccessor, ISubscriberCollection, LifecycleFlags } from '../observation';
import { subscriberCollection } from './subscriber-collection';
import { InterceptorFunc } from '../bindable';

const $is = Object.is;

export interface SetterObserver extends IPropertyObserver<IIndexable, string> {}

/**
 * Observer for the mutation of object property value employing getter-setter strategy.
 * This is used for observing object properties that has no decorator.
 */
@subscriberCollection()
export class SetterObserver {
  public currentValue: unknown = void 0;
  public oldValue: unknown = void 0;

  public readonly persistentFlags: LifecycleFlags;
  public inBatch: boolean = false;
  public observing: boolean = false;
  // todo(bigopon): tweak the flag based on typeof obj (array/set/map/iterator/proxy etc...)
  public type: AccessorType = AccessorType.Obj;

  public constructor(
    flags: LifecycleFlags,
    public readonly obj: IIndexable,
    public readonly propertyKey: string,
  ) {
    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;
  }

  public getValue(): unknown {
    return this.currentValue;
  }

  public setValue(newValue: unknown, flags: LifecycleFlags): void {
    if (this.observing) {
      const currentValue = this.currentValue;
      this.currentValue = newValue;
      this.callSubscribers(newValue, currentValue, this.persistentFlags | flags);
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

  public flushBatch(flags: LifecycleFlags): void {
    this.inBatch = false;
    const currentValue = this.currentValue;
    const oldValue = this.oldValue;
    this.oldValue = currentValue;
    this.callSubscribers(currentValue, oldValue, this.persistentFlags | flags);
  }

  public subscribe(subscriber: ISubscriber): void {
    if (this.observing === false) {
      this.start();
    }

    this.addSubscriber(subscriber);
  }

  public start(): this {
    if (this.observing === false) {
      this.observing = true;
      this.currentValue = this.obj[this.propertyKey];
      Reflect.defineProperty(
        this.obj,
        this.propertyKey,
        {
          enumerable: true,
          configurable: true,
          get: () => {
            return this.getValue();
          },
          set: value => {
            this.setValue(value, LifecycleFlags.none);
          },
        }
      );
    }
    return this;
  }

  public stop(): this {
    if (this.observing) {
      Reflect.defineProperty(this.obj, this.propertyKey, {
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
@subscriberCollection()
export class SetterNotifier implements IAccessor, ISubscribable {
  // ideally, everything is an object,
  // probably this flag is redundant, just None?
  public type: AccessorType = AccessorType.Obj;

  /**
   * @internal
   */
  public v: unknown = void 0;

  public readonly persistentFlags: LifecycleFlags = LifecycleFlags.none;

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
    if (!$is(value, oldValue)) {
      this.v = value;
      this.callSubscribers(value, oldValue, flags);
    }
  }
}
