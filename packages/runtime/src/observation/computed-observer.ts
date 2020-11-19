/* eslint-disable eqeqeq, compat/compat */
import {
  Collection,
  CollectionKind,
  LifecycleFlags,
  AccessorType,
} from '../observation.js';
import { ExpressionKind } from '../binding/ast.js';
import { subscriberCollection, collectionSubscriberCollection } from './subscriber-collection.js';
import { enterWatcher, exitWatcher } from './watcher-switcher.js';
import { connectable } from '../binding/connectable.js';
import { wrap, unwrap } from './proxy-observation.js';
import { defineHiddenProp, ensureProto } from '../utilities-objects.js';

import type {
  IBindingTargetObserver,
  IObservable,
  ISubscriber,
  ICollectionObserver,
  ICollectionSubscriber,
  ISubscriberCollection,
} from '../observation.js';
import type { Constructable, IServiceLocator } from '@aurelia/kernel';
import type { IConnectableBinding } from '../binding/connectable.js';
import type { IsBindingBehavior } from '../binding/ast.js';
import type { IWatcher } from './watcher-switcher.js';
import type { IWatcherCallback } from './watch.js';
import type { IObserverLocator, ObservableGetter } from './observer-locator.js';
import type { Scope } from './binding-context.js';

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
export class ComputedObserver implements IWatcherImpl, IConnectableBinding, ISubscriberCollection {

  public static create(
    obj: object,
    key: PropertyKey,
    descriptor: PropertyDescriptor,
    observerLocator: IObserverLocator,
    useProxy: boolean,
  ): ComputedObserver {
    const getter = descriptor.get!;
    const setter = descriptor.set;
    const observer = new ComputedObserver(obj, getter, setter, useProxy, observerLocator);
    const $get = (() => observer.getValue()) as ObservableGetter;
    $get.getObserver = () => observer;
    Reflect.defineProperty(obj, key, {
      enumerable: descriptor.enumerable,
      configurable: true,
      get: $get,
      set: (v) => {
        observer.setValue(v, LifecycleFlags.none);
      },
    });

    return observer;
  }

  public observers: Map<ICollectionObserver<CollectionKind>, number> = new Map();
  public type: AccessorType = AccessorType.Obj;

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
    public readonly observerLocator: IObserverLocator,
  ) {
    connectable.assignIdTo(this);
  }

  public getValue() {
    if (this.subscriberCount === 0) {
      return this.get.call(this.obj, this);
    }
    if (this.isDirty) {
      this.compute();
    }
    return this.value;
  }

  // deepscan-disable-next-line
  public setValue(v: unknown, _flags: LifecycleFlags): void {
    if (typeof this.set === 'function') {
      if (v !== this.value) {
        // setting running true as a form of batching
        this.running = true;
        this.set.call(this.obj, v);
        this.running = false;

        this.run();
      }
    } else {
      throw new Error('Property is readonly');
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
    if (this.running) {
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
      return this.value = unwrap(this.get.call(this.useProxy ? wrap(this.obj) : this.obj, this));
    } finally {
      this.unobserve(false);
      this.unobserveCollection(false);
      this.running = false;
      exitWatcher(this);
    }
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
      return this.value = unwrap(this.get.call(void 0, this.useProxy ? wrap(this.obj) : this.obj, this));
    } finally {
      this.unobserve(false);
      this.unobserveCollection(false);
      this.running = false;
      exitWatcher(this);
    }
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
