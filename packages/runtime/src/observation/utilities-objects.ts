export const defineProp = Reflect.defineProperty;

export function defineHiddenProp(o: object, key: PropertyKey, value: unknown): boolean {
  return defineProp(o, key, {
    enumerable: false,
    writable: true,
    configurable: true,
    value
  });
}

export function defineHiddenReadonlyProp(obj: object, key: PropertyKey, value: unknown): boolean {
  return defineProp(obj, key, {
    enumerable: false,
    writable: false,
    configurable: true,
    value
  });
}

export function isArray(obj: unknown): obj is [] {
  return obj instanceof Array;
}

export function isCollection(obj: unknown): obj is Map<unknown, unknown> | Set<unknown> {
  return isMap(obj) || isSet(obj);
}

export function isMap<TK = unknown, TV = unknown>(obj: unknown): obj is Map<TK, TV> {
  return obj instanceof Map;
}

export function isSet<TV = unknown>(obj: unknown): obj is Set<TV> {
  return obj instanceof Set;
}

export function isSymbol(v: unknown): v is Symbol {
  return typeof v === 'symbol';
}

export function isObject(obj: unknown): obj is object {
  return obj instanceof Object;
}

export function isPlainObject(value: unknown) {
  if (!isObject(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  if (proto == null) {
    return true;
  }
  return proto.constructor?.toString() === plainObjectString
}

const plainObjectString = Object.toString();
