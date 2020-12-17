
export const def = Reflect.defineProperty;
export function defineHiddenProp(obj: object, key: PropertyKey, value: unknown): void {
  Reflect.defineProperty(obj, key, {
    enumerable: false,
    configurable: true,
    writable: true,
    value
  });
}

export function ensureProto<T extends object, K extends keyof T>(
  proto: T,
  key: K,
  defaultValue: unknown,
  force: boolean = false
): void {
  if (force || !Object.prototype.hasOwnProperty.call(proto, key)) {
    defineHiddenProp(proto, key, defaultValue);
  }
}
