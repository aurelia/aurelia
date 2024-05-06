/**
 * TODO: add description.
 * References:
 * - https://github.com/tc39/proposal-decorator-metadata
 * - https://github.com/microsoft/TypeScript/issues/55788
 */
export function initializeTC39Metadata() {
  // We need the any-coercion here because the metadata in Symbol is marked as unique symbol.
  // And the symbol we are creating here is not assignable to the unique symbol.
  // More info: https://github.com/Microsoft/TypeScript/issues/23388
  (Symbol as any).metadata ??= Symbol.for("Symbol.metadata");
}
/**
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
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function isObject<T extends object = Object | Function>(value: unknown): value is T {
  return typeof value === 'object' && value !== null || typeof value === 'function';
}

/**
 * Determine whether a value is `null` or `undefined`.
 *
 * @param value - The value to test.
 * @returns `true` if the value is `null` or `undefined`, otherwise `false`.
 * Also performs a type assertion that ensures TypeScript treats the value appropriately in the `if` and `else` branches after this check.
 */
export function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === void 0;
}

export const Metadata = {
  get<T>(key: string, type: any): T | undefined {
    return type[Symbol.metadata]?.[key];
  },
  define(value: any, type: any,...keys: string[]): void {
    const metadata = type[Symbol.metadata] ??= Object.create(null);
    const length = keys.length;
    switch (length) {
      case 0: throw new Error('At least one key must be provided');
      case 1: metadata[keys[0]] = value; return;
      case 2: metadata[keys[0]] = metadata[keys[1]] = value; return;
      default: {
        for (let i = 0; i < length; ++i) {
          metadata[keys[i]] = value;
        }
        return;
      }
    }
  },
  has(key: string, type: any): boolean {
    const metadata = type[Symbol.metadata];
    return metadata == null
      ? false
      : key in metadata;
  },
  delete(key: string, type: any): void {
    const metadata = type[Symbol.metadata];
    if (metadata == null) return;
    Reflect.deleteProperty(metadata, key);
    return;
  },
};
