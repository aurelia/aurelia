import { Reporter } from '@aurelia/kernel';
import { BindingFlags } from './binding-flags';
import { IPropertySubscriber, PropertyObserver, MutationKind } from './observation';
import { subscriberCollection } from './subscriber-collection';

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
  }
  this.addSubscriber(subscriber);
}

function dispose(this: PropertyObserver): void {
  delete this.obj[this.propertyKey];
  this.obj = null;
  this.propertyKey = null;
  this.currentValue = null;
}

export function propertyObserver(): ClassDecorator {
  return function(target: Function): void {
    subscriberCollection(MutationKind.instance)(target);
    const proto = <PropertyObserver>target.prototype;

    proto.observing = false;
    proto.obj = null;
    proto.propertyKey = null;
    proto.currentValue = null;

    proto.subscribe = proto.subscribe || subscribe;
    proto.unsubscribe = proto.unsubscribe || proto.removeSubscriber;

    proto.dispose = proto.dispose || dispose;
  }
}
