/**
 * A shortcut to Object.prototype.hasOwnProperty
 * Needs to do explicit .call
 */
export declare const hasOwnProp: (v: PropertyKey) => boolean;
export declare const def: typeof Reflect.defineProperty;
export declare function defineHiddenProp<T extends unknown>(obj: object, key: PropertyKey, value: T): T;
export declare function ensureProto<T extends object, K extends keyof T>(proto: T, key: K, defaultValue: unknown, force?: boolean): void;
//# sourceMappingURL=utilities-objects.d.ts.map