import { Metadata } from '@aurelia/metadata';

/** @internal */ export const objectFreeze = Object.freeze;
/** @internal */ export const objectAssign = Object.assign;
/** @internal */ export const safeString = String;
/** @internal */ export const getMetadata = Metadata.get;
/** @internal */ export const hasMetadata = Metadata.has;
/** @internal */ export const defineMetadata = Metadata.define;

/**
 * Returns true if the value is a thenable (has a `.then` method).
 * An utility to be shared among core packages for better size optimization.
 *
 * Cross-realm safe (works with iframes, JSDOM, vitest, etc.).
 * Per Promise/A+ spec, a thenable is any object or function with a `.then` method.
 */
export const isPromise = <T>(v: unknown): v is Promise<T> =>
  v != null && typeof (v as Promise<T>).then === 'function';

/**
 * Returns true if the value is an Array.
 * An utility to be shared among core packages for better size optimization.
 *
 * Cross-realm safe via Array.isArray (works with iframes, JSDOM, vitest, etc.).
 */
export const isArray = <T>(v: unknown): v is T[] => Array.isArray(v);

/**
 * Returns true if the value is a Set.
 * An utility to be shared among core packages for better size optimization.
 *
 * Cross-realm safe via Symbol.toStringTag (works with iframes, JSDOM, vitest, etc.).
 * Uses Symbol.toStringTag directly instead of Object.prototype.toString.call() for performance.
 */
export const isSet = <T>(v: unknown): v is Set<T> =>
  v != null && (v as Set<T>)[Symbol.toStringTag] === 'Set';

/**
 * Returns true if the value is a Map.
 * An utility to be shared among core packages for better size optimization.
 *
 * Cross-realm safe via Symbol.toStringTag (works with iframes, JSDOM, vitest, etc.).
 * Uses Symbol.toStringTag directly instead of Object.prototype.toString.call() for performance.
 */
export const isMap = <T, K>(v: unknown): v is Map<T, K> =>
  v != null && (v as Map<T, K>)[Symbol.toStringTag] === 'Map';

/**
 * Returns true if the value is an object (excluding null).
 * An utility to be shared among core packages for better size optimization.
 *
 * Cross-realm safe via typeof (works with iframes, JSDOM, vitest, etc.).
 *
 * Note: Returns true for arrays and other object types, but NOT functions.
 * Use `isObjectOrFunction` if you need to include functions.
 */
export const isObject = (v: unknown): v is object =>
  typeof v === 'object' && v !== null;

/**
 * Returns true if the value is an object or function.
 * Cross-realm safe via typeof (works with iframes, JSDOM, etc.).
 *
 * Use this when you need to check for both objects AND functions.
 * For objects only, use `isObject`. For functions only, use `isFunction`.
 *
 * @example
 * ```ts
 * isObjectOrFunction({});        // true
 * isObjectOrFunction(() => {});  // true
 * isObjectOrFunction(null);      // false
 * isObjectOrFunction('string');  // false
 * ```
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function isObjectOrFunction<T extends object = Object | Function>(value: unknown): value is T {
  return typeof value === 'object' && value !== null || typeof value === 'function';
}

/**
 * Returns true if the value is a function
 * An utility to be shared among core packages for better size optimization
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const isFunction = <T extends Function>(v: unknown): v is T => typeof v === 'function';

/**
 * Returns true if the value is a string
 * An utility to be shared among core packages for better size optimization
 */
export const isString = (v: unknown): v is string => typeof v === 'string';

/**
 * Returns true if the value is a symbol
 * An utility to be shared among core packages for better size optimization
 */
export const isSymbol = (v: unknown): v is string => typeof v === 'symbol';

/**
 * Returns true if the value is a number
 * An utility to be shared among core packages for better size optimization
 */
export const isNumber = (v: unknown): v is number => typeof v === 'number';

/**
 * Create an object with no prototype to be used as a record
 * An utility to be shared among core packages for better size optimization
 */
export const createLookup = <T>() => Object.create(null) as Record<string, T>;

/**
 * Compare the 2 values without pitfall of JS ===, including NaN and +0/-0
 * An utility to be shared among core packages for better size optimization
 */
export const areEqual = Object.is;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunction = (...args: any) => any;
export type FunctionPropNames<T> = {
  [K in keyof T]: K extends 'constructor' ? never : NonNullable<T[K]> extends AnyFunction ? K : never;
}[keyof T];
export type MaybePromise<T> = T | Promise<T>;
