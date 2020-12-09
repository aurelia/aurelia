/* eslint-disable eqeqeq, compat/compat */
import {
  LifecycleFlags,
  AccessorType,
} from '../observation.js';
import { subscriberCollection } from './subscriber-collection.js';
import { enterConnectable, exitConnectable } from './connectable-switcher.js';
import { connectable } from '../binding/connectable.js';
import { wrap, unwrap } from './proxy-observation.js';

import type {
  ISubscriber,
  ICollectionSubscriber,
  ISubscriberCollection,
  IConnectable,
} from '../observation.js';
import type { IConnectableBinding } from '../binding/connectable.js';
import type { IObserverLocator, ObservableGetter } from './observer-locator.js';

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
    if (this.subs.count === 0) {
      return this.get.call(this.obj, this);
    }
    if (this.isDirty) {
      this.compute();
      this.isDirty = false;
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
    if (this.subs.count > 0) {
      this.run();
    }
  }

  public handleCollectionChange(): void {
    this.isDirty = true;
    if (this.subs.count > 0) {
      this.run();
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    // in theory, a collection subscriber could be added before a property subscriber
    // and it should be handled similarly in subscribeToCollection
    // though not handling for now, and wait until the merge of normal + collection subscription
    if (this.subs.add(subscriber) && this.subs.count === 1) {
      this.compute();
      this.isDirty = false;
    }
  }

  public unsubscribe(subscriber: ISubscriber): void {
    if (this.subs.remove(subscriber) && this.subs.count === 0) {
      this.isDirty = true;
      this.obs.clear(true);
      this.cObs.clear(true);
    }
  }

  private run(): void {
    if (this.running) {
      return;
    }
    const oldValue = this.value;
    const newValue = this.compute();

    this.isDirty = false;

    if (!Object.is(newValue, oldValue)) {
      // should optionally queue
      this.subs.notify(newValue, oldValue, LifecycleFlags.none);
    }
  }

  private compute(): unknown {
    this.running = true;
    this.obs.version++;
    try {
      enterConnectable(this);
      return this.value = unwrap(this.get.call(this.useProxy ? wrap(this.obj) : this.obj, this));
    } finally {
      this.obs.clear(false);
      this.cObs.clear(false);
      this.running = false;
      exitConnectable(this);
    }
  }
}

connectable(ComputedObserver);
subscriberCollection()(ComputedObserver);
