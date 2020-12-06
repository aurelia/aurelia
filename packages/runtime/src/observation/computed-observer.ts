/* eslint-disable eqeqeq, compat/compat */
import {
  LifecycleFlags,
  AccessorType,
} from '../observation.js';
import { ExpressionKind } from '../binding/ast.js';
import { subscriberCollection } from './subscriber-collection.js';
import { enterConnectable, exitConnectable } from './connectable-switcher.js';
import { connectable } from '../binding/connectable.js';
import { wrap, unwrap } from './proxy-observation.js';

import type {
  IObservable,
  ISubscriber,
  ICollectionSubscriber,
  ISubscriberCollection,
  IConnectable,
} from '../observation.js';
import type { IServiceLocator } from '@aurelia/kernel';
import type { IConnectableBinding } from '../binding/connectable.js';
import type { IsBindingBehavior } from '../binding/ast.js';
import type { IWatcherCallback } from './watch.js';
import type { IObserverLocator, ObservableGetter } from './observer-locator.js';
import type { Scope } from './binding-context.js';


export interface ComputedObserver extends IConnectableBinding, ISubscriberCollection { }

export class ComputedObserver implements IConnectableBinding, ISubscriber, ICollectionSubscriber, ISubscriberCollection {
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
    const $get = ((/* Computed Observer */) => observer.getValue()) as ObservableGetter;
    $get.getObserver = () => observer;
    Reflect.defineProperty(obj, key, {
      enumerable: descriptor.enumerable,
      configurable: true,
      get: $get,
      set: (/* Computed Observer */v) => {
        observer.setValue(v, LifecycleFlags.none);
      },
    });

    return observer;
  }

  public id!: number;
  public interceptor = this;
  public type: AccessorType = AccessorType.Obj;
  public value: unknown = void 0;

  /**
   * @internal
   */
  private subCount: number = 0;
  // todo: maybe use a counter allow recursive call to a certain level
  /**
   * @internal
   */
  private running: boolean = false;

  private isDirty: boolean = false;

  public constructor(
    public readonly obj: object,
    public readonly get: (watcher: IConnectable) => unknown,
    public readonly set: undefined | ((v: unknown) => void),
    public readonly useProxy: boolean,
    public readonly observerLocator: IObserverLocator,
  ) {
    connectable.assignIdTo(this);
  }

  public getValue() {
    if (this.subCount === 0) {
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
    if (this.subCount > 0) {
      this.run();
    }
  }

  public handleCollectionChange(): void {
    this.isDirty = true;
    if (this.subCount > 0) {
      this.run();
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    // in theory, a collection subscriber could be added before a property subscriber
    // and it should be handled similarly in subscribeToCollection
    // though not handling for now, and wait until the merge of normal + collection subscription
    if (this.addSubscriber(subscriber) && ++this.subCount === 1) {
      this.compute();
      this.isDirty = false;
    }
  }

  public unsubscribe(subscriber: ISubscriber): void {
    if (this.removeSubscriber(subscriber) && --this.subCount === 0) {
      this.isDirty = true;
      this.record.clear(true);
      this.cRecord.clear(true);
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
    this.record.version++;
    try {
      enterConnectable(this);
      return this.value = unwrap(this.get.call(this.useProxy ? wrap(this.obj) : this.obj, this));
    } finally {
      this.record.clear(false);
      this.cRecord.clear(false);
      this.running = false;
      exitConnectable(this);
    }
  }
}

// watchers (Computed & Expression) are basically binding,
// they are treated as special and setup before all other bindings

export interface ComputedWatcher extends IConnectableBinding { }

export class ComputedWatcher implements IConnectableBinding, ISubscriber, ICollectionSubscriber {
  public interceptor = this;

  public id!: number;
  public value: unknown = void 0;
  public isBound: boolean = false;

  // todo: maybe use a counter allow recursive call to a certain level
  private running: boolean = false;

  public constructor(
    public readonly obj: IObservable,
    public readonly observerLocator: IObserverLocator,
    public readonly get: (obj: object, watcher: IConnectable) => unknown,
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
    this.record.clear(true);
    this.cRecord.clear(true);
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
    this.record.version++;
    try {
      enterConnectable(this);
      return this.value = unwrap(this.get.call(void 0, this.useProxy ? wrap(this.obj) : this.obj, this));
    } finally {
      this.record.clear(false);
      this.cRecord.clear(false);
      this.running = false;
      exitConnectable(this);
    }
  }
}

/**
 * @internal The interface describes methods added by `connectable` & `subscriberCollection` decorators
 */
export interface ExpressionWatcher extends IConnectableBinding { }

export class ExpressionWatcher implements IConnectableBinding {
  public interceptor = this;
  /**
   * @internal
   */
  private readonly obj: object;

  public value: unknown;
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
    const canOptimize = expr.$kind === ExpressionKind.AccessScope && this.record.count === 1;
    if (!canOptimize) {
      this.record.version++;
      value = expr.evaluate(0, this.scope, null, this.locator, this);
      this.record.clear(false);
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
    this.record.version++;
    this.value = this.expression.evaluate(LifecycleFlags.none, this.scope, null, this.locator, this);
    this.record.clear(false);
  }

  public $unbind(): void {
    if (!this.isBound) {
      return;
    }
    this.isBound = false;
    this.record.clear(true);
    this.value = void 0;
  }
}

connectable(ComputedObserver);
subscriberCollection()(ComputedObserver);

connectable(ComputedWatcher);
connectable(ExpressionWatcher);
