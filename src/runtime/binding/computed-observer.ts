import { IDirtyChecker } from "./dirty-checker";
import { IObserverLocator } from "./observer-locator";
import { SubscriberCollection } from "./subscriber-collection";
import { IAccessor, ISubscribable } from "./observation";
import { ICallable } from "../interfaces";
import { ITaskQueue } from "../task-queue";

const proxySupported = typeof Proxy !== undefined;
const computedContext = 'computed-observer';

class ComputedController {
  private queued = false;
  private dependencies: ISubscribable[] = [];
  private subscriberCount = 0;
  private proxy: any;
  isCollecting = false;

  constructor(
    private instance: any,
    private propertyName: string,
    descriptor: PropertyDescriptor,
    private owner: ComputedObserver, 
    observerLocator: IObserverLocator, 
    private taskQueue: ITaskQueue
  ) {
    this.proxy = new Proxy(instance, createGetterTraps(observerLocator, this));

    Reflect.defineProperty(instance, propertyName, {
      get: descriptor.get.bind(this.proxy)
    });
  }

  addDependency(subscribable: ISubscribable) {
    if (this.dependencies.includes(subscribable)) {
      return;
    }

    this.dependencies.push(subscribable);
  }

  onSubscriberAdded() {
    this.subscriberCount++;

    if (this.subscriberCount > 1) {
      return;
    }
    
    this.getValueAndCollectDependencies();
  }

  getValueAndCollectDependencies() {
    this.queued = false;
    this.unsubscribeAllDependencies();

    this.isCollecting = true;
    let value = this.instance[this.propertyName]; // triggers observer collection
    this.isCollecting = false;

    this.dependencies.forEach(x => x.subscribe(computedContext, this));

    return value;
  }

  onSubscriberRemoved() {
    this.subscriberCount--;

    if (this.subscriberCount === 0) {
      this.unsubscribeAllDependencies();
    }
  }

  private unsubscribeAllDependencies() {
    this.dependencies.forEach(x => x.unsubscribe(computedContext, this));
    this.dependencies.length = 0;
  }

  call() {
    if (!this.queued) {
      this.queued = true;
      this.taskQueue.queueMicroTask(this.owner);
    }
  }
}

export class ComputedObserver extends SubscriberCollection implements IAccessor, ISubscribable, ICallable {
  private currentValue: any;
  private controller: ComputedController;
  
  private constructor(private instance: any, private propertyName: string, private descriptor: PropertyDescriptor, private observerLocator: IObserverLocator, private taskQueue: ITaskQueue) {
    super();

    this.controller = new ComputedController(
      instance, 
      propertyName, 
      descriptor, 
      this, 
      observerLocator, 
      taskQueue
    );       
  }

  static create(observerLocator: IObserverLocator, dirtyChecker: IDirtyChecker, taskQueue: ITaskQueue, instance: any, propertyName: string, descriptor: PropertyDescriptor) {
    if (!proxySupported || descriptor.configurable === false) {
      return dirtyChecker.createProperty(instance, propertyName);
    }

    if (descriptor.get) {
      if (descriptor.set) {
        throw new Error('Getter/Setter wrapper observer not implemented yet.')
      }

      return new ComputedObserver(instance, propertyName, descriptor, observerLocator, taskQueue);
    }
  
    throw new Error('You cannot observer a setter only property.');
  }

  getValue() {
    return this.currentValue;
  }

  setValue(newValue) { }

  call() {
    let oldValue = this.currentValue;
    let newValue = this.controller.getValueAndCollectDependencies();
    
    if (oldValue !== newValue) {
      this.currentValue = newValue;
      this.callSubscribers(newValue, oldValue);
    }
  }

  subscribe(context: string, callable: ICallable) {
    this.addSubscriber(context, callable);
    this.controller.onSubscriberAdded();
  }

  unsubscribe(context: string, callable: ICallable) {
    this.removeSubscriber(context, callable);
    this.controller.onSubscriberRemoved();
  }
}

function createGetterTraps(observerLocator: IObserverLocator, controller: ComputedController) {
  return {
    get: function(instance, key) {
      let value = instance[key];

      if (key === '$observers' || typeof value === 'function' || !controller.isCollecting) {
        return value;
      }

      if (instance instanceof Array) {
        controller.addDependency(observerLocator.getArrayObserver(instance));

        if (key === 'length') {
          controller.addDependency(observerLocator.getArrayObserver(instance).getLengthObserver());
        }
      } else if (instance instanceof Map) {
        controller.addDependency(observerLocator.getMapObserver(instance));

        if (key === 'size') {
          controller.addDependency(this.getMapObserver(instance).getLengthObserver());
        }
      } else if (instance instanceof Set) {
        controller.addDependency(observerLocator.getSetObserver(instance));

        if (key === 'size') {
          return observerLocator.getSetObserver(instance).getLengthObserver();
        }
      } else {
        controller.addDependency(<any>observerLocator.getObserver(instance, key));
      }

      return proxyOrValue(observerLocator, controller, value);
    }
  }
}

function proxyOrValue(observerLocator, controller: ComputedController, value) {
  if (!(value instanceof Object)) {
    return value;
  }

  return new Proxy(value, createGetterTraps(observerLocator, controller));
}
