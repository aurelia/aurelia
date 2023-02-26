import { IDisposable, IIndexable, IServiceLocator } from '@aurelia/kernel';
import type { Scope } from './observation/scope';
import type { CollectionLengthObserver, CollectionSizeObserver } from './observation/collection-length-observer';
import { TaskQueue } from '@aurelia/platform';
export interface IBinding {
    readonly isBound: boolean;
    bind(scope: Scope): void;
    unbind(): void;
    get: IServiceLocator['get'];
    useScope(scope: Scope): void;
    limit(opts: IRateLimitOptions): IDisposable;
}
export interface IRateLimitOptions {
    type: 'throttle' | 'debounce';
    delay: number;
    queue: TaskQueue;
    now: () => number;
}
export declare const ICoercionConfiguration: import("@aurelia/kernel").InterfaceSymbol<ICoercionConfiguration>;
export interface ICoercionConfiguration {
    /** When set to `true`, enables the automatic type-coercion for bindables globally. */
    enableCoercion: boolean;
    /** When set to `true`, coerces the `null` and `undefined` values to the target types. This is ineffective when `disableCoercion` is set to `true.` */
    coerceNullish: boolean;
}
export type InterceptorFunc<TInput = unknown, TOutput = unknown> = (value: TInput, coercionConfig: ICoercionConfiguration | null) => TOutput;
export interface IConnectable {
    observe(obj: object, key: PropertyKey): void;
    observeCollection(obj: Collection): void;
    subscribeTo(subscribable: ISubscribable | ICollectionSubscribable): void;
}
/**
 * Interface of a subscriber or property change handler
 */
export interface ISubscriber<TValue = unknown> {
    handleChange(newValue: TValue, previousValue: TValue): void;
}
/**
 * Interface of a collection subscriber or mutation handler
 */
export interface ICollectionSubscriber {
    handleCollectionChange(collection: Collection, indexMap: IndexMap): void;
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
    remove(subscriber: T): boolean;
    notify(value: unknown, oldValue: unknown): void;
    notifyCollection(collection: Collection, indexMap: IndexMap): void;
}
/**
 * An internal interface describing the implementation of a ISubscribable of Aurelia that supports batching
 *
 * This is usually mixed into a class via the import `subscriberCollection` import from Aurelia.
 * The `subscriberCollection` import can be used as either a decorator, or a function call.
 */
export interface ISubscriberCollection extends ISubscribable {
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
    /**
     * The backing subscriber record for all subscriber methods of this collection
     */
    readonly subs: ISubscriberRecord<ICollectionSubscriber>;
}
/**
 * A collection (array, set or map)
 */
export type Collection = unknown[] | Set<unknown> | Map<unknown, unknown>;
export declare const enum CollectionKind {
    indexed = 8,
    keyed = 4,
    array = 9,
    map = 6,
    set = 7
}
export type LengthPropertyName<T> = T extends unknown[] ? 'length' : T extends Set<unknown> ? 'size' : T extends Map<unknown, unknown> ? 'size' : never;
export type CollectionTypeToKind<T> = T extends unknown[] ? CollectionKind.array | CollectionKind.indexed : T extends Set<unknown> ? CollectionKind.set | CollectionKind.keyed : T extends Map<unknown, unknown> ? CollectionKind.map | CollectionKind.keyed : never;
export type CollectionKindToType<T> = T extends CollectionKind.array ? unknown[] : T extends CollectionKind.indexed ? unknown[] : T extends CollectionKind.map ? Map<unknown, unknown> : T extends CollectionKind.set ? Set<unknown> : T extends CollectionKind.keyed ? Set<unknown> | Map<unknown, unknown> : never;
export type ObservedCollectionKindToType<T> = T extends CollectionKind.array ? unknown[] : T extends CollectionKind.indexed ? unknown[] : T extends CollectionKind.map ? Map<unknown, unknown> : T extends CollectionKind.set ? Set<unknown> : T extends CollectionKind.keyed ? Map<unknown, unknown> | Set<unknown> : never;
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
    setValue(newValue: TValue, obj?: object, key?: PropertyKey): void;
}
/**
 * An interface describing a standard contract of an observer in Aurelia binding & observation system
 */
export interface IObserver extends IAccessor, ISubscribable {
    doNotCache?: boolean;
}
export type AccessorOrObserver = (IAccessor | IObserver) & {
    doNotCache?: boolean;
};
/**
 * An array of indices, where the index of an element represents the index to map FROM, and the numeric value of the element itself represents the index to map TO
 *
 * The deletedIndices property contains the items (in case of an array) or keys (in case of map or set) that have been deleted.
 */
export type IndexMap<T = unknown> = number[] & {
    deletedIndices: number[];
    deletedItems: T[];
    isIndexMap: true;
};
export declare function copyIndexMap<T = unknown>(existing: number[] & {
    deletedIndices?: number[];
    deletedItems?: T[];
}, deletedIndices?: number[], deletedItems?: T[]): IndexMap;
export declare function createIndexMap(length?: number): IndexMap;
export declare function cloneIndexMap(indexMap: IndexMap): IndexMap;
export declare function isIndexMap(value: unknown): value is IndexMap;
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
export type CollectionObserver = ICollectionObserver<CollectionKind>;
export interface IBindingContext {
    [key: PropertyKey]: any;
}
export interface IOverrideContext {
    [key: PropertyKey]: any;
}
export type IObservable<T = IIndexable> = T & {
    $observers?: IIndexable<{}, AccessorOrObserver>;
};
//# sourceMappingURL=observation.d.ts.map