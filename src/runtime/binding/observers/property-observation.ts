import { SubscriberCollection } from '../subscriber-collection';
import { ITaskQueue } from '../../task-queue';
import { ICallable, IIndexable } from '../../../kernel/interfaces';
import { Reporter } from '../../../kernel/reporter';
import { IAccessor, ISubscribable } from '../observation';
import { PLATFORM } from '../../../kernel/platform';

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
  public doNotCache = true;
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

export class SetterObserver extends SubscriberCollection implements IAccessor, ISubscribable, ICallable {
  private queued = false;
  private observing = false;
  private currentValue: any;
  private oldValue: any;

  constructor(private taskQueue: ITaskQueue, private obj: any, private propertyName: string) {
    super();
  }

  getValue() {
    return this.obj[this.propertyName];
  }

  setValue(newValue: any) {
    this.obj[this.propertyName] = newValue;
  }

  getterValue() {
    return this.currentValue;
  }

  setterValue(newValue: any) {
    let oldValue = this.currentValue;

    if (oldValue !== newValue) {
      this.currentValue = newValue;
      this.oldValue = oldValue;
      this.callSubscribers(newValue, oldValue);
      // if (!this.queued) {
      //   this.oldValue = oldValue;
      //   this.queued = true;
      //   this.taskQueue.queueMicroTask(this);
      // }

      // this.currentValue = newValue;
    }
  }

  call() {
    let oldValue = this.oldValue;
    let newValue = this.currentValue;

    this.queued = false;

    this.callSubscribers(newValue, oldValue);
  }

  subscribe(context: string, callable: ICallable) {
    if (!this.observing) {
      this.convertProperty();
    }

    this.addSubscriber(context, callable);
  }

  unsubscribe(context: string, callable: ICallable) {
    this.removeSubscriber(context, callable);
  }

  convertProperty() {
    this.observing = true;
    this.currentValue = this.obj[this.propertyName];
    this.setValue = this.setterValue;
    this.getValue = this.getterValue;

    if (!Reflect.defineProperty(this.obj, this.propertyName, {
      configurable: true,
      enumerable: this.propertyName in this.obj ? this.obj.propertyIsEnumerable(this.propertyName) : true,
      get: this.getValue.bind(this),
      set: this.setValue.bind(this)
    })) {
      Reporter.write(1, this.propertyName, this.obj);
    }
  }
}

export class Observer<T> extends SubscriberCollection implements IAccessor, ISubscribable, ICallable {
  private queued = false;
  private oldValue: T;

  constructor(private taskQueue: ITaskQueue, private currentValue: T, private selfCallback?: (newValue: T, oldValue: T) => void | T) {
    super();
  }

  getValue(): T {
    return this.currentValue;
  }

  setValue(newValue: T) {
    let oldValue = this.currentValue;

    if (oldValue !== newValue) {
      if (!this.queued) {
        this.oldValue = oldValue;
        this.queued = true;
        this.taskQueue.queueMicroTask(this);
      }

      if (this.selfCallback !== undefined) {
        let coercedValue = this.selfCallback(newValue, oldValue);

        if (coercedValue !== undefined) {
          newValue = <T>coercedValue;
        }
      }

      this.currentValue = newValue;
    }
  }

  call() {
    let oldValue = this.oldValue;
    let newValue = this.currentValue;
    this.queued = false;
    this.callSubscribers(newValue, oldValue);
  }

  subscribe(context: string, callable: ICallable) {
    this.addSubscriber(context, callable);
  }

  unsubscribe(context: string, callable: ICallable) {
    this.removeSubscriber(context, callable);
  }
}
