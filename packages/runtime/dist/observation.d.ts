import { IDisposable, IIndexable, Primitive } from '@aurelia/kernel';
export declare enum LifecycleFlags {
    none = 0,
    mustEvaluate = 524288,
    mutation = 3,
    isCollectionMutation = 1,
    isInstanceMutation = 2,
    update = 28,
    updateTargetObserver = 4,
    updateTargetInstance = 8,
    updateSourceExpression = 16,
    from = 524256,
    fromFlush = 96,
    fromAsyncFlush = 32,
    fromSyncFlush = 64,
    fromStartTask = 128,
    fromStopTask = 256,
    fromBind = 512,
    fromUnbind = 1024,
    fromAttach = 2048,
    fromDetach = 4096,
    fromCache = 8192,
    fromCreate = 16384,
    fromDOMEvent = 32768,
    fromObserverSetter = 65536,
    fromBindableHandler = 131072,
    fromLifecycleTask = 262144,
    parentUnmountQueued = 1048576,
    doNotUpdateDOM = 2097152
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
export interface IBindingTargetAccessor<TObj = any, TProp = keyof TObj, TValue = unknown> extends IDisposable, IAccessor<TValue>, IPropertyChangeTracker<TObj, TProp> {
}
/**
 * Describes a target observer for from-view or two-way bindings.
 */
export interface IBindingTargetObserver<TObj = any, TProp = keyof TObj, TValue = unknown> extends IBindingTargetAccessor<TObj, TProp, TValue>, ISubscribable<MutationKind.instance>, ISubscriberCollection<MutationKind.instance> {
    bind?(flags: LifecycleFlags): void;
    unbind?(flags: LifecycleFlags): void;
}
export declare type AccessorOrObserver = IBindingTargetAccessor | IBindingTargetObserver;
/**
 * An array of indices, where the index of an element represents the index to map FROM, and the numeric value of the element itself represents the index to map TO
 *
 * The deletedItems property contains the items (in case of an array) or keys (in case of map or set) that have been deleted.
 */
export declare type IndexMap = number[] & {
    deletedItems?: unknown[];
};
/**
 * Mostly just a marker enum to help with typings (specifically to reduce duplication)
 */
export declare enum MutationKind {
    instance = 1,
    collection = 2
}
/**
 * Describes a type that specifically tracks changes in an object property, or simply something that can have a getter and/or setter
 */
export interface IPropertyChangeTracker<TObj extends Object, TProp = keyof TObj, TValue = IIndexable | Primitive> {
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
export declare type IPropertyChangeHandler<TValue = unknown> = (newValue: TValue, previousValue: TValue, flags: LifecycleFlags) => void;
/**
 * Represents a (observer) function that can notify subscribers of mutations on a property
 */
export interface IPropertyChangeNotifier extends IPropertyChangeHandler {
}
/**
 * Describes a (subscriber) type that has a function conforming to the IPropertyChangeHandler interface
 */
export interface IPropertySubscriber<TValue = unknown> {
    handleChange(newValue: TValue, previousValue: TValue, flags: LifecycleFlags): void;
}
/**
 * Represents a (subscriber) function that can be called by a CollectionChangeNotifier
 */
export declare type ICollectionChangeHandler = (origin: string, args: IArguments | null, flags?: LifecycleFlags) => void;
/**
 * Represents a (observer) function that can notify subscribers of mutations in a collection
 */
export interface ICollectionChangeNotifier extends ICollectionChangeHandler {
}
/**
 * Represents a (subscriber) function that can be called by a BatchedCollectionChangeNotifier
 */
export declare type IBatchedCollectionChangeHandler = (indexMap: number[]) => void;
/**
 * Represents a (observer) function that can notify subscribers of batched mutations in a collection
 */
export interface IBatchedCollectionChangeNotifier extends IBatchedCollectionChangeHandler {
}
/**
 * Describes a (subscriber) type that has a function conforming to the ICollectionChangeHandler interface
 */
export interface ICollectionSubscriber {
    handleChange(origin: string, args: IArguments | null, flags: LifecycleFlags): void;
}
/**
 * Describes a (subscriber) type that has a function conforming to the IBatchedCollectionChangeNotifier interface
 */
export interface IBatchedCollectionSubscriber {
    handleBatchedChange(indexMap: number[]): void;
}
/**
 * Either a property or collection subscriber
 */
export declare type Subscriber = ICollectionSubscriber | IPropertySubscriber;
/**
 * Either a batched property or batched collection subscriber
 */
export declare type BatchedSubscriber = IBatchedCollectionSubscriber;
/**
 * Helper type that translates from mutationKind enum to the correct subscriber interface
 */
export declare type MutationKindToSubscriber<T> = T extends MutationKind.instance ? IPropertySubscriber : T extends MutationKind.collection ? ICollectionSubscriber : never;
/**
 * Helper type that translates from mutationKind enum to the correct batched subscriber interface
 */
export declare type MutationKindToBatchedSubscriber<T> = T extends MutationKind.collection ? IBatchedCollectionSubscriber : never;
/**
 * Helper type that translates from mutationKind enum to the correct notifier interface
 */
export declare type MutationKindToNotifier<T> = T extends MutationKind.instance ? IPropertyChangeNotifier : T extends MutationKind.collection ? ICollectionChangeNotifier : never;
/**
 * Helper type that translates from mutationKind enum to the correct batched notifier interface
 */
export declare type MutationKindToBatchedNotifier<T> = T extends MutationKind.collection ? IBatchedCollectionChangeNotifier : never;
export interface ISubscribable<T extends MutationKind> {
    subscribe(subscriber: MutationKindToSubscriber<T>): void;
    unsubscribe(subscriber: MutationKindToSubscriber<T>): void;
}
/**
 * A collection of property or collection subscribers
 */
export interface ISubscriberCollection<T extends MutationKind> extends ISubscribable<T> {
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
    callBatchedSubscribers: MutationKindToBatchedNotifier<T>;
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
export interface IPropertyObserver<TObj extends Object, TProp extends keyof TObj> extends IDisposable, IAccessor<TObj[TProp]>, IPropertyChangeTracker<TObj, TProp>, ISubscriberCollection<MutationKind.instance> {
}
/**
 * An any-typed property observer
 */
export declare type PropertyObserver = IPropertyObserver<any, PropertyKey>;
/**
 * A collection (array, set or map)
 */
export declare type Collection = unknown[] | Set<unknown> | Map<unknown, unknown>;
interface IObservedCollection {
    $observer?: CollectionObserver;
}
/**
 * An array that is being observed for mutations
 */
export interface IObservedArray<T = unknown> extends IObservedCollection, Array<T> {
}
/**
 * A set that is being observed for mutations
 */
export interface IObservedSet<T = unknown> extends IObservedCollection, Set<T> {
}
/**
 * A map that is being observed for mutations
 */
export interface IObservedMap<K = unknown, V = unknown> extends IObservedCollection, Map<K, V> {
}
/**
 * A collection that is being observed for mutations
 */
export declare type ObservedCollection = IObservedArray | IObservedSet | IObservedMap;
export declare const enum CollectionKind {
    indexed = 8,
    keyed = 4,
    array = 9,
    map = 6,
    set = 7
}
export declare type LengthPropertyName<T> = T extends unknown[] ? 'length' : T extends Set<unknown> ? 'size' : T extends Map<unknown, unknown> ? 'size' : never;
export declare type CollectionTypeToKind<T> = T extends unknown[] ? CollectionKind.array | CollectionKind.indexed : T extends Set<unknown> ? CollectionKind.set | CollectionKind.keyed : T extends Map<unknown, unknown> ? CollectionKind.map | CollectionKind.keyed : never;
export declare type CollectionKindToType<T> = T extends CollectionKind.array ? unknown[] : T extends CollectionKind.indexed ? unknown[] : T extends CollectionKind.map ? Map<unknown, unknown> : T extends CollectionKind.set ? Set<unknown> : T extends CollectionKind.keyed ? Set<unknown> | Map<unknown, unknown> : never;
export declare type ObservedCollectionKindToType<T> = T extends CollectionKind.array ? IObservedArray : T extends CollectionKind.indexed ? IObservedArray : T extends CollectionKind.map ? IObservedMap : T extends CollectionKind.set ? IObservedSet : T extends CollectionKind.keyed ? IObservedSet | IObservedMap : never;
/**
 * An observer that tracks collection mutations and notifies subscribers (either directly or in batches)
 */
export interface ICollectionObserver<T extends CollectionKind> extends IDisposable, ICollectionChangeTracker<CollectionKindToType<T>>, ISubscriberCollection<MutationKind.collection>, IBatchedSubscriberCollection<MutationKind.collection> {
    collection: ObservedCollectionKindToType<T>;
    lengthPropertyName: LengthPropertyName<CollectionKindToType<T>>;
    collectionKind: T;
    lengthObserver: IBindingTargetObserver;
    getLengthObserver(): IBindingTargetObserver;
}
export declare type CollectionObserver = ICollectionObserver<CollectionKind>;
export interface IBindingContext {
    [key: string]: unknown;
    readonly $synthetic?: true;
    readonly $observers?: ObserversLookup<IOverrideContext>;
    getObservers?(): ObserversLookup<IOverrideContext>;
}
export interface IOverrideContext {
    [key: string]: unknown;
    readonly $synthetic?: true;
    readonly $observers?: ObserversLookup<IOverrideContext>;
    readonly bindingContext: IBindingContext;
    readonly parentOverrideContext: IOverrideContext | null;
    getObservers(): ObserversLookup<IOverrideContext>;
}
export interface IScope {
    readonly bindingContext: IBindingContext;
    readonly overrideContext: IOverrideContext;
}
export interface IObserversLookup<TObj extends IIndexable = IIndexable, TKey extends keyof TObj = Exclude<keyof TObj, '$synthetic' | '$observers' | 'bindingContext' | 'overrideContext' | 'parentOverrideContext'>> {
}
export declare type ObserversLookup<TObj extends IIndexable = IIndexable, TKey extends keyof TObj = Exclude<keyof TObj, '$synthetic' | '$observers' | 'bindingContext' | 'overrideContext' | 'parentOverrideContext'>> = {
    [P in TKey]: PropertyObserver;
} & {
    getOrCreate(obj: IBindingContext | IOverrideContext, key: string): PropertyObserver;
};
export declare type IObservable = IIndexable & {
    readonly $synthetic?: false;
    $observers?: Record<string, AccessorOrObserver>;
};
export {};
//# sourceMappingURL=observation.d.ts.map