import { IIndexable } from '@aurelia/kernel';
import { connecting, currentConnectable } from './connectable-switcher';

const R$get = Reflect.get;
const toStringTag = Object.prototype.toString;
const proxyMap = new WeakMap<object, object>();

function canWrap(obj: unknown): obj is object {
  switch (toStringTag.call(obj)) {
    case '[object Object]':
    case '[object Array]':
    case '[object Map]':
    case '[object Set]':
    // it's unlikely that methods on the following 2 objects need to be observed for changes
    // so while they are valid/ we don't wrap them either
    // case '[object Math]':
    // case '[object Reflect]':
      return true;
    default:
      return false;
  }
}

export const rawKey = '__raw__';

export function wrap<T extends unknown>(v: T): T {
  return canWrap(v) ? getProxy(v) : v;
}
export function getProxy<T extends object>(obj: T): T {
  // deepscan-disable-next-line
  return proxyMap.get(obj) as T ?? createProxy(obj);
}

export function getRaw<T extends object>(obj: T): T {
  // todo: get in a weakmap if null/undef
  return (obj as IIndexable)[rawKey] as T ?? obj;
}
export function unwrap<T extends unknown>(v: T): T {
  return canWrap(v) && (v as IIndexable)[rawKey] as T || v;
}

function doNotCollect(key: PropertyKey): boolean {
  return key === 'constructor'
    || key === '__proto__'
    // probably should revert to v1 naming style for consistency with builtin?
    // __o__ is shorters & less chance of conflict with other libs as well
    || key === '$observers'
    || key === Symbol.toPrimitive
    || key === Symbol.toStringTag;
}

function createProxy<T extends object>(obj: T): T {
  const handler: ProxyHandler<object> = obj instanceof Array
    ? arrayHandler
    : obj instanceof Map || obj instanceof Set
      ? collectionHandler
      : objectHandler;

  const proxiedObj = new Proxy(obj, handler);
  proxyMap.set(obj, proxiedObj);

  return proxiedObj as T;
}

const objectHandler: ProxyHandler<object> = {
  get(target: IIndexable, key: PropertyKey, receiver: object): unknown {
    // maybe use symbol?
    if (key === rawKey) {
      return target;
    }

    const connectable = currentConnectable();

    if (!connecting || doNotCollect(key) || connectable == null) {
      return R$get(target, key, receiver);
    }

    // todo: static
    connectable.observe(target, key);

    return wrap(R$get(target, key, receiver));
  },
};

const arrayHandler: ProxyHandler<unknown[]> = {
  get(target: unknown[], key: PropertyKey, receiver: unknown): unknown {
    // maybe use symbol?
    if (key === rawKey) {
      return target;
    }

    const connectable = currentConnectable();

    if (!connecting || doNotCollect(key) || connectable == null) {
      return R$get(target, key, receiver);
    }

    switch (key) {
      case 'length':
        connectable.observe(target, 'length');
        return target.length;
      case 'map':
        return wrappedArrayMap;
      case 'includes':
        return wrappedArrayIncludes;
      case 'indexOf':
        return wrappedArrayIndexOf;
      case 'lastIndexOf':
        return wrappedArrayLastIndexOf;
      case 'every':
        return wrappedArrayEvery;
      case 'filter':
        return wrappedArrayFilter;
      case 'find':
        return wrappedArrayFind;
      case 'findIndex':
        return wrappedArrayFindIndex;
      case 'flat':
        return wrappedArrayFlat;
      case 'flatMap':
        return wrappedArrayFlatMap;
      case 'join':
        return wrappedArrayJoin;
      case 'push':
        return wrappedArrayPush;
      case 'pop':
        return wrappedArrayPop;
      case 'reduce':
        return wrappedReduce;
      case 'reduceRight':
        return wrappedReduceRight;
      case 'reverse':
        return wrappedArrayReverse;
      case 'shift':
        return wrappedArrayShift;
      case 'unshift':
        return wrappedArrayUnshift;
      case 'slice':
        return wrappedArraySlice;
      case 'splice':
        return wrappedArraySplice;
      case 'some':
        return wrappedArraySome;
      case 'sort':
        return wrappedArraySort;
      case 'keys':
        return wrappedKeys;
      case 'values':
      case Symbol.iterator:
        return wrappedValues;
      case 'entries':
        return wrappedEntries;
    }

    connectable.observe(target, key);

    return wrap(R$get(target, key, receiver));
  },
  // for (let i in array) ...
  ownKeys(target: unknown[]): (string | symbol)[] {
    currentConnectable()?.observe(target, 'length');
    return Reflect.ownKeys(target) as (string | symbol)[];
  },
};

function wrappedArrayMap(this: unknown[], cb: (v: unknown, i: number, arr: unknown[]) => unknown, thisArg?: unknown): unknown {
  const raw = getRaw(this);
  const res = raw.map((v, i) =>
    // do we wrap `thisArg`?
    unwrap(cb.call(thisArg, wrap(v), i, this))
  );
  currentConnectable()?.observeCollection(raw);
  return wrap(res);
}

function wrappedArrayEvery(this: unknown[], cb: (v: unknown, i: number, arr: unknown[]) => unknown, thisArg?: unknown): boolean {
  const raw = getRaw(this);
  const res = raw.every((v, i) => cb.call(thisArg, wrap(v), i, this));
  currentConnectable()?.observeCollection(raw);
  return res;
}

function wrappedArrayFilter(this: unknown[], cb: (v: unknown, i: number, arr: unknown[]) => boolean, thisArg?: unknown): unknown[] {
  const raw = getRaw(this);
  const res = raw.filter((v, i) =>
    // do we wrap `thisArg`?
    unwrap(cb.call(thisArg, wrap(v), i, this))
  );
  currentConnectable()?.observeCollection(raw);
  return wrap(res);
}

function wrappedArrayIncludes(this: unknown[], v: unknown): boolean {
  const raw = getRaw(this);
  const res = raw.includes(unwrap(v));
  currentConnectable()?.observeCollection(raw);
  return res;
}

function wrappedArrayIndexOf(this: unknown[], v: unknown): number {
  const raw = getRaw(this);
  const res = raw.indexOf(unwrap(v));
  currentConnectable()?.observeCollection(raw);
  return res;
}
function wrappedArrayLastIndexOf(this: unknown[], v: unknown): number {
  const raw = getRaw(this);
  const res = raw.lastIndexOf(unwrap(v));
  currentConnectable()?.observeCollection(raw);
  return res;
}
function wrappedArrayFindIndex(this: unknown[], cb: (v: unknown, i: number, arr: unknown[]) => boolean, thisArg?: unknown): number {
  const raw = getRaw(this);
  const res = raw.findIndex((v, i) => unwrap(cb.call(thisArg, wrap(v), i, this)));
  currentConnectable()?.observeCollection(raw);
  return res;
}

function wrappedArrayFind(this: unknown[], cb: (v: unknown, i: number, arr: unknown[]) => boolean, thisArg?: unknown): unknown {
  const raw = getRaw(this);
  const res = raw.find((v, i) => cb(wrap(v), i, this), thisArg);
  currentConnectable()?.observeCollection(raw);
  return wrap(res);
}

function wrappedArrayFlat(this: unknown[]): unknown[] {
  const raw = getRaw(this);
  currentConnectable()?.observeCollection(raw);
  return wrap(raw.flat());
}
function wrappedArrayFlatMap(this: unknown[], cb: (v: unknown, i: number, arr: unknown[]) => unknown, thisArg?: unknown): unknown[] {
  const raw = getRaw(this);
  currentConnectable()?.observeCollection(raw);
  return getProxy(raw.flatMap((v, i) =>
    wrap(cb.call(thisArg, wrap(v), i, this)))
  );
}
function wrappedArrayJoin(this: unknown[], separator?: string): string {
  const raw = getRaw(this);
  currentConnectable()?.observeCollection(raw);
  return raw.join(separator);
}

function wrappedArrayPop(this: unknown[]): unknown {
  return wrap(getRaw(this).pop());
}
function wrappedArrayPush(this: unknown[], ...args: unknown[]): number {
  return getRaw(this).push(...args);
}
function wrappedArrayShift(this: unknown[]): unknown {
  return wrap(getRaw(this).shift());
}
function wrappedArrayUnshift(this: unknown[], ...args: unknown[]): unknown {
  return getRaw(this).unshift(...args);
}
function wrappedArraySplice(this: unknown[], ...args: [number, number, ...unknown[]]): unknown {
  return wrap(getRaw(this).splice(...args));
}
function wrappedArrayReverse(this: unknown[], ...args: unknown[]): unknown[] {
  const raw = getRaw(this);
  const res = raw.reverse();
  currentConnectable()?.observeCollection(raw);
  return wrap(res);
}

function wrappedArraySome(this: unknown[], cb: (v: unknown, i: number, arr: unknown[]) => boolean, thisArg?: unknown): boolean {
  const raw = getRaw(this);
  const res = raw.some((v, i) => unwrap(cb.call(thisArg, wrap(v), i, this)));
  currentConnectable()?.observeCollection(raw);
  return res;
}

function wrappedArraySort(this: unknown[], cb?: (a: unknown, b: unknown) => number): unknown[] {
  const raw = getRaw(this);
  const res = raw.sort(cb);
  currentConnectable()?.observeCollection(raw);
  return wrap(res);
}

function wrappedArraySlice(this: unknown[], start?: number, end?: number): unknown[] {
  const raw = getRaw(this);
  currentConnectable()?.observeCollection(raw);
  return getProxy(raw.slice(start, end));
}

function wrappedReduce(this: unknown[], cb: (curr: unknown, v: unknown, i: number, arr: unknown[]) => unknown, initValue: unknown): unknown {
  const raw = getRaw(this);
  const res = raw.reduce((curr, v, i) => cb(curr, wrap(v), i, this), initValue);
  currentConnectable()?.observeCollection(raw);
  return wrap(res);
}

function wrappedReduceRight(this: unknown[], cb: (curr: unknown, v: unknown, i: number, arr: unknown[]) => unknown, initValue: unknown): unknown {
  const raw = getRaw(this);
  const res = raw.reduceRight((curr, v, i) => cb(curr, wrap(v), i, this), initValue);
  currentConnectable()?.observeCollection(raw);
  return wrap(res);
}

// the below logic takes inspiration from Vue, Mobx
// much thanks to them for working out this
const collectionHandler: ProxyHandler<$MapOrSet> = {
  get(target: $MapOrSet, key: PropertyKey, receiver?): unknown {
    // maybe use symbol?
    if (key === rawKey) {
      return target;
    }

    const connectable = currentConnectable();

    if (!connecting || doNotCollect(key) || connectable == null) {
      return R$get(target, key, receiver);
    }

    switch (key) {
      case 'size':
        connectable.observe(target, 'size');
        return target.size;
      case 'clear':
        return wrappedClear;
      case 'delete':
        return wrappedDelete;
      case 'forEach':
        return wrappedForEach;
      case 'add':
        if (target instanceof Set) {
          return wrappedAdd;
        }
        break;
      case 'get':
        if (target instanceof Map) {
          return wrappedGet;
        }
        break;
      case 'set':
        if (target instanceof Map) {
          return wrappedSet;
        }
        break;
      case 'has':
        return wrappedHas;
      case 'keys':
        return wrappedKeys;
      case 'values':
        return wrappedValues;
      case 'entries':
        return wrappedEntries;
      case Symbol.iterator:
        return target instanceof Map ? wrappedEntries : wrappedValues;
    }

    return wrap(R$get(target, key, receiver));
  },
};

type $MapOrSet = Map<unknown, unknown> | Set<unknown>;
type CollectionMethod = (this: unknown, ...args: unknown[]) => unknown;

function wrappedForEach(this: $MapOrSet, cb: CollectionMethod, thisArg?: unknown): void {
  const raw = getRaw(this);
  currentConnectable()?.observeCollection(raw);
  return raw.forEach((v: unknown, key: unknown) => {
    cb.call(/* should wrap or not?? */thisArg, wrap(v), wrap(key), this);
  });
}

function wrappedHas(this: $MapOrSet, v: unknown): boolean {
  const raw = getRaw(this);
  currentConnectable()?.observeCollection(raw);
  return raw.has(unwrap(v));
}

function wrappedGet(this: Map<unknown, unknown>, k: unknown): unknown {
  const raw = getRaw(this);
  currentConnectable()?.observeCollection(raw);
  return wrap(raw.get(unwrap(k)));
}
function wrappedSet(this: Map<unknown, unknown>, k: unknown, v: unknown): Map<unknown, unknown> {
  return wrap(getRaw(this).set(unwrap(k), unwrap(v)));
}

function wrappedAdd(this: Set<unknown>, v: unknown): Set<unknown> {
  return wrap(getRaw(this).add(unwrap(v)));
}

function wrappedClear(this: $MapOrSet): void {
  return wrap(getRaw(this).clear());
}

function wrappedDelete(this: $MapOrSet, k: unknown): boolean {
  return wrap(getRaw(this).delete(unwrap(k)));
}

function wrappedKeys(this: $MapOrSet | unknown[]): IterableIterator<unknown> {
  const raw = getRaw(this);
  currentConnectable()?.observeCollection(raw);
  const iterator = raw.keys();

  return {
    next(): IteratorResult<unknown, unknown> {
      const next = iterator.next();
      const value = next.value;
      const done = next.done;

      return done
        ? { value: void 0, done }
        : { value: wrap(value), done };
    },
    [Symbol.iterator]() {
      return this;
    },
  };
}

function wrappedValues(this: $MapOrSet | unknown[]): IterableIterator<unknown> {
  const raw = getRaw(this);
  currentConnectable()?.observeCollection(raw);
  const iterator = raw.values();

  return {
    next(): IteratorResult<unknown, unknown> {
      const next = iterator.next();
      const value = next.value;
      const done = next.done;

      return done
        ? { value: void 0, done }
        : { value: wrap(value), done };
    },
    [Symbol.iterator]() {
      return this;
    },
  };
}

function wrappedEntries(this: $MapOrSet | unknown[]): IterableIterator<unknown> {
  const raw = getRaw(this);
  currentConnectable()?.observeCollection(raw);
  const iterator = raw.entries();

  // return a wrapped iterator which returns observed versions of the
  // values emitted from the real iterator
  return {
    next(): IteratorResult<unknown, unknown> {
      const next = iterator.next();
      const value = next.value;
      const done = next.done;

      return done
        ? { value: void 0, done }
        : { value: [wrap(value[0]), wrap(value[1])], done };
    },
    [Symbol.iterator]() {
      return this;
    },
  };
}

export const ProxyObservable = Object.freeze({
  getProxy,
  getRaw,
  wrap,
  unwrap,
  rawKey,
});
