import { Metadata } from '@aurelia/metadata';
import { DI } from '@aurelia/kernel';

/**
 * A shortcut to Object.prototype.hasOwnProperty
 * Needs to do explicit .call
 *
 * @internal
 */
export const hasOwnProp = Object.prototype.hasOwnProperty;

/**
 * Reflect does not throw on invalid property def
 *
 * @internal
 */
export const rtDef = Reflect.defineProperty;

/** @internal */
export function rtDefineHiddenProp<T>(obj: object, key: PropertyKey, value: T): T {
  rtDef(obj, key, {
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
    rtDefineHiddenProp(proto, key, defaultValue);
  }
}

/** @internal */ export const rtObjectAssign = Object.assign;
/** @internal */ export const rtObjectFreeze = Object.freeze;
// this is used inside template literal, since TS errs without String(...value)
/** @internal */ export const rtSafeString = String;
/** @internal */ export const rtCreateInterface = DI.createInterface;

/** @internal */ export const rtGetMetadata = Metadata.get;
/** @internal */ export const rtDefineMetadata = Metadata.define;
