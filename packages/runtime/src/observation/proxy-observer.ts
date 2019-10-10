import { PLATFORM } from '@aurelia/kernel';
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
export class ProxySubscriberCollection<TObj extends object = object> implements ProxySubscriberCollection<TObj> {
  public inBatch: boolean;

  public readonly proxy: IProxy<TObj>;
  public readonly raw: TObj;
  public readonly key: string | number;
  public constructor(proxy: IProxy<TObj>, raw: TObj, key: string | number) {

    this.inBatch = false;

    this.raw = raw;
    this.key = key;
    this.proxy = proxy;
    this.subscribe = this.addSubscriber;
    this.unsubscribe = this.removeSubscriber;
    if (raw[key as keyof TObj] instanceof Object) { // Ensure we observe array indices and newly created object properties
      raw[key as keyof TObj] = ProxyObserver.getOrCreate(raw[key as keyof TObj] as unknown as object).proxy as unknown as TObj[keyof TObj];
    }
  }

  public setValue(value: unknown, flags?: LifecycleFlags): void {
    const oldValue = this.raw[this.key as keyof TObj];
    if (oldValue !== value) {
      this.raw[this.key as keyof TObj] = value as TObj[keyof TObj];
      this.callSubscribers(value, oldValue, flags! | LifecycleFlags.proxyStrategy | LifecycleFlags.updateTargetInstance);
    }
  }
  public getValue(): unknown {
    return this.raw[this.key as keyof TObj];
  }

  public flushBatch(flags: LifecycleFlags): void {
    return;
  }
}

export interface ProxyObserver<TObj extends object = object> extends IProxyObserver<TObj> {}

@proxySubscriberCollection()
export class ProxyObserver<TObj extends object = object> implements ProxyObserver<TObj> {
  public readonly proxy: IProxy<TObj>;
  public readonly raw: TObj;
  private readonly subscribers: Record<string | number, ProxySubscriberCollection<TObj>>;

  public constructor(obj: TObj) {
    this.raw = obj;
    this.proxy = new Proxy<TObj>(obj, this) as IProxy<TObj>;
    lookup.set(obj, this.proxy);
    this.subscribers = {};
  }

  public static getProxyOrSelf<T extends object = object>(obj: T): T {
    if ((obj as { $raw?: T }).$raw === void 0) {
      const proxy = lookup.get(obj) as T;
      if (proxy === void 0) {
        return obj;
      }
      return proxy;
    }
    return obj;
  }
  public static getRawIfProxy<T extends object = object>(obj: T): T {
    const raw = (obj as { $raw?: T }).$raw;
    if (raw === void 0) {
      return obj;
    }
    return raw;
  }

  public static getOrCreate<T extends object>(obj: T): IProxyObserver<T>;
  public static getOrCreate<T extends object>(obj: T, key: string | number): PropertyObserver;
  public static getOrCreate<T extends object>(obj: T, key?: string | number): IProxyObserver<T> | PropertyObserver {
    let proxyObserver: ProxyObserver<T>;
    if ((obj as T & { $raw?: T }).$raw === void 0) {
      const proxy = lookup.get(obj);
      if (proxy === void 0) {
        proxyObserver = new ProxyObserver(obj);
      } else {
        proxyObserver = (proxy as T & { $observer: ProxyObserver<T> }).$observer;
      }
    } else {
      proxyObserver = (obj as T & { $observer: ProxyObserver<T> }).$observer;
    }
    if (key === void 0) {
      return proxyObserver;
    }
    let subscribers = proxyObserver.subscribers[key];
    if (subscribers === void 0) {
      const raw = this.getRawIfProxy(obj);
      const proxy = proxyObserver.proxy;
      subscribers = proxyObserver.subscribers[key] = new ProxySubscriberCollection(proxy, raw, key);
    }
    return subscribers;
  }

  public static isProxy<T extends object>(obj: T & { $raw?: T }): obj is T & { $raw: T; $observer: ProxyObserver<T> } {
    return obj.$raw !== void 0;
  }

  public get(target: TObj, p: string | number, receiver?: unknown): unknown {
    if (p === '$observer') {
      return this;
    }
    if (p === '$raw') {
      return target;
    }
    return target[p as keyof TObj];
  }

  public set(target: TObj, p: string | number, value: unknown, receiver?: unknown): boolean {
    const oldValue = target[p as keyof TObj];
    if (oldValue !== value) {
      target[p as keyof TObj] = value as TObj[keyof TObj];
      this.callPropertySubscribers(value, oldValue, p);
      this.callProxySubscribers(p, value, oldValue, LifecycleFlags.proxyStrategy | LifecycleFlags.updateTargetInstance);
    }
    return true;
  }

  public deleteProperty(target: TObj, p: string | number): boolean {
    const oldValue = target[p as keyof TObj];
    if (Reflect.deleteProperty(target, p)) {
      if (oldValue !== void 0) {
        this.callPropertySubscribers(undefined, oldValue, p);
        this.callProxySubscribers(p, undefined, oldValue, LifecycleFlags.proxyStrategy | LifecycleFlags.updateTargetInstance);
      }
      return true;
    }
    return false;
  }

  public defineProperty(target: TObj, p: string | number, attributes: PropertyDescriptor): boolean {
    const oldValue = target[p as keyof TObj];
    if (Reflect.defineProperty(target, p, attributes)) {
      if (attributes.value !== oldValue) {
        this.callPropertySubscribers(attributes.value, oldValue, p);
        this.callProxySubscribers(p, attributes.value, oldValue, LifecycleFlags.proxyStrategy | LifecycleFlags.updateTargetInstance);
      }
      return true;
    }
    return false;
  }

  public apply(target: TObj, thisArg: unknown, argArray: ArrayLike<unknown> = PLATFORM.emptyArray): unknown {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return Reflect.apply(target as Function, target, argArray); // Reflect API dictates this
  }

  public subscribe(subscriber: IProxySubscriber): void;
  public subscribe(subscriber: ISubscriber, key: string | number): void;
  public subscribe(subscriber: ISubscriber | IProxySubscriber, key?: string | number): void {
    if (key === void 0) {
      this.addProxySubscriber(subscriber as IProxySubscriber);
    } else {
      let subscribers = this.subscribers[key];
      if (subscribers === void 0) {
        subscribers = this.subscribers[key] = new ProxySubscriberCollection(this.proxy, this.raw, key);
      }
      subscribers.addSubscriber(subscriber as ISubscriber);
    }
  }

  public unsubscribe(subscriber: IProxySubscriber): void;
  public unsubscribe(subscriber: ISubscriber, key: string | number): void;
  public unsubscribe(subscriber: ISubscriber | IProxySubscriber, key?: string | number): void {
    if (key === void 0) {
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
    if (subscribers !== void 0) {
      subscribers.callSubscribers(newValue, oldValue, LifecycleFlags.proxyStrategy | LifecycleFlags.updateTargetInstance);
    }
  }
}
