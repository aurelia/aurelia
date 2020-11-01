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
export declare function isObject<T extends object = Object | Function>(value: unknown): value is T;
/**
 * Determine whether a value is `null` or `undefined`.
 *
 * @param value - The value to test.
 * @returns `true` if the value is `null` or `undefined`, otherwise `false`.
 * Also performs a type assertion that ensures TypeScript treats the value appropriately in the `if` and `else` branches after this check.
 */
export declare function isNullOrUndefined(value: unknown): value is null | undefined;
/**
 * A default metadata decorator factory that can be used on a class, class member, or parameter.
 *
 * @param metadataKey - The key for the metadata entry.
 * If `metadataKey` is already defined for the target and target key, the
 * metadataValue for that key will be overwritten.
 * @param metadataValue - The value for the metadata entry.
 * @returns A decorator function.
 */
export declare function metadata(metadataKey: any, metadataValue: any): {
    (target: Function): void;
    (target: any, propertyKey: string | symbol): void;
};
/**
 * Define a unique metadata entry on the target.
 *
 * @param metadataKey - A key used to store and retrieve metadata.
 * @param metadataValue - A value that contains attached metadata.
 * @param target - The target object on which to define metadata.
 * @example
 *
 *     class Example {
 *     }
 *
 *     // constructor
 *     Metadata.define("custom:annotation", options, Example);
 *
 *     // decorator factory as metadata-producing annotation.
 *     function MyAnnotation(options): ClassDecorator {
 *         return target => Metadata.define("custom:annotation", options, target);
 *     }
 *
 */
declare function $define(metadataKey: any, metadataValue: any, target: any): void;
/**
 * Define a unique metadata entry on the target.
 *
 * @param metadataKey - A key used to store and retrieve metadata.
 * @param metadataValue - A value that contains attached metadata.
 * @param target - The target object on which to define metadata.
 * @param propertyKey - The property key for the target.
 * @example
 *
 *     class Example {
 *         // property declarations are not part of ES6, though they are valid in TypeScript:
 *         // static staticProperty;
 *         // property;
 *
 *         static staticMethod(p) { }
 *         method(p) { }
 *     }
 *
 *     // property (on constructor)
 *     Metadata.define("custom:annotation", Number, Example, "staticProperty");
 *
 *     // property (on prototype)
 *     Metadata.define("custom:annotation", Number, Example.prototype, "property");
 *
 *     // method (on constructor)
 *     Metadata.define("custom:annotation", Number, Example, "staticMethod");
 *
 *     // method (on prototype)
 *     Metadata.define("custom:annotation", Number, Example.prototype, "method");
 *
 *     // decorator factory as metadata-producing annotation.
 *     function MyAnnotation(options): PropertyDecorator {
 *         return (target, key) => Metadata.define("custom:annotation", options, target, key);
 *     }
 *
 */
declare function $define(metadataKey: any, metadataValue: any, target: any, propertyKey: string | symbol): void;
/**
 * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
 *
 * @param metadataKey - A key used to store and retrieve metadata.
 * @param target - The target object on which the metadata is defined.
 * @returns `true` if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
 * @example
 *
 *     class Example {
 *     }
 *
 *     // constructor
 *     result = Metadata.has("custom:annotation", Example);
 *
 */
declare function $has(metadataKey: any, target: any): boolean;
/**
 * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
 *
 * @param metadataKey - A key used to store and retrieve metadata.
 * @param target - The target object on which the metadata is defined.
 * @param propertyKey - The property key for the target.
 * @returns `true` - if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
 * @example
 *
 *     class Example {
 *         // property declarations are not part of ES6, though they are valid in TypeScript:
 *         // static staticProperty;
 *         // property;
 *
 *         static staticMethod(p) { }
 *         method(p) { }
 *     }
 *
 *     // property (on constructor)
 *     result = Metadata.has("custom:annotation", Example, "staticProperty");
 *
 *     // property (on prototype)
 *     result = Metadata.has("custom:annotation", Example.prototype, "property");
 *
 *     // method (on constructor)
 *     result = Metadata.has("custom:annotation", Example, "staticMethod");
 *
 *     // method (on prototype)
 *     result = Metadata.has("custom:annotation", Example.prototype, "method");
 *
 */
declare function $has(metadataKey: any, target: any, propertyKey: string | symbol): boolean;
/**
 * Gets a value indicating whether the target object has the provided metadata key defined.
 *
 * @param metadataKey - A key used to store and retrieve metadata.
 * @param target - The target object on which the metadata is defined.
 * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
 * @example
 *
 *     class Example {
 *     }
 *
 *     // constructor
 *     result = Metadata.hasOwn("custom:annotation", Example);
 *
 */
declare function $hasOwn(metadataKey: any, target: any): boolean;
/**
 * Gets a value indicating whether the target object has the provided metadata key defined.
 *
 * @param metadataKey - A key used to store and retrieve metadata.
 * @param target - The target object on which the metadata is defined.
 * @param propertyKey - The property key for the target.
 * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
 * @example
 *
 *     class Example {
 *         // property declarations are not part of ES6, though they are valid in TypeScript:
 *         // static staticProperty;
 *         // property;
 *
 *         static staticMethod(p) { }
 *         method(p) { }
 *     }
 *
 *     // property (on constructor)
 *     result = Metadata.hasOwn("custom:annotation", Example, "staticProperty");
 *
 *     // property (on prototype)
 *     result = Metadata.hasOwn("custom:annotation", Example.prototype, "property");
 *
 *     // method (on constructor)
 *     result = Metadata.hasOwn("custom:annotation", Example, "staticMethod");
 *
 *     // method (on prototype)
 *     result = Metadata.hasOwn("custom:annotation", Example.prototype, "method");
 *
 */
declare function $hasOwn(metadataKey: any, target: any, propertyKey: string | symbol): boolean;
/**
 * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
 *
 * @param metadataKey - A key used to store and retrieve metadata.
 * @param target - The target object on which the metadata is defined.
 * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
 * @example
 *
 *     class Example {
 *     }
 *
 *     // constructor
 *     result = Metadata.get("custom:annotation", Example);
 *
 */
declare function $get(metadataKey: any, target: any): any;
/**
 * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
 *
 * @param metadataKey - A key used to store and retrieve metadata.
 * @param target - The target object on which the metadata is defined.
 * @param propertyKey - The property key for the target.
 * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
 * @example
 *
 *     class Example {
 *         // property declarations are not part of ES6, though they are valid in TypeScript:
 *         // static staticProperty;
 *         // property;
 *
 *         static staticMethod(p) { }
 *         method(p) { }
 *     }
 *
 *     // property (on constructor)
 *     result = Metadata.get("custom:annotation", Example, "staticProperty");
 *
 *     // property (on prototype)
 *     result = Metadata.get("custom:annotation", Example.prototype, "property");
 *
 *     // method (on constructor)
 *     result = Metadata.get("custom:annotation", Example, "staticMethod");
 *
 *     // method (on prototype)
 *     result = Metadata.get("custom:annotation", Example.prototype, "method");
 *
 */
declare function $get(metadataKey: any, target: any, propertyKey: string | symbol): any;
/**
 * Gets the metadata value for the provided metadata key on the target object.
 *
 * @param metadataKey - A key used to store and retrieve metadata.
 * @param target - The target object on which the metadata is defined.
 * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
 * @example
 *
 *     class Example {
 *     }
 *
 *     // constructor
 *     result = Metadata.getOwn("custom:annotation", Example);
 *
 */
declare function $getOwn(metadataKey: any, target: any): any;
/**
 * Gets the metadata value for the provided metadata key on the target object.
 *
 * @param metadataKey - A key used to store and retrieve metadata.
 * @param target - The target object on which the metadata is defined.
 * @param propertyKey - The property key for the target.
 * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
 * @example
 *
 *     class Example {
 *         // property declarations are not part of ES6, though they are valid in TypeScript:
 *         // static staticProperty;
 *         // property;
 *
 *         static staticMethod(p) { }
 *         method(p) { }
 *     }
 *
 *     // property (on constructor)
 *     result = Metadata.getOwn("custom:annotation", Example, "staticProperty");
 *
 *     // property (on prototype)
 *     result = Metadata.getOwn("custom:annotation", Example.prototype, "property");
 *
 *     // method (on constructor)
 *     result = Metadata.getOwn("custom:annotation", Example, "staticMethod");
 *
 *     // method (on prototype)
 *     result = Metadata.getOwn("custom:annotation", Example.prototype, "method");
 *
 */
declare function $getOwn(metadataKey: any, target: any, propertyKey: string | symbol): any;
/**
 * Gets the metadata keys defined on the target object or its prototype chain.
 *
 * @param target - The target object on which the metadata is defined.
 * @returns An array of unique metadata keys.
 * @example
 *
 *     class Example {
 *     }
 *
 *     // constructor
 *     result = Metadata.getKeys(Example);
 *
 */
declare function $getKeys(target: any): any[];
/**
 * Gets the metadata keys defined on the target object or its prototype chain.
 *
 * @param target - The target object on which the metadata is defined.
 * @param propertyKey - The property key for the target.
 * @returns An array of unique metadata keys.
 * @example
 *
 *     class Example {
 *         // property declarations are not part of ES6, though they are valid in TypeScript:
 *         // static staticProperty;
 *         // property;
 *
 *         static staticMethod(p) { }
 *         method(p) { }
 *     }
 *
 *     // property (on constructor)
 *     result = Metadata.getKeys(Example, "staticProperty");
 *
 *     // property (on prototype)
 *     result = Metadata.getKeys(Example.prototype, "property");
 *
 *     // method (on constructor)
 *     result = Metadata.getKeys(Example, "staticMethod");
 *
 *     // method (on prototype)
 *     result = Metadata.getKeys(Example.prototype, "method");
 *
 */
declare function $getKeys(target: any, propertyKey: string | symbol): any[];
/**
 * Gets the unique metadata keys defined on the target object.
 *
 * @param target - The target object on which the metadata is defined.
 * @returns An array of unique metadata keys.
 * @example
 *
 *     class Example {
 *     }
 *
 *     // constructor
 *     result = Metadata.getOwnKeys(Example);
 *
 */
declare function $getOwnKeys(target: any): any[];
/**
 * Gets the unique metadata keys defined on the target object.
 *
 * @param target - The target object on which the metadata is defined.
 * @param propertyKey - The property key for the target.
 * @returns An array of unique metadata keys.
 * @example
 *
 *     class Example {
 *         // property declarations are not part of ES6, though they are valid in TypeScript:
 *         // static staticProperty;
 *         // property;
 *
 *         static staticMethod(p) { }
 *         method(p) { }
 *     }
 *
 *     // property (on constructor)
 *     result = Metadata.getOwnKeys(Example, "staticProperty");
 *
 *     // property (on prototype)
 *     result = Metadata.getOwnKeys(Example.prototype, "property");
 *
 *     // method (on constructor)
 *     result = Metadata.getOwnKeys(Example, "staticMethod");
 *
 *     // method (on prototype)
 *     result = Metadata.getOwnKeys(Example.prototype, "method");
 *
 */
declare function $getOwnKeys(target: any, propertyKey: string | symbol): any[];
/**
 * Deletes the metadata entry from the target object with the provided key.
 *
 * @param metadataKey - A key used to store and retrieve metadata.
 * @param target - The target object on which the metadata is defined.
 * @returns `true` if the metadata entry was found and deleted; otherwise, false.
 * @example
 *
 *     class Example {
 *     }
 *
 *     // constructor
 *     result = Metadata.delete("custom:annotation", Example);
 *
 */
declare function $delete(metadataKey: any, target: any): boolean;
/**
 * Deletes the metadata entry from the target object with the provided key.
 *
 * @param metadataKey - A key used to store and retrieve metadata.
 * @param target - The target object on which the metadata is defined.
 * @param propertyKey - The property key for the target.
 * @returns `true` if the metadata entry was found and deleted; otherwise, false.
 * @example
 *
 *     class Example {
 *         // property declarations are not part of ES6, though they are valid in TypeScript:
 *         // static staticProperty;
 *         // property;
 *
 *         static staticMethod(p) { }
 *         method(p) { }
 *     }
 *
 *     // property (on constructor)
 *     result = Metadata.delete("custom:annotation", Example, "staticProperty");
 *
 *     // property (on prototype)
 *     result = Metadata.delete("custom:annotation", Example.prototype, "property");
 *
 *     // method (on constructor)
 *     result = Metadata.delete("custom:annotation", Example, "staticMethod");
 *
 *     // method (on prototype)
 *     result = Metadata.delete("custom:annotation", Example.prototype, "method");
 *
 */
declare function $delete(metadataKey: any, target: any, propertyKey: string | symbol): boolean;
export declare const Metadata: {
    define: typeof $define;
    has: typeof $has;
    hasOwn: typeof $hasOwn;
    get: typeof $get;
    getOwn: typeof $getOwn;
    getKeys: typeof $getKeys;
    getOwnKeys: typeof $getOwnKeys;
    delete: typeof $delete;
};
export declare function applyMetadataPolyfill(reflect: typeof Reflect, throwIfConflict?: boolean, forceOverwrite?: boolean, writable?: boolean, configurable?: boolean): void;
export {};
//# sourceMappingURL=index.d.ts.map