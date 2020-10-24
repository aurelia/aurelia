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

export function isPlainObject(value: unknown) {
  if (!isObject(value)) {
    return false;
  }
  const proto = Object.getPrototypeOf(value);
  if (proto == null) {
    return true;
  }
  return proto.constructor?.toString() === plainObjectString;
}

const plainObjectString = Object.toString();
