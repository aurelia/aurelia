export function defineHiddenProp(obj: object, key: PropertyKey, value: unknown): void {
  Reflect.defineProperty(obj, key, {
    enumerable: false,
    configurable: true,
    writable: true,
    value
  });
}

export function ensureProto<T extends object, K extends keyof T>(proto: T, key: K, defaultValue: unknown): void {
  if (!Object.prototype.hasOwnProperty.call(proto, key)) {
    defineHiddenProp(proto, key, defaultValue);
  }
}

export function isArray(obj: unknown): obj is unknown[] {
  return obj instanceof Array;
}

export function isMap<TK = unknown, TV = unknown>(obj: unknown): obj is Map<TK, TV> {
  return obj instanceof Map;
}

export function isSet<TV = unknown>(obj: unknown): obj is Set<TV> {
  return obj instanceof Set;
}

export function isSymbol(v: unknown): v is symbol {
  return typeof v === 'symbol';
}

export function isObject(obj: unknown): obj is object {
  return obj instanceof Object;
}
