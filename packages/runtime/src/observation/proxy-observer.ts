import { IPropertySubscriber, IProxySubscriber, ISubscriberCollection, LifecycleFlags, MutationKind } from '../observation';
import { subscriberCollection } from './subscriber-collection';

export interface ProxySubscriberCollection extends ISubscriberCollection<MutationKind.instance> {}

@subscriberCollection(MutationKind.instance)
export class ProxySubscriberCollection implements ProxySubscriberCollection {}

const lookup = new WeakMap<object, ProxyObserver>();
const proxies = new WeakSet<object>();

export interface ProxyObserver<T extends object = object> extends ISubscriberCollection<MutationKind.proxy> {}

@subscriberCollection(MutationKind.proxy)
export class ProxyObserver<T extends object = object> implements ProxyObserver<T> {
  public readonly proxy: T;
  public readonly obj: T;
  private readonly subscribers: Record<PropertyKey, ProxySubscriberCollection>;

  constructor(obj: T) {
    this.proxy = new Proxy(obj, this);
    proxies.add(this.proxy);
    this.obj = obj;
    this.subscribers = {};
  }

  public static getOrCreate<T extends object>(obj: T): ProxyObserver<T> {
    let observer = lookup.get(obj);
    if (observer === undefined) {
      observer = new ProxyObserver(obj);
      lookup.set(obj, observer);
    }
    return observer as ProxyObserver<T>;
  }

  public static isProxy<T extends object>(obj: T): boolean {
    return proxies.has(obj);
  }

  public get(target: T, p: PropertyKey, receiver?: unknown): unknown {
    if (typeof receiver === 'object' && !proxies.has(receiver)) {
      return Reflect.get(target, p, receiver);
    }
    return Reflect.get(target, p, target);
  }

  public set(target: T, p: PropertyKey, value: unknown, receiver?: unknown): boolean {
    const oldValue = target[p];
    if (typeof receiver === 'object' && !proxies.has(receiver)) {
      if (Reflect.set(target, p, value, receiver)) {
        if (oldValue !== value) {
          this.callPropertySubscribers(value, oldValue, p);
          this.callSubscribers(p, value, oldValue, LifecycleFlags.updateTargetInstance);
        }
        return true;
      } else {
        return false;
      }
    }
    if (Reflect.set(target, p, value, target)) {
      if (oldValue !== value) {
        this.callPropertySubscribers(value, oldValue, p);
        this.callSubscribers(p, value, oldValue, LifecycleFlags.updateTargetInstance);
      }
      return true;
    } else {
      return false;
    }
  }

  public deleteProperty(target: T, p: PropertyKey): boolean {
    const oldValue = target[p];
    if (Reflect.deleteProperty(target, p)) {
      if (oldValue !== undefined) {
        this.callPropertySubscribers(undefined, oldValue, p);
        this.callSubscribers(p, undefined, oldValue, LifecycleFlags.updateTargetInstance);
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
        this.callSubscribers(p, attributes.value, oldValue, LifecycleFlags.updateTargetInstance);
      }
      return true;
    }
    return false;
  }

  public apply(target: T, thisArg: unknown, argArray?: unknown[]): unknown {
    if (typeof thisArg === 'object' && !proxies.has(thisArg)) {
      return Reflect.apply(target as Function, thisArg, argArray);
    }
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
        subscribers = this.subscribers[key as string | number] = new ProxySubscriberCollection();
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
      subscribers.callSubscribers(newValue, oldValue, LifecycleFlags.updateTargetInstance);
    }
  }
}
