import { watching, currentWatcher } from './watcher-switcher';
const R$get = Reflect.get;
const proxyMap = new WeakMap();
export const rawKey = '__raw__';
export function getProxyOrSelf(v) {
    return v instanceof Object ? getProxy(v) : v;
}
export function getProxy(obj) {
    var _a;
    // deepscan-disable-next-line
    return (_a = proxyMap.get(obj)) !== null && _a !== void 0 ? _a : createProxy(obj);
}
export function getRaw(obj) {
    var _a;
    // todo: get in a weakmap if null/undef
    return (_a = obj[rawKey]) !== null && _a !== void 0 ? _a : obj;
}
export function getRawOrSelf(v) {
    return v instanceof Object ? v[rawKey] : v;
}
function doNotCollect(key) {
    return key === 'constructor'
        || key === '__proto__'
        // probably should revert to v1 naming style for consistency with builtin?
        // __o__ is shorters & less chance of conflict with other libs as well
        || key === 'observers'
        || key === Symbol.toPrimitive
        || key === Symbol.toStringTag;
}
function createProxy(obj) {
    const handler = obj instanceof Array
        ? arrayHandler
        : obj instanceof Map || obj instanceof Set
            ? collectionHandler
            : objectHandler;
    const proxiedObj = new Proxy(obj, handler);
    proxyMap.set(obj, proxiedObj);
    return proxiedObj;
}
const objectHandler = {
    get(target, key, receiver) {
        // maybe use symbol?
        if (key === rawKey) {
            return target;
        }
        const connectable = currentWatcher();
        if (!watching || doNotCollect(key) || connectable == null) {
            return R$get(target, key, receiver);
        }
        // todo: static
        connectable.observe(target, key);
        return getProxyOrSelf(R$get(target, key, receiver));
    },
};
const arrayHandler = {
    get(target, key, receiver) {
        // maybe use symbol?
        if (key === rawKey) {
            return target;
        }
        const connectable = currentWatcher();
        if (!watching || doNotCollect(key) || connectable == null) {
            return R$get(target, key, receiver);
        }
        switch (key) {
            case 'length':
                connectable.observeLength(target);
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
            case 'keys':
                return wrappedKeys;
            case 'values':
            case Symbol.iterator:
                return wrappedValues;
            case 'entries':
                return wrappedEntries;
        }
        connectable.observe(target, key);
        return getProxyOrSelf(R$get(target, key, receiver));
    },
    // for (let i in array) ...
    ownKeys(target) {
        var _a;
        (_a = currentWatcher()) === null || _a === void 0 ? void 0 : _a.observeLength(target);
        return Reflect.ownKeys(target);
    },
};
function wrappedArrayMap(cb, thisArg) {
    var _a;
    const raw = getRaw(this);
    const res = raw.map((v, i) => 
    // do we wrap `thisArg`?
    getRawOrSelf(cb.call(thisArg, getProxyOrSelf(v), i, this)));
    (_a = currentWatcher()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return getProxyOrSelf(res);
}
function wrappedArrayEvery(cb, thisArg) {
    var _a;
    const raw = getRaw(this);
    const res = raw.every((v, i) => cb.call(thisArg, getProxyOrSelf(v), i, this));
    (_a = currentWatcher()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return res;
}
function wrappedArrayFilter(cb, thisArg) {
    var _a;
    const raw = getRaw(this);
    const res = raw.filter((v, i) => 
    // do we wrap `thisArg`?
    getRawOrSelf(cb.call(thisArg, getProxyOrSelf(v), i, this)));
    (_a = currentWatcher()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return getProxyOrSelf(res);
}
function wrappedArrayIncludes(v) {
    var _a;
    const raw = getRaw(this);
    const res = raw.includes(getRawOrSelf(v));
    (_a = currentWatcher()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return res;
}
function wrappedArrayIndexOf(v) {
    var _a;
    const raw = getRaw(this);
    const res = raw.indexOf(getRawOrSelf(v));
    (_a = currentWatcher()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return res;
}
function wrappedArrayLastIndexOf(v) {
    var _a;
    const raw = getRaw(this);
    const res = raw.lastIndexOf(getRawOrSelf(v));
    (_a = currentWatcher()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return res;
}
function wrappedArrayFindIndex(cb, thisArg) {
    var _a;
    const raw = getRaw(this);
    const res = raw.findIndex((v, i) => getRawOrSelf(cb.call(thisArg, getProxyOrSelf(v), i, this)));
    (_a = currentWatcher()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return res;
}
function wrappedArrayFlat() {
    var _a;
    const raw = getRaw(this);
    (_a = currentWatcher()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return getProxyOrSelf(raw.flat());
}
function wrappedArrayFlatMap(cb, thisArg) {
    var _a;
    const raw = getRaw(this);
    (_a = currentWatcher()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return getProxy(raw.flatMap((v, i) => getProxyOrSelf(cb.call(thisArg, getProxyOrSelf(v), i, this))));
}
function wrappedArrayJoin(separator) {
    var _a;
    const raw = getRaw(this);
    (_a = currentWatcher()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return raw.join(separator);
}
function wrappedArrayPop() {
    return getProxyOrSelf(getRaw(this).pop());
}
function wrappedArrayPush(...args) {
    return getRaw(this).push(...args);
}
function wrappedArrayShift() {
    return getProxyOrSelf(getRaw(this).shift());
}
function wrappedArrayUnshift(...args) {
    return getRaw(this).unshift(...args);
}
function wrappedArraySplice(...args) {
    return getProxyOrSelf(getRaw(this).splice(...args));
}
function wrappedArrayReverse(...args) {
    var _a;
    const raw = getRaw(this);
    const res = raw.reverse();
    (_a = currentWatcher()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return getProxyOrSelf(res);
}
function wrappedArraySome(cb, thisArg) {
    var _a;
    const raw = getRaw(this);
    const res = raw.some((v, i) => getRawOrSelf(cb.call(thisArg, getProxyOrSelf(v), i, this)));
    (_a = currentWatcher()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return res;
}
function wrappedArraySlice(start, end) {
    var _a;
    const raw = getRaw(this);
    (_a = currentWatcher()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return getProxy(raw.slice(start, end));
}
function wrappedReduce(cb, initValue) {
    var _a;
    const raw = getRaw(this);
    const res = raw.reduce((curr, v, i) => cb(curr, getProxyOrSelf(v), i, this), initValue);
    (_a = currentWatcher()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return getProxyOrSelf(res);
}
function wrappedReduceRight(cb, initValue) {
    var _a;
    const raw = getRaw(this);
    const res = raw.reduceRight((curr, v, i) => cb(curr, getProxyOrSelf(v), i, this), initValue);
    (_a = currentWatcher()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return getProxyOrSelf(res);
}
// the below logic takes inspiration from Vue, Mobx
// much thanks to them for working out this
const collectionHandler = {
    get(target, key, receiver) {
        // maybe use symbol?
        if (key === rawKey) {
            return target;
        }
        const connectable = currentWatcher();
        if (!watching || doNotCollect(key) || connectable == null) {
            return R$get(target, key, receiver);
        }
        switch (key) {
            case 'size':
                connectable.observeLength(target);
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
        return getProxyOrSelf(R$get(target, key, receiver));
    },
};
function wrappedForEach(cb, thisArg) {
    var _a;
    const raw = getRaw(this);
    (_a = currentWatcher()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return raw.forEach((v, key) => {
        cb.call(/* should wrap or not?? */ thisArg, getProxyOrSelf(v), getProxyOrSelf(key), this);
    });
}
function wrappedHas(v) {
    var _a;
    const raw = getRaw(this);
    (_a = currentWatcher()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return raw.has(getRawOrSelf(v));
}
function wrappedGet(k) {
    var _a;
    const raw = getRaw(this);
    (_a = currentWatcher()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    return getProxyOrSelf(raw.get(getRawOrSelf(k)));
}
function wrappedSet(k, v) {
    return getProxyOrSelf(getRaw(this).set(getRawOrSelf(k), getRawOrSelf(v)));
}
function wrappedAdd(v) {
    return getProxyOrSelf(getRaw(this).add(getRawOrSelf(v)));
}
function wrappedClear() {
    return getProxyOrSelf(getRaw(this).clear());
}
function wrappedDelete(k) {
    return getProxyOrSelf(getRaw(this).delete(getRawOrSelf(k)));
}
function wrappedKeys() {
    var _a;
    const raw = getRaw(this);
    (_a = currentWatcher()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    const iterator = raw.keys();
    return {
        next() {
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
function wrappedValues() {
    var _a;
    const raw = getRaw(this);
    (_a = currentWatcher()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    const iterator = raw.values();
    return {
        next() {
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
function wrappedEntries() {
    var _a;
    const raw = getRaw(this);
    (_a = currentWatcher()) === null || _a === void 0 ? void 0 : _a.observeCollection(raw);
    const iterator = raw.entries();
    // return a wrapped iterator which returns observed versions of the
    // values emitted from the real iterator
    return {
        next() {
            const next = iterator.next();
            const value = next.value;
            const done = next.done;
            return done
                ? { value: void 0, done }
                : { value: [getProxyOrSelf(value[0]), getProxyOrSelf(value[1])], done };
        },
        [Symbol.iterator]() {
            return this;
        },
    };
}
export const ProxyObservable = Object.freeze({
    getProxy,
    getRaw,
});
//# sourceMappingURL=proxy-observation.js.map