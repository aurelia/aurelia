import { IIndexable, Reporter, Tracer } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { IPropertyObserver, ISubscriber } from '../observation';
import { subscriberCollection } from './subscriber-collection';

const slice = Array.prototype.slice;

export interface SetterObserver extends IPropertyObserver<IIndexable, string> {}

@subscriberCollection()
export class SetterObserver {
  public observing: boolean;
  public readonly persistentFlags: LifecycleFlags;
  public obj: IIndexable;
  public propertyKey: string;
  public currentValue: unknown;

  constructor(flags: LifecycleFlags, obj: IIndexable, propertyKey: string) {
    if (Tracer.enabled) { Tracer.enter('SetterObserver', 'constructor', slice.call(arguments)); }

    this.observing = false;
    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;
    this.obj = obj;
    this.propertyKey = propertyKey;
    this.currentValue = void 0;

    if (Tracer.enabled) { Tracer.leave(); }
  }

  public getValue(): unknown {
    return this.currentValue;
  }
  public setValue(newValue: unknown, flags: LifecycleFlags): void {
    const currentValue = this.currentValue;
    if (currentValue !== newValue) {
      this.currentValue = newValue;
      if ((flags & LifecycleFlags.fromBind) === 0) {
        this.callSubscribers(newValue, currentValue, this.persistentFlags | flags);
      }
      // If subscribe() has been called, the target property descriptor is replaced by these getter/setter methods,
      // so calling obj[propertyKey] will actually return this.currentValue.
      // However, if subscribe() was not yet called (indicated by !this.observing), the target descriptor
      // is unmodified and we need to explicitly set the property value.
      // This will happen in one-time, to-view and two-way bindings during $bind, meaning that the $bind will not actually update the target value.
      // This wasn't visible in vCurrent due to connect-queue always doing a delayed update, so in many cases it didn't matter whether $bind updated the target or not.
      if (!this.observing) {
        this.obj[this.propertyKey] = newValue;
      }
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    if (this.observing === false) {
      this.observing = true;
      this.currentValue = this.obj[this.propertyKey];
      if (
        !Reflect.defineProperty(
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
        )
      ) {
        Reporter.write(1, this.propertyKey, this.obj);
      }
    }

    this.addSubscriber(subscriber);
  }
}
