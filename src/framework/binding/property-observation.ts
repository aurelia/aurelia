import { getLogger } from '../logging';
import { SubscriberCollection } from './subscriber-collection';
import { TaskQueue } from '../task-queue';
import { IIndexable, ITaskQueue, ICallable } from './binding-interfaces';

const logger = getLogger('property-observation');

export const propertyAccessor = {
  getValue: (obj: any, propertyName: string) => obj[propertyName],
  setValue: (value: any, obj: IIndexable, propertyName: string) => { obj[propertyName] = value; }
};

export class PrimitiveObserver {
  doNotCache = true;

  constructor(
    private primitive: IIndexable,
    private propertyName: string
  ) {
    this.primitive = primitive;
    this.propertyName = propertyName;
  }

  getValue() {
    return this.primitive[this.propertyName];
  }

  setValue() {
    let type = typeof this.primitive;
    throw new Error(`The ${this.propertyName} property of a ${type} (${this.primitive}) cannot be assigned.`);
  }

  subscribe() {
  }

  unsubscribe() {
  }
}

export class SetterObserver extends SubscriberCollection {
  private queued = false;
  private observing = false;
  private currentValue: any;
  private oldValue: any;

  constructor(
    private taskQueue: ITaskQueue,
    private obj: any,
    private propertyName: string
  ) {
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
      if (!this.queued) {
        this.oldValue = oldValue;
        this.queued = true;
        this.taskQueue.queueMicroTask(this);
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
      enumerable: this.propertyName in this.obj ?
        this.obj.propertyIsEnumerable(this.propertyName) : true,
      get: this.getValue.bind(this),
      set: this.setValue.bind(this)
    })) {
      logger.warn(`Cannot observe property '${this.propertyName}' of object`, this.obj);
    }
  }
}

export class Observer<T> extends SubscriberCollection {
  private queued = false;
  private oldValue: T;

  constructor(
    private currentValue: T,
    private selfCallback?: (newValue: T, oldValue: T) => void | T,
    private taskQueue = TaskQueue.instance
  ) {
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
