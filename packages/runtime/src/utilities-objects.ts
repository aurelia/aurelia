import { Metadata } from '@aurelia/metadata';
import { DI, Protocol } from '@aurelia/kernel';

/**
 * A shortcut to Object.prototype.hasOwnProperty
 * Needs to do explicit .call
 *
 * @internal
 */
export const hasOwnProp = Object.prototype.hasOwnProperty;

/** @internal */
export const def = Reflect.defineProperty;

/** @internal */
export const createError = (message: string) => new Error(message);

/** @internal */
// eslint-disable-next-line @typescript-eslint/ban-types
export const isFunction = <K extends Function>(v: unknown): v is K => typeof v === 'function';

/** @internal */
export const isString = (v: unknown): v is string => typeof v === 'string';

/** @internal */
export const isArray = <T>(v: unknown): v is T[] => v instanceof Array;

/** @internal */
export const isSet = <T>(v: unknown): v is Set<T> => v instanceof Set;

/** @internal */
export const isMap = <T, K>(v: unknown): v is Map<T, K> => v instanceof Map;

/** @internal */
export const areEqual = Object.is;

/** @internal */
export function defineHiddenProp<T>(obj: object, key: PropertyKey, value: T): T {
  def(obj, key, {
    enumerable: false,
    configurable: true,
    writable: true,
    value
  });
  return value;
}

/** @internal */
export function ensureProto<T extends object, K extends keyof T>(
  proto: T,
  key: K,
  defaultValue: unknown
): void {
  if (!(key in proto)) {
    defineHiddenProp(proto, key, defaultValue);
  }
}

// this is used inside template literal, since TS errs without String(...value)
/** @internal */ export const safeString = String;
/** @internal */ export const createInterface = DI.createInterface;

/** @internal */ export const createLookup = <T>(): Record<string, T> => Object.create(null) as Record<string, T>;

/** @internal */ export const getOwnMetadata = Metadata.getOwn;
/** @internal */ export const hasOwnMetadata = Metadata.hasOwn;
/** @internal */ export const defineMetadata = Metadata.define;
/** @internal */ export const getAnnotationKeyFor = Protocol.annotation.keyFor;
/** @internal */ export const getResourceKeyFor = Protocol.resource.keyFor;
/** @internal */ export const appendResourceKey = Protocol.resource.appendTo;
