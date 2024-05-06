import { DI, IIndexable } from '@aurelia/kernel';
import { isArray, objectFreeze } from './utilities';

import type { CollectionLengthObserver, CollectionSizeObserver } from './observation/collection-length-observer';

export const ICoercionConfiguration = /*@__PURE__*/DI.createInterface<ICoercionConfiguration>('ICoercionConfiguration');
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

export type LengthPropertyName<T> =
  T extends unknown[] ? 'length' :
    T extends Set<unknown> ? 'size' :
      T extends Map<unknown, unknown> ? 'size' :
        never;

export type CollectionKindToType<T> =
  T extends 'array' ? unknown[] :
    T extends 'indexed' ? unknown[] :
      T extends 'map' ? Map<unknown, unknown> :
        T extends 'set' ? Set<unknown> :
          T extends 'keyed' ? Set<unknown> | Map<unknown, unknown> :
            never;

export type ObservedCollectionKindToType<T> =
  T extends 'array' ? unknown[] :
    T extends 'indexed' ? unknown[] :
      T extends 'map' ? Map<unknown, unknown> :
        T extends 'set' ? Set<unknown> :
          T extends 'keyed' ? Map<unknown, unknown> | Set<unknown> :
            never;

/** @internal */ export const atNone     = 0b0_000_000;
/** @internal */ export const atObserver = 0b0_000_001;
/** @internal */ export const atNode     = 0b0_000_010;
/** @internal */ export const atLayout   = 0b0_000_100;
export const AccessorType = /*@__PURE__*/objectFreeze({
  None      : atNone,
  Observer  : atObserver,
  Node      : atNode,
  // misc characteristic of accessors/observers when update
  //
  // by default, everything is synchronous
  // except changes that are supposed to cause reflow/heavy computation
  // an observer can use this flag to signal binding that don't carelessly tell it to update
  // queue it instead
  // todo: https://gist.github.com/paulirish/5d52fb081b3570c81e3a
  // todo: https://csstriggers.com/
  Layout    : atLayout,
} as const);
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

export function copyIndexMap<T = unknown>(
  existing: number[] & { deletedIndices?: number[]; deletedItems?: T[] },
  deletedIndices?: number[],
  deletedItems?: T[],
): IndexMap {
  const { length } = existing;
  const arr = Array(length) as IndexMap;
  let i = 0;
  while (i < length) {
    arr[i] = existing[i];
    ++i;
  }
  if (deletedIndices !== void 0) {
    arr.deletedIndices = deletedIndices.slice(0);
  } else if (existing.deletedIndices !== void 0) {
    arr.deletedIndices = existing.deletedIndices.slice(0);
  } else {
    arr.deletedIndices = [];
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
  arr.deletedIndices = [];
  arr.deletedItems = [];
  arr.isIndexMap = true;
  return arr;
}

export function cloneIndexMap(indexMap: IndexMap): IndexMap {
  const clone = indexMap.slice() as IndexMap;
  clone.deletedIndices = indexMap.deletedIndices.slice();
  clone.deletedItems = indexMap.deletedItems.slice();
  clone.isIndexMap = true;
  return clone;
}

export function isIndexMap(value: unknown): value is IndexMap {
  return isArray(value) && (value as IndexMap).isIndexMap === true;
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
  ICollectionSubscribable {
  type: AccessorType;
  collection: ObservedCollectionKindToType<T>;
  getLengthObserver(): T extends 'array' ? CollectionLengthObserver : CollectionSizeObserver;
  notify(): void;
}
export type CollectionObserver = ICollectionObserver<CollectionKind>;

export type IObservable<T = IIndexable> = T & {
  $observers?: IIndexable<{}, AccessorOrObserver>;
};
