import { Tracer } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import {
  IPropertySubscriber,
  IProxy,
  IProxyObserver,
  IProxySubscriber,
  MutationKind
} from '../observation';
import { subscriberCollection } from './subscriber-collection';

const slice = Array.prototype.slice;

const lookup: WeakMap<object, IProxy> = new WeakMap();
export interface ProxySubscriberCollection<TObj extends object = object> extends IProxyObserver<TObj, MutationKind.instance> {}

@subscriberCollection(MutationKind.instance)
export class ProxySubscriberCollection<TObj extends object = object> implements ProxySubscriberCollection<TObj> {
  public readonly proxy: IProxy<TObj>;
  public readonly raw: TObj;
  public readonly key: PropertyKey;
  constructor(proxy: IProxy<TObj>, raw: TObj, key: PropertyKey) {
    if (Tracer.enabled) { Tracer.enter('ProxySubscriberCollection', 'constructor', slice.call(arguments)); }
    this.raw = raw;
    this.key = key;
    this.proxy = proxy;
    this.subscribe = this.addSubscriber;
    this.unsubscribe = this.removeSubscriber;
    if (raw[key as keyof TObj] instanceof Object) { // Ensure we observe array indices and newly created object properties
      raw[key as keyof TObj] = ProxyObserver.getOrCreate(raw[key as keyof TObj]).proxy as unknown as TObj[keyof TObj];
    }
    if (Tracer.enabled) { Tracer.leave(); }
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
}

export interface ProxyObserver<TObj extends object = object> extends IProxyObserver<TObj> {}

@subscriberCollection(MutationKind.proxy)
export class ProxyObserver<TObj extends object = object> implements ProxyObserver<TObj> {
  public readonly proxy: IProxy<TObj>;
  public readonly raw: TObj;
  private readonly subscribers: Record<PropertyKey, ProxySubscriberCollection<TObj>>;

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
  public static getOrCreate<T extends object>(obj: T & { $raw?: T; $observer?: ProxyObserver<T> }, key: PropertyKey): IProxyObserver<T, MutationKind.instance>;
  public static getOrCreate<T extends object>(obj: T & { $raw?: T; $observer?: ProxyObserver<T> }, key?: PropertyKey): IProxyObserver<T, MutationKind.instance | MutationKind.proxy> {
    let proxyObserver: ProxyObserver<T>;
    if (obj.$raw === undefined) {
      const proxy = lookup.get(obj);
      if (proxy === undefined) {
        proxyObserver = new ProxyObserver(obj);
      } else {
        proxyObserver = (proxy as { $observer: ProxyObserver<T> }).$observer;
      }
    } else {
      proxyObserver = obj.$observer!;
    }
    if (arguments.length === 1) {
      return proxyObserver;
    }
    let subscribers = proxyObserver.subscribers[key as string | number];
    if (subscribers === undefined) {
      const raw = this.getRawIfProxy(obj);
      const proxy = proxyObserver.proxy;
      subscribers = proxyObserver.subscribers[key as string | number] = new ProxySubscriberCollection(proxy, raw, key as keyof T);
    }
    return subscribers;
  }

  public static isProxy<T extends object>(obj: T & { $raw?: T }): obj is T & { $raw: T; $observer: ProxyObserver<T> } {
    return obj.$raw !== undefined;
  }

  public get(target: TObj, p: PropertyKey, receiver?: unknown): unknown {
    if (p === '$observer') {
      return this;
    }
    if (p === '$raw') {
      return target;
    }
    return target[p as keyof TObj];
  }

  public set(target: TObj, p: PropertyKey, value: unknown, receiver?: unknown): boolean {
    const oldValue = target[p as keyof TObj];
    if (oldValue !== value) {
      Reflect.set(target, p, value, target);
      this.callPropertySubscribers(value, oldValue, p);
      this.callSubscribers(p, value, oldValue, LifecycleFlags.proxyStrategy | LifecycleFlags.updateTargetInstance);
    }
    return true;
  }

  public deleteProperty(target: TObj, p: PropertyKey): boolean {
    const oldValue = target[p as keyof TObj];
    if (Reflect.deleteProperty(target, p)) {
      if (oldValue !== undefined) {
        this.callPropertySubscribers(undefined, oldValue, p);
        this.callSubscribers(p, undefined, oldValue, LifecycleFlags.proxyStrategy | LifecycleFlags.updateTargetInstance);
      }
      return true;
    }
    return false;
  }

  public defineProperty(target: TObj, p: PropertyKey, attributes: PropertyDescriptor): boolean {
    const oldValue = target[p as keyof TObj];
    if (Reflect.defineProperty(target, p, attributes)) {
      if (attributes.value !== oldValue) {
        this.callPropertySubscribers(attributes.value, oldValue, p);
        this.callSubscribers(p, attributes.value, oldValue, LifecycleFlags.proxyStrategy | LifecycleFlags.updateTargetInstance);
      }
      return true;
    }
    return false;
  }

  public apply(target: TObj, thisArg: unknown, argArray?: unknown[]): unknown {
    // tslint:disable-next-line:ban-types // Reflect API dictates this
    return Reflect.apply(target as Function, target, argArray!);
  }

  public subscribe(subscriber: IProxySubscriber): void;
  public subscribe(subscriber: IPropertySubscriber, key: PropertyKey): void;
  public subscribe(subscriber: IPropertySubscriber | IProxySubscriber, key?: PropertyKey): void {
    if (arguments.length === 1) {
      this.addSubscriber(subscriber);
    } else {
      let subscribers = this.subscribers[key as string | number];
      if (subscribers === undefined) {
        subscribers = this.subscribers[key as string | number] = new ProxySubscriberCollection(this.proxy, this.raw, key as keyof TObj);
      }
      subscribers.addSubscriber(subscriber as IPropertySubscriber);
    }
  }

  public unsubscribe(subscriber: IProxySubscriber): void;
  public unsubscribe(subscriber: IPropertySubscriber, key: PropertyKey): void;
  public unsubscribe(subscriber: IPropertySubscriber | IProxySubscriber, key?: PropertyKey): void {
    if (arguments.length === 1) {
      this.removeSubscriber(subscriber);
    } else {
      const subscribers = this.subscribers[key as string | number];
      if (subscribers !== undefined) {
        subscribers.removeSubscriber(subscriber as IPropertySubscriber);
      }
    }
  }

  private callPropertySubscribers(newValue: unknown, oldValue: unknown, key: PropertyKey): void {
    const subscribers = this.subscribers[key as string | number];
    if (subscribers !== undefined) {
      subscribers.callSubscribers(newValue, oldValue, LifecycleFlags.proxyStrategy | LifecycleFlags.updateTargetInstance);
    }
  }
}
