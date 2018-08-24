import { IDisposable } from '@aurelia/kernel';
import { IScope } from './binding-context';
import { BindingFlags } from './binding-flags';
import { IChangeSet } from './change-set';

export interface IBindScope {
  readonly $isBound: boolean;
  $bind(flags: BindingFlags, scope: IScope): void;
  $unbind(flags: BindingFlags): void;
}

/**
 * Basic interface to normalize getting/setting a value of any property on any object
 */
export interface IAccessor<TValue = any> {
  getValue(): TValue;
  setValue(newValue: TValue, flags: BindingFlags): void;
}

/**
 * Describes a target observer for to-view bindings (in other words, an observer without the observation).
 */
export interface IBindingTargetAccessor<
  TObj = any,
  TProp = keyof TObj,
  TValue = any>
  extends IDisposable,
          IAccessor<TValue>,
          IPropertyChangeTracker<TObj, TProp> { }

/**
 * Describes a target observer for from-view or two-way bindings.
 */
export interface IBindingTargetObserver<
  TObj = any,
  TProp = keyof TObj,
  TValue = any>
  extends IBindingTargetAccessor<TObj, TProp, TValue>,
          ISubscribable<MutationKind.instance> {

  bind?(flags: BindingFlags): void;
  unbind?(flags: BindingFlags): void;
}

export type AccessorOrObserver = IBindingTargetAccessor | IBindingTargetObserver;

export interface IObservable<T = any> {
  $observers: Record<string, AccessorOrObserver>;
}

/**
 * An array of indices, where the index of an element represents the index to map FROM, and the numeric value of the element itself represents the index to map TO
 *
 * The deletedItems property contains the items (in case of an array) or keys (in case of map or set) that have been deleted.
 */
export type IndexMap = Array<number> & {
  deletedItems?: Array<any>;
};

/**
 * Describes a type that tracks changes and can flush those changes in some way
 */
export interface IChangeTracker {
  hasChanges?: boolean;
  flushChanges(): void;
}

/**
 * Mostly just a marker enum to help with typings (specifically to reduce duplication)
 */
export enum MutationKind {
  instance   = 0b01,
  collection = 0b10
}

/**
 * Describes a type that specifically tracks changes in an object property, or simply something that can have a getter and/or setter
 */
export interface IPropertyChangeTracker<TObj extends Object, TProp = keyof TObj, TValue = any> extends IChangeTracker {
  obj: TObj;
  propertyKey?: TProp;
  oldValue?: TValue;
  previousValue?: TValue;
  currentValue: TValue;
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
export interface IPropertyChangeHandler { (newValue: any, previousValue: any, flags: BindingFlags): void; }
/**
 * Represents a (observer) function that can notify subscribers of mutations on a property
 */
export interface IPropertyChangeNotifier extends IPropertyChangeHandler {}

/**
 * Represents a (subscriber) function that can be called by a BatchedPropertyChangeNotifier
 */
export interface IBatchedPropertyChangeHandler { (newValue: any, oldValue: any): void; }
/**
 * Represents a (observer) function that can notify subscribers of batched mutations on a property
 */
export interface IBatchedPropertyChangeNotifier extends IBatchedPropertyChangeHandler {}

/**
 * Describes a (subscriber) type that has a function conforming to the IPropertyChangeHandler interface
 */
export interface IPropertySubscriber { handleChange(newValue: any, previousValue: any, flags: BindingFlags): void; }
/**
 * Describes a (subscriber) type that has a function conforming to the IBatchedPropertyChangeNotifier interface
 */
export interface IBatchedPropertySubscriber { handleBatchedChange(newValue: any, oldValue: any): void; }

/**
 * Represents a (subscriber) function that can be called by a CollectionChangeNotifier
 */
export interface ICollectionChangeHandler { (origin: string, args: IArguments | null, flags?: BindingFlags): void; }
/**
 * Represents a (observer) function that can notify subscribers of mutations in a collection
 */
export interface ICollectionChangeNotifier extends ICollectionChangeHandler {}

/**
 * Represents a (subscriber) function that can be called by a BatchedCollectionChangeNotifier
 */
export interface IBatchedCollectionChangeHandler { (indexMap: Array<number>): void; }
/**
 * Represents a (observer) function that can notify subscribers of batched mutations in a collection
 */
export interface IBatchedCollectionChangeNotifier extends IBatchedCollectionChangeHandler {}

/**
 * Describes a (subscriber) type that has a function conforming to the ICollectionChangeHandler interface
 */
export interface ICollectionSubscriber { handleChange(origin: string, args: IArguments | null, flags: BindingFlags): void; }
/**
 * Describes a (subscriber) type that has a function conforming to the IBatchedCollectionChangeNotifier interface
 */
export interface IBatchedCollectionSubscriber { handleBatchedChange(indexMap: Array<number>): void; }

/**
 * Either a property or collection subscriber
 */
export type Subscriber = ICollectionSubscriber | IPropertySubscriber;
/**
 * Either a batched property or batched collection subscriber
 */
export type BatchedSubscriber = IBatchedCollectionSubscriber | IBatchedPropertySubscriber;

/**
 * Helper type that translates from mutationKind enum to the correct subscriber interface
 */
export type MutationKindToSubscriber<T> =
  T extends MutationKind.instance ? IPropertySubscriber :
  T extends MutationKind.collection ? ICollectionSubscriber :
  never;

/**
 * Helper type that translates from mutationKind enum to the correct batched subscriber interface
 */
export type MutationKindToBatchedSubscriber<T> =
  T extends MutationKind.instance ? IBatchedPropertySubscriber :
  T extends MutationKind.collection ? IBatchedCollectionSubscriber :
  never;

/**
 * Helper type that translates from mutationKind enum to the correct notifier interface
 */
export type MutationKindToNotifier<T> =
  T extends MutationKind.instance ? IPropertyChangeNotifier :
  T extends MutationKind.collection ? ICollectionChangeNotifier :
  never;

/**
 * Helper type that translates from mutationKind enum to the correct batched notifier interface
 */
export type MutationKindToBatchedNotifier<T> =
  T extends MutationKind.instance ? IBatchedPropertyChangeNotifier :
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
  subscribers: Array<MutationKindToSubscriber<T>>;
  notify: MutationKindToNotifier<T>;
}

export interface IBatchedSubscribable<T extends MutationKind> {
  subscribeBatched(subscriber: MutationKindToBatchedSubscriber<T>): void;
  unsubscribeBatched(subscriber: MutationKindToBatchedSubscriber<T>): void;
}

/**
 * A collection of batched property or batched collection subscribers
 */
export interface IBatchedSubscriberCollection<T extends MutationKind> extends IBatchedSubscribable<T> {
  batchedSubscribers: Array<MutationKindToBatchedSubscriber<T>>;
  notifyBatched: MutationKindToBatchedNotifier<T>;
}

/**
 * Describes a complete property observer with an accessor, change tracking fields, normal and batched subscribers
 */
export interface IPropertyObserver<TObj extends Object, TProp extends keyof TObj> extends
  IDisposable,
  IAccessor<any>,
  IPropertyChangeTracker<TObj, TProp>,
  ISubscriberCollection<MutationKind.instance>,
  IBatchedSubscriberCollection<MutationKind.instance> {
  /*@internal*/changeSet: IChangeSet;
  /*@internal*/observing: boolean;
  /*@internal*/ownPropertyDescriptor: PropertyDescriptor;
}

/**
 * An any-typed property observer
 */
export type PropertyObserver = IPropertyObserver<any, PropertyKey>;

/**
 * A collection (array, set or map)
 */
export type Collection = Array<any> | Set<any> | Map<any, any>;
interface IObservedCollection {
  $observer: CollectionObserver;
}

/**
 * An array that is being observed for mutations
 */
export interface IObservedArray extends IObservedCollection, Array<any> { }
/**
 * A set that is being observed for mutations
 */
export interface IObservedSet extends IObservedCollection, Set<any> { }
/**
 * A map that is being observed for mutations
 */
export interface IObservedMap extends IObservedCollection, Map<any, any> { }
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

type LengthPropertyName<T> =
  T extends Array<any> ? 'length' :
  T extends Set<any> ? 'size' :
  T extends Map<any, any> ? 'size' :
  never;

type CollectionTypeToKind<T> =
  T extends Array<any> ? CollectionKind.array | CollectionKind.indexed :
  T extends Set<any> ? CollectionKind.set | CollectionKind.keyed :
  T extends Map<any, any> ? CollectionKind.map | CollectionKind.keyed :
  never;

type CollectionKindToType<T> =
  T extends CollectionKind.array ? Array<any> :
  T extends CollectionKind.indexed ? Array<any> :
  T extends CollectionKind.map ? Map<any, any> :
  T extends CollectionKind.set ? Set<any> :
  T extends CollectionKind.keyed ? Set<any> | Map<any, any> :
  never;

type ObservedCollectionKindToType<T> =
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
    /*@internal*/changeSet: IChangeSet;
    collection: ObservedCollectionKindToType<T>;
    lengthPropertyName: LengthPropertyName<CollectionKindToType<T>>;
    collectionKind: T;
}

export type CollectionObserver = ICollectionObserver<CollectionKind>;
