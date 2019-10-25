import { Constructable } from './interfaces';
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
export declare function isNumeric(value: unknown): value is number | string;
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
 * Returns `PLATFORM.emptyArray` if both arrays are either `null`, `undefined` or `PLATFORM.emptyArray`
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
//# sourceMappingURL=functions.d.ts.map