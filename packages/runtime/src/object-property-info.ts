import { isSymbol } from '@aurelia/kernel';

/** @internal */
export type ComputedPropertyInfo = {
  flush?: 'sync' | 'async';
  deps?: (string | symbol)[];
  deep?: boolean;
};

/** @internal */
export const computedPropInfo = (() => {
  const map = new WeakMap<object, Map<string | symbol, ComputedPropertyInfo>>();
  const normalizeKey = (key: PropertyKey): string | symbol => {
    return isSymbol(key) ? key : String(key);
  };
  return {
    get: (obj: object, key: PropertyKey) => map.get(obj)?.get(normalizeKey(key)),
    set: (obj: object, key: PropertyKey, value: ComputedPropertyInfo) => {
      if (!map.has(obj)) {
        map.set(obj, new Map());
      }
      map.get(obj)!.set(normalizeKey(key), value);
    }
  };
})();
