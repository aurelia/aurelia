import { IIndexable } from '@aurelia/kernel';
import { LifecycleFlags } from './flags';
import { ILifecycle } from './lifecycle';

/** @internal */
export const enum SubscriberFlags {
  None            = 0,
  Subscriber0     = 0b0001,
  Subscriber1     = 0b0010,
  Subscriber2     = 0b0100,
  SubscribersRest = 0b1000,
  Any             = 0b1111,
}

export enum DelegationStrategy {
  none = 0,
  capturing = 1,
  bubbling = 2
}

export interface IBatchable {
  flushBatch(flags: LifecycleFlags): void;
}

export interface ISubscriber<TValue = unknown> {
  id?: number;
  handleChange(newValue: TValue, previousValue: TValue, flags: LifecycleFlags): void;
}

export interface IProxySubscriber<TValue = unknown> {
  handleProxyChange(key: PropertyKey, newValue: TValue, previousValue: TValue, flags: LifecycleFlags): void;
}

export interface ICollectionSubscriber {
  handleCollectionChange(indexMap: IndexMap, flags: LifecycleFlags): void;
}

export interface ISubscribable {
  subscribe(subscriber: ISubscriber): void;
  unsubscribe(subscriber: ISubscriber): void;
}

export interface IProxySubscribable {
  subscribeToProxy(subscriber: IProxySubscriber): void;
  unsubscribeFromProxy(subscriber: IProxySubscriber): void;
}

export interface ICollectionSubscribable {
  subscribeToCollection(subscriber: ICollectionSubscriber): void;
  unsubscribeFromCollection(subscriber: ICollectionSubscriber): void;
}

export interface ISubscriberCollection extends ISubscribable {
  /** @internal */_subscriberFlags: SubscriberFlags;
  /** @internal */_subscriber0?: ISubscriber;
  /** @internal */_subscriber1?: ISubscriber;
  /** @internal */_subscriber2?: ISubscriber;
  /** @internal */_subscribersRest?: ISubscriber[];

  callSubscribers(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void;
  hasSubscribers(): boolean;
  hasSubscriber(subscriber: ISubscriber): boolean;
  removeSubscriber(subscriber: ISubscriber): boolean;
  addSubscriber(subscriber: ISubscriber): boolean;

  [key: number]: LifecycleFlags;
}

export interface IProxySubscriberCollection extends IProxySubscribable {
  /** @internal */_proxySubscriberFlags: SubscriberFlags;
  /** @internal */_proxySubscriber0?: IProxySubscriber;
  /** @internal */_proxySubscriber1?: IProxySubscriber;
  /** @internal */_proxySubscriber2?: IProxySubscriber;
  /** @internal */_proxySubscribersRest?: IProxySubscriber[];

  callProxySubscribers(key: PropertyKey, newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
  hasProxySubscribers(): boolean;
  hasProxySubscriber(subscriber: IProxySubscriber): boolean;
  removeProxySubscriber(subscriber: IProxySubscriber): boolean;
  addProxySubscriber(subscriber: IProxySubscriber): boolean;

  [key: number]: LifecycleFlags;
}

export interface ICollectionSubscriberCollection extends ICollectionSubscribable {
  /** @internal */_collectionSubscriberFlags: SubscriberFlags;
  /** @internal */_collectionSubscriber0?: ICollectionSubscriber;
  /** @internal */_collectionSubscriber1?: ICollectionSubscriber;
  /** @internal */_collectionSubscriber2?: ICollectionSubscriber;
  /** @internal */_collectionSubscribersRest?: ICollectionSubscriber[];

  callCollectionSubscribers(indexMap: IndexMap, flags: LifecycleFlags): void;
  hasCollectionSubscribers(): boolean;
  hasCollectionSubscriber(subscriber: ICollectionSubscriber): boolean;
  removeCollectionSubscriber(subscriber: ICollectionSubscriber): boolean;
  addCollectionSubscriber(subscriber: ICollectionSubscriber): boolean;

  [key: number]: LifecycleFlags;
}

/**
 * Describes a complete property observer with an accessor, change tracking fields, normal and batched subscribers
 */
export interface IPropertyObserver<TObj extends object, TProp extends keyof TObj> extends
  IAccessor<TObj[TProp]>,
  IPropertyChangeTracker<TObj, TProp>,
  ISubscriberCollection,
  IBatchable {
  inBatch: boolean;
  observing: boolean;
  persistentFlags: LifecycleFlags;
}

/**
 * An any-typed property observer
 */
export type PropertyObserver = IPropertyObserver<IIndexable, string>;

/**
 * A collection (array, set or map)
 */
export type Collection = unknown[] | Set<unknown> | Map<unknown, unknown>;
interface IObservedCollection<T extends CollectionKind = CollectionKind> {
  $observer?: ICollectionObserver<T>;
  $raw?: this;
}

/**
 * An array that is being observed for mutations
 */
export interface IObservedArray<T = unknown> extends IObservedCollection<CollectionKind.array>, Array<T> { }
/**
 * A set that is being observed for mutations
 */
export interface IObservedSet<T = unknown> extends IObservedCollection<CollectionKind.set>, Set<T> { }
/**
 * A map that is being observed for mutations
 */
export interface IObservedMap<K = unknown, V = unknown> extends IObservedCollection<CollectionKind.map>, Map<K, V> { }
/**
 * A collection that is being observed for mutations
 */
export type ObservedCollection = IObservedArray | IObservedSet | IObservedMap;

export const enum CollectionKind {
  indexed = 0b1000,
  keyed   = 0b0100,
  array   = 0b1001,
  map     = 0b0110,
  set     = 0b0111
}

export type LengthPropertyName<T> =
  T extends unknown[] ? 'length' :
    T extends Set<unknown> ? 'size' :
      T extends Map<unknown, unknown> ? 'size' :
        never;

export type CollectionTypeToKind<T> =
  T extends unknown[] ? CollectionKind.array | CollectionKind.indexed :
    T extends Set<unknown> ? CollectionKind.set | CollectionKind.keyed :
      T extends Map<unknown, unknown> ? CollectionKind.map | CollectionKind.keyed :
        never;

export type CollectionKindToType<T> =
  T extends CollectionKind.array ? unknown[] :
    T extends CollectionKind.indexed ? unknown[] :
      T extends CollectionKind.map ? Map<unknown, unknown> :
        T extends CollectionKind.set ? Set<unknown> :
          T extends CollectionKind.keyed ? Set<unknown> | Map<unknown, unknown> :
            never;

export type ObservedCollectionKindToType<T> =
  T extends CollectionKind.array ? IObservedArray :
    T extends CollectionKind.indexed ? IObservedArray :
      T extends CollectionKind.map ? IObservedMap :
        T extends CollectionKind.set ? IObservedSet :
          T extends CollectionKind.keyed ? IObservedSet | IObservedMap :
            never;

export interface IProxyObserver<TObj extends {} = {}> extends IProxySubscriberCollection {
  proxy: IProxy<TObj>;
}

export type IProxy<TObj extends {} = {}> = TObj & {
  $raw: TObj;
  $observer: IProxyObserver<TObj>;
};

/**
 * Basic interface to normalize getting/setting a value of any property on any object
 */
export interface IAccessor<TValue = unknown> {
  getValue(): TValue;
  setValue(newValue: TValue, flags: LifecycleFlags): void;
}

/**
 * Describes a target observer for to-view bindings (in other words, an observer without the observation).
 */
export interface IBindingTargetAccessor<
  TObj = any,
  TProp = keyof TObj,
  TValue = unknown>
  extends IAccessor<TValue>,
  IPropertyChangeTracker<TObj, TProp> {
  bind?(flags: LifecycleFlags): void;
  unbind?(flags: LifecycleFlags): void;
}

/**
 * Describes a target observer for from-view or two-way bindings.
 */
export interface IBindingTargetObserver<
  TObj = any,
  TProp = keyof TObj,
  TValue = unknown>
  extends IBindingTargetAccessor<TObj, TProp, TValue>,
  ISubscribable,
  ISubscriberCollection {}

export type AccessorOrObserver = IBindingTargetAccessor | IBindingTargetObserver;

/**
 * An array of indices, where the index of an element represents the index to map FROM, and the numeric value of the element itself represents the index to map TO
 *
 * The deletedItems property contains the items (in case of an array) or keys (in case of map or set) that have been deleted.
 */
export type IndexMap = number[] & {
  deletedItems: number[];
  isIndexMap: true;
};

export function copyIndexMap(
  existing: number[] & { deletedItems?: number[] },
  deletedItems?: number[],
): IndexMap {
  const { length } = existing;
  const arr = Array(length) as IndexMap;
  let i = 0;
  while (i < length) {
    arr[i] = existing[i];
    ++i;
  }
  if (deletedItems !== void 0) {
    arr.deletedItems = deletedItems.slice(0);
  } else if (existing.deletedItems !== void 0) {
    arr.deletedItems = existing.deletedItems.slice(0);
  } else {
    arr.deletedItems = [];
  }
  arr.isIndexMap = true;
  return arr;
}

export function createIndexMap(length: number = 0): IndexMap {
  const arr = Array(length) as IndexMap;
  let i = 0;
  while (i < length) {
    arr[i] = i++;
  }
  arr.deletedItems = [];
  arr.isIndexMap = true;
  return arr;
}

export function cloneIndexMap(indexMap: IndexMap): IndexMap {
  const clone = indexMap.slice() as IndexMap;
  clone.deletedItems = indexMap.deletedItems.slice();
  clone.isIndexMap = true;
  return clone;
}

export function isIndexMap(value: unknown): value is IndexMap {
  return value instanceof Array && (value as IndexMap).isIndexMap === true;
}

/**
 * Describes a type that specifically tracks changes in an object property, or simply something that can have a getter and/or setter
 */
export interface IPropertyChangeTracker<TObj, TProp = keyof TObj, TValue = unknown> {
  obj: TObj;
  propertyKey?: TProp;
  currentValue?: TValue;
}

export interface ICollectionLengthObserver extends IAccessor<number>, IPropertyChangeTracker<unknown[], 'length', number>, ISubscriberCollection {
  currentValue: number;
}

export interface ICollectionSizeObserver extends IAccessor<number>, IPropertyChangeTracker<Set<unknown> | Map<unknown, unknown>, 'size', number>, ISubscriberCollection {
  currentValue: number;
}

/**
 * Describes a type that specifically tracks changes in a collection (map, set or array)
 */
export interface ICollectionChangeTracker<T extends Collection> {
  collection: T;
  indexMap: IndexMap;
}

/**
 * An observer that tracks collection mutations and notifies subscribers (either directly or in batches)
 */
export interface ICollectionObserver<T extends CollectionKind> extends
  ICollectionChangeTracker<CollectionKindToType<T>>,
  ICollectionSubscriberCollection,
  IBatchable {
  inBatch: boolean;
  lifecycle: ILifecycle;
  persistentFlags: LifecycleFlags;
  collection: ObservedCollectionKindToType<T>;
  lengthObserver: T extends CollectionKind.array ? ICollectionLengthObserver : ICollectionSizeObserver;
  getLengthObserver(): T extends CollectionKind.array ? ICollectionLengthObserver : ICollectionSizeObserver;
  notify(): void;
}
export type CollectionObserver = ICollectionObserver<CollectionKind>;

export interface IBindingContext {
  [key: string]: any;

  readonly $synthetic?: true;
  readonly $observers?: ObserversLookup;
  getObservers?(flags: LifecycleFlags): ObserversLookup;
}

export interface IOverrideContext {
  [key: string]: unknown;

  readonly $synthetic?: true;
  readonly $observers?: ObserversLookup;
  readonly bindingContext: IBindingContext;
  readonly parentOverrideContext: IOverrideContext | null;
  getObservers(flags: LifecycleFlags): ObserversLookup;
}

export interface IScope {
  readonly parentScope: IScope | null;
  readonly scopeParts: readonly string[];
  readonly bindingContext: IBindingContext;
  readonly overrideContext: IOverrideContext;
}

export type ObserversLookup = IIndexable<{
  getOrCreate(
    lifecycle: ILifecycle,
    flags: LifecycleFlags,
    obj: IBindingContext | IOverrideContext,
    key: string,
  ): PropertyObserver;
}, PropertyObserver>;

export type InlineObserversLookup<T> = IIndexable<{}, T>;

export type IObservable<T = {}> = {
  readonly $synthetic?: false;
  $observers?: ObserversLookup | InlineObserversLookup<T>;
};
