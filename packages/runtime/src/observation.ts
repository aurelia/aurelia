import { IDisposable, IIndexable } from '@aurelia/kernel';
import { LifecycleFlags, State } from './flags';
import { ILifecycle } from './lifecycle';

export interface IProxyObserver<TObj extends object = object, TMut extends MutationKind = MutationKind.proxy> extends ISubscriberCollection<TMut> {
  proxy: IProxy<TObj>;
}

export type IProxy<TObj extends object = object> = TObj & {
  $raw: TObj;
  $observer: IProxyObserver<TObj>;
};

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

/**
 * Describes a type that tracks changes and can flush those changes in some way
 */
export interface IChangeTracker {
  $nextFlush?: IChangeTracker;
  hasChanges?: boolean;
  flush(flags: LifecycleFlags): void;
}

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
  extends IDisposable,
          IAccessor<TValue>,
          IPropertyChangeTracker<TObj, TProp> {
  isDOMObserver?: boolean;
}

/**
 * Describes a target observer for from-view or two-way bindings.
 */
export interface IBindingTargetObserver<
  TObj = any,
  TProp = keyof TObj,
  TValue = unknown>
  extends IBindingTargetAccessor<TObj, TProp, TValue>,
          ISubscribable<MutationKind.instance>,
          ISubscriberCollection<MutationKind.instance> {

  bind?(flags: LifecycleFlags): void;
  unbind?(flags: LifecycleFlags): void;
}

export type AccessorOrObserver = IBindingTargetAccessor | IBindingTargetObserver;

/**
 * An array of indices, where the index of an element represents the index to map FROM, and the numeric value of the element itself represents the index to map TO
 *
 * The deletedItems property contains the items (in case of an array) or keys (in case of map or set) that have been deleted.
 */
export type IndexMap = number[] & {
  deletedItems?: number[];
};

/**
 * Mostly just a marker enum to help with typings (specifically to reduce duplication)
 */
export enum MutationKind {
  instance   = 0b001,
  collection = 0b010,
  proxy      = 0b100
}

export interface IPatchable {
  $patch(flags: LifecycleFlags): void;
}

/**
 * Describes a type that specifically tracks changes in an object property, or simply something that can have a getter and/or setter
 */
export interface IPropertyChangeTracker<TObj extends Record<string, unknown>, TProp = keyof TObj, TValue = unknown> extends IPatchable {
  obj: TObj;
  propertyKey?: TProp;
  currentValue?: TValue;
}

/**
 * Describes a type that specifically tracks changes in a collection (map, set or array)
 */
export interface ICollectionChangeTracker<T extends Collection> extends IChangeTracker {
  collection: T;
  indexMap: IndexMap;
  resetIndexMap(): void;
}

/**
 * Represents a (subscriber) function that can be called by a PropertyChangeNotifier
 */
export type IPropertyChangeHandler<TValue = unknown> = (newValue: TValue, previousValue: TValue, flags: LifecycleFlags) => void;
/**
 * Represents a (observer) function that can notify subscribers of mutations on a property
 */
export interface IPropertyChangeNotifier extends IPropertyChangeHandler {}

/**
 * Describes a (subscriber) type that has a function conforming to the IPropertyChangeHandler interface
 */
export interface IPropertySubscriber<TValue = unknown> { handleChange(newValue: TValue, previousValue: TValue, flags: LifecycleFlags): void; }

/**
 * Represents a (subscriber) function that can be called by a ProxyChangeNotifier
 */
export type IProxyChangeHandler<TValue = unknown> = (key: PropertyKey, newValue: TValue, previousValue: TValue, flags: LifecycleFlags) => void;
/**
 * Represents a (observer) function that can notify subscribers of mutations on a proxy
 */
export interface IProxyChangeNotifier extends IProxyChangeHandler {}

/**
 * Describes a (subscriber) type that has a function conforming to the IProxyChangeHandler interface
 */
export interface IProxySubscriber<TValue = unknown> { handleChange(key: PropertyKey, newValue: TValue, previousValue: TValue, flags: LifecycleFlags): void; }

/**
 * Represents a (subscriber) function that can be called by a CollectionChangeNotifier
 */
export type ICollectionChangeHandler = (origin: string, args: IArguments | null, flags: LifecycleFlags) => void;
/**
 * Represents a (observer) function that can notify subscribers of mutations in a collection
 */
export interface ICollectionChangeNotifier extends ICollectionChangeHandler {}

/**
 * Represents a (subscriber) function that can be called by a BatchedCollectionChangeNotifier
 */
export type IBatchedCollectionChangeHandler = (indexMap: number[], flags: LifecycleFlags) => void;
/**
 * Represents a (observer) function that can notify subscribers of batched mutations in a collection
 */
export interface IBatchedCollectionChangeNotifier extends IBatchedCollectionChangeHandler {}

/**
 * Describes a (subscriber) type that has a function conforming to the ICollectionChangeHandler interface
 */
export interface ICollectionSubscriber { handleChange(origin: string, args: IArguments | null, flags: LifecycleFlags): void; }
/**
 * Describes a (subscriber) type that has a function conforming to the IBatchedCollectionChangeNotifier interface
 */
export interface IBatchedCollectionSubscriber { handleBatchedChange(indexMap: number[], flags: LifecycleFlags): void; }

/**
 * Either a property or collection subscriber
 */
export type Subscriber = ICollectionSubscriber | IPropertySubscriber | IProxySubscriber;
/**
 * Either a batched property or batched collection subscriber
 */
export type BatchedSubscriber = IBatchedCollectionSubscriber;

/**
 * Helper type that translates from mutationKind enum to the correct subscriber interface
 */
export type MutationKindToSubscriber<T> =
  T extends MutationKind.instance ? IPropertySubscriber :
  T extends MutationKind.collection ? ICollectionSubscriber :
  T extends MutationKind.proxy ? IProxySubscriber :
  never;

/**
 * Helper type that translates from mutationKind enum to the correct batched subscriber interface
 */
export type MutationKindToBatchedSubscriber<T> =
  T extends MutationKind.collection ? IBatchedCollectionSubscriber :
  never;

/**
 * Helper type that translates from mutationKind enum to the correct notifier interface
 */
export type MutationKindToNotifier<T> =
  T extends MutationKind.instance ? IPropertyChangeNotifier :
  T extends MutationKind.collection ? ICollectionChangeNotifier :
  T extends MutationKind.proxy ? IProxyChangeNotifier :
  never;

/**
 * Helper type that translates from mutationKind enum to the correct batched notifier interface
 */
export type MutationKindToBatchedNotifier<T> =
  T extends MutationKind.collection ? IBatchedCollectionChangeNotifier :
  never;

export interface ISubscribable<T extends MutationKind> {
  subscribe(subscriber: MutationKindToSubscriber<T>): void;
  unsubscribe(subscriber: MutationKindToSubscriber<T>): void;
}

/**
 * A collection of property or collection subscribers
 */
export interface ISubscriberCollection<T extends MutationKind> extends ISubscribable<T> {
  /** @internal */_subscriberFlags?: SubscriberFlags;
  /** @internal */_subscriber0?: MutationKindToSubscriber<T>;
  /** @internal */_subscriber1?: MutationKindToSubscriber<T>;
  /** @internal */_subscriber2?: MutationKindToSubscriber<T>;
  /** @internal */_subscribersRest?: MutationKindToSubscriber<T>[];

  callSubscribers: MutationKindToNotifier<T>;
  hasSubscribers(): boolean;
  hasSubscriber(subscriber: MutationKindToSubscriber<T>): boolean;
  removeSubscriber(subscriber: MutationKindToSubscriber<T>): boolean;
  addSubscriber(subscriber: MutationKindToSubscriber<T>): boolean;
}

/**
 * A collection of batched property or collection subscribers
 */
export interface IBatchedSubscriberCollection<T extends MutationKind> extends IBatchedSubscribable<T> {
  /** @internal */_batchedSubscriberFlags?: SubscriberFlags;
  /** @internal */_batchedSubscriber0?: MutationKindToBatchedSubscriber<T>;
  /** @internal */_batchedSubscriber1?: MutationKindToBatchedSubscriber<T>;
  /** @internal */_batchedSubscriber2?: MutationKindToBatchedSubscriber<T>;
  /** @internal */_batchedSubscribersRest?: MutationKindToBatchedSubscriber<T>[];

  /** @internal */lifecycle?: ILifecycle;
  callBatchedSubscribers: MutationKindToBatchedNotifier<T>;

  /** @internal */flush(flags: LifecycleFlags): void;
  hasBatchedSubscribers(): boolean;
  hasBatchedSubscriber(subscriber: MutationKindToBatchedSubscriber<T>): boolean;
  removeBatchedSubscriber(subscriber: MutationKindToBatchedSubscriber<T>): boolean;
  addBatchedSubscriber(subscriber: MutationKindToBatchedSubscriber<T>): boolean;
}

export interface IBatchedSubscribable<T extends MutationKind> {
  subscribeBatched(subscriber: MutationKindToBatchedSubscriber<T>): void;
  unsubscribeBatched(subscriber: MutationKindToBatchedSubscriber<T>): void;
}

/**
 * Describes a complete property observer with an accessor, change tracking fields, normal and batched subscribers
 */
export interface IPropertyObserver<TObj extends Record<string, unknown>, TProp extends keyof TObj> extends
  IDisposable,
  IAccessor<TObj[TProp]>,
  IPropertyChangeTracker<TObj, TProp>,
  ISubscriberCollection<MutationKind.instance> {
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
interface IObservedCollection {
  $observer?: CollectionObserver;
  $raw?: this;
}

/**
 * An array that is being observed for mutations
 */
export interface IObservedArray<T = unknown> extends IObservedCollection, Array<T> { }
/**
 * A set that is being observed for mutations
 */
export interface IObservedSet<T = unknown> extends IObservedCollection, Set<T> { }
/**
 * A map that is being observed for mutations
 */
export interface IObservedMap<K = unknown, V = unknown> extends IObservedCollection, Map<K, V> { }
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

/**
 * An observer that tracks collection mutations and notifies subscribers (either directly or in batches)
 */
export interface ICollectionObserver<T extends CollectionKind> extends
  IDisposable,
  ICollectionChangeTracker<CollectionKindToType<T>>,
  ISubscriberCollection<MutationKind.collection>,
  IBatchedSubscriberCollection<MutationKind.collection> {
    persistentFlags: LifecycleFlags;
    collection: ObservedCollectionKindToType<T>;
    lengthPropertyName: LengthPropertyName<CollectionKindToType<T>>;
    collectionKind: T;
    lengthObserver: IBindingTargetObserver & IPatchable;
    getLengthObserver(flags: LifecycleFlags): IBindingTargetObserver;
}
export type CollectionObserver = ICollectionObserver<CollectionKind>;

export interface IBindingContext {
  [key: string]: unknown;

  readonly $synthetic?: true;
  readonly $observers?: ObserversLookup<IOverrideContext>;
  getObservers?(flags: LifecycleFlags): ObserversLookup<IOverrideContext>;
}

export interface IOverrideContext {
  [key: string]: unknown;

  readonly $synthetic?: true;
  readonly $observers?: ObserversLookup<IOverrideContext>;
  readonly bindingContext: IBindingContext;
  readonly parentOverrideContext: IOverrideContext | null;
  getObservers(flags: LifecycleFlags): ObserversLookup<IOverrideContext>;
}

export interface IScope {
  readonly bindingContext: IBindingContext;
  readonly overrideContext: IOverrideContext;
  // parentScope is strictly internal API and mainly for replaceable template controller.
  // NOT intended for regular scope traversal!
  /** @internal */readonly parentScope: IScope | null;
}

// TODO: currently unused, still need to fix the observersLookup type
export interface IObserversLookup<TObj extends IIndexable = IIndexable, TKey extends keyof TObj =
  Exclude<keyof TObj, '$synthetic' | '$observers' | 'bindingContext' | 'overrideContext' | 'parentOverrideContext'>> { }

export type ObserversLookup<TObj extends IIndexable = IIndexable, TKey extends keyof TObj =
  Exclude<keyof TObj, '$synthetic' | '$observers' | 'bindingContext' | 'overrideContext' | 'parentOverrideContext'>> =
  { [P in TKey]: PropertyObserver; } & { getOrCreate(flags: LifecycleFlags, obj: IBindingContext | IOverrideContext, key: string): PropertyObserver };

export type IObservable = IIndexable & {
  readonly $synthetic?: false;
  $observers?: Record<string, AccessorOrObserver>;
};
