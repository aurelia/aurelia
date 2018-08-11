import { Reporter } from '@aurelia/kernel';
import { BindingFlags } from './binding-flags';
import { IBatchedPropertySubscriber, IPropertySubscriber, PropertyObserver } from './observation';

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
  observedPropertyDescriptor.get = observer.getValue.bind(observer);
  observedPropertyDescriptor.set = observer.setValue.bind(observer);
  observedPropertyDescriptor.enumerable = ownPropertyDescriptor === undefined || ownPropertyDescriptor.enumerable;
  if (!defineProperty(obj, propertyKey, observedPropertyDescriptor)) {
    Reporter.write(1, propertyKey, obj);
  }
  observer.observing = true;
}

function notify(this: PropertyObserver, newValue: any, previousValue?: any, flags?: BindingFlags): void {
  this.hasChanges = newValue !== this.oldValue;
  const subscribers = this.subscribers;
  const subscriberFlags = this.subscriberFlags;
  const len = subscribers.length;
  let i = 0;
  while (i < len) {
    subscribers[i].handleChange(newValue, previousValue, flags | subscriberFlags[i]);
    i++;
  }
  this.changeSet.add(this);
}

function observeAndSubscribe(this: PropertyObserver, subscriber: IPropertySubscriber, flags?: BindingFlags): void {
  if (!this.observing) {
    startObserving(this, this.obj, this.propertyKey);
    this.subscribe = subscribe;
  }
  this.subscribers.push(subscriber);
  this.subscriberFlags.push(flags);
}

function subscribe(this: PropertyObserver, subscriber: IPropertySubscriber, flags?: BindingFlags): void {
  this.subscribers.push(subscriber);
  this.subscriberFlags.push(flags);
}

function unsubscribe(this: PropertyObserver, subscriber: IPropertySubscriber, flags?: BindingFlags): void {
  const subscribers = this.subscribers;
  const len = subscribers.length;
  let i = 0;
  while (i < len) {
    if (subscribers[i] === subscriber) {
      subscribers.splice(i, 1);
      this.subscriberFlags.splice(i, 1);
      break;
    }
    i++;
  }
}

function notifyBatched(this: PropertyObserver, newValue: any, oldValue?: any, flags?: BindingFlags): void {
  const subscribers = this.batchedSubscribers;
  const len = subscribers.length;
  let i = 0;
  while (i < len) {
    subscribers[i].handleBatchedChange(newValue, oldValue, flags);
    i++;
  }
}

function subscribeBatched(this: PropertyObserver, subscriber: IBatchedPropertySubscriber, flags?: BindingFlags): void {
  this.batchedSubscribers.push(subscriber);
  this.batchedSubscriberFlags.push(flags);
}

function unsubscribeBatched(this: PropertyObserver, subscriber: IBatchedPropertySubscriber, flags?: BindingFlags): void {
  const subscribers = this.batchedSubscribers;
  const len = subscribers.length;
  let i = 0;
  while (i < len) {
    if (subscribers[i] === subscriber) {
      subscribers.splice(i, 1);
      this.batchedSubscriberFlags.splice(i, 1);
      break;
    }
    i++;
  }
}

function flushChanges(this: PropertyObserver, flags?: BindingFlags): void {
  if (this.hasChanges) {
    this.hasChanges = false;
    this.notifyBatched(this.oldValue, this.currentValue, flags);
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
  this.obj = null;
  this.propertyKey = null;
  this.oldValue = null;
  this.previousValue = null;
  this.currentValue = null;
  this.hasChanges = false;

  this.subscribers = null;
  this.batchedSubscribers = null;
}

export function propertyObserver(): ClassDecorator {
  return function(target: Function): void {
    const proto = <PropertyObserver>target.prototype;

    proto.observing = false;
    proto.obj = null;
    proto.propertyKey = null;
    proto.ownPropertyDescriptor = null;
    proto.oldValue = null;
    proto.previousValue = null;
    proto.currentValue = null;
    proto.hasChanges = false;

    proto.subscribers = null;
    proto.batchedSubscribers = null;

    proto.subscriberFlags = null;
    proto.batchedSubscriberFlags = null;

    proto.notify = proto.notify || notify;
    proto.subscribe = proto.subscribe || observeAndSubscribe;
    proto.unsubscribe = proto.unsubscribe || unsubscribe;

    proto.notifyBatched = proto.notifyBatched || notifyBatched;
    proto.subscribeBatched = proto.subscribeBatched || subscribeBatched;
    proto.unsubscribeBatched = proto.unsubscribeBatched || unsubscribeBatched;

    proto.flushChanges = proto.flushChanges || flushChanges;
    proto.dispose = proto.dispose || dispose;
  }
}
