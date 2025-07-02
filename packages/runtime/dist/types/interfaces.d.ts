import { IIndexable } from '@aurelia/kernel';
import type { CollectionLengthObserver, CollectionSizeObserver } from './collection-length-observer';
export declare const ICoercionConfiguration: import("@aurelia/kernel").InterfaceSymbol<ICoercionConfiguration>;
export interface ICoercionConfiguration {
    /** When set to `true`, enables the automatic type-coercion for bindables globally. */
    enableCoercion: boolean;
    /** When set to `true`, coerces the `null` and `undefined` values to the target types. This is ineffective when `disableCoercion` is set to `true.` */
    coerceNullish: boolean;
}
export type InterceptorFunc<TInput = unknown, TOutput = unknown> = (value: TInput, coercionConfig?: ICoercionConfiguration) => TOutput;
export interface IConnectable {
    observe(obj: object, key: PropertyKey): void;
    observeCollection(obj: Collection): void;
    subscribeTo(subscribable: ISubscribable | ICollectionSubscribable): void;
}
export interface IDirtySubscriber {
    handleDirty(): void;
}
/**
 * Interface of a subscriber or property change handler
 */
export interface ISubscriber<TValue = unknown> extends Partial<IDirtySubscriber> {
    handleChange(newValue: TValue, previousValue: TValue): void;
}
/**
 * Interface of a collection subscriber or mutation handler
 */
export interface ICollectionSubscriber {
    handleCollectionChange(collection: Collection, indexMap: IndexMap): void;
}
export interface ISubscribable<T = ISubscriber> {
    subscribe(subscriber: T): void;
    unsubscribe(subscriber: T): void;
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
    notifyDirty(): void;
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
export type CollectionKind = 'indexed' | 'keyed' | 'array' | 'map' | 'set';
export type LengthPropertyName<T> = T extends unknown[] ? 'length' : T extends Set<unknown> ? 'size' : T extends Map<unknown, unknown> ? 'size' : never;
export type CollectionKindToType<T> = T extends 'array' ? unknown[] : T extends 'indexed' ? unknown[] : T extends 'map' ? Map<unknown, unknown> : T extends 'set' ? Set<unknown> : T extends 'keyed' ? Set<unknown> | Map<unknown, unknown> : never;
export type ObservedCollectionKindToType<T> = T extends 'array' ? unknown[] : T extends 'indexed' ? unknown[] : T extends 'map' ? Map<unknown, unknown> : T extends 'set' ? Set<unknown> : T extends 'keyed' ? Map<unknown, unknown> | Set<unknown> : never;
export declare const AccessorType: Readonly<{
    readonly None: 0;
    readonly Observer: 1;
    readonly Node: 2;
    readonly Layout: 4;
}>;
export type AccessorType = typeof AccessorType[keyof typeof AccessorType];
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
export interface IObserver<TValue = unknown> extends IAccessor<TValue>, ISubscribable {
    doNotCache?: boolean;
    useCallback?(callback: (newValue: TValue, oldValue: TValue) => void): boolean;
    useCoercer?(coercer: InterceptorFunc, coercionConfig?: ICoercionConfiguration): boolean;
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
export declare const hasChanges: (indexMap: IndexMap) => boolean;
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
    getLengthObserver(): T extends 'array' ? CollectionLengthObserver : CollectionSizeObserver;
    notify(): void;
}
export type CollectionObserver = ICollectionObserver<CollectionKind>;
export type IObservable<T = IIndexable> = T & {
    $observers?: IIndexable<{}, AccessorOrObserver>;
};
//# sourceMappingURL=interfaces.d.ts.map