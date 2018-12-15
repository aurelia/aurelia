import { IIndexable, PLATFORM, Primitive, Reporter } from '../../kernel';
import { ILifecycle } from '../lifecycle';
import { IBindingTargetAccessor, IBindingTargetObserver, IObservable, IPropertySubscriber, ISubscribable, LifecycleFlags, MutationKind } from '../observation';
import { IDirtyChecker } from './dirty-checker';
import { IObserverLocator } from './observer-locator';
import { subscriberCollection } from './subscriber-collection';

export interface ComputedOverrides {
  // Indicates that a getter doesn't need to re-calculate its dependencies after the first observation.
  // tslint:disable-next-line:no-reserved-keywords
  static?: boolean;

  // Indicates that the getter of a getter/setter pair can change its value based on side-effects outside the setter.
  volatile?: boolean;
}

export type ComputedLookup = { computed?: Record<string, ComputedOverrides> };

export function computed(config: ComputedOverrides): PropertyDecorator {
  return function(target: Object & ComputedLookup, key: string): void {
    (target.computed || (target.computed = {}))[key] = config;
  };
}

// tslint:disable-next-line:no-typeof-undefined
const noProxy = !(typeof Proxy !== 'undefined');
const computedOverrideDefaults: ComputedOverrides = { static: false, volatile: false };

/* @internal */
export function createComputedObserver(
  observerLocator: IObserverLocator,
  dirtyChecker: IDirtyChecker,
  lifecycle: ILifecycle,
  // tslint:disable-next-line:no-reserved-keywords
  instance: IObservable & { constructor: Function & ComputedLookup },
  propertyName: string,
  descriptor: PropertyDescriptor): IBindingTargetAccessor {

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
          : new GetterObserver(overrides, instance, propertyName, descriptor, observerLocator, lifecycle);
      }

      return new CustomSetterObserver(instance, propertyName, descriptor, lifecycle);
    }

    return noProxy
      ? dirtyChecker.createProperty(instance, propertyName)
      : new GetterObserver(overrides, instance, propertyName, descriptor, observerLocator, lifecycle);
  }

  throw Reporter.error(18, propertyName);
}

export interface CustomSetterObserver extends IBindingTargetObserver { }

// Used when the getter is dependent solely on changes that happen within the setter.
@subscriberCollection(MutationKind.instance)
export class CustomSetterObserver implements CustomSetterObserver {
  public $nextFlush: this = null;
  public dispose: () => void;
  public observing: boolean = false;
  public currentValue: IIndexable | Primitive;
  public oldValue: IIndexable | Primitive;

  constructor(
    public obj: IObservable,
    public propertyKey: string,
    private descriptor: PropertyDescriptor,
    private lifecycle: ILifecycle
  ) { }

  public getValue(): IIndexable | Primitive {
    return this.obj[this.propertyKey];
  }

  public setValue(newValue: IIndexable | Primitive): void {
    this.obj[this.propertyKey] = newValue;
  }

  public flush(flags: LifecycleFlags): void {
    const oldValue = this.oldValue;
    const newValue = this.currentValue;

    this.callSubscribers(newValue, oldValue, flags | LifecycleFlags.updateTargetInstance);
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
    this.currentValue = this.obj[this.propertyKey];

    Reflect.defineProperty(this.obj, this.propertyKey, {
      set: function(newValue: IIndexable | Primitive): void {
        setter.call(that.obj, newValue);

        const oldValue = that.currentValue;

        if (oldValue !== newValue) {
          that.oldValue = oldValue;
          that.lifecycle.enqueueFlush(that);

          that.currentValue = newValue;
        }
      }
    });
  }
}

CustomSetterObserver.prototype.dispose = PLATFORM.noop;

export interface GetterObserver extends IBindingTargetObserver { }

// Used when there is no setter, and the getter is dependent on other properties of the object;
// Used when there is a setter but the value of the getter can change based on properties set outside of the setter.
/*@internal*/
@subscriberCollection(MutationKind.instance)
export class GetterObserver implements GetterObserver {
  public dispose: () => void;
  private controller: GetterController;

  constructor(
    private overrides: ComputedOverrides,
    public obj: IObservable,
    public propertyKey: string,
    private descriptor: PropertyDescriptor,
    private observerLocator: IObserverLocator,
    private lifecycle: ILifecycle
  ) {
    this.controller = new GetterController(
      overrides,
      obj,
      propertyKey,
      descriptor,
      this,
      observerLocator,
      lifecycle
    );
  }

  public getValue(): IIndexable | Primitive {
    return this.controller.value;
  }

  // tslint:disable-next-line:no-empty
  public setValue(newValue: IIndexable | Primitive): void { }

  public flush(flags: LifecycleFlags): void {
    const oldValue = this.controller.value;
    const newValue = this.controller.getValueAndCollectDependencies();

    if (oldValue !== newValue) {
      this.callSubscribers(newValue, oldValue, flags | LifecycleFlags.updateTargetInstance);
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

GetterObserver.prototype.dispose = PLATFORM.noop;

/*@internal*/
export class GetterController {
  public value: IIndexable | Primitive;
  public isCollecting: boolean = false;

  private dependencies: ISubscribable<MutationKind.instance>[] = [];
  private subscriberCount: number = 0;

  constructor(
    private overrides: ComputedOverrides,
    private instance: IObservable,
    private propertyName: string,
    descriptor: PropertyDescriptor,
    private owner: GetterObserver,
    observerLocator: IObserverLocator,
    private lifecycle: ILifecycle
  ) {
    const proxy = new Proxy(instance, createGetterTraps(observerLocator, this));
    const getter = descriptor.get;
    const ctrl = this;

    Reflect.defineProperty(instance, propertyName, {
      get: function(): IIndexable | Primitive {
        if (ctrl.subscriberCount < 1 || ctrl.isCollecting) {
          ctrl.value = getter.apply(proxy);
        }

        return ctrl.value;
      }
    });
  }

  public addDependency(subscribable: ISubscribable<MutationKind.instance>): void {
    if (this.dependencies.includes(subscribable)) {
      return;
    }

    this.dependencies.push(subscribable);
  }

  public onSubscriberAdded(): void {
    this.subscriberCount++;

    if (this.subscriberCount > 1) {
      return;
    }

    this.getValueAndCollectDependencies(true);
  }

  public getValueAndCollectDependencies(requireCollect: boolean = false): IIndexable | Primitive {
    const dynamicDependencies = !this.overrides.static || requireCollect;

    if (dynamicDependencies) {
      this.unsubscribeAllDependencies();
      this.isCollecting = true;
    }

    this.value = this.instance[this.propertyName]; // triggers observer collection

    if (dynamicDependencies) {
      this.isCollecting = false;
      this.dependencies.forEach(x => { x.subscribe(this); });
    }

    return this.value;
  }

  public onSubscriberRemoved(): void {
    this.subscriberCount--;

    if (this.subscriberCount === 0) {
      this.unsubscribeAllDependencies();
    }
  }

  public handleChange(): void {
    this.lifecycle.enqueueFlush(this.owner);
  }

  private unsubscribeAllDependencies(): void {
    this.dependencies.forEach(x => { x.unsubscribe(this); });
    this.dependencies.length = 0;
  }
}

function createGetterTraps(observerLocator: IObserverLocator, controller: GetterController): ReturnType<typeof proxyOrValue> {
  return {
    get: function(instance: IIndexable, key: string): IIndexable | Primitive {
      const value = instance[key];

      if (key === '$observers' || typeof value === 'function' || !controller.isCollecting) {
        return value;
      }

      // TODO: fix this
      if (instance instanceof Array) {
        controller.addDependency(observerLocator.getArrayObserver(instance));

        if (key === 'length') {
          controller.addDependency(observerLocator.getArrayObserver(instance).getLengthObserver());
        }
      } else if (instance instanceof Map) {
        controller.addDependency(observerLocator.getMapObserver(instance));

        if (key === 'size') {
          controller.addDependency(observerLocator.getMapObserver(instance).getLengthObserver());
        }
      } else if (instance instanceof Set) {
        controller.addDependency(observerLocator.getSetObserver(instance));

        if (key === 'size') {
          return observerLocator.getSetObserver(instance).getLengthObserver();
        }
      } else {
        controller.addDependency(observerLocator.getObserver(instance, key) as IBindingTargetObserver);
      }

      return proxyOrValue(observerLocator, controller, value);
    }
  };
}

function proxyOrValue(observerLocator: IObserverLocator, controller: GetterController, value: IIndexable): ProxyHandler<IIndexable> {
  if (!(value instanceof Object)) {
    return value;
  }

  return new Proxy(value, createGetterTraps(observerLocator, controller));
}
