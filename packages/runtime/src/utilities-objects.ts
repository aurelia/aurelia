/**
 * A shortcut to Object.prototype.hasOwnProperty
 * Needs to do explicit .call
 */
export const hasOwnProp = Object.prototype.hasOwnProperty;
export const def = Reflect.defineProperty;
export function defineHiddenProp<T extends unknown>(obj: object, key: PropertyKey, value: T): T {
  def(obj, key, {
    enumerable: false,
    configurable: true,
    writable: true,
    value
  });
  return value;
}

export function ensureProto<T extends object, K extends keyof T>(
  proto: T,
  key: K,
  defaultValue: unknown,
  force: boolean = false
): void {
  if (force || !hasOwnProp.call(proto, key)) {
    defineHiddenProp(proto, key, defaultValue);
  }
}
