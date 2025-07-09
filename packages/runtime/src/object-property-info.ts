import { isSymbol } from '@aurelia/kernel';

/** @internal */
export const computedPropInfo = (() => {
  const map = new WeakMap<object, Map<string | symbol, { flush: 'sync' | 'async' }>>();
  const normalizeKey = (key: PropertyKey): string | symbol => {
    return isSymbol(key) ? key : String(key);
  };
  return {
    get: (obj: object, key: PropertyKey) => map.get(obj)?.get(normalizeKey(key)),
    _getFlush: (obj: object, key: PropertyKey): 'sync' | 'async' | undefined => {
      return map.get(obj)?.get(normalizeKey(key))?.flush;
    },
    set: (obj: object, key: PropertyKey, value: { flush: 'sync' | 'async' }) => {
      if (!map.has(obj)) {
        map.set(obj, new Map());
      }
      map.get(obj)!.set(normalizeKey(key), value);
    }
  };
})();
