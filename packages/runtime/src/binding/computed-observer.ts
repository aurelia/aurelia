import { Reporter } from '@aurelia/kernel';
import { BindingFlags } from './binding-flags';
import { IChangeSet } from './change-set';
import { IDirtyChecker } from './dirty-checker';
import { IAccessor, IChangeTracker, IPropertySubscriber, ISubscribable, ISubscriberCollection, MutationKind } from './observation';
import { IObserverLocator } from './observer-locator';
import { subscriberCollection } from './subscriber-collection';

// tslint:disable-next-line:interface-name
export interface ComputedOverrides {
  // Indicates that a getter doesn't need to re-calculate its dependencies after the first observation.
  static?: boolean;

  // Indicates that the getter of a getter/setter pair can change its value based on side-effects outside the setter.
  volatile?: boolean;
}

export function computed(config: ComputedOverrides) {
  return function(target, key, descriptor) {
    let computed = target.computed || (target.computed = {});
    computed[key] = config;
  };
}

const noProxy = !(typeof Proxy !== undefined);
const computedOverrideDefaults: ComputedOverrides = { static: false, volatile: false };

/* @internal */
export function createComputedObserver(observerLocator: IObserverLocator, dirtyChecker: IDirtyChecker, changeSet: IChangeSet, instance: any, propertyName: string, descriptor: PropertyDescriptor) {
  if (descriptor.configurable === false) {
    return dirtyChecker.createProperty(instance, propertyName);
  }

  if (descriptor.get) {
    const overrides: ComputedOverrides = instance.constructor.computed
      ? instance.constructor.computed[propertyName] || computedOverrideDefaults
      : computedOverrideDefaults;

    if (descriptor.set) {
      if (overrides.volatile) {
        return noProxy
          ? dirtyChecker.createProperty(instance, propertyName)
          : new GetterObserver(overrides, instance, propertyName, descriptor, observerLocator, changeSet);
      }

      return new CustomSetterObserver(instance, propertyName, descriptor, changeSet);
    }

    return noProxy
      ? dirtyChecker.createProperty(instance, propertyName)
      : new GetterObserver(overrides, instance, propertyName, descriptor, observerLocator, changeSet);
  }

  throw Reporter.error(18, propertyName);
}

// tslint:disable-next-line:interface-name
export interface CustomSetterObserver extends
  ISubscriberCollection<MutationKind.instance>,
  IAccessor,
  ISubscribable<MutationKind.instance>,
  IChangeTracker { }

// Used when the getter is dependent solely on changes that happen within the setter.
@subscriberCollection(MutationKind.instance)
export class CustomSetterObserver implements CustomSetterObserver {
  private observing = false;
  private currentValue: any;
  private oldValue: any;

  constructor(private instance: any, private propertyName: string, private descriptor: PropertyDescriptor, private changeSet: IChangeSet) { }

  public getValue(): any {
    return this.instance[this.propertyName];
  }

  public setValue(newValue: any): void {
    this.instance[this.propertyName] = newValue;
  }

  public flushChanges(): void {
    const oldValue = this.oldValue;
    const newValue = this.currentValue;

    this.callSubscribers(newValue, oldValue, BindingFlags.updateTargetInstance | BindingFlags.fromFlushChanges);
  }

  public subscribe(subscriber: IPropertySubscriber): void {
    if (!this.observing) {
      this.convertProperty();
    }
    this.addSubscriber(subscriber);
  }

  public unsubscribe(subscriber: IPropertySubscriber): void {
    this.removeSubscriber(subscriber);
  }

  public convertProperty(): void {
    const setter = this.descriptor.set;
    const that = this;

    this.observing = true;
    this.currentValue = this.instance[this.propertyName];

    Reflect.defineProperty(this.instance, this.propertyName, {
      set: function(newValue) {
        setter(newValue);

        const oldValue = this.currentValue;

        if (oldValue !== newValue) {
          that.oldValue = oldValue;
          that.changeSet.add(that);

          that.currentValue = newValue;
        }
      }
    });
  }
}

// tslint:disable-next-line:interface-name
export interface GetterObserver extends
  ISubscriberCollection<MutationKind.instance>,
  IAccessor,
  ISubscribable<MutationKind.instance>,
  IChangeTracker { }

// Used when there is no setter, and the getter is dependent on other properties of the object;
// Used when there is a setter but the value of the getter can change based on properties set outside of the setter.
/*@internal*/
@subscriberCollection(MutationKind.instance)
export class GetterObserver implements GetterObserver {
  private controller: GetterController;

  constructor(private overrides: ComputedOverrides, private instance: any, private propertyName: string, private descriptor: PropertyDescriptor, private observerLocator: IObserverLocator, private changeSet: IChangeSet) {
    this.controller = new GetterController(
      overrides,
      instance,
      propertyName,
      descriptor,
      this,
      observerLocator,
      changeSet
    );
  }

  public getValue(): any {
    return this.controller.value;
  }

  public setValue(newValue): void { }

  public flushChanges(): void {
    const oldValue = this.controller.value;
    const newValue = this.controller.getValueAndCollectDependencies();

    if (oldValue !== newValue) {
      this.callSubscribers(newValue, oldValue, BindingFlags.updateTargetInstance);
    }
  }

  public subscribe(subscriber: IPropertySubscriber): void {
    this.addSubscriber(subscriber);
    this.controller.onSubscriberAdded();
  }

  public unsubscribe(subscriber: IPropertySubscriber): void {
    this.removeSubscriber(subscriber);
    this.controller.onSubscriberRemoved();
  }
}

/*@internal*/
export class GetterController {
  private dependencies: ISubscribable<MutationKind.instance>[] = [];
  private subscriberCount = 0;

  public value;
  public isCollecting = false;

  constructor(
    private overrides: ComputedOverrides,
    private instance: any,
    private propertyName: string,
    descriptor: PropertyDescriptor,
    private owner: GetterObserver,
    observerLocator: IObserverLocator,
    private changeSet: IChangeSet
  ) {
    const proxy = new Proxy(instance, createGetterTraps(observerLocator, this));
    const getter = descriptor.get;
    const ctrl = this;

    Reflect.defineProperty(instance, propertyName, {
      get: function() {
        if (ctrl.subscriberCount < 1 || ctrl.isCollecting) {
          ctrl.value = getter.apply(proxy);
        }

        return ctrl.value;
      }
    });
  }

  public addDependency(subscribable: ISubscribable<MutationKind.instance>) {
    if (this.dependencies.includes(subscribable)) {
      return;
    }

    this.dependencies.push(subscribable);
  }

  public onSubscriberAdded() {
    this.subscriberCount++;

    if (this.subscriberCount > 1) {
      return;
    }

    this.getValueAndCollectDependencies(true);
  }

  public getValueAndCollectDependencies(requireCollect = false) {
    const dynamicDependencies = !this.overrides.static || requireCollect;

    if (dynamicDependencies) {
      this.unsubscribeAllDependencies();
      this.isCollecting = true;
    }

    this.value = this.instance[this.propertyName]; // triggers observer collection

    if (dynamicDependencies) {
      this.isCollecting = false;
      this.dependencies.forEach(x => x.subscribe(this));
    }

    return this.value;
  }

  public onSubscriberRemoved() {
    this.subscriberCount--;

    if (this.subscriberCount === 0) {
      this.unsubscribeAllDependencies();
    }
  }

  private unsubscribeAllDependencies() {
    this.dependencies.forEach(x => x.unsubscribe(this));
    this.dependencies.length = 0;
  }

  public handleChange() {
    this.changeSet.add(this.owner);
  }
}

function createGetterTraps(observerLocator: IObserverLocator, controller: GetterController) {
  return {
    get: function(instance, key) {
      const value = instance[key];

      if (key === '$observers' || typeof value === 'function' || !controller.isCollecting) {
        return value;
      }

      // TODO: fix this
      // if (instance instanceof Array) {
      //   controller.addDependency(observerLocator.getArrayObserver(instance));

      //   if (key === 'length') {
      //     controller.addDependency(observerLocator.getArrayObserver(instance).getLengthObserver());
      //   }
      // } else if (instance instanceof Map) {
      //   controller.addDependency(observerLocator.getMapObserver(instance));

      //   if (key === 'size') {
      //     controller.addDependency(this.getMapObserver(instance).getLengthObserver());
      //   }
      // } else if (instance instanceof Set) {
      //   controller.addDependency(observerLocator.getSetObserver(instance));

      //   if (key === 'size') {
      //     return observerLocator.getSetObserver(instance).getLengthObserver();
      //   }
      // } else {
        controller.addDependency(<any>observerLocator.getObserver(instance, key));
      //}

      return proxyOrValue(observerLocator, controller, value);
    }
  }
}

function proxyOrValue(observerLocator: IObserverLocator, controller: GetterController, value: any) {
  if (!(value instanceof Object)) {
    return value;
  }

  return new Proxy(value, createGetterTraps(observerLocator, controller));
}
