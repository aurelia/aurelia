import { nativePush, nativeSplice } from './array-observer';
import { BindingFlags } from './binding-flags';
import { IPropertySubscriber, PropertyObserver } from './observation';
import { Reporter } from '@aurelia/kernel';

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

function notify(this: PropertyObserver, newValue: any, previousValue: any, flags: BindingFlags): void {
  const subscribers = this.subscribers;
  for (let i = 0, ii = subscribers.length; i < ii; ++i) {
    subscribers[i].handleChange(newValue, previousValue, flags);
  }
}

function subscribe(this: PropertyObserver, subscriber: IPropertySubscriber): void {
  if (this.observing === false) {
    this.observing = true;
    // tslint:disable-next-line:no-this-assignment
    const { obj, propertyKey } = this;
    this.currentValue = obj[propertyKey];
    observedPropertyDescriptor.get = () => this.getValue();
    observedPropertyDescriptor.set = value => this.setValue(value, BindingFlags.updateTargetInstance);
    if (!defineProperty(obj, propertyKey, observedPropertyDescriptor)) {
      Reporter.write(1, propertyKey, obj);
    }
    this.subscribe = subscribe;
  }
  nativePush.call(this.subscribers, subscriber);
}

function unsubscribe(this: PropertyObserver, subscriber: IPropertySubscriber): void {
  const subscribers = this.subscribers;
  for (let i = 0, ii = subscribers.length; i < ii; ++i) {
    if (subscribers[i] === subscriber) {
      nativeSplice.call(subscribers, i, 1);
      return;
    }
  }
}

function dispose(this: PropertyObserver): void {
  delete this.obj[this.propertyKey];
  this.obj = null;
  this.propertyKey = null;
  this.currentValue = null;

  this.subscribers = null;
}

export function propertyObserver(): ClassDecorator {
  return function(target: Function): void {
    const proto = <PropertyObserver>target.prototype;

    proto.observing = false;
    proto.obj = null;
    proto.propertyKey = null;
    proto.currentValue = null;

    proto.subscribers = null;

    proto.notify = proto.notify || notify;
    proto.subscribe = proto.subscribe || subscribe;
    proto.unsubscribe = proto.unsubscribe || unsubscribe;

    proto.dispose = proto.dispose || dispose;
  }
}
