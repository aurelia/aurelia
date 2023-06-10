import { DI, IDisposable, IIndexable, IServiceLocator } from '@aurelia/kernel';
import { isArray } from './utilities-objects';

import type { Scope } from './observation/scope';
import type { CollectionLengthObserver, CollectionSizeObserver } from './observation/collection-length-observer';
import { TaskQueue } from '@aurelia/platform';

export interface IBinding {
  readonly isBound: boolean;
  bind(scope: Scope): void;
  unbind(): void;
  get: IServiceLocator['get'];
  useScope?(scope: Scope): void;
  limit?(opts: IRateLimitOptions): IDisposable;
}

export interface IRateLimitOptions {
  type: 'throttle' | 'debounce';
  delay: number;
  queue: TaskQueue;
  now: () => number;
  signals: string[];
}

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
  None          = 0b0_000_000,
  Observer      = 0b0_000_001,

  Node          = 0b0_000_010,

  // misc characteristic of accessors/observers when update
  //
  // by default, everything is synchronous
  // except changes that are supposed to cause reflow/heavy computation
  // an observer can use this flag to signal binding that don't carelessly tell it to update
  // queue it instead
  // todo: https://gist.github.com/paulirish/5d52fb081b3570c81e3a
  // todo: https://csstriggers.com/
  Layout        = 0b0_000_100,
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

export type IGlobalContext = {
  [key in (typeof globalNames)[number]]: typeof globalThis[key];
};

export type IObservable<T = IIndexable> = T & {
  $observers?: IIndexable<{}, AccessorOrObserver>;
};

const globalNames = [
  // https://262.ecma-international.org/#sec-value-properties-of-the-global-object
  'globalThis',
  'Infinity',
  'NaN',

  // https://262.ecma-international.org/#sec-function-properties-of-the-global-object
  'isFinite',
  'isNaN',
  'parseFloat',
  'parseInt',
  'decodeURI',
  'decodeURIComponent',
  'encodeURI',
  'encodeURIComponent',

  // https://262.ecma-international.org/#sec-constructor-properties-of-the-global-object
  'AggregateError',
  'Array',
  'ArrayBuffer',
  'BigInt',
  'BigInt64Array',
  'BigUint64Array',
  'Boolean',
  'DataView',
  'Date',
  'Error',
  'EvalError',
  'FinalizationRegistry',
  'Float32Array',
  'Float64Array',
  'Function',
  'Int8Array',
  'Int16Array',
  'Int32Array',
  'Map',
  'Number',
  'Object',
  'Promise',
  'Proxy',
  'RangeError',
  'ReferenceError',
  'RegExp',
  'Set',
  'SharedArrayBuffer',
  'String',
  'Symbol',
  'SyntaxError',
  'TypeError',
  'Uint8Array',
  'Uint8ClampedArray',
  'Uint16Array',
  'Uint32Array',
  'URIError',
  'WeakMap',
  'WeakRef',
  'WeakSet',

  // https://262.ecma-international.org/#sec-other-properties-of-the-global-object
  'Atomics',
  'JSON',
  'Math',
  'Reflect',
] as const;

export const createGlobalContext = (globalObj: typeof globalThis): IGlobalContext => {
  const globalContext = Object.assign(Object.create(null), Object.fromEntries(globalNames.map(k => [k, globalObj[k]])));
  return globalContext;
};
