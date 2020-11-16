/* eslint-disable eqeqeq, compat/compat */
import {
  Constructable,
  IIndexable,
  emptyArray,
  isArrayIndex,
  IServiceLocator
} from '@aurelia/kernel';
import {
  IBindingContext,
  IBindingTargetObserver,
  ICollectionSubscribable,
  ILifecycle,
  IObservable,
  ISubscribable,
  ISubscriber,
  Collection,
  ICollectionObserver,
  CollectionKind,
  LifecycleFlags,
  ISubscriberCollection,
  ICollectionSubscriber,
} from '../observation';
import { IDirtyChecker } from './dirty-checker';
import { IObserverLocator } from './observer-locator';
import { subscriberCollection, collectionSubscriberCollection } from './subscriber-collection';
import { IWatcher, enterWatcher, exitWatcher } from './watcher-switcher';
import { connectable, IConnectableBinding } from '../binding/connectable';
import { IWatcherCallback } from './watch';
import { ExpressionKind, IsBindingBehavior } from '../binding/ast';
import { getProxyOrSelf, getRawOrSelf } from './proxy-observation';
import { Scope } from './binding-context';
import { defineHiddenProp, ensureProto } from '../utilities-objects';

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
    if (target.computed == null) {
      Reflect.defineProperty(target, 'computed', {
        writable: true,
        configurable: true,
        enumerable: false,
        value: Object.create(null)
      });
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
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
  instance: IObservable,
  propertyName: string,
  descriptor: PropertyDescriptor): IBindingTargetObserver {

  if (descriptor.configurable === false) {
    return dirtyChecker.createProperty(instance, propertyName);
  }

  if (descriptor.get != null) {
    const { constructor: { prototype: { computed: givenOverrides } } }: IObservable & { constructor: { prototype: ComputedLookup } } = instance;
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unnecessary-type-assertion
    const overrides: ComputedOverrides = givenOverrides && givenOverrides![propertyName] || computedOverrideDefaults;

    if (descriptor.set != null) {
      if (overrides.volatile) {
        return new GetterObserver(flags, overrides, instance, propertyName, descriptor, observerLocator);
      }
      return new CustomSetterObserver(instance, propertyName, descriptor);
    }
    return new GetterObserver(flags, overrides, instance, propertyName, descriptor, observerLocator);
  }
  throw new Error(`You cannot observe a setter only property: '${propertyName}'`);
}

export interface CustomSetterObserver extends IBindingTargetObserver { }

// Used when the getter is dependent solely on changes that happen within the setter.
@subscriberCollection()
export class CustomSetterObserver implements CustomSetterObserver {
  public currentValue: unknown = void 0;
  public oldValue: unknown = void 0;

  private observing: boolean = false;

  public constructor(
    public readonly obj: IObservable & IIndexable,
    public readonly propertyKey: string,
    private readonly descriptor: PropertyDescriptor,
  ) { }

  public setValue(newValue: unknown): void {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-type-assertion
    this.descriptor.set!.call(this.obj, newValue); // Non-null is implied because descriptors without setters won't end up here
    if (this.currentValue !== newValue) {
      this.oldValue = this.currentValue;
      this.currentValue = newValue;
      this.callSubscribers(newValue, this.oldValue, LifecycleFlags.updateTarget);
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
    public readonly obj: IObservable,
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
    if (this.subscriberCount > 0 || this.isCollecting) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.currentValue = Reflect.apply(this.descriptor.get!, this.proxy, emptyArray); // Non-null is implied because descriptors without getters won't end up here
    } else {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.currentValue = Reflect.apply(this.descriptor.get!, this.obj, emptyArray); // Non-null is implied because descriptors without getters won't end up here
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
      this.callSubscribers(newValue, oldValue, LifecycleFlags.updateTarget);
    }
  }

  public handleCollectionChange(): void {
    const oldValue = this.currentValue;
    const newValue = this.getValueAndCollectDependencies(false);
    if (oldValue !== newValue) {
      this.callSubscribers(newValue, oldValue, LifecycleFlags.updateTarget);
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

  public doNotCollect(target: IObservable | IBindingContext, key: PropertyKey, receiver?: unknown): boolean {
    return !this.isCollecting
      || key === '$observers'
      || key === '$synthetic'
      || key === 'constructor';
  }

  private unsubscribeAllDependencies(): void {
    this.propertyDeps.forEach(x => { x.unsubscribe(this); });
    this.propertyDeps.length = 0;
    this.collectionDeps.forEach(x => { x.unsubscribeFromCollection(this); });
    this.collectionDeps.length = 0;
  }
}

const toStringTag = Object.prototype.toString;

/**
 * _@param observer The owning observer of current evaluation, will subscribe to all observers created via proxy
 */
function createGetterTraps(flags: LifecycleFlags, observerLocator: IObserverLocator, observer: GetterObserver): ProxyHandler<object> {
  return {
    get: function (target: IObservable | IBindingContext, key: PropertyKey, receiver?: unknown): unknown {
      if (observer.doNotCollect(target, key, receiver)) {
        return Reflect.get(target, key, receiver);
      }

      // The length and iterator properties need to be invoked on the original object
      // (for Map and Set at least) or they will throw.
      switch (toStringTag.call(target)) {
        case '[object Array]':
          if (key === 'length' || isArrayIndex(key)) {
            observer.addCollectionDep(observerLocator.getArrayObserver(flags, target as unknown[]));
            return proxyOrValue(flags, target, key, observerLocator, observer);
          }
          break;
        case '[object Map]':
          if (key === 'size') {
            observer.addCollectionDep(observerLocator.getMapObserver(flags, target as Map<unknown, unknown>));
            return Reflect.get(target, key, target);
          }
          break;
        case '[object Set]':
          if (key === 'size') {
            observer.addCollectionDep(observerLocator.getSetObserver(flags, target as Set<unknown>));
            return Reflect.get(target, key, target);
          }
          break;
      }
      observer.addPropertyDep(observerLocator.getObserver(flags, target, key as string) as IBindingTargetObserver);

      return proxyOrValue(flags, target, key, observerLocator, observer);
    }
  };
}

/**
 * _@param observer The owning observer of current evaluation, will subscribe to all observers created via proxy
 */
function proxyOrValue(flags: LifecycleFlags, target: object, key: PropertyKey, observerLocator: IObserverLocator, observer: GetterObserver): ProxyHandler<object> {
  const value = Reflect.get(target, key, target);
  if (typeof value !== 'object' || typeof value === 'function' || value === null) {
    return value;
  }
  return new Proxy(value, createGetterTraps(flags, observerLocator, observer));
}

interface IWatcherImpl extends IWatcher, IConnectableBinding, ISubscriber, ICollectionSubscriber {
  id: number;
  observers: Map<ICollectionObserver<CollectionKind>, number>;
  readonly useProxy: boolean;
  unobserveCollection(all?: boolean): void;
}

function watcherImpl(): ClassDecorator;
function watcherImpl(klass?: Constructable<IWatcher>): void;
function watcherImpl(klass?: Constructable<IWatcher>): ClassDecorator | void {
  return klass == null ? watcherImplDecorator as ClassDecorator : watcherImplDecorator(klass);
}

function watcherImplDecorator(klass: Constructable<IWatcher>) {
  const proto = klass.prototype as IWatcher;
  connectable()(klass);
  subscriberCollection()(klass);
  collectionSubscriberCollection()(klass);

  ensureProto(proto, 'observe', observe);
  ensureProto(proto, 'observeCollection', observeCollection);
  ensureProto(proto, 'observeLength', observeLength);

  defineHiddenProp(proto as IWatcherImpl, 'unobserveCollection', unobserveCollection);
}

function observe(this: IWatcherImpl, obj: object, key: PropertyKey): void {
  const observer = this.observerLocator.getObserver(LifecycleFlags.none, obj, key as string) as IBindingTargetObserver;
  this.addObserver(observer);
}

function observeCollection(this: IWatcherImpl, collection: Collection): void {
  const obs = getCollectionObserver(this.observerLocator, collection);
  this.observers.set(obs, this.version);
  obs.subscribeToCollection(this);
}

function observeLength(this: IWatcherImpl, collection: Collection): void {
  getCollectionObserver(this.observerLocator, collection).getLengthObserver().subscribe(this);
}

function unobserveCollection(this: IWatcherImpl, all?: boolean): void {
  const version = this.version;
  const observers = this.observers;
  observers.forEach((v, o) => {
    if (all || v !== version) {
      o.unsubscribeFromCollection(this);
      observers.delete(o);
    }
  });
}

function getCollectionObserver(observerLocator: IObserverLocator, collection: Collection): ICollectionObserver<CollectionKind> {
  let observer: ICollectionObserver<CollectionKind>;
  if (collection instanceof Array) {
    observer = observerLocator.getArrayObserver(LifecycleFlags.none, collection);
  } else if (collection instanceof Set) {
    observer = observerLocator.getSetObserver(LifecycleFlags.none, collection);
  } else if (collection instanceof Map) {
    observer = observerLocator.getMapObserver(LifecycleFlags.none, collection);
  } else {
    throw new Error('Unrecognised collection type.');
  }
  return observer;
}

export interface ComputedObserver extends IWatcherImpl, IConnectableBinding, ISubscriberCollection {}

@watcherImpl
export class ComputedObserver implements IWatcherImpl {

  public static create(obj: object, key: PropertyKey, descriptor: PropertyDescriptor, useProxy: boolean): ComputedObserver {
    const getter = descriptor.get!;
    const setter = descriptor.set;
    const observer = new ComputedObserver(obj, getter, setter, useProxy);
    Reflect.defineProperty(obj, key, {
      enumerable: descriptor.enumerable,
      writable: true,
      configurable: true,
      get: () => observer.getValue(),
      set: (v) => {
        observer.setValue(v, LifecycleFlags.none);
      },
    });

    return observer;
  }

  public observers: Map<ICollectionObserver<CollectionKind>, number> = new Map();

  /**
   * @internal
   */
  private subscriberCount: number = 0;
  // todo: maybe use a counter allow recursive call to a certain level
  /**
   * @internal
   */
  private running: boolean = false;
  private value: unknown = void 0;

  private isDirty: boolean = false;

  public constructor(
    public readonly obj: object,
    public readonly get: (watcher: IWatcher) => unknown,
    public readonly set: undefined | ((v: unknown) => void),
    public readonly useProxy: boolean,
  ) {
    connectable.assignIdTo(this);
  }

  public getValue() {
    if (this.isDirty) {
      this.compute();
    }
    return this.value;
  }

  public setValue(v: unknown, flags: LifecycleFlags): void {
    if (typeof this.set === 'function') {
      if (v !== this.value) {
        const oldValue = this.value;
        this.set.call(this.obj, v);
        if (!this.useProxy) {
          this.isDirty = true;
          this.callSubscribers(this.getValue(), oldValue, flags);
          this.isDirty = false;
        }
      } else {
        throw new Error('Property is readonly');
      }
    }
  }

  public handleChange(): void {
    this.isDirty = true;
    if (this.observerSlots > 0) {
      this.run();
    }
  }

  public handleCollectionChange(): void {
    this.isDirty = true;
    if (this.observerSlots > 0) {
      this.run();
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    if (this.addSubscriber(subscriber) && ++this.subscriberCount === 1) {
      this.compute();
      this.isDirty = false;
    }
  }

  public unsubscribe(subscriber: ISubscriber): void {
    if (this.removeSubscriber(subscriber) && --this.subscriberCount === 0) {
      this.isDirty = true;
      this.unobserve(true);
      this.unobserveCollection(true);
    }
  }

  private run(): void {
    if (!this.isBound || this.running) {
      return;
    }
    const oldValue = this.value;
    const newValue = this.compute();

    if (!Object.is(newValue, oldValue)) {
      // should optionally queue
      this.callSubscribers(newValue, oldValue, LifecycleFlags.none);
    }
  }

  private compute(): unknown {
    this.running = true;
    this.version++;
    try {
      enterWatcher(this);
      this.value = getRawOrSelf(this.get.call(this.useProxy ? getProxyOrSelf(this.obj) : this.obj, this));
    } finally {
      exitWatcher(this);
      this.unobserve(false);
      this.unobserveCollection(false);
      this.running = false;
    }
    return this.value;
  }
}

// watchers (Computed & Expression) are basically binding,
// they are treated as special and setup before all other bindings

export interface ComputedWatcher extends IWatcherImpl, IConnectableBinding { }

@watcherImpl
export class ComputedWatcher implements IWatcher {

  /**
   * @internal
   */
  public observers: Map<ICollectionObserver<CollectionKind>, number> = new Map();

  // todo: maybe use a counter allow recursive call to a certain level
  private running: boolean = false;
  private value: unknown = void 0;

  public isBound: boolean = false;

  public constructor(
    public readonly obj: IObservable,
    public readonly observerLocator: IObserverLocator,
    public readonly get: (obj: object, watcher: IWatcher) => unknown,
    private readonly cb: IWatcherCallback<object>,
    public readonly useProxy: boolean,
  ) {
    connectable.assignIdTo(this);
  }

  public handleChange(): void {
    this.run();
  }

  public handleCollectionChange(): void {
    this.run();
  }

  public $bind(): void {
    if (this.isBound) {
      return;
    }
    this.isBound = true;
    this.compute();
  }

  public $unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    this.unobserve(true);
    this.unobserveCollection(true);
  }

  private run(): void {
    if (!this.isBound || this.running) {
      return;
    }
    const obj = this.obj;
    const oldValue = this.value;
    const newValue = this.compute();

    if (!Object.is(newValue, oldValue)) {
      // should optionally queue
      this.cb.call(obj, newValue, oldValue, obj);
    }
  }

  private compute(): unknown {
    this.running = true;
    this.version++;
    try {
      enterWatcher(this);
      this.value = getRawOrSelf(this.get.call(void 0, this.useProxy ? getProxyOrSelf(this.obj) : this.obj, this));
    } finally {
      exitWatcher(this);
      this.unobserve(false);
      this.unobserveCollection(false);
      this.running = false;
    }
    return this.value;
  }
}

/**
 * @internal The interface describes methods added by `connectable` & `subscriberCollection` decorators
 */
export interface ExpressionWatcher extends IConnectableBinding { }

@connectable()
export class ExpressionWatcher implements IConnectableBinding {
  /**
   * @internal
   */
  private value: unknown;
  /**
   * @internal
   */
  private readonly obj: object;

  public isBound: boolean = false;

  public constructor(
    public scope: Scope,
    public locator: IServiceLocator,
    public observerLocator: IObserverLocator,
    private readonly expression: IsBindingBehavior,
    private readonly callback: IWatcherCallback<object>,
  ) {
    this.obj = scope.bindingContext;
    connectable.assignIdTo(this);
  }

  public handleChange(value: unknown): void {
    const expr = this.expression;
    const obj = this.obj;
    const oldValue = this.value;
    const canOptimize = expr.$kind === ExpressionKind.AccessScope && this.observerSlots === 1;
    if (!canOptimize) {
      this.version++;
      value = expr.evaluate(0, this.scope, null, this.locator, this);
      this.unobserve(false);
    }
    if (!Object.is(value, oldValue)) {
      this.value = value;
      // should optionally queue for batch synchronous
      this.callback.call(obj, value, oldValue, obj);
    }
  }

  public $bind(): void {
    if (this.isBound) {
      return;
    }
    this.isBound = true;
    this.version++;
    this.value = this.expression.evaluate(LifecycleFlags.none, this.scope, null, this.locator, this);
    this.unobserve(false);
  }

  public $unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    this.unobserve(true);
    this.value = void 0;
  }
}
