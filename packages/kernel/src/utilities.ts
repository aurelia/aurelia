import { Metadata } from '@aurelia/metadata';

/** @internal */ export const objectFreeze = Object.freeze;
/** @internal */ export const objectAssign = Object.assign;
/** @internal */ export const safeString = String;
/** @internal */ export const getMetadata = Metadata.get;
/** @internal */ export const hasMetadata = Metadata.has;
/** @internal */ export const defineMetadata = Metadata.define;

/**
 * Returns true if the value is a Promise via checking if it's an instance of Promise.
 * This does not work for objects across different realms (e.g., iframes).
 * An utility to be shared among core packages for better size optimization
 */
export const isPromise = <T>(v: unknown): v is Promise<T> => v instanceof Promise;

/**
 * Returns true if the value is an Array via checking if it's an instance of Array.
 * This does not work for objects across different realms (e.g., iframes).
 * An utility to be shared among core packages for better size optimization
 */
export const isArray = <T>(v: unknown): v is T[] => v instanceof Array;

/**
 * Returns true if the value is a Set via checking if it's an instance of Set.
 * This does not work for objects across different realms (e.g., iframes).
 * An utility to be shared among core packages for better size optimization
 */
export const isSet = <T>(v: unknown): v is Set<T> => v instanceof Set;

/**
 * Returns true if the value is a Map via checking if it's an instance of Map.
 * This does not work for objects across different realms (e.g., iframes).
 * An utility to be shared among core packages for better size optimization
 */
export const isMap = <T, K>(v: unknown): v is Map<T, K> => v instanceof Map;

/**
 * Returns true if the value is an object via checking if it's an instance of Object.
 * This does not work for objects across different realms (e.g., iframes).
 * An utility to be shared among core packages for better size optimization
 */
export const isObject = (v: unknown): v is object => v instanceof Object;

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
