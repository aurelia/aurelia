import { IIndexable, isArrayIndex } from '@aurelia/kernel';
import { collecting, currentSub as currentSub, IWatcher } from './subscriber-switcher';
import { CollectionObserver, ICollectionObserver, CollectionKind } from '../observation';
import { LifecycleFlags } from '../flags';
import { isMap, isSet, isObject, isArray } from './utilities-objects';

const R$get = Reflect.get;
const proxyMap = new WeakMap<object, object>();

export const rawKey = '__raw__';

export function getProxyOrSelf<T extends unknown>(v: T): T {
  return isObject(v) ? getProxy(v) : v;
}
export function getProxy<T extends object>(obj: T): T {
  return proxyMap.get(obj) as T ?? createProxy(obj);
}

export function getRaw<T extends object>(obj: T): T {
  // todo: get in a weakmap if null/undef
  return (obj as IIndexable)[rawKey] as T ?? obj;
}

export function doNotCollect(obj: object, key: PropertyKey): boolean {
  return key === 'constructor'
    || key === '__proto__';
}

function createProxy<T extends object>(obj: T): T {
  const handler: ProxyHandler<object> = isArray(obj)
    ? arrayHandler
    : isMap(obj) || isSet(obj)
      ? collectionHandler
      : objectHandler;

  const proxiedObj = new Proxy(obj, handler);
  proxyMap.set(obj, proxiedObj);

  return proxiedObj as T;
}

export const objectHandler: ProxyHandler<object> = {
  get(target: IIndexable, key: PropertyKey, receiver: object): unknown {
    // maybe use symbol?
    if (key === rawKey && getProxy(receiver) === target) {
      return target;
    }

    const connectable = currentSub();

    if (!collecting || doNotCollect(target, key) || connectable == null) {
      // maybe just use symbol
      return R$get(target, key, receiver);
    }

    // todo: static
    connectable.observeProperty(LifecycleFlags.none, target, key as string);

    return getProxyOrSelf(R$get(target, key, receiver));
  },
}

export const arrayHandler: ProxyHandler<unknown[]> = {
  get(target: unknown[], key: PropertyKey, receiver?): unknown {
    // maybe use symbol?
    if (key === rawKey) {
      return target;
    }

    const connectable = currentSub();

    if (!collecting || doNotCollect(target, key) || connectable == null) {
      return R$get(target, key, receiver);
    }

    if (key === 'length') {
      getArrayObserver(target, connectable)
        .getLengthObserver()
        .subscribe(connectable);
      return target.length;
    } else if (key in Array.prototype) {
      // assume that all method in the prototype requires subscription to the array itself
      subscribeToArray(target, connectable);
    } else if (isArrayIndex(key)) {
      getArrayObserver(target, connectable)
        .getIndexObserver(key as number)
        .subscribe(connectable);
    }

    return getProxyOrSelf(R$get(target, key, receiver));
  },
}

export const collectionHandler: ProxyHandler<$MapOrSet> = {
  get(target: $MapOrSet, key: PropertyKey, receiver?): unknown {
    // maybe use symbol?
    if (key === rawKey) {
      return target;
    }

    const connectable = currentSub();

    if (!collecting || doNotCollect(target, key) || connectable == null) {
      return R$get(target, key, receiver);;
    }

    switch (key) {
      case 'size':
        subscribeCollectionSize(target, connectable);
        return R$get(target, key, receiver);
      case 'clear':
        return wrappedClear;
      case 'forEach':
        return wrappedForEach;
      case 'add':
        if (isSet(target)) {
          return wrappedAdd;
        }
        break;
      case 'set':
        if (isMap(target)) {
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
      case Symbol.iterator:
        return wrappedEntries;
    }

    return getProxyOrSelf(R$get(target, key, receiver));
  },
}

type $MapOrSet = Map<unknown, unknown> | Set<unknown>;
type CollectionMethod = (this: unknown, ...args: unknown[]) => unknown;

// todo: static
function getArrayObserver(arr: unknown[], connectable: IWatcher): ICollectionObserver<CollectionKind.array> {
  return connectable.observerLocator.getArrayObserver(LifecycleFlags.none, arr);
}
function subscribeToArray(arr: unknown[], connectable: IWatcher): void {
  return getArrayObserver(arr, connectable).subscribeToCollection(connectable);
}
// todo: static
function getCollectionObserver(collection: $MapOrSet, connectable: IWatcher): CollectionObserver {
  if (collection instanceof Set) {
    return connectable.observerLocator.getSetObserver(LifecycleFlags.none, collection);
  } else {
    return connectable.observerLocator.getMapObserver(LifecycleFlags.none, collection);
  }
}
// todo: static
function subscribeCollection(collection: $MapOrSet, connectable: IWatcher): void {
  getCollectionObserver(collection, connectable).subscribeToCollection(connectable);
}
// todo: static
function subscribeCollectionSize(collection: $MapOrSet, connectable: IWatcher): void {
  getCollectionObserver(collection, connectable).getLengthObserver().subscribe(connectable);
}

function wrappedForEach(this: $MapOrSet, cb: CollectionMethod, thisArg?: unknown): void {
  const raw = getRaw(this);
  const connectable = currentSub();
  if (connectable != null) {
    subscribeCollection(raw, connectable);
  }
  return raw.forEach((v: unknown, key: unknown) => {
    cb.call(/* should wrap or not?? */thisArg, getProxyOrSelf(v), getProxyOrSelf(key), this);
  });
}

function wrappedHas(this: $MapOrSet, v: unknown): boolean {
  const raw = getRaw(this);
  const connectable = currentSub();
  if (connectable != null) {
    subscribeCollection(raw, connectable);
  }
  return raw.has(v);
}

function wrappedSet(this: Map<unknown, unknown>, k: unknown, v: unknown): Map<unknown, unknown> {
  const raw = getRaw(this);
  const connectable = currentSub();
  if (connectable != null) {
    subscribeCollection(raw, connectable);
  }
  return raw.set(k, v);
}

function wrappedAdd(this: Set<unknown>, v: unknown): Set<unknown> {
  const raw = getRaw(this);
  const connectable = currentSub();
  if (connectable != null) {
    subscribeCollection(raw, connectable);
  }
  return getProxyOrSelf(raw.add(v));
}

function wrappedClear(this: $MapOrSet): void {
  return getProxyOrSelf(getRaw(this).clear());
}

function wrappedKeys(this: $MapOrSet): IterableIterator<unknown> {
  const raw = getRaw(this);
  const connectable = currentSub();
  if (connectable != null) {
    subscribeCollection(raw, connectable);
  }
  const iterator = raw.keys();

  return {
    next(): IteratorResult<unknown, unknown> {
      const next = iterator.next();
      const value = next.value;
      const done = next.done;

      return done
        ? { value: void 0, done }
        : { value: getProxyOrSelf(value), done };
    },
    [Symbol.iterator]() {
      return this;
    },
  };
}

function wrappedValues(this: $MapOrSet): IterableIterator<unknown> {
  const raw = getRaw(this);
  const connectable = currentSub();
  if (connectable != null) {
    subscribeCollection(raw, connectable);
  }
  const iterator = raw.values();

  return {
    next(): IteratorResult<unknown, unknown> {
      const next = iterator.next();
      const value = next.value;
      const done = next.done;

      return done
        ? { value: void 0, done }
        : { value: getProxyOrSelf(value), done };
    },
    [Symbol.iterator]() {
      return this;
    },
  };
}

function wrappedEntries(this: $MapOrSet): IterableIterator<unknown> {
  const raw = getRaw(this);
  const connectable = currentSub();
  if (connectable != null) {
    subscribeCollection(raw, connectable);
  }
  const iterator = raw.entries();

  // return a wrapped iterator which returns observed versions of the
  // values emitted from the real iterator
  return {
    next(): IteratorResult<unknown, unknown> {
      const next = iterator.next();
      const value = next.value;
      const done = next.done;
      if (done) {
        return { value, done };
      }

      return done
        ? { value: void 0, done }
        : { value: [getProxyOrSelf(value[0]), getProxyOrSelf(value[1])], done };
    },
    [Symbol.iterator]() {
      return this;
    },
  };
}
