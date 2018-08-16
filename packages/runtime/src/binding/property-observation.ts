import { IIndexable, PLATFORM, Primitive } from '@aurelia/kernel';
import { BindingFlags } from './binding-flags';
import { IChangeSet } from './change-set';
import { IAccessor, IBatchedPropertySubscriber, IPropertyObserver, IPropertySubscriber, ISubscribable, MutationKind } from './observation';
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
  public subscribeBatched: () => void;
  public unsubscribeBatched: () => void;

  public doNotCache: boolean = true;
  private obj: Primitive;

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
    return (<any>this.obj).length;
  }
  private returnUndefined(): undefined {
    return undefined;
  }
}
PrimitiveObserver.prototype.setValue = noop;
PrimitiveObserver.prototype.subscribe = noop;
PrimitiveObserver.prototype.unsubscribe = noop;
PrimitiveObserver.prototype.subscribeBatched = noop;
PrimitiveObserver.prototype.unsubscribeBatched = noop;

@propertyObserver()
export class SetterObserver implements IPropertyObserver<IIndexable, string> {
  /*@internal*/
  public changeSet: IChangeSet;
  public notify: (newValue: any, previousValue?: any, flags?: BindingFlags) => void;
  public notifyBatched: (newValue: any, oldValue?: any, flags?: BindingFlags) => void;
  public subscribeBatched: (subscriber: IBatchedPropertySubscriber, flags?: BindingFlags) => void;
  public unsubscribeBatched: (subscriber: IBatchedPropertySubscriber, flags?: BindingFlags) => void;
  public subscribe: (subscriber: IPropertySubscriber, flags?: BindingFlags) => void;
  public unsubscribe: (subscriber: IPropertySubscriber, flags?: BindingFlags) => void;
  public flushChanges: () => void;
  public dispose: () => void;

  public observing: boolean;
  public obj: IIndexable;
  public propertyKey: string;
  public ownPropertyDescriptor: PropertyDescriptor;
  // oldValue is the initial value the property has when observation starts, or after the batched changes are flushed - it will not be updated with each change
  public oldValue?: any;
  // previousValue is literally the previous value of the property, and will be updated with each change
  public previousValue?: any;
  public currentValue: any;
  public hasChanges: boolean;

  public subscribers: Array<IPropertySubscriber>;
  public batchedSubscribers: Array<IBatchedPropertySubscriber>;

  public subscriberFlags: Array<BindingFlags>;
  public batchedSubscriberFlags: Array<BindingFlags>;

  constructor(changeSet: IChangeSet, obj: IIndexable, propertyKey: string) {
    this.changeSet = changeSet;
    this.obj = obj;
    this.propertyKey = propertyKey;

    this.subscribers = new Array();
    this.batchedSubscribers = new Array();

    this.subscriberFlags = new Array();
    this.batchedSubscriberFlags = new Array();
  }

  public getValue(): any {
    return this.currentValue;
  }
  public setValue(newValue: any, flags?: BindingFlags): void {
    const currentValue = this.currentValue;
    if (currentValue !== newValue) {
      this.previousValue = currentValue;
      this.currentValue = newValue;
      if (!(flags & BindingFlags.bindOrigin)) {
        this.notify(newValue, currentValue, flags);
      }
    }
  }
}

@propertyObserver()
export class Observer<T>  implements IPropertyObserver<IIndexable, string> {
  /*@internal*/
  public changeSet: IChangeSet;
  public notify: (newValue: any, previousValue?: any, flags?: BindingFlags) => void;
  public notifyBatched: (newValue: any, oldValue?: any, flags?: BindingFlags) => void;
  public subscribeBatched: (subscriber: IBatchedPropertySubscriber, flags?: BindingFlags) => void;
  public unsubscribeBatched: (subscriber: IBatchedPropertySubscriber, flags?: BindingFlags) => void;
  public subscribe: (subscriber: IPropertySubscriber, flags?: BindingFlags) => void;
  public unsubscribe: (subscriber: IPropertySubscriber, flags?: BindingFlags) => void;
  public flushChanges: (flags?: BindingFlags) => void;
  public dispose: () => void;

  public observing: boolean;
  public obj: IIndexable;
  public propertyKey: string;
  public ownPropertyDescriptor: PropertyDescriptor;
  // oldValue is the initial value the property has when observation starts, or after the batched changes are flushed - it will not be updated with each change
  public oldValue?: any;
  // previousValue is literally the previous value of the property, and will be updated with each change
  public previousValue?: any;
  public currentValue: any;
  public hasChanges: boolean;

  public subscribers: Array<IPropertySubscriber>;
  public batchedSubscribers: Array<IBatchedPropertySubscriber>;

  public subscriberFlags: Array<BindingFlags>;
  public batchedSubscriberFlags: Array<BindingFlags>;

  constructor(
    changeSet: IChangeSet,
    currentValue: T,
    private selfCallback?: (newValue: T, oldValue: T) => void | T
  ) {
      this.changeSet = changeSet;
      this.currentValue = currentValue;

      this.subscribers = new Array();
      this.batchedSubscribers = new Array();

      this.subscriberFlags = new Array();
      this.batchedSubscriberFlags = new Array();
  }

  public getValue(): any {
    return this.currentValue;
  }

  public setValue(newValue: T, flags?: BindingFlags): void {
    const previousValue = this.currentValue;

    if (previousValue !== newValue) {
      this.previousValue = previousValue;
      this.currentValue = newValue;

      if (!(flags & BindingFlags.bindOrigin)) {
        if (this.selfCallback !== undefined) {
          const coercedValue = this.selfCallback(newValue, previousValue);

          if (coercedValue !== undefined) {
            this.currentValue = newValue = <T>coercedValue;
          }
        }

        this.notify(newValue, previousValue);
      }
    }
  }
}
