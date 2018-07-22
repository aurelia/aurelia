import { PLATFORM } from '../../../kernel/platform';
import { IDisposable } from "../../../kernel/interfaces";
import { Reporter } from '../../../kernel/reporter';

const $null = PLATFORM.$null;

export interface IImmediatePropertySubscriber {
  (newValue: any, oldValue?: any): void;
}

export interface IBatchedPropertySubscriber {
  (newValue: any, oldValue?: any): void;
}

export interface IImmediatePropertySubscriberCollection {
  immediateSubscriber0: IImmediatePropertySubscriber;
  immediateSubscriber1: IImmediatePropertySubscriber;
  immediateSubscribers: Array<IImmediatePropertySubscriber>;
  immediateSubscriberCount: number;
  notifyImmediate(newValue: any, previousValue?: any): void;
  subscribeImmediate(subscriber: IImmediatePropertySubscriber): void;
  unsubscribeImmediate(subscriber: IImmediatePropertySubscriber): void;
}

export interface IBatchedPropertySubscriberCollection {
  batchedSubscriber0: IBatchedPropertySubscriber;
  batchedSubscriber1: IBatchedPropertySubscriber;
  batchedSubscribers: Array<IBatchedPropertySubscriber>;
  batchedSubscriberCount: number;
  notifyBatched(newValue: any, oldValue?: any): void;
  subscribeBatched(subscriber: IBatchedPropertySubscriber): void;
  unsubscribeBatched(subscriber: IBatchedPropertySubscriber): void;
}

export interface IPropertyObserver<TObj extends Object, TProp extends keyof TObj> extends IDisposable, IImmediatePropertySubscriberCollection, IBatchedPropertySubscriberCollection {
  observing: boolean;
  obj: TObj;
  propertyKey: TProp;
  ownPropertyDescriptor: PropertyDescriptor;
  oldValue?: any;
  previousValue?: any;
  currentValue: any;
  hasChanges: boolean;
  flushChanges(): void;
  getValue(): any;
  setValue(newValue: any): void;
}

export type PropertyObserver = IPropertyObserver<any, PropertyKey>;

function getValue(this: PropertyObserver): any {
  return this.currentValue;
}

function setValue(this: PropertyObserver, newValue: any): void {
  const currentValue = this.currentValue;
  if (currentValue !== newValue) {
    this.previousValue = currentValue;
    this.currentValue = newValue;
    this.notifyImmediate(newValue, currentValue);
  }
}

const getOwnPropertyDescriptor = Reflect.getOwnPropertyDescriptor;
const defineProperty = Reflect.defineProperty;
// note: we're reusing the same object for setting all descriptors, just changing some properties as needed
//   this works, because the properties are copied by defineProperty (so changing them afterwards doesn't affect existing descriptors)
// see also: https://tc39.github.io/ecma262/#sec-topropertydescriptor
const observedPropertyDescriptor: PropertyDescriptor = {
  get: undefined,
  set: undefined,
  enumerable: true,
  configurable: true
};


function startObserving(observer: PropertyObserver, obj: any, propertyKey: PropertyKey): void {
  observer.currentValue = obj[propertyKey];
  const ownPropertyDescriptor = observer.ownPropertyDescriptor = getOwnPropertyDescriptor(obj, propertyKey);
  observedPropertyDescriptor.get = getValue.bind(observer);
  observedPropertyDescriptor.set = setValue.bind(observer);
  observedPropertyDescriptor.enumerable = ownPropertyDescriptor === undefined || ownPropertyDescriptor.enumerable;
  if (!defineProperty(obj, propertyKey, observedPropertyDescriptor)) {
    Reporter.write(1, propertyKey, obj);
  }
  observer.observing = true;
}

function notifyImmediate(this: PropertyObserver, newValue: any, previousValue?: any): void {
  this.hasChanges = newValue !== this.oldValue;
  const count = this.immediateSubscriberCount;
  switch(count) {
    case 0:
      return;
    case 1:
      this.immediateSubscriber0(newValue, previousValue);
      return;
    case 2:
      this.immediateSubscriber0(newValue, previousValue);
      this.immediateSubscriber1(newValue, previousValue);
      return;
    default:
      this.immediateSubscriber0(newValue, previousValue);
      this.immediateSubscriber1(newValue, previousValue);
      const immediateSubscribers = this.immediateSubscribers;
      const len = count - 2;
      let i = 0;
      while (i < len) {
        immediateSubscribers[i](newValue, previousValue);
        i++;
      }
  }
}

function subscribeImmediate(this: PropertyObserver, subscriber: IImmediatePropertySubscriber): void {
  switch (this.immediateSubscriberCount) {
    case 0:
      this.immediateSubscriber0 = subscriber;
      if (!this.observing) {
        startObserving(this, this.obj, this.propertyKey);
      }
      break;
    case 1:
      this.immediateSubscriber1 = subscriber;
      break;
    default:
      this.immediateSubscribers.push(subscriber);
      break;
  }
  this.immediateSubscriberCount++;
}

function unsubscribeImmediate(this: PropertyObserver, subscriber: IImmediatePropertySubscriber): void {
  if (subscriber === this.immediateSubscriber0) {
    this.immediateSubscriber0 = this.immediateSubscriber1;
    this.immediateSubscriber1 = this.immediateSubscribers.shift();
  } else if (subscriber === this.immediateSubscriber1) {
    this.immediateSubscriber1 = this.immediateSubscribers.shift();
  } else {
    const i = this.immediateSubscribers.indexOf(subscriber);
    if (i > -1) {
      this.immediateSubscribers.splice(i, 1);
    }
  }
  this.immediateSubscriberCount--;
}


function notifyBatched(this: PropertyObserver, newValue: any, oldValue?: any): void {
  const count = this.batchedSubscriberCount;
  switch(count) {
    case 0:
      return;
    case 1:
      this.batchedSubscriber0(newValue, oldValue);
      return;
    case 2:
      this.batchedSubscriber0(newValue, oldValue);
      this.batchedSubscriber1(newValue, oldValue);
      return;
    default:
      this.batchedSubscriber0(newValue, oldValue);
      this.batchedSubscriber1(newValue, oldValue);
      const len = count - 2;
      let i = 0;
      while (i < len) {
        this.batchedSubscribers[i](newValue, oldValue);
        i++;
      }
  }
}

function subscribeBatched(this: PropertyObserver, subscriber: IBatchedPropertySubscriber): void {
  switch (this.batchedSubscriberCount) {
    case 0:
      this.batchedSubscriber0 = subscriber;
      if (!this.observing) {
        startObserving(this, this.obj, this.propertyKey);
      }
      break;
    case 1:
      this.batchedSubscriber1 = subscriber;
      break;
    default:
      this.batchedSubscribers.push(subscriber);
      break;
  }
  this.batchedSubscriberCount++;
}

function unsubscribeBatched(this: PropertyObserver, subscriber: IBatchedPropertySubscriber): void {
  if (subscriber === this.batchedSubscriber0) {
    this.batchedSubscriber0 = this.batchedSubscriber1;
    this.batchedSubscriber1 = this.batchedSubscribers.shift();
  } else if (subscriber === this.batchedSubscriber1) {
    this.batchedSubscriber1 = this.batchedSubscribers.shift();
  } else {
    const i = this.batchedSubscribers.indexOf(subscriber);
    if (i > -1) {
      this.batchedSubscribers.splice(i, 1);
    }
  }
  this.batchedSubscriberCount--;
}

function flushChanges(this: PropertyObserver): void {
  if (this.hasChanges) {
    this.hasChanges = false;
    this.notifyBatched(this.oldValue, this.currentValue);
    this.oldValue = this.previousValue = this.currentValue;
  }
}

function dispose(this: PropertyObserver): void {
  const ownPropertyDescriptor = this.ownPropertyDescriptor;
  // restore the property state to what it was before being observed
  if (ownPropertyDescriptor === undefined) {
    delete this.obj[this.propertyKey];
  } else {
    defineProperty(this.obj, this.propertyKey, ownPropertyDescriptor);
  }
  this.obj = $null;
  this.propertyKey = $null;
  this.oldValue = $null;
  this.previousValue = $null;
  this.currentValue = $null;
  this.hasChanges = false;

  this.immediateSubscriber0 = $null;
  this.immediateSubscriber1 = $null;
  this.immediateSubscribers = $null;
  this.immediateSubscriberCount = 0;

  this.batchedSubscriber0 = $null;
  this.batchedSubscriber1 = $null;
  this.batchedSubscribers = $null;
  this.batchedSubscriberCount = 0;
}

export function propertyObserver(): ClassDecorator {
  return function(target: Function): void {
    const proto = <PropertyObserver>target.prototype;

    proto.observing = false;
    proto.obj = $null;
    proto.propertyKey = $null;
    proto.ownPropertyDescriptor = $null;
    proto.oldValue = $null;
    proto.previousValue = $null;
    proto.currentValue = $null;
    proto.hasChanges = false;

    proto.getValue = getValue;
    proto.setValue = setValue;

    proto.immediateSubscriber0 = $null;
    proto.immediateSubscriber1 = $null;
    proto.immediateSubscribers = $null;
    proto.immediateSubscriberCount = 0;

    proto.batchedSubscriber0 = $null;
    proto.batchedSubscriber1 = $null;
    proto.batchedSubscribers = $null;
    proto.batchedSubscriberCount = 0;

    proto.notifyImmediate = notifyImmediate;
    proto.subscribeImmediate = subscribeImmediate;
    proto.unsubscribeImmediate = unsubscribeImmediate;

    proto.notifyBatched = notifyBatched;
    proto.subscribeBatched = subscribeBatched;
    proto.unsubscribeBatched = unsubscribeBatched;

    proto.flushChanges = flushChanges;
    proto.dispose = dispose;
  }
}
