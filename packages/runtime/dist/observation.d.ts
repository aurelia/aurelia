import { IIndexable } from '@aurelia/kernel';
import { LifecycleFlags } from './flags';
import { ILifecycle } from './lifecycle';
export declare enum DelegationStrategy {
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
    callSubscribers(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void;
    hasSubscribers(): boolean;
    hasSubscriber(subscriber: ISubscriber): boolean;
    removeSubscriber(subscriber: ISubscriber): boolean;
    addSubscriber(subscriber: ISubscriber): boolean;
    [key: number]: LifecycleFlags;
}
export interface IProxySubscriberCollection extends IProxySubscribable {
    callProxySubscribers(key: PropertyKey, newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void;
    hasProxySubscribers(): boolean;
    hasProxySubscriber(subscriber: IProxySubscriber): boolean;
    removeProxySubscriber(subscriber: IProxySubscriber): boolean;
    addProxySubscriber(subscriber: IProxySubscriber): boolean;
    [key: number]: LifecycleFlags;
}
export interface ICollectionSubscriberCollection extends ICollectionSubscribable {
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
export interface IPropertyObserver<TObj extends object, TProp extends keyof TObj> extends IAccessor<TObj[TProp]>, IPropertyChangeTracker<TObj, TProp>, ISubscriberCollection, IBatchable {
    inBatch: boolean;
    observing: boolean;
    persistentFlags: LifecycleFlags;
}
/**
 * An any-typed property observer
 */
export declare type PropertyObserver = IPropertyObserver<IIndexable, string>;
/**
 * A collection (array, set or map)
 */
export declare type Collection = unknown[] | Set<unknown> | Map<unknown, unknown>;
interface IObservedCollection<T extends CollectionKind = CollectionKind> {
    $observer?: ICollectionObserver<T>;
    $raw?: this;
}
/**
 * An array that is being observed for mutations
 */
export interface IObservedArray<T = unknown> extends IObservedCollection<CollectionKind.array>, Array<T> {
}
/**
 * A set that is being observed for mutations
 */
export interface IObservedSet<T = unknown> extends IObservedCollection<CollectionKind.set>, Set<T> {
}
/**
 * A map that is being observed for mutations
 */
export interface IObservedMap<K = unknown, V = unknown> extends IObservedCollection<CollectionKind.map>, Map<K, V> {
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
export interface IProxyObserver<TObj extends {} = {}> extends IProxySubscriberCollection {
    proxy: IProxy<TObj>;
}
export declare type IProxy<TObj extends {} = {}> = TObj & {
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
export interface IBindingTargetAccessor<TObj = any, TProp = keyof TObj, TValue = unknown> extends IAccessor<TValue>, IPropertyChangeTracker<TObj, TProp> {
    bind?(flags: LifecycleFlags): void;
    unbind?(flags: LifecycleFlags): void;
}
/**
 * Describes a target observer for from-view or two-way bindings.
 */
export interface IBindingTargetObserver<TObj = any, TProp = keyof TObj, TValue = unknown> extends IBindingTargetAccessor<TObj, TProp, TValue>, ISubscribable, ISubscriberCollection {
}
export declare type AccessorOrObserver = IBindingTargetAccessor | IBindingTargetObserver;
/**
 * An array of indices, where the index of an element represents the index to map FROM, and the numeric value of the element itself represents the index to map TO
 *
 * The deletedItems property contains the items (in case of an array) or keys (in case of map or set) that have been deleted.
 */
export declare type IndexMap = number[] & {
    deletedItems: number[];
    isIndexMap: true;
};
export declare function copyIndexMap(existing: number[] & {
    deletedItems?: number[];
}, deletedItems?: number[]): IndexMap;
export declare function createIndexMap(length?: number): IndexMap;
export declare function cloneIndexMap(indexMap: IndexMap): IndexMap;
export declare function isIndexMap(value: unknown): value is IndexMap;
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
export interface ICollectionObserver<T extends CollectionKind> extends ICollectionChangeTracker<CollectionKindToType<T>>, ICollectionSubscriberCollection, IBatchable {
    inBatch: boolean;
    lifecycle: ILifecycle;
    persistentFlags: LifecycleFlags;
    collection: ObservedCollectionKindToType<T>;
    lengthObserver: T extends CollectionKind.array ? ICollectionLengthObserver : ICollectionSizeObserver;
    getLengthObserver(): T extends CollectionKind.array ? ICollectionLengthObserver : ICollectionSizeObserver;
    notify(): void;
}
export declare type CollectionObserver = ICollectionObserver<CollectionKind>;
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
export declare type ObserversLookup = IIndexable<{
    getOrCreate(lifecycle: ILifecycle, flags: LifecycleFlags, obj: IBindingContext | IOverrideContext, key: string): PropertyObserver;
}, PropertyObserver>;
export declare type InlineObserversLookup<T> = IIndexable<{}, T>;
export declare type IObservable<T = {}> = {
    readonly $synthetic?: false;
    $observers?: ObserversLookup | InlineObserversLookup<T>;
};
export {};
//# sourceMappingURL=observation.d.ts.map