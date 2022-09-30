import { DI, IDisposable, IIndexable, IServiceLocator } from '@aurelia/kernel';
import { isArray } from './utilities-objects';

import type { Scope } from './observation/binding-context';
import type { CollectionLengthObserver, CollectionSizeObserver } from './observation/collection-length-observer';
import { TaskQueue } from '@aurelia/platform';

export interface IBinding {
  readonly locator: IServiceLocator;
  readonly scope?: Scope;
  readonly isBound: boolean;
  $bind(scope: Scope): void;
  $unbind(): void;
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

export const ICoercionConfiguration = DI.createInterface<ICoercionConfiguration>('ICoercionConfiguration');
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

export interface ISubscriber<TValue = unknown> {
  handleChange(newValue: TValue, previousValue: TValue): void;
}

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

export const enum CollectionKind {
  indexed = 0b1000,
  keyed   = 0b0100,
  array   = 0b1001,
  map     = 0b0110,
  set     = 0b0111,
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
  T extends CollectionKind.array ? unknown[] :
    T extends CollectionKind.indexed ? unknown[] :
      T extends CollectionKind.map ? Map<unknown, unknown> :
        T extends CollectionKind.set ? Set<unknown> :
          T extends CollectionKind.keyed ? Map<unknown, unknown> | Set<unknown> :
            never;

export const enum AccessorType {
  None          = 0b0_0000_0000,
  Observer      = 0b0_0000_0001,

  Node          = 0b0_0000_0010,

  // misc characteristic of accessors/observers when update
  //
  // by default, everything is synchronous
  // except changes that are supposed to cause reflow/heavy computation
  // an observer can use this flag to signal binding that don't carelessly tell it to update
  // queue it instead
  // todo: https://gist.github.com/paulirish/5d52fb081b3570c81e3a
  // todo: https://csstriggers.com/
  Layout        = 0b0_0000_0100,
  // by default, everything is an object
  // eg: a property is accessed on an object
  // unless explicitly not so
  Primtive      = 0b0_0000_1000,

  Array         = 0b0_0001_0010,
  Set           = 0b0_0010_0010,
  Map           = 0b0_0100_0010,
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
  getLengthObserver(): T extends CollectionKind.array ? CollectionLengthObserver : CollectionSizeObserver;
  notify(): void;
}
export type CollectionObserver = ICollectionObserver<CollectionKind>;

export interface IBindingContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: PropertyKey]: any;
}

export interface IOverrideContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: PropertyKey]: any;
}

export type IObservable<T = IIndexable> = T & {
  $observers?: IIndexable<{}, AccessorOrObserver>;
};
