import { Tracer, PLATFORM } from '@aurelia/kernel';
import { IPropertySubscriber, IProxySubscriber, ISubscriberCollection, LifecycleFlags, MutationKind } from '../observation';
import { subscriberCollection } from './subscriber-collection';

const slice = Array.prototype.slice;

export interface IProxyObserver<M extends MutationKind, T extends object = object> extends ISubscriberCollection<M> {
  proxy: T;
}

export interface ProxySubscriberCollection<T extends object = object> extends IProxyObserver<MutationKind.instance, T> {}

@subscriberCollection(MutationKind.instance)
export class ProxySubscriberCollection<T extends object = object> implements ProxySubscriberCollection<T> {
  public readonly proxy: T;
  public readonly raw: T;
  public readonly key: PropertyKey;
  constructor(proxy: T, key: PropertyKey) {
    if (Tracer.enabled) { Tracer.enter('ProxySubscriberCollection.constructor', slice.call(arguments)); }
    this.raw = PLATFORM.getRawIfProxy(proxy);
    this.key = key;
    this.proxy = proxy;
    this.subscribe = this.addSubscriber;
    this.unsubscribe = this.removeSubscriber;
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public setValue(value: unknown, flags?: LifecycleFlags): void {
    const oldValue = this.raw[this.key];
    if (oldValue !== value) {
      this.raw[this.key] = value;
      this.callSubscribers(value, oldValue, flags | LifecycleFlags.useProxies | LifecycleFlags.updateTargetInstance);
    }
  }
  public getValue(): unknown {
    return this.raw[this.key];
  }
}

export interface ProxyObserver<T extends object = object> extends IProxyObserver<MutationKind.proxy, T> {}

@subscriberCollection(MutationKind.proxy)
export class ProxyObserver<T extends object = object> implements ProxyObserver<T> {
  public readonly proxy: T;
  private readonly subscribers: Record<PropertyKey, ProxySubscriberCollection<T>>;

  constructor(obj: T) {
    if (Tracer.enabled) { Tracer.enter('ProxyObserver.constructor', slice.call(arguments)); }
    this.proxy = new Proxy(obj, this);
    PLATFORM.proxyLookup.set(obj, this.proxy);
    this.subscribers = {};
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public static getOrCreate<T extends object>(obj: T & { $raw?: T; $observer?: ProxyObserver<T> }): IProxyObserver<MutationKind.instance | MutationKind.proxy, T>;
  public static getOrCreate<T extends object>(obj: T & { $raw?: T; $observer?: ProxyObserver<T> }, key: PropertyKey): IProxyObserver<MutationKind.instance | MutationKind.proxy, T>;
  public static getOrCreate<T extends object>(obj: T & { $raw?: T; $observer?: ProxyObserver<T> }, key?: PropertyKey): IProxyObserver<MutationKind.instance | MutationKind.proxy, T> {
    let proxyObserver: ProxyObserver<T>;
    if (obj.$raw === undefined) {
      const proxy = PLATFORM.proxyLookup.get(obj);
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
    let subscribers = proxyObserver.subscribers[key as string | number];
    if (subscribers === undefined) {
      subscribers = proxyObserver.subscribers[key as string | number] = new ProxySubscriberCollection(proxyObserver.proxy, key);
    }
    return subscribers as IProxyObserver<MutationKind.instance | MutationKind.proxy, T>;
  }

  public static isProxy<T extends object>(obj: T & { $raw?: T }): obj is T & { $raw: T; $observer: ProxyObserver<T> } {
    return obj.$raw !== undefined;
  }

  public get(target: T, p: PropertyKey, receiver?: unknown): unknown {
    if (p === '$observer') {
      return this;
    }
    if (p === '$raw') {
      return target;
    }
    return target[p];
  }

  public set(target: T, p: PropertyKey, value: unknown, receiver?: unknown): boolean {
    const oldValue = target[p];
    if (oldValue !== value) {
      Reflect.set(target, p, value, target);
      this.callPropertySubscribers(value, oldValue, p);
      this.callSubscribers(p, value, oldValue, LifecycleFlags.useProxies | LifecycleFlags.updateTargetInstance);
    }
    return true;
  }

  public deleteProperty(target: T, p: PropertyKey): boolean {
    const oldValue = target[p];
    if (Reflect.deleteProperty(target, p)) {
      if (oldValue !== undefined) {
        this.callPropertySubscribers(undefined, oldValue, p);
        this.callSubscribers(p, undefined, oldValue, LifecycleFlags.useProxies | LifecycleFlags.updateTargetInstance);
      }
      return true;
    }
    return false;
  }

  public defineProperty(target: T, p: PropertyKey, attributes: PropertyDescriptor): boolean {
    const oldValue = target[p];
    if (Reflect.defineProperty(target, p, attributes)) {
      if (attributes.value !== oldValue) {
        this.callPropertySubscribers(attributes.value, oldValue, p);
        this.callSubscribers(p, attributes.value, oldValue, LifecycleFlags.useProxies | LifecycleFlags.updateTargetInstance);
      }
      return true;
    }
    return false;
  }

  public apply(target: T, thisArg: unknown, argArray?: unknown[]): unknown {
    return Reflect.apply(target as Function, target, argArray);
  }

  public subscribe(subscriber: IProxySubscriber): void;
  public subscribe(subscriber: IPropertySubscriber, key: PropertyKey): void;
  public subscribe(subscriber: IPropertySubscriber | IProxySubscriber, key?: PropertyKey): void {
    if (arguments.length === 1) {
      this.addSubscriber(subscriber);
    } else {
      let subscribers = this.subscribers[key as string | number];
      if (subscribers === undefined) {
        subscribers = this.subscribers[key as string | number] = new ProxySubscriberCollection(this.proxy, key);
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
      subscribers.callSubscribers(newValue, oldValue, LifecycleFlags.useProxies | LifecycleFlags.updateTargetInstance);
    }
  }
}
