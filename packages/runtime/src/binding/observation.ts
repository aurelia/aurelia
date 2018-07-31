import { ICallable, IDisposable, IIndexable } from '@aurelia/kernel';
import { IScope } from './binding-context';
import { BindingFlags } from './binding-flags';

export interface IBindScope {
  $bind(flags: BindingFlags, scope: IScope): void;
  $unbind(flags: BindingFlags): void;
}
export interface IAccessor<T = any> {
  getValue(): T;
  setValue(newValue: T): void;
}

export interface ISubscribable {
  subscribe(context: string, callable: ICallable): void;
  unsubscribe(context: string, callable: ICallable): void;
}

export interface IBindingTargetAccessor<TGetReturn = any, TSetValue = TGetReturn> {
  getValue(obj: IIndexable, propertyName: string): TGetReturn;
  setValue(value: TSetValue, obj: IIndexable, propertyName: string): void;
}

export interface IBindingTargetObserver<TGetReturn = any, TSetValue = TGetReturn>
  extends IBindingTargetAccessor<TGetReturn, TSetValue>, ISubscribable {

  bind?(flags: BindingFlags): void;
  unbind?(flags: BindingFlags): void;
}

export interface IBindingCollectionObserver extends ISubscribable, ICallable {
  getValue?(target: IIndexable, targetProperty: string): any;
  setValue?(value: any, target: IIndexable, targetProperty: string): void;

  addChangeRecord(changeRecord: any): void;
  flushChangeRecords(): void;
  reset(oldCollection: any): any;
  getLengthObserver(): any;
}

export type AccessorOrObserver = IAccessor | IBindingTargetAccessor | IBindingTargetObserver | IBindingCollectionObserver;

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
 * Describes a type that tracks something, knows whether it has changes or not, and can flush those changes in some way
 */
export interface IChangeTracker {
  hasChanges: boolean;
  flushChanges(): void;
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
 * Represents a (subscriber) function that can be called by a CollectionChangeNotifier
 */
export interface ICollectionChangeHandler { (origin: string, args?: IArguments, flags?: BindingFlags): void; }
/**
 * Represents a (observer) function that can notify subscribers of mutations in a collection
 */
export interface ICollectionChangeNotifier extends ICollectionChangeHandler {}

/**
 * Represents a (subscriber) function that can be called by a BatchedCollectionChangeNotifier
 */
export interface IBatchedCollectionChangeHandler { (indexMap: Array<number>, flags?: BindingFlags): void; }
/**
 * Represents a (observer) function that can notify subscribers of batched mutations in a collection
 */
export interface IBatchedCollectionChangeNotifier extends IBatchedCollectionChangeHandler {}

/**
 * Describes a (subscriber) type that has a function conforming to the ICollectionChangeHandler interface
 */
export interface ICollectionSubscriber { handleChange(origin: string, args?: IArguments, flags?: BindingFlags): void; }
/**
 * Describes a (subscriber) type that has a function conforming to the IBatchedCollectionChangeNotifier interface
 */
export interface IBatchedCollectionSubscriber { handleBatchedChange(indexMap: Array<number>, flags?: BindingFlags): void; }

/**
 * A collection of collection subscribers
 */
export interface ICollectionSubscriberCollection {
  subscribers: Array<ICollectionSubscriber>;
  subscriberFlags: Array<BindingFlags>;
  notify: ICollectionChangeNotifier;
  subscribe(subscriber: ICollectionSubscriber, flags?: BindingFlags): void;
  unsubscribe(subscriber: ICollectionSubscriber, flags?: BindingFlags): void;
}

/**
 * A collection of batched collection subscribers
 */
export interface IBatchedCollectionSubscriberCollection {
  batchedSubscribers: Array<IBatchedCollectionSubscriber>;
  batchedSubscriberFlags: Array<BindingFlags>;
  notifyBatched: IBatchedCollectionChangeNotifier;
  subscribeBatched(subscriber: IBatchedCollectionSubscriber, flags?: BindingFlags): void;
  unsubscribeBatched(subscriber: IBatchedCollectionSubscriber, flags?: BindingFlags): void;
}

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
  ICollectionSubscriberCollection,
  IBatchedCollectionSubscriberCollection {
    collection: ObservedCollectionKindToType<T>;
    lengthPropertyName: LengthPropertyName<CollectionKindToType<T>>;
    collectionKind: T;
}

export type CollectionObserver = ICollectionObserver<CollectionKind>;
