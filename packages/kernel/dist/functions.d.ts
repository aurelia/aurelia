import { Constructable, Overwrite } from './interfaces.js';
/**
 * Efficiently determine whether the provided property key is numeric
 * (and thus could be an array indexer) or not.
 *
 * Always returns true for values of type `'number'`.
 *
 * Otherwise, only returns true for strings that consist only of positive integers.
 *
 * Results are cached.
 */
export declare function isArrayIndex(value: unknown): value is number | string;
/**
 * Determines if the value passed is a number or bigint for parsing purposes
 *
 * @param value - Value to evaluate
 */
export declare function isNumberOrBigInt(value: unknown): value is number | bigint;
/**
 * Determines if the value passed is a number or bigint for parsing purposes
 *
 * @param value - Value to evaluate
 */
export declare function isStringOrDate(value: unknown): value is string | Date;
/**
 * Efficiently convert a string to camelCase.
 *
 * Non-alphanumeric characters are treated as separators.
 *
 * Primarily used by Aurelia to convert DOM attribute names to ViewModel property names.
 *
 * Results are cached.
 */
export declare const camelCase: (input: string) => string;
/**
 * Efficiently convert a string to PascalCase.
 *
 * Non-alphanumeric characters are treated as separators.
 *
 * Primarily used by Aurelia to convert element names to class names for synthetic types.
 *
 * Results are cached.
 */
export declare const pascalCase: (input: string) => string;
/**
 * Efficiently convert a string to kebab-case.
 *
 * Non-alphanumeric characters are treated as separators.
 *
 * Primarily used by Aurelia to convert ViewModel property names to DOM attribute names.
 *
 * Results are cached.
 */
export declare const kebabCase: (input: string) => string;
/**
 * Efficiently (up to 10x faster than `Array.from`) convert an `ArrayLike` to a real array.
 *
 * Primarily used by Aurelia to convert DOM node lists to arrays.
 */
export declare function toArray<T = unknown>(input: ArrayLike<T>): T[];
/**
 * Retrieve the next ID in a sequence for a given string, starting with `1`.
 *
 * Used by Aurelia to assign unique ID's to controllers and resources.
 *
 * Aurelia will always prepend the context name with `au$`, so as long as you avoid
 * using that convention you should be safe from collisions.
 */
export declare function nextId(context: string): number;
/**
 * Reset the ID for the given string, so that `nextId` will return `1` again for the next call.
 *
 * Used by Aurelia to reset ID's in between unit tests.
 */
export declare function resetId(context: string): void;
/**
 * A compare function to pass to `Array.prototype.sort` for sorting numbers.
 * This is needed for numeric sort, since the default sorts them as strings.
 */
export declare function compareNumber(a: number, b: number): number;
/**
 * Efficiently merge and deduplicate the (primitive) values in two arrays.
 *
 * Does not deduplicate existing values in the first array.
 *
 * Guards against null or undefined arrays.
 *
 * Returns `emptyArray` if both arrays are either `null`, `undefined` or `emptyArray`
 *
 * @param slice - If `true`, always returns a new array copy (unless neither array is/has a value)
 */
export declare function mergeDistinct<T>(arr1: readonly T[] | T[] | null | undefined, arr2: readonly T[] | T[] | null | undefined, slice: boolean): T[];
/**
 * Decorator. (lazily) bind the method to the class instance on first call.
 */
export declare function bound<T extends Function>(target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T>;
export declare function mergeArrays<T>(...arrays: (readonly T[] | undefined)[]): T[];
export declare function mergeObjects<T extends object>(...objects: readonly (T | undefined)[]): T;
export declare function firstDefined<T>(...values: readonly (T | undefined)[]): T;
export declare const getPrototypeChain: <T extends Constructable<{}>>(Type: T) => readonly [T, ...Constructable<{}>[]];
export declare function toLookup<T1 extends {}>(obj1: T1): T1;
export declare function toLookup<T1 extends {}, T2 extends {}>(obj1: T1, obj2: T2): Overwrite<T1, T2>;
export declare function toLookup<T1 extends {}, T2 extends {}, T3 extends {}>(obj1: T1, obj2: T2, obj3: T3): Overwrite<T1, Overwrite<T1, T2>>;
export declare function toLookup<T1 extends {}, T2 extends {}, T3 extends {}, T4 extends {}>(obj1: T1, obj2: T2, obj3: T3, obj4: T4): Readonly<T1 & T2 & T3 & T4>;
export declare function toLookup<T1 extends {}, T2 extends {}, T3 extends {}, T4 extends {}, T5 extends {}>(obj1: T1, obj2: T2, obj3: T3, obj4: T4, obj5: T5): Readonly<T1 & T2 & T3 & T4 & T5>;
/**
 * Determine whether the value is a native function.
 *
 * @param fn - The function to check.
 * @returns `true` is the function is a native function, otherwise `false`
 */
export declare const isNativeFunction: (fn: Function) => boolean;
declare type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
declare type MaybePromise<T> = T extends Promise<infer R> ? (T | R) : (T | Promise<T>);
/**
 * Normalize a potential promise via a callback, to ensure things stay synchronous when they can.
 *
 * If the value is a promise, it is `then`ed before the callback is invoked. Otherwise the callback is invoked synchronously.
 */
export declare function onResolve<TValue, TRet>(maybePromise: TValue, resolveCallback: (value: UnwrapPromise<TValue>) => TRet): MaybePromise<TRet>;
/**
 * Normalize an array of potential promises, to ensure things stay synchronous when they can.
 *
 * If exactly one value is a promise, then that promise is returned.
 *
 * If more than one value is a promise, a new `Promise.all` is returned.
 *
 * If none of the values is a promise, nothing is returned, to indicate that things can stay synchronous.
 */
export declare function resolveAll(...maybePromises: (void | Promise<void>)[]): void | Promise<void>;
export {};
//# sourceMappingURL=functions.d.ts.map