/**
 * Returns true if the value is a Promise via checking if it's an instance of Promise.
 * This does not work for objects across different realms (e.g., iframes).
 * An utility to be shared among core packages for better size optimization
 */
export declare const isPromise: <T>(v: unknown) => v is Promise<T>;
/**
 * Returns true if the value is an Array via checking if it's an instance of Array.
 * This does not work for objects across different realms (e.g., iframes).
 * An utility to be shared among core packages for better size optimization
 */
export declare const isArray: <T>(v: unknown) => v is T[];
/**
 * Returns true if the value is a Set via checking if it's an instance of Set.
 * This does not work for objects across different realms (e.g., iframes).
 * An utility to be shared among core packages for better size optimization
 */
export declare const isSet: <T>(v: unknown) => v is Set<T>;
/**
 * Returns true if the value is a Map via checking if it's an instance of Map.
 * This does not work for objects across different realms (e.g., iframes).
 * An utility to be shared among core packages for better size optimization
 */
export declare const isMap: <T, K>(v: unknown) => v is Map<T, K>;
/**
 * Returns true if the value is an object via checking if it's an instance of Object.
 * This does not work for objects across different realms (e.g., iframes).
 * An utility to be shared among core packages only for better size optimization
 *
 * This is semi private to core packages and applications should not depend on this.
 */
export declare const isObject: (v: unknown) => v is object;
/**
 * IMPORTANT: This is semi private to core packages and applications should not depend on this.
 *
 * Determine whether a value is an object.
 *
 * Uses `typeof` to guarantee this works cross-realm, which is where `instanceof Object` might fail.
 *
 * Some environments where these issues are known to arise:
 * - same-origin iframes (accessing the other realm via `window.top`)
 * - `jest`.
 *
 * The exact test is:
 * ```ts
 * typeof value === 'object' && value !== null || typeof value === 'function'
 * ```
 *
 * @param value - The value to test.
 * @returns `true` if the value is an object, otherwise `false`.
 * Also performs a type assertion that defaults to `value is Object | Function` which, if the input type is a union with an object type, will infer the correct type.
 * This can be overridden with the generic type argument.
 *
 * @example
 *
 * ```ts
 * class Foo {
 *   bar = 42;
 * }
 *
 * function doStuff(input?: Foo | null) {
 *   input.bar; // Object is possibly 'null' or 'undefined'
 *
 *   // input has an object type in its union (Foo) so that type will be extracted for the 'true' condition
 *   if (isObject(input)) {
 *     input.bar; // OK (input is now typed as Foo)
 *   }
 * }
 *
 * function doOtherStuff(input: unknown) {
 *   input.bar; // Object is of type 'unknown'
 *
 *   // input is 'unknown' so there is no union type to match and it will default to 'Object | Function'
 *   if (isObject(input)) {
 *     input.bar; // Property 'bar' does not exist on type 'Object | Function'
 *   }
 *
 *   // if we know for sure that, if input is an object, it must be a specific type, we can explicitly tell the function to assert that for us
 *   if (isObject<Foo>(input)) {
 *    input.bar; // OK (input is now typed as Foo)
 *   }
 * }
 * ```
 *
 */
export declare function isObjectOrFunction<T extends object = Object | Function>(value: unknown): value is T;
/**
 * Returns true if the value is a function
 * An utility to be shared among core packages for better size optimization
 */
export declare const isFunction: <T extends Function>(v: unknown) => v is T;
/**
 * Returns true if the value is a string
 * An utility to be shared among core packages for better size optimization
 */
export declare const isString: (v: unknown) => v is string;
/**
 * Returns true if the value is a symbol
 * An utility to be shared among core packages for better size optimization
 */
export declare const isSymbol: (v: unknown) => v is string;
/**
 * Returns true if the value is a number
 * An utility to be shared among core packages for better size optimization
 */
export declare const isNumber: (v: unknown) => v is number;
/**
 * Create an object with no prototype to be used as a record
 * An utility to be shared among core packages for better size optimization
 */
export declare const createLookup: <T>() => Record<string, T>;
/**
 * Compare the 2 values without pitfall of JS ===, including NaN and +0/-0
 * An utility to be shared among core packages for better size optimization
 */
export declare const areEqual: (value1: any, value2: any) => boolean;
export type AnyFunction = (...args: any) => any;
export type FunctionPropNames<T> = {
    [K in keyof T]: K extends 'constructor' ? never : NonNullable<T[K]> extends AnyFunction ? K : never;
}[keyof T];
export type MaybePromise<T> = T | Promise<T>;
//# sourceMappingURL=utilities.d.ts.map