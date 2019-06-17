import { Constructable, PLATFORM, Reporter, Tracer, IIndexable } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { ILifecycle } from '../lifecycle';
import {
  IBindingContext,
  IBindingTargetObserver,
  ICollectionSubscribable,
  IObservable,
  ISubscribable,
  ISubscriber
} from '../observation';
import { IDirtyChecker } from './dirty-checker';
import { IObserverLocator } from './observer-locator';
import { subscriberCollection } from './subscriber-collection';

const slice = Array.prototype.slice;

export interface ComputedOverrides {
  // Indicates that a getter doesn't need to re-calculate its dependencies after the first observation.
  static?: boolean;

  // Indicates that the getter of a getter/setter pair can change its value based on side-effects outside the setter.
  volatile?: boolean;
}

export type ComputedLookup = { computed?: Record<string, ComputedOverrides> };

export function computed(config: ComputedOverrides): PropertyDecorator {
  return function (target: Constructable & ComputedLookup, key: string): void {
    (target.computed || (target.computed = {}))[key] = config;
  } as PropertyDecorator;
}

const computedOverrideDefaults: ComputedOverrides = { static: false, volatile: false };

/* @internal */
export function createComputedObserver(
  flags: LifecycleFlags,
  observerLocator: IObserverLocator,
  dirtyChecker: IDirtyChecker,
  lifecycle: ILifecycle,
  instance: IObservable,
  propertyName: string,
  descriptor: PropertyDescriptor): IBindingTargetObserver {

  if (descriptor.configurable === false) {
    return dirtyChecker.createProperty(instance, propertyName);
  }

  if (descriptor.get) {
    const overrides = (
      (instance as IObservable & { constructor: ComputedLookup }).constructor.computed
      && (instance as IObservable & { constructor: ComputedLookup }).constructor.computed![propertyName]
      || computedOverrideDefaults
    );

    if (descriptor.set) {
      if (overrides.volatile) {
        return new GetterObserver(flags, overrides, instance, propertyName, descriptor, observerLocator, lifecycle);
      }
      return new CustomSetterObserver(instance, propertyName, descriptor);
    }
    return new GetterObserver(flags, overrides, instance, propertyName, descriptor, observerLocator, lifecycle);
  }
  throw Reporter.error(18, propertyName);
}

export interface CustomSetterObserver extends IBindingTargetObserver { }

// Used when the getter is dependent solely on changes that happen within the setter.
@subscriberCollection()
export class CustomSetterObserver implements CustomSetterObserver {
  public readonly obj: IObservable & IIndexable;
  public readonly propertyKey: string;
  public currentValue: unknown;
  public oldValue: unknown;

  private readonly descriptor: PropertyDescriptor;
  private observing: boolean;

  constructor(obj: IObservable, propertyKey: string, descriptor: PropertyDescriptor) {
    this.obj = obj;
    this.propertyKey = propertyKey;
    this.currentValue = this.oldValue = undefined;
    this.descriptor = descriptor;
    this.observing = false;
  }

  public setValue(newValue: unknown): void {
    if (Tracer.enabled) { Tracer.enter('CustomSetterObserver', 'setValue', slice.call(arguments)); }
    // tslint:disable-next-line: no-non-null-assertion // Non-null is implied because descriptors without setters won't end up here
    this.descriptor.set!.call(this.obj, newValue);
    if (this.currentValue !== newValue) {
      this.oldValue = this.currentValue;
      this.currentValue = newValue;
      this.callSubscribers(newValue, this.oldValue, LifecycleFlags.updateTargetInstance);
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public subscribe(subscriber: ISubscriber): void {
    if (!this.observing) {
      this.convertProperty();
    }
    this.addSubscriber(subscriber);
  }

  public unsubscribe(subscriber: ISubscriber): void {
    this.removeSubscriber(subscriber);
  }

  public convertProperty(): void {
    if (Tracer.enabled) { Tracer.enter('CustomSetterObserver', 'convertProperty', slice.call(arguments)); }
    this.observing = true;
    this.currentValue = this.obj[this.propertyKey];

    const set = (newValue: unknown): void => { this.setValue(newValue); };
    Reflect.defineProperty(this.obj, this.propertyKey, { set });
    if (Tracer.enabled) { Tracer.leave(); }
  }
}

export interface GetterObserver extends IBindingTargetObserver { }

// Used when there is no setter, and the getter is dependent on other properties of the object;
// Used when there is a setter but the value of the getter can change based on properties set outside of the setter.
/** @internal */
@subscriberCollection()
export class GetterObserver implements GetterObserver {
  public readonly obj: IObservable;
  public readonly propertyKey: string;
  public currentValue: unknown;
  public oldValue: unknown;

  private readonly proxy: ProxyHandler<object>;
  private readonly propertyDeps: ISubscribable[];
  private readonly collectionDeps: ICollectionSubscribable[];
  private readonly overrides: ComputedOverrides;
  private readonly descriptor: PropertyDescriptor;
  private subscriberCount: number;
  private isCollecting: boolean;

  constructor(flags: LifecycleFlags, overrides: ComputedOverrides, obj: IObservable, propertyKey: string, descriptor: PropertyDescriptor, observerLocator: IObserverLocator, lifecycle: ILifecycle) {
    this.obj = obj;
    this.propertyKey = propertyKey;
    this.isCollecting = false;
    this.currentValue = this.oldValue = undefined;

    this.propertyDeps = [];
    this.collectionDeps = [];
    this.overrides = overrides;
    this.subscriberCount = 0;
    this.descriptor = descriptor;
    this.proxy = new Proxy(obj, createGetterTraps(flags, observerLocator, this));

    const get = (): unknown => this.getValue();
    Reflect.defineProperty(obj, propertyKey, { get });
  }

  public addPropertyDep(subscribable: ISubscribable): void {
    if (this.propertyDeps.indexOf(subscribable) === -1) {
      this.propertyDeps.push(subscribable);
    }
  }

  public addCollectionDep(subscribable: ICollectionSubscribable): void {
    if (this.collectionDeps.indexOf(subscribable) === -1) {
      this.collectionDeps.push(subscribable);
    }
  }

  public getValue(): unknown {
    if (Tracer.enabled) { Tracer.enter('GetterObserver', 'getValue', slice.call(arguments)); }
    if (this.subscriberCount === 0 || this.isCollecting) {
      // tslint:disable-next-line: no-non-null-assertion // Non-null is implied because descriptors without getters won't end up here
      this.currentValue = Reflect.apply(this.descriptor.get!, this.proxy, PLATFORM.emptyArray);
    } else {
      // tslint:disable-next-line: no-non-null-assertion // Non-null is implied because descriptors without getters won't end up here
      this.currentValue = Reflect.apply(this.descriptor.get!, this.obj, PLATFORM.emptyArray);
    }
    if (Tracer.enabled) { Tracer.leave(); }
    return this.currentValue;
  }

  public subscribe(subscriber: ISubscriber): void {
    this.addSubscriber(subscriber);
    if (++this.subscriberCount === 1) {
      this.getValueAndCollectDependencies(true);
    }
  }

  public unsubscribe(subscriber: ISubscriber): void {
    this.removeSubscriber(subscriber);
    if (--this.subscriberCount === 0) {
      this.unsubscribeAllDependencies();
    }
  }

  public handleChange(): void {
    const oldValue = this.currentValue;
    const newValue = this.getValueAndCollectDependencies(false);
    if (oldValue !== newValue) {
      this.callSubscribers(newValue, oldValue, LifecycleFlags.updateTargetInstance);
    }
  }

  public handleCollectionChange(): void {
    const oldValue = this.currentValue;
    const newValue = this.getValueAndCollectDependencies(false);
    if (oldValue !== newValue) {
      this.callSubscribers(newValue, oldValue, LifecycleFlags.updateTargetInstance);
    }
  }

  public getValueAndCollectDependencies(requireCollect: boolean): unknown {
    if (Tracer.enabled) { Tracer.enter('GetterObserver', 'getValueAndCollectDependencies', slice.call(arguments)); }
    const dynamicDependencies = !this.overrides.static || requireCollect;

    if (dynamicDependencies) {
      this.unsubscribeAllDependencies();
      this.isCollecting = true;
    }

    this.currentValue = this.getValue();

    if (dynamicDependencies) {
      this.propertyDeps.forEach(x => { x.subscribe(this); });
      this.collectionDeps.forEach(x => { x.subscribeToCollection(this); });
      this.isCollecting = false;
    }

    if (Tracer.enabled) { Tracer.leave(); }
    return this.currentValue;
  }

  public doNotCollect(key: PropertyKey): boolean {
    return !this.isCollecting || key === '$observers';
  }

  private unsubscribeAllDependencies(): void {
    this.propertyDeps.forEach(x => { x.unsubscribe(this); });
    this.propertyDeps.length = 0;
    this.collectionDeps.forEach(x => { x.unsubscribeFromCollection(this); });
    this.collectionDeps.length = 0;
  }
}

const toStringTag = Object.prototype.toString;

function createGetterTraps(flags: LifecycleFlags, observerLocator: IObserverLocator, observer: GetterObserver): ProxyHandler<object> {
  if (Tracer.enabled) { Tracer.enter('computed', 'createGetterTraps', slice.call(arguments)); }
  const traps = {
    get: function(target: IObservable | IBindingContext, key: PropertyKey, receiver?: unknown): unknown {
      if (Tracer.enabled) { Tracer.enter('computed', 'get', slice.call(arguments)); }
      if (observer.doNotCollect(key)) {
        if (Tracer.enabled) { Tracer.leave(); }
        return Reflect.get(target, key, receiver);
      }

      // The length and iterator properties need to be invoked on the original object (for Map and Set
      // at least) or they will throw.
      switch (toStringTag.call(target)) {
        case '[object Array]':
          observer.addCollectionDep(observerLocator.getArrayObserver(flags, target as unknown[]));
          if (key === 'length') {
            if (Tracer.enabled) { Tracer.leave(); }
            return Reflect.get(target, key, target);
          }
        case '[object Map]':
          observer.addCollectionDep(observerLocator.getMapObserver(flags, target as Map<unknown, unknown>));
          if (key === 'size') {
            if (Tracer.enabled) { Tracer.leave(); }
            return Reflect.get(target, key, target);
          }
        case '[object Set]':
          observer.addCollectionDep(observerLocator.getSetObserver(flags, target as Set<unknown>));
          if (key === 'size') {
            if (Tracer.enabled) { Tracer.leave(); }
            return Reflect.get(target, key, target);
          }
        default:
          observer.addPropertyDep(observerLocator.getObserver(flags, target, key as string) as IBindingTargetObserver);
      }

      if (Tracer.enabled) { Tracer.leave(); }
      return proxyOrValue(flags, target, key, observerLocator, observer);
    }
  };
  if (Tracer.enabled) { Tracer.leave(); }
  return traps;
}

function proxyOrValue(flags: LifecycleFlags, target: object, key: PropertyKey, observerLocator: IObserverLocator, observer: GetterObserver): ProxyHandler<object> {
  const value = Reflect.get(target, key, target);
  if (typeof value === 'function') {
    // tslint:disable-next-line: ban-types // We need Function's bind() method here
    return (target as { [key: string]: Function })[key as string].bind(target);
  }
  if (typeof value !== 'object' || value === null) {
    return value;
  }
  return new Proxy(value, createGetterTraps(flags, observerLocator, observer));
}
