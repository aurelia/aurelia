import { IIndexable, PLATFORM, Primitive } from '../../kernel';
import { IAccessor, IPropertyObserver, IPropertySubscriber, ISubscribable, LifecycleFlags, MutationKind } from '../observation';
import { propertyObserver } from './property-observer';

const noop = PLATFORM.noop;

// note: string.length is the only property of any primitive that is not a function,
// so we can hardwire it to that and simply return undefined for anything else
// note#2: a modified primitive constructor prototype would not work (and really, it shouldn't..)
export class PrimitiveObserver implements IAccessor, ISubscribable<MutationKind.instance> {
  public getValue: () => undefined | number;
  // removed the error reporter here because technically any primitive property that can get, can also set,
  // but since that never serves any purpose (e.g. setting string.length doesn't throw but doesn't change the length either),
  // we could best just leave this as a no-op and so don't need to store the propertyName
  public setValue: () => void;
  public subscribe: () => void;
  public unsubscribe: () => void;
  public dispose: () => void;

  public doNotCache: boolean = true;
  public obj: Primitive;

  constructor(obj: Primitive, propertyKey: PropertyKey) {
    // we don't need to store propertyName because only 'length' can return a useful value
    if (propertyKey === 'length') {
      // deliberately not checking for typeof string as users probably still want to know via an error that their string is undefined
      this.obj = obj;
      this.getValue = this.getStringLength;
    } else {
      this.getValue = this.returnUndefined;
    }
  }

  private getStringLength(): number {
    return (<string>this.obj).length;
  }
  private returnUndefined(): undefined {
    return undefined;
  }
}
PrimitiveObserver.prototype.setValue = noop;
PrimitiveObserver.prototype.subscribe = noop;
PrimitiveObserver.prototype.unsubscribe = noop;
PrimitiveObserver.prototype.dispose = noop;

export interface SetterObserver extends IPropertyObserver<IIndexable, string> {}

@propertyObserver()
export class SetterObserver implements SetterObserver {
  public subscribe: (subscriber: IPropertySubscriber) => void;
  public unsubscribe: (subscriber: IPropertySubscriber) => void;
  public obj: IIndexable;
  public propertyKey: string;

  constructor(obj: IIndexable, propertyKey: string) {
    this.obj = obj;
    this.propertyKey = propertyKey;
  }

  public getValue(): IIndexable | Primitive {
    return this.currentValue;
  }
  public setValue(newValue: IIndexable | Primitive, flags: LifecycleFlags): void {
    const currentValue = this.currentValue;
    if (currentValue !== newValue) {
      this.currentValue = newValue;
      if (!(flags & LifecycleFlags.fromBind)) {
        this.callSubscribers(newValue, currentValue, flags);
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
}

export interface Observer extends IPropertyObserver<IIndexable, string> {}

@propertyObserver()
export class Observer implements Observer {
  public obj: IIndexable;
  public propertyKey: string;
  public currentValue: IIndexable | Primitive;

  private callback: (newValue: IIndexable | Primitive, oldValue: IIndexable | Primitive) => IIndexable | Primitive;

  constructor(
    instance: object,
    propertyName: string,
    callbackName: string
  ) {
      this.obj = instance;
      this.propertyKey = propertyName;
      this.currentValue = instance[propertyName];
      this.callback = callbackName in instance
        ? instance[callbackName].bind(instance)
        : noop;
  }

  public getValue(): IIndexable | Primitive {
    return this.currentValue;
  }

  public setValue(newValue: IIndexable | Primitive, flags: LifecycleFlags): void {
    const currentValue = this.currentValue;

    if (currentValue !== newValue) {
      this.currentValue = newValue;

      if (!(flags & LifecycleFlags.fromBind)) {
        const coercedValue = this.callback(newValue, currentValue);

        if (coercedValue !== undefined) {
          this.currentValue = newValue = coercedValue;
        }

        this.callSubscribers(newValue, currentValue, flags);
      }
    }
  }
}
