import type { IIndexable, IServiceLocator } from '@aurelia/kernel';
import type { Scope } from './observation/binding-context.js';
import type { CollectionLengthObserver, CollectionSizeObserver } from './observation/collection-length-observer.js';
export interface IBinding {
    interceptor: this;
    readonly locator: IServiceLocator;
    readonly $scope?: Scope;
    readonly isBound: boolean;
    $bind(flags: LifecycleFlags, scope: Scope): void;
    $unbind(flags: LifecycleFlags): void;
}
export declare type InterceptorFunc<TInput = unknown, TOutput = unknown> = (value: TInput) => TOutput;
export declare enum BindingMode {
    oneTime = 1,
    toView = 2,
    fromView = 4,
    twoWay = 6,
    default = 8
}
export declare const enum LifecycleFlags {
    none = 0,
    persistentBindingFlags = 961,
    allowParentScopeTraversal = 64,
    observeLeafPropertiesOnly = 128,
    targetObserverFlags = 769,
    noFlush = 256,
    persistentTargetObserverQueue = 512,
    bindingStrategy = 1,
    isStrictBindingStrategy = 1,
    fromBind = 2,
    fromUnbind = 4,
    mustEvaluate = 8,
    isTraversingParentScope = 16,
    dispose = 32
}
export interface IConnectable {
    observeProperty(obj: object, key: PropertyKey): void;
    observeCollection(obj: Collection): void;
    subscribeTo(subscribable: ISubscribable | ICollectionSubscribable): void;
}
export declare enum DelegationStrategy {
    none = 0,
    capturing = 1,
    bubbling = 2
}
export interface IBatchable {
    flushBatch(flags: LifecycleFlags): void;
}
export interface ISubscriber<TValue = unknown> {
    handleChange(newValue: TValue, previousValue: TValue, flags: LifecycleFlags): void;
}
export interface ICollectionSubscriber {
    handleCollectionChange(indexMap: IndexMap, flags: LifecycleFlags): void;
}
export interface ISubscribable {
    subscribe(subscriber: ISubscriber): void;
    unsubscribe(subscriber: ISubscriber): void;
}
export interface ICollectionSubscribable {
    subscribe(subscriber: ICollectionSubscriber): void;
    unsubscribe(subscriber: ICollectionSubscriber): void;
}
/**
 * An interface describing the contract of a subscriber list,
 * with the ability to propagate values to those subscribers
 */
export interface ISubscriberRecord<T extends ISubscriber | ICollectionSubscriber> {
    readonly count: number;
    add(subscriber: T): boolean;
    has(subscriber: T): boolean;
    remove(subscriber: T): boolean;
    any(): boolean;
    notify(value: unknown, oldValue: unknown, flags: LifecycleFlags): void;
    notifyCollection(indexMap: IndexMap, flags: LifecycleFlags): void;
}
/**
 * An internal interface describing the implementation of a ISubscribable of Aurelia that supports batching
 *
 * This is usually mixed into a class via the import `subscriberCollection` import from Aurelia.
 * The `subscriberCollection` import can be used as either a decorator, or a function call.
 */
export interface ISubscriberCollection extends ISubscribable {
    [key: number]: LifecycleFlags;
    /**
     * The backing subscriber record for all subscriber methods of this collection
     */
    readonly subs: ISubscriberRecord<ISubscriber>;
}
/**
 * An internal interface describing the implementation of a ICollectionSubscribable of Aurelia that supports batching
 *
 * This is usually mixed into a class via the import `subscriberCollection` import from Aurelia.
 * The `subscriberCollection` import can be used as either a decorator, or a function call.
 */
export interface ICollectionSubscriberCollection extends ICollectionSubscribable {
    [key: number]: LifecycleFlags;
    /**
     * The backing subscriber record for all subscriber methods of this collection
     */
    readonly subs: ISubscriberRecord<ICollectionSubscriber>;
}
/**
 * A collection (array, set or map)
 */
export declare type Collection = unknown[] | Set<unknown> | Map<unknown, unknown>;
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
export declare type ObservedCollectionKindToType<T> = T extends CollectionKind.array ? unknown[] : T extends CollectionKind.indexed ? unknown[] : T extends CollectionKind.map ? Map<unknown, unknown> : T extends CollectionKind.set ? Set<unknown> : T extends CollectionKind.keyed ? Map<unknown, unknown> | Set<unknown> : never;
export declare const enum AccessorType {
    None = 0,
    Observer = 1,
    Node = 2,
    Layout = 4,
    Primtive = 8,
    Array = 18,
    Set = 34,
    Map = 66
}
/**
 * Basic interface to normalize getting/setting a value of any property on any object
 */
export interface IAccessor<TValue = unknown> {
    type: AccessorType;
    getValue(obj?: object, key?: PropertyKey): TValue;
    setValue(newValue: TValue, flags: LifecycleFlags, obj?: object, key?: PropertyKey): void;
}
/**
 * An interface describing a standard contract of an observer in Aurelia binding & observation system
 */
export interface IObserver extends IAccessor, ISubscribable {
}
export declare type AccessorOrObserver = (IAccessor | IObserver) & {
    doNotCache?: boolean;
};
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
export interface IArrayIndexObserver extends IObserver {
    owner: ICollectionObserver<CollectionKind.array>;
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
export interface ICollectionObserver<T extends CollectionKind> extends ICollectionChangeTracker<CollectionKindToType<T>>, ICollectionSubscribable {
    type: AccessorType;
    collection: ObservedCollectionKindToType<T>;
    getLengthObserver(): T extends CollectionKind.array ? CollectionLengthObserver : CollectionSizeObserver;
    notify(): void;
}
export declare type CollectionObserver = ICollectionObserver<CollectionKind>;
export interface IBindingContext {
    [key: string]: any;
}
export interface IOverrideContext {
    [key: string]: unknown;
    readonly bindingContext: IBindingContext;
}
export declare type IObservable<T = IIndexable> = T & {
    $observers?: IIndexable<{}, AccessorOrObserver>;
};
//# sourceMappingURL=observation.d.ts.map