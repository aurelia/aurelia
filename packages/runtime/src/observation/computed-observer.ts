import { Constructable, IIndexable, PLATFORM, Reporter } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { ILifecycle } from '../lifecycle';
import {
  IBindingContext,
  IBindingTargetObserver,
  ICollectionSubscribable,
  ISubscribable,
  ISubscriber
} from '../observation';
import { IDirtyChecker } from './dirty-checker';
import { IObserverLocator } from './observer-locator';
import { subscriberCollection } from './subscriber-collection';

export interface ComputedOverrides {
  // Indicates that a getter doesn't need to re-calculate its dependencies after the first observation.
  static?: boolean;

  // Indicates that the getter of a getter/setter pair can change its value based on side-effects outside the setter.
  volatile?: boolean;
}

export type ComputedLookup = { computed?: Record<string, ComputedOverrides> };

export function computed(config: ComputedOverrides): PropertyDecorator {
  return function (target: Constructable & ComputedLookup, key: string): void {
    /**
     * The 'computed' property defined on prototype needs to be non-enumerable to prevent getting this in loops,
     * iterating over object properties, such as for..in.
     *
     * The 'value' of the property should not have any prototype. Otherwise if by mistake the target passed
     * here is `Object`, then we are in soup. Because then every instance of `Object` will have the `computed`
     * property, including the `value` (in the descriptor of the property), when assigned `{}`. This might
     * lead to infinite recursion for the cases as mentioned above.
     */
    if (!target.computed) {
      Reflect.defineProperty(target, 'computed', {
        writable: true,
        configurable: true,
        enumerable: false,
        value: Object.create(null)
      });
    }
    target.computed![key] = config;
  } as PropertyDecorator;
}

const computedOverrideDefaults: ComputedOverrides = { static: false, volatile: false };

/* @internal */
export function createComputedObserver(
  flags: LifecycleFlags,
  observerLocator: IObserverLocator,
  dirtyChecker: IDirtyChecker,
  lifecycle: ILifecycle,
  instance: IIndexable,
  propertyName: string,
  descriptor: PropertyDescriptor): IBindingTargetObserver {

  if (descriptor.configurable === false) {
    return dirtyChecker.createProperty(instance, propertyName);
  }

  if (descriptor.get) {
    const { constructor: { prototype: { computed: givenOverrides } } }: IIndexable & { constructor: { prototype: ComputedLookup } } = instance;
    const overrides = givenOverrides && givenOverrides![propertyName] || computedOverrideDefaults;

    if (descriptor.set) {
      if (overrides.volatile) {
        return new GetterObserver(flags, overrides, instance, propertyName, descriptor, observerLocator);
      }
      return new CustomSetterObserver(instance, propertyName, descriptor);
    }
    return new GetterObserver(flags, overrides, instance, propertyName, descriptor, observerLocator);
  }
  throw Reporter.error(18, propertyName);
}

export interface CustomSetterObserver extends IBindingTargetObserver { }

// Used when the getter is dependent solely on changes that happen within the setter.
@subscriberCollection()
export class CustomSetterObserver implements CustomSetterObserver {
  public currentValue: unknown = void 0;
  public oldValue: unknown = void 0;

  private observing: boolean = false;

  public constructor(
    public readonly obj: IIndexable & IIndexable,
    public readonly propertyKey: string,
    private readonly descriptor: PropertyDescriptor,
  ) {}

  public setValue(newValue: unknown): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.descriptor.set!.call(this.obj, newValue); // Non-null is implied because descriptors without setters won't end up here
    if (this.currentValue !== newValue) {
      this.oldValue = this.currentValue;
      this.currentValue = newValue;
      this.callSubscribers(newValue, this.oldValue, LifecycleFlags.updateTargetInstance);
    }
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
    this.observing = true;
    this.currentValue = this.obj[this.propertyKey];

    const set = (newValue: unknown): void => { this.setValue(newValue); };
    Reflect.defineProperty(this.obj, this.propertyKey, { set, get: this.descriptor.get });
  }
}

export interface GetterObserver extends IBindingTargetObserver { }

// Used when there is no setter, and the getter is dependent on other properties of the object;
// Used when there is a setter but the value of the getter can change based on properties set outside of the setter.
@subscriberCollection()
export class GetterObserver implements GetterObserver {
  public currentValue: unknown = void 0;
  public oldValue: unknown = void 0;

  private readonly proxy: ProxyHandler<object>;
  private readonly propertyDeps: ISubscribable[] = [];
  private readonly collectionDeps: ICollectionSubscribable[] = [];
  private subscriberCount: number = 0;
  private isCollecting: boolean = false;

  public constructor(
    flags: LifecycleFlags,
    private readonly overrides: ComputedOverrides,
    public readonly obj: IIndexable,
    public readonly propertyKey: string,
    private readonly descriptor: PropertyDescriptor,
    observerLocator: IObserverLocator,
  ) {
    this.proxy = new Proxy(obj, createGetterTraps(flags, observerLocator, this));

    const get = (): unknown => this.getValue();
    Reflect.defineProperty(obj, propertyKey, { get, set: descriptor.set });
  }

  public addPropertyDep(subscribable: ISubscribable): void {
    if (!this.propertyDeps.includes(subscribable)) {
      this.propertyDeps.push(subscribable);
    }
  }

  public addCollectionDep(subscribable: ICollectionSubscribable): void {
    if (!this.collectionDeps.includes(subscribable)) {
      this.collectionDeps.push(subscribable);
    }
  }

  public getValue(): unknown {
    if (this.subscriberCount === 0 || this.isCollecting) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.currentValue = Reflect.apply(this.descriptor.get!, this.proxy, PLATFORM.emptyArray); // Non-null is implied because descriptors without getters won't end up here
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.currentValue = Reflect.apply(this.descriptor.get!, this.obj, PLATFORM.emptyArray); // Non-null is implied because descriptors without getters won't end up here
    }
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

    return this.currentValue;
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
  // eslint-disable-next-line sonarjs/prefer-immediate-return
  const traps = {
    get: function (target: IIndexable, key: PropertyKey, receiver?: unknown): unknown {
      if (!observer['isCollecting']) {
        return Reflect.get(target, key, receiver);
      }

      // The length and iterator properties need to be invoked on the original object (for Map and Set
      // at least) or they will throw.
      switch (toStringTag.call(target)) {
        case '[object Array]':
          observer.addCollectionDep(observerLocator.getArrayObserver(flags, target as unknown as unknown[]));
          if (key === 'length') {
            return Reflect.get(target, key, target);
          }
          break;
        case '[object Map]':
          observer.addCollectionDep(observerLocator.getMapObserver(flags, target as unknown as Map<unknown, unknown>));
          if (key === 'size') {
            return Reflect.get(target, key, target);
          }
          break;
        case '[object Set]':
          observer.addCollectionDep(observerLocator.getSetObserver(flags, target as unknown as Set<unknown>));
          if (key === 'size') {
            return Reflect.get(target, key, target);
          }
          break;
        default:
          observer.addPropertyDep(observerLocator.getObserver(flags, target, key as string) as IBindingTargetObserver);
      }

      return proxyOrValue(flags, target, key, observerLocator, observer);
    }
  };
  return traps;
}

function proxyOrValue(flags: LifecycleFlags, target: object, key: PropertyKey, observerLocator: IObserverLocator, observer: GetterObserver): ProxyHandler<object> {
  const value = Reflect.get(target, key, target);
  if (typeof value === 'function') {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return (target as { [key: string]: Function })[key as string].bind(target); // We need Function's bind() method here
  }
  if (typeof value !== 'object' || value === null) {
    return value;
  }
  return new Proxy(value, createGetterTraps(flags, observerLocator, observer));
}
