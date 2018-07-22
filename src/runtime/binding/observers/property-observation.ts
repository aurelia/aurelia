import { SubscriberCollection } from '../subscriber-collection';
import { ITaskQueue } from '../../task-queue';
import { ICallable, IIndexable } from '../../../kernel/interfaces';
import { IAccessor, ISubscribable, IPropertyObserver, IImmediatePropertySubscriber, IBatchedPropertySubscriber } from '../observation';
import { PLATFORM } from '../../../kernel/platform';
import { propertyObserver } from './property-observer';

const noop = PLATFORM.noop;

export const propertyAccessor = {
  getValue: (obj: any, propertyName: string) => obj[propertyName],
  setValue: (value: any, obj: IIndexable, propertyName: string) => { obj[propertyName] = value; }
};

export type Primitive = undefined | null | number | boolean | symbol | string;

// note: string.length is the only property of any primitive that is not a function,
// so we can hardwire it to that and simply return undefined for anything else
// note#2: a modified primitive constructor prototype would not work (and really, it shouldn't..)
export class PrimitiveObserver implements IAccessor, ISubscribable {
  public doNotCache: boolean = true;
  private primitive: Primitive;

  constructor(primitive: Primitive, propertyName: PropertyKey) {
    // we don't need to store propertyName because only 'length' can return a useful value
    if (propertyName === 'length') {
      // deliberately not checking for typeof string as users probably still want to know via an error that their string is undefined
      this.primitive = primitive;
      this.getValue = this.getStringLength;
    } else {
      this.getValue = this.returnUndefined;
    }
  }

  public getValue: () => undefined | number;
  private getStringLength(): number {
    return (<any>this.primitive).length;
  }
  private returnUndefined(): undefined {
    return undefined;
  }

  // removed the error reporter here because technically any primitive property that can get, can also set,
  // but since that never serves any purpose (e.g. setting string.length doesn't throw but doesn't change the length either),
  // we could best just leave this as a no-op and so don't need to store the propertyName
  public setValue: () => void = noop;
  public subscribe: () => void = noop;
  public unsubscribe: () => void = noop;
}


@propertyObserver()
export class SetterObserver implements IPropertyObserver<IIndexable, string> {
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

  public immediateSubscriber0: IImmediatePropertySubscriber;
  public immediateSubscriber1: IImmediatePropertySubscriber;
  public immediateSubscribers: Array<IImmediatePropertySubscriber>;
  public immediateSubscriberCount: number;
  public batchedSubscriber0: IBatchedPropertySubscriber;
  public batchedSubscriber1: IBatchedPropertySubscriber;
  public batchedSubscribers: Array<IBatchedPropertySubscriber>;
  public batchedSubscriberCount: number;

  constructor(obj: IIndexable, propertyKey: string) {
    this.obj = obj;
    this.propertyKey = propertyKey;

    this.immediateSubscribers = new Array();
    this.batchedSubscribers = new Array();
  }

  public getValue: () => any;
  public setValue: (newValue: any) => void;

  public notifyImmediate: (newValue: any, previousValue?: any) => void;
  public notifyBatched: (newValue: any, oldValue?: any) => void;
  public subscribeBatched: (subscriber: IBatchedPropertySubscriber) => void;
  public unsubscribeBatched: (subscriber: IBatchedPropertySubscriber) => void;
  public subscribeImmediate: (subscriber: IImmediatePropertySubscriber) => void;
  public unsubscribeImmediate: (subscriber: IImmediatePropertySubscriber) => void;
  public flushChanges: () => void;
  public dispose: () => void;
}

export class Observer<T> extends SubscriberCollection implements IAccessor, ISubscribable, ICallable {
  private queued: boolean = false;
  private oldValue: T;

  constructor(
    private taskQueue: ITaskQueue,
    private currentValue: T,
    private selfCallback?: (newValue: T, oldValue: T) => void | T) {
    super();
  }

  public getValue(): T {
    return this.currentValue;
  }

  public setValue(newValue: T): void {
    const oldValue = this.currentValue;

    if (oldValue !== newValue) {
      if (!this.queued) {
        this.oldValue = oldValue;
        this.queued = true;
        this.taskQueue.queueMicroTask(this);
      }

      if (this.selfCallback !== undefined) {
        const coercedValue = this.selfCallback(newValue, oldValue);

        if (coercedValue !== undefined) {
          newValue = <T>coercedValue;
        }
      }

      this.currentValue = newValue;
    }
  }

  public call(): void {
    const oldValue = this.oldValue;
    const newValue = this.currentValue;
    this.queued = false;
    this.callSubscribers(newValue, oldValue);
  }

  public subscribe(context: string, callable: ICallable): void {
    this.addSubscriber(context, callable);
  }

  public unsubscribe(context: string, callable: ICallable): void {
    this.removeSubscriber(context, callable);
  }
}
