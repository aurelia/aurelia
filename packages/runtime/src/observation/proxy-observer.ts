import { Tracer } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import {
  IPropertyObserver,
  IProxy,
  IProxyObserver,
  IProxySubscriber,
  ISubscriber,
  PropertyObserver
} from '../observation';
import { proxySubscriberCollection, subscriberCollection } from './subscriber-collection';

const slice = Array.prototype.slice;
type Indexable = Record<string | number, unknown>;

const lookup: WeakMap<object, IProxy> = new WeakMap();
export interface ProxySubscriberCollection extends IPropertyObserver<Indexable, string> {}

@subscriberCollection()
export class ProxySubscriberCollection implements ProxySubscriberCollection {
  public readonly proxy: IProxy<Indexable>;
  public readonly raw: Indexable;
  public readonly key: string | number;
  constructor(proxy: IProxy<Indexable>, raw: Indexable, key: string | number) {
    if (Tracer.enabled) { Tracer.enter('ProxySubscriberCollection', 'constructor', slice.call(arguments)); }
    this.raw = raw;
    this.key = key;
    this.proxy = proxy;
    this.subscribe = this.addSubscriber;
    this.unsubscribe = this.removeSubscriber;
    if (raw[key] instanceof Object) { // Ensure we observe array indices and newly created object properties
      raw[key] = ProxyObserver.getOrCreate(raw[key] as object).proxy;
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public setValue(value: unknown, flags?: LifecycleFlags): void {
    const oldValue = this.raw[this.key];
    if (oldValue !== value) {
      this.raw[this.key] = value;
      this.callSubscribers(value, oldValue, flags | LifecycleFlags.proxyStrategy | LifecycleFlags.updateTargetInstance);
    }
  }
  public getValue(): unknown {
    return this.raw[this.key];
  }
}

export interface ProxyObserver<TObj extends object = object> extends IProxyObserver<TObj> {}

@proxySubscriberCollection()
export class ProxyObserver<TObj extends object = object> implements ProxyObserver<TObj> {
  public readonly proxy: IProxy<TObj>;
  public readonly raw: TObj;
  private readonly subscribers: Record<string | number, ProxySubscriberCollection>;

  constructor(obj: TObj) {
    if (Tracer.enabled) { Tracer.enter('ProxyObserver', 'constructor', slice.call(arguments)); }
    this.raw = obj;
    this.proxy = new Proxy<TObj>(obj, this) as IProxy<TObj>;
    lookup.set(obj, this.proxy);
    this.subscribers = {};
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public static getProxyOrSelf<T extends object = object>(obj: T): T {
    if ((obj as { $raw?: T }).$raw === undefined) {
      const proxy = lookup.get(obj) as T;
      if (proxy === undefined) {
        return obj;
      }
      return proxy;
    }
    return obj;
  }

  public static getRawIfProxy<T extends object = object>(obj: T): T {
    const raw = (obj as { $raw?: T }).$raw;
    if (raw === undefined) {
      return obj;
    }
    return raw;
  }

  public static getOrCreate<T extends object>(obj: T & { $raw?: T; $observer?: ProxyObserver<T> }): IProxyObserver<T>;
  public static getOrCreate<T extends object>(obj: T & { $raw?: T; $observer?: ProxyObserver<T> }, key: string | number): PropertyObserver;
  public static getOrCreate<T extends object>(obj: T & { $raw?: T; $observer?: ProxyObserver<T> }, key?: string | number): IProxyObserver<T> | PropertyObserver {
    let proxyObserver: ProxyObserver<T>;
    if (obj.$raw === undefined) {
      const proxy = lookup.get(obj);
      if (proxy === undefined) {
        proxyObserver = new ProxyObserver(obj);
      } else {
        proxyObserver = (proxy as { $observer: ProxyObserver<T> }).$observer;
      }
    } else {
      proxyObserver = obj.$observer;
    }
    if (arguments.length === 1) {
      return proxyObserver;
    }
    let subscribers = proxyObserver.subscribers[key];
    if (subscribers === undefined) {
      const raw = this.getRawIfProxy(obj);
      const proxy = proxyObserver.proxy;
      subscribers = proxyObserver.subscribers[key] = new ProxySubscriberCollection(proxy, raw, key);
    }
    return subscribers;
  }

  public static isProxy<T extends object>(obj: T & { $raw?: T }): obj is T & { $raw: T; $observer: ProxyObserver<T> } {
    return obj.$raw !== undefined;
  }

  public get(target: TObj, p: string | number, receiver?: unknown): unknown {
    if (p === '$observer') {
      return this;
    }
    if (p === '$raw') {
      return target;
    }
    return target[p];
  }

  public set(target: TObj, p: string | number, value: unknown, receiver?: unknown): boolean {
    const oldValue = target[p];
    if (oldValue !== value) {
      Reflect.set(target, p, value, target);
      this.callPropertySubscribers(value, oldValue, p);
      this.callProxySubscribers(p, value, oldValue, LifecycleFlags.proxyStrategy | LifecycleFlags.updateTargetInstance);
    }
    return true;
  }

  public deleteProperty(target: TObj, p: string | number): boolean {
    const oldValue = target[p];
    if (Reflect.deleteProperty(target, p)) {
      if (oldValue !== undefined) {
        this.callPropertySubscribers(undefined, oldValue, p);
        this.callProxySubscribers(p, undefined, oldValue, LifecycleFlags.proxyStrategy | LifecycleFlags.updateTargetInstance);
      }
      return true;
    }
    return false;
  }

  public defineProperty(target: TObj, p: string | number, attributes: PropertyDescriptor): boolean {
    const oldValue = target[p];
    if (Reflect.defineProperty(target, p, attributes)) {
      if (attributes.value !== oldValue) {
        this.callPropertySubscribers(attributes.value, oldValue, p);
        this.callProxySubscribers(p, attributes.value, oldValue, LifecycleFlags.proxyStrategy | LifecycleFlags.updateTargetInstance);
      }
      return true;
    }
    return false;
  }

  public apply(target: TObj, thisArg: unknown, argArray?: unknown[]): unknown {
    // tslint:disable-next-line:ban-types // Reflect API dictates this
    return Reflect.apply(target as Function, target, argArray);
  }

  public subscribe(subscriber: IProxySubscriber): void;
  public subscribe(subscriber: ISubscriber, key: string | number): void;
  public subscribe(subscriber: ISubscriber | IProxySubscriber, key?: string | number): void {
    if (arguments.length === 1) {
      this.addProxySubscriber(subscriber as IProxySubscriber);
    } else {
      let subscribers = this.subscribers[key];
      if (subscribers === undefined) {
        subscribers = this.subscribers[key] = new ProxySubscriberCollection(this.proxy, this.raw, key);
      }
      subscribers.addSubscriber(subscriber as ISubscriber);
    }
  }

  public unsubscribe(subscriber: IProxySubscriber): void;
  public unsubscribe(subscriber: ISubscriber, key: string | number): void;
  public unsubscribe(subscriber: ISubscriber | IProxySubscriber, key?: string | number): void {
    if (arguments.length === 1) {
      this.removeProxySubscriber(subscriber as IProxySubscriber);
    } else {
      const subscribers = this.subscribers[key];
      if (subscribers !== undefined) {
        subscribers.removeSubscriber(subscriber as ISubscriber);
      }
    }
  }

  private callPropertySubscribers(newValue: unknown, oldValue: unknown, key: string | number): void {
    const subscribers = this.subscribers[key];
    if (subscribers !== undefined) {
      subscribers.callSubscribers(newValue, oldValue, LifecycleFlags.proxyStrategy | LifecycleFlags.updateTargetInstance);
    }
  }
}
