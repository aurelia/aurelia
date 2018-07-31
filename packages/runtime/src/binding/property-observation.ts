import { SubscriberCollection } from './subscriber-collection';
import { ITaskQueue } from '../task-queue';
import { ICallable, IIndexable } from '@aurelia/kernel';
import { Reporter } from '@aurelia/kernel';
import { IAccessor, ISubscribable } from './observation';

export const propertyAccessor = {
  getValue: (obj: any, propertyName: string) => obj[propertyName],
  setValue: (value: any, obj: IIndexable, propertyName: string) => { obj[propertyName] = value; }
};

export class PrimitiveObserver implements IAccessor, ISubscribable {
  public doNotCache = true;

  constructor(private primitive: IIndexable, private propertyName: string) {
    this.primitive = primitive;
    this.propertyName = propertyName;
  }

  public getValue() {
    return this.primitive[this.propertyName];
  }

  public setValue() {
    throw Reporter.error(14, `${typeof this.primitive}#${this.propertyName}`);
  }

  public subscribe() { }
  public unsubscribe() { }
}

export class SetterObserver extends SubscriberCollection implements IAccessor, ISubscribable, ICallable {
  private queued = false;
  private observing = false;
  private currentValue: any;
  private oldValue: any;

  constructor(private taskQueue: ITaskQueue, private obj: any, private propertyName: string) {
    super();
  }

  public getValue() {
    return this.obj[this.propertyName];
  }

  public setValue(newValue: any) {
    this.obj[this.propertyName] = newValue;
  }

  public getterValue() {
    return this.currentValue;
  }

  public setterValue(newValue: any) {
    let oldValue = this.currentValue;

    if (oldValue !== newValue) {
      if (!this.queued) {
        this.oldValue = oldValue;
        this.queued = true;
        this.taskQueue.queueMicroTask(this);
      }

      this.currentValue = newValue;
    }
  }

  public call() {
    let oldValue = this.oldValue;
    let newValue = this.currentValue;

    this.queued = false;

    this.callSubscribers(newValue, oldValue);
  }

  public subscribe(context: string, callable: ICallable) {
    if (!this.observing) {
      this.convertProperty();
    }

    this.addSubscriber(context, callable);
  }

  public unsubscribe(context: string, callable: ICallable) {
    this.removeSubscriber(context, callable);
  }

  public convertProperty() {
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

  public getValue(): T {
    return this.currentValue;
  }

  public setValue(newValue: T) {
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

  public call() {
    let oldValue = this.oldValue;
    let newValue = this.currentValue;
    this.queued = false;
    this.callSubscribers(newValue, oldValue);
  }

  public subscribe(context: string, callable: ICallable) {
    this.addSubscriber(context, callable);
  }

  public unsubscribe(context: string, callable: ICallable) {
    this.removeSubscriber(context, callable);
  }
}
