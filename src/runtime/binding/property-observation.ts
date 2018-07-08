import { SubscriberCollection } from './subscriber-collection';
import { ITaskQueue } from '../task-queue';
import { ICallable, IIndexable } from '../../kernel/interfaces';
import { Reporter } from '../../kernel/reporter';
import { IAccessor, ISubscribable } from './observation';

export const propertyAccessor = {
  getValue: (obj: any, propertyName: string) => obj[propertyName],
  setValue: (value: any, obj: IIndexable, propertyName: string) => { obj[propertyName] = value; }
};

export class PrimitiveObserver implements IAccessor, ISubscribable {
  doNotCache = true;

  constructor(private primitive: IIndexable, private propertyName: string) {
    this.primitive = primitive;
    this.propertyName = propertyName;
  }

  getValue() {
    return this.primitive[this.propertyName];
  }

  setValue() {
    throw Reporter.error(14, `${typeof this.primitive}#${this.propertyName}`);
  }

  subscribe() { }
  unsubscribe() { }
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
