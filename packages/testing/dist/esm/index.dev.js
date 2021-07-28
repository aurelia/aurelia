import { noop, isArrayIndex, DI, Registration, emptyArray, kebabCase } from '@aurelia/kernel';
import { StandardConfiguration, IPlatform, ITemplateCompiler, IObserverLocator, CustomElement, BrowserPlatform, CustomAttribute, Aurelia, valueConverter, bindable, customElement, IDirtyChecker, INodeObserverLocator, Scope, OverrideContext } from '@aurelia/runtime-html';

// Significant portion of this code is copy-pasted from the node.js source
const { getPrototypeOf, getOwnPropertyDescriptor, getOwnPropertyDescriptors, getOwnPropertyNames, getOwnPropertySymbols, defineProperty, defineProperties, } = Object;
const Object_keys = Object.keys;
const Object_is = Object.is;
const Object_freeze = Object.freeze;
const Object_assign = Object.assign;
const Number_isNaN = Number.isNaN;
const Reflect_apply = Reflect.apply;
const ArrayBuffer_isView = ArrayBuffer.isView;
function uncurryThis(func) {
    return (thisArg, ...args) => Reflect_apply(func, thisArg, args);
}
const hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);
const propertyIsEnumerable = uncurryThis(Object.prototype.propertyIsEnumerable);
const TypedArrayPrototype = getPrototypeOf(Uint8Array.prototype);
const TypedArrayProto_toStringTag = uncurryThis(getOwnPropertyDescriptor(TypedArrayPrototype, Symbol.toStringTag).get);
const Object_toString = uncurryThis(Object.prototype.toString);
const RegExp_toString = uncurryThis(RegExp.prototype.toString);
const Date_toISOString = uncurryThis(Date.prototype.toISOString);
const Date_toString = uncurryThis(Date.prototype.toString);
const Error_toString = uncurryThis(Error.prototype.toString);
const Date_getTime = uncurryThis(Date.prototype.getTime);
const Set_values = uncurryThis(Set.prototype.values);
const Map_entries = uncurryThis(Map.prototype.entries);
const Boolean_valueOf = uncurryThis(Boolean.prototype.valueOf);
const Number_valueOf = uncurryThis(Number.prototype.valueOf);
const Symbol_valueOf = uncurryThis(Symbol.prototype.valueOf);
const String_valueOf = uncurryThis(String.prototype.valueOf);
function isNumber(arg) {
    return typeof arg === 'number';
}
function isString(arg) {
    return typeof arg === 'string';
}
function isSymbol(arg) {
    return typeof arg === 'symbol';
}
function isUndefined(arg) {
    return arg === void 0;
}
function isObject(arg) {
    return arg !== null && typeof arg === 'object';
}
function isFunction(arg) {
    return typeof arg === 'function';
}
function isPrimitive(arg) {
    return arg === null || typeof arg !== 'object' && typeof arg !== 'function';
}
function isArrayBuffer(arg) {
    return arg instanceof ArrayBuffer;
}
function isAnyArrayBuffer(arg) {
    return arg instanceof ArrayBuffer || arg instanceof SharedArrayBuffer;
}
function isDate(arg) {
    return arg instanceof Date;
}
function isMap(arg) {
    return arg instanceof Map;
}
function isMapIterator(arg) {
    return Object_toString(arg) === '[object Map Iterator]';
}
function isRegExp(arg) {
    return arg instanceof RegExp;
}
function isSet(arg) {
    return arg instanceof Set;
}
function isSetIterator(arg) {
    return Object_toString(arg) === '[object Set Iterator]';
}
function isError(arg) {
    return arg instanceof Error;
}
function isNumberObject(arg) {
    return arg instanceof Number;
}
function isStringObject(arg) {
    return arg instanceof String;
}
function isBooleanObject(arg) {
    return arg instanceof Boolean;
}
function isSymbolObject(arg) {
    return arg instanceof Symbol;
}
function isBoxedPrimitive(arg) {
    return (isNumberObject(arg)
        || isStringObject(arg)
        || isBooleanObject(arg)
        || isSymbolObject(arg));
}
function isTypedArray(value) {
    return TypedArrayProto_toStringTag(value) !== void 0;
}
function isUint8Array(value) {
    return TypedArrayProto_toStringTag(value) === 'Uint8Array';
}
function isUint8ClampedArray(value) {
    return TypedArrayProto_toStringTag(value) === 'Uint8ClampedArray';
}
function isUint16Array(value) {
    return TypedArrayProto_toStringTag(value) === 'Uint16Array';
}
function isUint32Array(value) {
    return TypedArrayProto_toStringTag(value) === 'Uint32Array';
}
function isInt8Array(value) {
    return TypedArrayProto_toStringTag(value) === 'Int8Array';
}
function isInt16Array(value) {
    return TypedArrayProto_toStringTag(value) === 'Int16Array';
}
function isInt32Array(value) {
    return TypedArrayProto_toStringTag(value) === 'Int32Array';
}
function isFloat32Array(value) {
    return TypedArrayProto_toStringTag(value) === 'Float32Array';
}
function isFloat64Array(value) {
    return TypedArrayProto_toStringTag(value) === 'Float64Array';
}
function isArgumentsObject(value) {
    return Object_toString(value) === '[object Arguments]';
}
function isDataView(value) {
    return Object_toString(value) === '[object DataView]';
}
function isPromise(value) {
    return Object_toString(value) === '[object Promise]';
}
function isWeakSet(value) {
    return Object_toString(value) === '[object WeakSet]';
}
function isWeakMap(value) {
    return Object_toString(value) === '[object WeakMap]';
}
function getOwnNonIndexProperties(val, showHidden) {
    if (showHidden) {
        return getOwnPropertyNames(val).filter(k => !isArrayIndex(k));
    }
    else {
        return Object_keys(val).filter(k => !isArrayIndex(k));
    }
}
function getEnumerables(val, keys) {
    return keys.filter(k => propertyIsEnumerable(val, k));
}
// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
const colors = Object_freeze({
    bold(str) {
        return `\u001b[1m${str}\u001b[22m`;
    },
    italic(str) {
        return `\u001b[3m${str}\u001b[23m`;
    },
    underline(str) {
        return `\u001b[4m${str}\u001b[24m`;
    },
    inverse(str) {
        return `\u001b[7m${str}\u001b[27m`;
    },
    white(str) {
        return `\u001b[37m${str}\u001b[39m`;
    },
    grey(str) {
        return `\u001b[90m${str}\u001b[39m`;
    },
    black(str) {
        return `\u001b[30m${str}\u001b[39m`;
    },
    blue(str) {
        return `\u001b[34m${str}\u001b[39m`;
    },
    cyan(str) {
        return `\u001b[36m${str}\u001b[39m`;
    },
    green(str) {
        return `\u001b[32m${str}\u001b[39m`;
    },
    magenta(str) {
        return `\u001b[35m${str}\u001b[39m`;
    },
    red(str) {
        return `\u001b[31m${str}\u001b[39m`;
    },
    yellow(str) {
        return `\u001b[33m${str}\u001b[39m`;
    },
});
const colorRegExp = /\u001b\[\d\d?m/g;
const strEscapeSequencesRegExp = /[\x00-\x1f\x27\x5c]/;
const strEscapeSequencesReplacer = /[\x00-\x1f\x27\x5c]/g;
const strEscapeSequencesRegExpSingle = /[\x00-\x1f\x5c]/;
const strEscapeSequencesReplacerSingle = /[\x00-\x1f\x5c]/g;
function removeColors(str) {
    return str.replace(colorRegExp, '');
}
function join(output, separator) {
    let str = '';
    if (output.length !== 0) {
        let i = 0;
        for (; i < output.length - 1; i++) {
            str += output[i];
            str += separator;
        }
        str += output[i];
    }
    return str;
}
const asciiEscape = Object_freeze([
    '\\u0000', '\\u0001', '\\u0002', '\\u0003', '\\u0004',
    '\\u0005', '\\u0006', '\\u0007', '\\b', '\\t',
    '\\n', '\\u000b', '\\f', '\\r', '\\u000e',
    '\\u000f', '\\u0010', '\\u0011', '\\u0012', '\\u0013',
    '\\u0014', '\\u0015', '\\u0016', '\\u0017', '\\u0018',
    '\\u0019', '\\u001a', '\\u001b', '\\u001c', '\\u001d',
    '\\u001e', '\\u001f', '', '', '',
    '', '', '', '', '\\\'', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '\\\\'
]);
function addQuotes(str, quotes) {
    if (quotes === -1) {
        return `"${str}"`;
    }
    if (quotes === -2) {
        return `\`${str}\``;
    }
    return `'${str}'`;
}
const escapeFn = (str) => asciiEscape[str.charCodeAt(0)];
function escapeAndQuoteString(str) {
    let escapeTest = strEscapeSequencesRegExp;
    let escapeReplace = strEscapeSequencesReplacer;
    let singleQuote = 39;
    if (str.includes('\'')) {
        if (!str.includes('"')) {
            singleQuote = -1;
        }
        else if (!str.includes('`') && !str.includes('${')) {
            singleQuote = -2;
        }
        if (singleQuote !== 39) {
            escapeTest = strEscapeSequencesRegExpSingle;
            escapeReplace = strEscapeSequencesReplacerSingle;
        }
    }
    if (str.length < 5000 && !escapeTest.test(str))
        return addQuotes(str, singleQuote);
    if (str.length > 100) {
        str = str.replace(escapeReplace, escapeFn);
        return addQuotes(str, singleQuote);
    }
    let result = '';
    let last = 0;
    let i = 0;
    for (; i < str.length; i++) {
        const point = str.charCodeAt(i);
        if (point === singleQuote || point === 92 || point < 32) {
            if (last === i) {
                result += asciiEscape[point];
            }
            else {
                result += `${str.slice(last, i)}${asciiEscape[point]}`;
            }
            last = i + 1;
        }
    }
    if (last !== i) {
        result += str.slice(last);
    }
    return addQuotes(result, singleQuote);
}
function escapeString(str) {
    return str.replace(strEscapeSequencesReplacer, escapeFn);
}
const trimFull = (function () {
    const cache = {};
    return function (input) {
        let result = cache[input];
        if (result === void 0) {
            result = '';
            const length = input.length;
            let ch = 0;
            for (let i = 0; i < length; ++i) {
                ch = input.charCodeAt(i);
                if (ch > 0x20) {
                    result += String.fromCharCode(ch);
                }
            }
            cache[input] = result;
        }
        return result;
    };
}());
function createSpy(instanceOrInnerFn, key, callThroughOrInnerFn) {
    const calls = [];
    function reset() {
        calls.length = 0;
    }
    let $spy;
    let $restore;
    if (instanceOrInnerFn === void 0) {
        $spy = function spy(...args) {
            calls.push(args);
        };
        $restore = noop;
    }
    else if (key === void 0) {
        $spy = function spy(...args) {
            calls.push(args);
            return instanceOrInnerFn(...args);
        };
        $restore = noop;
    }
    else {
        if (!(key in instanceOrInnerFn)) {
            throw new Error(`No method named '${key}' exists in object of type ${Reflect.getPrototypeOf(instanceOrInnerFn).constructor.name}`);
        }
        let descriptorOwner = instanceOrInnerFn;
        let descriptor = Reflect.getOwnPropertyDescriptor(descriptorOwner, key);
        while (descriptor === void 0) {
            descriptorOwner = Reflect.getPrototypeOf(descriptorOwner);
            descriptor = Reflect.getOwnPropertyDescriptor(descriptorOwner, key);
        }
        // Already wrapped, restore first
        if (descriptor.value !== null && (typeof descriptor.value === 'object' || typeof descriptor.value === 'function') && typeof descriptor.value.restore === 'function') {
            descriptor.value.restore();
            descriptor = Reflect.getOwnPropertyDescriptor(descriptorOwner, key);
        }
        $restore = function restore() {
            if (instanceOrInnerFn === descriptorOwner) {
                Reflect.defineProperty(instanceOrInnerFn, key, descriptor);
            }
            else {
                Reflect.deleteProperty(instanceOrInnerFn, key);
            }
        };
        if (callThroughOrInnerFn === void 0) {
            $spy = function spy(...args) {
                calls.push(args);
            };
        }
        else if (callThroughOrInnerFn === true) {
            $spy = function spy(...args) {
                calls.push(args);
                return descriptor.value.apply(instanceOrInnerFn, args);
            };
        }
        else if (typeof callThroughOrInnerFn === 'function') {
            $spy = function spy(...args) {
                calls.push(args);
                return callThroughOrInnerFn(...args);
            };
        }
        else {
            throw new Error(`Invalid spy`);
        }
        Reflect.defineProperty(instanceOrInnerFn, key, {
            ...descriptor,
            value: $spy,
        });
    }
    Reflect.defineProperty($spy, 'calls', {
        value: calls,
    });
    Reflect.defineProperty($spy, 'reset', {
        value: reset,
    });
    Reflect.defineProperty($spy, 'restore', {
        value: $restore,
    });
    return $spy;
}

// Significant portion of this code is copy-pasted from the node.js source
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */
var IterationType;
(function (IterationType) {
    IterationType[IterationType["noIterator"] = 0] = "noIterator";
    IterationType[IterationType["isArray"] = 1] = "isArray";
    IterationType[IterationType["isSet"] = 2] = "isSet";
    IterationType[IterationType["isMap"] = 3] = "isMap";
})(IterationType || (IterationType = {}));
function areSimilarRegExps(a, b) {
    return a.source === b.source && a.flags === b.flags;
}
function areSimilarFloatArrays(a, b) {
    if (a.byteLength !== b.byteLength) {
        return false;
    }
    const { byteLength } = a;
    for (let i = 0; i < byteLength; ++i) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}
function compare(a, b) {
    if (a === b) {
        return 0;
    }
    const aLen = a.length;
    const bLen = b.length;
    const len = Math.min(aLen, bLen);
    for (let i = 0; i < len; ++i) {
        if (a[i] !== b[i]) {
            const itemA = a[i];
            const itemB = b[i];
            if (itemA < itemB) {
                return -1;
            }
            if (itemB < itemA) {
                return 1;
            }
            return 0;
        }
    }
    if (aLen < bLen) {
        return -1;
    }
    if (bLen < aLen) {
        return 1;
    }
    return 0;
}
function areSimilarTypedArrays(a, b) {
    if (a.byteLength !== b.byteLength) {
        return false;
    }
    return compare(new Uint8Array(a.buffer, a.byteOffset, a.byteLength), new Uint8Array(b.buffer, b.byteOffset, b.byteLength)) === 0;
}
function areEqualArrayBuffers(buf1, buf2) {
    return (buf1.byteLength === buf2.byteLength
        && compare(new Uint8Array(buf1), new Uint8Array(buf2)) === 0);
}
function isEqualBoxedPrimitive(val1, val2) {
    if (isNumberObject(val1)) {
        return (isNumberObject(val2)
            && Object_is(Number_valueOf(val1), Number_valueOf(val2)));
    }
    if (isStringObject(val1)) {
        return (isStringObject(val2)
            && String_valueOf(val1) === String_valueOf(val2));
    }
    if (isBooleanObject(val1)) {
        return (isBooleanObject(val2)
            && Boolean_valueOf(val1) === Boolean_valueOf(val2));
    }
    return (isSymbolObject(val2)
        && Symbol_valueOf(val1) === Symbol_valueOf(val2));
}
function innerDeepEqual(val1, val2, strict, memos) {
    if (val1 === val2) {
        if (val1 !== 0) {
            return true;
        }
        return strict ? Object_is(val1, val2) : true;
    }
    if (strict) {
        if (typeof val1 !== 'object') {
            return (isNumber(val1)
                && Number_isNaN(val1)
                && Number_isNaN(val2));
        }
        if (typeof val2 !== 'object' || val1 === null || val2 === null) {
            return false;
        }
        if (getPrototypeOf(val1) !== getPrototypeOf(val2)) {
            return false;
        }
    }
    else {
        if (!isObject(val1)) {
            if (!isObject(val2)) {
                return val1 == val2;
            }
            return false;
        }
        if (!isObject(val2)) {
            return false;
        }
    }
    const val1Tag = Object_toString(val1);
    const val2Tag = Object_toString(val2);
    if (val1Tag !== val2Tag) {
        return false;
    }
    if (val1Tag === '[object URLSearchParams]') {
        return innerDeepEqual(Array.from(val1.entries()), Array.from(val2.entries()), strict, memos);
    }
    if (Array.isArray(val1)) {
        if (val1.length !== val2.length) {
            return false;
        }
        const keys1 = getOwnNonIndexProperties(val1, false);
        const keys2 = getOwnNonIndexProperties(val2, false);
        if (keys1.length !== keys2.length) {
            return false;
        }
        return keyCheck(val1, val2, strict, memos, 1 /* isArray */, keys1);
    }
    if (val1Tag === '[object Object]') {
        return keyCheck(val1, val2, strict, memos, 0 /* noIterator */);
    }
    if (isDate(val1)) {
        if (Date_getTime(val1) !== Date_getTime(val2)) {
            return false;
        }
    }
    else if (isRegExp(val1)) {
        if (!areSimilarRegExps(val1, val2)) {
            return false;
        }
    }
    else if (isError(val1)) {
        if (val1.message !== val2.message || val1.name !== val2.name) {
            return false;
        }
    }
    else if (ArrayBuffer_isView(val1)) {
        if (!strict && (isFloat32Array(val1) || isFloat64Array(val1))) {
            if (!areSimilarFloatArrays(val1, val2)) {
                return false;
            }
        }
        else if (!areSimilarTypedArrays(val1, val2)) {
            return false;
        }
        const keys1 = getOwnNonIndexProperties(val1, false);
        const keys2 = getOwnNonIndexProperties(val2, false);
        if (keys1.length !== keys2.length) {
            return false;
        }
        return keyCheck(val1, val2, strict, memos, 0 /* noIterator */, keys1);
    }
    else if (isSet(val1)) {
        if (!isSet(val2) || val1.size !== val2.size) {
            return false;
        }
        return keyCheck(val1, val2, strict, memos, 2 /* isSet */);
    }
    else if (isMap(val1)) {
        if (!isMap(val2) || val1.size !== val2.size) {
            return false;
        }
        return keyCheck(val1, val2, strict, memos, 3 /* isMap */);
    }
    else if (isAnyArrayBuffer(val1)) {
        if (!areEqualArrayBuffers(val1, val2)) {
            return false;
        }
    }
    else if (isBoxedPrimitive(val1) && !isEqualBoxedPrimitive(val1, val2)) {
        return false;
    }
    return keyCheck(val1, val2, strict, memos, 0 /* noIterator */);
}
function keyCheck(val1, val2, strict, memos, iterationType, aKeys) {
    if (arguments.length === 5) {
        aKeys = Object_keys(val1);
        const bKeys = Object_keys(val2);
        if (aKeys.length !== bKeys.length) {
            return false;
        }
    }
    let i = 0;
    for (; i < aKeys.length; i++) {
        if (!hasOwnProperty(val2, aKeys[i])) {
            return false;
        }
    }
    if (strict && arguments.length === 5) {
        const symbolKeysA = getOwnPropertySymbols(val1);
        if (symbolKeysA.length !== 0) {
            let count = 0;
            for (i = 0; i < symbolKeysA.length; i++) {
                const key = symbolKeysA[i];
                if (propertyIsEnumerable(val1, key)) {
                    if (!propertyIsEnumerable(val2, key)) {
                        return false;
                    }
                    aKeys.push(key);
                    count++;
                }
                else if (propertyIsEnumerable(val2, key)) {
                    return false;
                }
            }
            const symbolKeysB = getOwnPropertySymbols(val2);
            if (symbolKeysA.length !== symbolKeysB.length
                && getEnumerables(val2, symbolKeysB).length !== count) {
                return false;
            }
        }
        else {
            const symbolKeysB = getOwnPropertySymbols(val2);
            if (symbolKeysB.length !== 0
                && getEnumerables(val2, symbolKeysB).length !== 0) {
                return false;
            }
        }
    }
    if (aKeys.length === 0
        && (iterationType === 0 /* noIterator */
            || iterationType === 1 /* isArray */ && val1.length === 0
            || val1.size === 0)) {
        return true;
    }
    if (memos === void 0) {
        memos = {
            val1: new Map(),
            val2: new Map(),
            position: 0
        };
    }
    else {
        const val2MemoA = memos.val1.get(val1);
        if (val2MemoA !== void 0) {
            const val2MemoB = memos.val2.get(val2);
            if (val2MemoB !== void 0) {
                return val2MemoA === val2MemoB;
            }
        }
        memos.position++;
    }
    memos.val1.set(val1, memos.position);
    memos.val2.set(val2, memos.position);
    const areEq = objEquiv(val1, val2, strict, aKeys, memos, iterationType);
    memos.val1.delete(val1);
    memos.val2.delete(val2);
    return areEq;
}
function setHasEqualElement(set, val1, strict, memos) {
    for (const val2 of set) {
        if (innerDeepEqual(val1, val2, strict, memos)) {
            set.delete(val2);
            return true;
        }
    }
    return false;
}
function findLooseMatchingPrimitives(val) {
    switch (typeof val) {
        case 'undefined':
            return null;
        case 'object':
            return undefined;
        case 'symbol':
            return false;
        case 'string':
            val = +val;
        // Fall through
        case 'number':
            if (Number_isNaN(val)) {
                return false;
            }
    }
    return true;
}
function setMightHaveLoosePrimitive(a, b, val) {
    const altValue = findLooseMatchingPrimitives(val);
    if (altValue != null) {
        return altValue;
    }
    return b.has(altValue) && !a.has(altValue);
}
function mapMightHaveLoosePrimitive(a, b, val, item, memos) {
    const altValue = findLooseMatchingPrimitives(val);
    if (altValue != null) {
        return altValue;
    }
    const curB = b.get(altValue);
    if (curB === void 0 && !b.has(altValue)
        || !innerDeepEqual(item, curB, false, memos)) {
        return false;
    }
    return !a.has(altValue) && innerDeepEqual(item, curB, false, memos);
}
function setEquiv(a, b, strict, memos) {
    let set = null;
    for (const val of a) {
        if (isObject(val)) {
            if (set === null) {
                set = new Set();
            }
            set.add(val);
        }
        else if (!b.has(val)) {
            if (strict) {
                return false;
            }
            if (!setMightHaveLoosePrimitive(a, b, val)) {
                return false;
            }
            if (set === null) {
                set = new Set();
            }
            set.add(val);
        }
    }
    if (set !== null) {
        for (const val of b) {
            if (isObject(val)) {
                if (!setHasEqualElement(set, val, strict, memos)) {
                    return false;
                }
            }
            else if (!strict
                && !a.has(val)
                && !setHasEqualElement(set, val, strict, memos)) {
                return false;
            }
        }
        return set.size === 0;
    }
    return true;
}
function mapHasEqualEntry(set, map, key1, item1, strict, memos) {
    for (const key2 of set) {
        if (innerDeepEqual(key1, key2, strict, memos)
            && innerDeepEqual(item1, map.get(key2), strict, memos)) {
            set.delete(key2);
            return true;
        }
    }
    return false;
}
function mapEquiv(a, b, strict, memos) {
    let set = null;
    for (const [key, item1] of a) {
        if (isObject(key)) {
            if (set === null) {
                set = new Set();
            }
            set.add(key);
        }
        else {
            const item2 = b.get(key);
            if ((item2 === void 0 && !b.has(key)
                || !innerDeepEqual(item1, item2, strict, memos))) {
                if (strict) {
                    return false;
                }
                if (!mapMightHaveLoosePrimitive(a, b, key, item1, memos)) {
                    return false;
                }
                if (set === null) {
                    set = new Set();
                }
                set.add(key);
            }
        }
    }
    if (set !== null) {
        for (const [key, item] of b) {
            if (isObject(key)) {
                if (!mapHasEqualEntry(set, a, key, item, strict, memos)) {
                    return false;
                }
            }
            else if (!strict
                && (!a.has(key) || !innerDeepEqual(a.get(key), item, false, memos))
                && !mapHasEqualEntry(set, a, key, item, false, memos)) {
                return false;
            }
        }
        return set.size === 0;
    }
    return true;
}
function objEquiv(a, b, strict, keys, memos, iterationType) {
    let i = 0;
    if (iterationType === 2 /* isSet */) {
        if (!setEquiv(a, b, strict, memos)) {
            return false;
        }
    }
    else if (iterationType === 3 /* isMap */) {
        if (!mapEquiv(a, b, strict, memos)) {
            return false;
        }
    }
    else if (iterationType === 1 /* isArray */) {
        for (; i < a.length; i++) {
            if (hasOwnProperty(a, i)) {
                if (!hasOwnProperty(b, i)
                    || !innerDeepEqual(a[i], b[i], strict, memos)) {
                    return false;
                }
            }
            else if (hasOwnProperty(b, i)) {
                return false;
            }
            else {
                const keysA = Object_keys(a);
                for (; i < keysA.length; i++) {
                    const key = keysA[i];
                    if (!hasOwnProperty(b, key)
                        || !innerDeepEqual(a[key], b[key], strict, memos)) {
                        return false;
                    }
                }
                if (keysA.length !== Object_keys(b).length) {
                    return false;
                }
                return true;
            }
        }
    }
    for (i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!innerDeepEqual(a[key], b[key], strict, memos)) {
            return false;
        }
    }
    return true;
}
function isDeepEqual(val1, val2) {
    return innerDeepEqual(val1, val2, false);
}
function isDeepStrictEqual(val1, val2) {
    return innerDeepEqual(val1, val2, true);
}

/* eslint-disable import/no-mutable-exports */
class TestContext {
    constructor() {
        this._container = void 0;
        this._platform = void 0;
        this._templateCompiler = void 0;
        this.oL = void 0;
        this._domParser = void 0;
    }
    get wnd() { return this.platform.globalThis; }
    get doc() { return this.platform.document; }
    get userAgent() { return this.platform.navigator.userAgent; }
    get UIEvent() { return this.platform.globalThis.UIEvent; }
    get Event() { return this.platform.globalThis.Event; }
    get CustomEvent() { return this.platform.globalThis.CustomEvent; }
    get Node() { return this.platform.globalThis.Node; }
    get Element() { return this.platform.globalThis.Element; }
    get HTMLElement() { return this.platform.globalThis.HTMLElement; }
    get HTMLDivElement() { return this.platform.globalThis.HTMLDivElement; }
    get Text() { return this.platform.globalThis.Text; }
    get Comment() { return this.platform.globalThis.Comment; }
    get DOMParser() { return this.platform.globalThis.DOMParser; }
    get container() {
        if (this._container === void 0) {
            this._container = DI.createContainer();
            StandardConfiguration.register(this._container);
            this._container.register(Registration.instance(TestContext, this));
            if (this._container.has(IPlatform, true) === false) {
                this._container.register(PLATFORMRegistration);
            }
        }
        return this._container;
    }
    get platform() {
        if (this._platform === void 0) {
            this._platform = this.container.get(IPlatform);
        }
        return this._platform;
    }
    get templateCompiler() {
        if (this._templateCompiler === void 0) {
            this._templateCompiler = this.container.get(ITemplateCompiler);
        }
        return this._templateCompiler;
    }
    get observerLocator() {
        if (this.oL === void 0) {
            this.oL = this.container.get(IObserverLocator);
        }
        return this.oL;
    }
    get domParser() {
        if (this._domParser === void 0) {
            this._domParser = this.doc.createElement('div');
        }
        return this._domParser;
    }
    static create() {
        return new TestContext();
    }
    createElementFromMarkup(markup) {
        this.domParser.innerHTML = markup;
        return this.domParser.firstElementChild;
    }
    createElement(name) {
        return this.doc.createElement(name);
    }
    createAttribute(name, value) {
        const attr = this.doc.createAttribute(name);
        attr.value = value;
        return attr;
    }
}
// Note: our tests shouldn't rely directly on this global variable, but retrieve the platform from a container instead.
// This keeps the door open for more easily mocking the task queues or certain globals (such as Date) in the future.
// It's OK to use this for environment or feature checks necessary to conditionally run tests that only work in specific envs,
// or for initializing test data (creating template elements) before actually running the tests that use that data.
// For existing usages that "violate" the above: do NOT introduce more of them. Intent is to get rid of those in a future test cleanup pass. Please don't create more work for when that time comes.
let PLATFORM;
let PLATFORMRegistration;
function setPlatform(p) {
    PLATFORM = p;
    PLATFORMRegistration = Registration.instance(IPlatform, p);
}
function createContainer(...registries) {
    return DI.createContainer().register(PLATFORMRegistration, ...registries);
}

// Significant portion of this code is copy-pasted from the node.js source
/* eslint-disable max-lines-per-function, @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */
let maxStack_ErrorName;
let maxStack_ErrorMessage;
function isStackOverflowError(err) {
    if (maxStack_ErrorMessage === undefined) {
        try {
            function overflowStack() { overflowStack(); }
            overflowStack();
        }
        catch (err) {
            maxStack_ErrorMessage = err.message;
            maxStack_ErrorName = err.name;
        }
    }
    return (err.name === maxStack_ErrorName
        && err.message === maxStack_ErrorMessage);
}
const defaultInspectOptions = Object_freeze({
    showHidden: false,
    depth: 2,
    colors: true,
    customInspect: true,
    showProxy: false,
    maxArrayLength: 100,
    breakLength: 60,
    compact: true,
    sorted: false,
    getters: false,
    userOptions: void 0,
    stylize: stylizeWithColor,
});
const mandatoryInspectKeys = Object_keys(defaultInspectOptions);
function getUserOptions(ctx) {
    const obj = {};
    for (const key of mandatoryInspectKeys) {
        // @ts-ignore // TODO: https://github.com/microsoft/TypeScript/issues/31904
        obj[key] = ctx[key];
    }
    if (ctx.userOptions !== void 0) {
        Object_assign(obj, ctx.userOptions);
    }
    return obj;
}
function getInspectContext(ctx) {
    const obj = {
        ...defaultInspectOptions,
        budget: {},
        indentationLvl: 0,
        seen: [],
        currentDepth: 0,
        stylize: ctx.colors ? stylizeWithColor : stylizeNoColor,
    };
    for (const key of mandatoryInspectKeys) {
        if (hasOwnProperty(ctx, key)) {
            // @ts-ignore // TODO: https://github.com/microsoft/TypeScript/issues/31904
            obj[key] = ctx[key];
        }
    }
    if (obj.userOptions === void 0) {
        obj.userOptions = ctx;
    }
    return obj;
}
const styles = Object_freeze({
    special: 'cyan',
    number: 'yellow',
    boolean: 'yellow',
    undefined: 'grey',
    null: 'bold',
    string: 'green',
    symbol: 'green',
    date: 'magenta',
    regexp: 'red',
});
const operatorText = Object_freeze({
    deepStrictEqual: 'Expected values to be strictly deep-equal:',
    strictEqual: 'Expected values to be strictly equal:',
    strictEqualObject: 'Expected "actual" to be reference-equal to "expected":',
    deepEqual: 'Expected values to be loosely deep-equal:',
    equal: 'Expected values to be loosely equal:',
    notDeepStrictEqual: 'Expected "actual" not to be strictly deep-equal to:',
    notStrictEqual: 'Expected "actual" to be strictly unequal to:',
    notStrictEqualObject: 'Expected "actual" not to be reference-equal to "expected":',
    notDeepEqual: 'Expected "actual" not to be loosely deep-equal to:',
    notEqual: 'Expected "actual" to be loosely unequal to:',
    notIdentical: 'Values identical but not reference-equal:',
});
const customInspectSymbol = Symbol.for('customInspect');
function stylizeWithColor(str, styleType) {
    const style = styles[styleType];
    if (isString(style)) {
        return colors[style](str);
    }
    else {
        return str;
    }
}
function stylizeNoColor(str, styleType) {
    return str;
}
class AssertionError extends Error {
    constructor(options) {
        const { actual, expected, message, operator, stackStartFn } = options;
        const limit = Error.stackTraceLimit;
        Error.stackTraceLimit = 0;
        let prefix = message == null ? '' : `${message} - `;
        if (operator === 'deepStrictEqual' || operator === 'strictEqual') {
            super(`${prefix}${createErrDiff(actual, expected, operator)}`);
        }
        else if (operator === 'notDeepStrictEqual'
            || operator === 'notStrictEqual') {
            let base = operatorText[operator];
            // eslint-disable-next-line prefer-const
            let res = inspectValue(actual).split('\n');
            if (operator === 'notStrictEqual'
                && isObject(actual)) {
                base = operatorText.notStrictEqualObject;
            }
            if (res.length > 30) {
                res[26] = colors.blue('...');
                while (res.length > 27) {
                    res.pop();
                }
            }
            if (res.length === 1) {
                super(`${prefix}${base} ${res[0]}`);
            }
            else {
                super(`${prefix}${base}\n\n${join(res, '\n')}\n`);
            }
        }
        else {
            let res = inspectValue(actual);
            let other = '';
            const knownOperators = operatorText[operator];
            if (operator === 'notDeepEqual' || operator === 'notEqual') {
                res = `${operatorText[operator]}\n\n${res}`;
                if (res.length > 1024) {
                    res = `${res.slice(0, 1021)}...`;
                }
            }
            else {
                other = `${inspectValue(expected)}`;
                if (res.length > 512) {
                    res = `${res.slice(0, 509)}...`;
                }
                if (other.length > 512) {
                    other = `${other.slice(0, 509)}...`;
                }
                if (operator === 'deepEqual' || operator === 'equal') {
                    res = `${knownOperators}\n\n${res}\n\nshould equal\n\n`;
                }
                else {
                    other = ` ${operator} ${other}`;
                }
            }
            if (!operator) {
                other = '';
                res = '';
                prefix = prefix.slice(0, -3);
            }
            super(`${prefix}${res}${other}`);
        }
        Error.stackTraceLimit = limit;
        this.generatedMessage = !message || message === 'Failed';
        defineProperty(this, 'name', {
            value: 'AssertionError [ERR_ASSERTION]',
            enumerable: false,
            writable: true,
            configurable: true
        });
        this.code = 'ERR_ASSERTION';
        this.actual = actual;
        this.expected = expected;
        this.operator = operator;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, stackStartFn);
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            this.stack;
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            Error().stack;
        }
        this.name = 'AssertionError';
    }
    toString() {
        return `${this.name} [${this.code}]: ${this.message}`;
    }
    [customInspectSymbol](recurseTimes, ctx) {
        return inspect(this, {
            ...ctx,
            customInspect: false,
            depth: 0,
        });
    }
}
const kMaxShortLength = 10;
function createErrDiff(actual, expected, operator) {
    let other = '';
    let res = '';
    let lastPos = 0;
    let end = '';
    let skipped = false;
    const actualInspected = inspectValue(actual);
    const actualLines = actualInspected.split('\n');
    const expectedLines = inspectValue(expected).split('\n');
    let i = 0;
    let indicator = '';
    if (operator === 'strictEqual'
        && isObject(actual)
        && isObject(expected)) {
        operator = 'strictEqualObject';
    }
    if (actualLines.length === 1
        && expectedLines.length === 1
        && actualLines[0] !== expectedLines[0]) {
        const inputLength = actualLines[0].length + expectedLines[0].length;
        if (inputLength <= kMaxShortLength) {
            if (!isObject(actual)
                && !isObject(expected)
                && (actual !== 0 || expected !== 0)) {
                return `${operatorText[operator]}\n\n${actualLines[0]} !== ${expectedLines[0]}\n`;
            }
        }
        else if (operator !== 'strictEqualObject' && inputLength < 80) {
            while (actualLines[0][i] === expectedLines[0][i]) {
                i++;
            }
            if (i > 2) {
                indicator = `\n  ${' '.repeat(i)}^`;
                i = 0;
            }
        }
    }
    let a = actualLines[actualLines.length - 1];
    let b = expectedLines[expectedLines.length - 1];
    while (a === b) {
        if (i++ < 2) {
            end = `\n  ${a}${end}`;
        }
        else {
            other = a;
        }
        actualLines.pop();
        expectedLines.pop();
        if (actualLines.length === 0 || expectedLines.length === 0) {
            break;
        }
        a = actualLines[actualLines.length - 1];
        b = expectedLines[expectedLines.length - 1];
    }
    const maxLines = Math.max(actualLines.length, expectedLines.length);
    if (maxLines === 0) {
        const $actualLines = actualInspected.split('\n');
        if ($actualLines.length > 30) {
            $actualLines[26] = colors.blue('...');
            while ($actualLines.length > 27) {
                $actualLines.pop();
            }
        }
        return `${operatorText.notIdentical}\n\n${join($actualLines, '\n')}\n`;
    }
    if (i > 3) {
        end = `\n${colors.blue('...')}${end}`;
        skipped = true;
    }
    if (other !== '') {
        end = `\n  ${other}${end}`;
        other = '';
    }
    let printedLines = 0;
    const msg = `${operatorText[operator]}\n${colors.green('+ actual')} ${colors.red('- expected')}`;
    const skippedMsg = ` ${colors.blue('...')} Lines skipped`;
    for (i = 0; i < maxLines; i++) {
        const cur = i - lastPos;
        if (actualLines.length < i + 1) {
            if (cur > 1 && i > 2) {
                if (cur > 4) {
                    res += `\n${colors.blue('...')}`;
                    skipped = true;
                }
                else if (cur > 3) {
                    res += `\n  ${expectedLines[i - 2]}`;
                    printedLines++;
                }
                res += `\n  ${expectedLines[i - 1]}`;
                printedLines++;
            }
            lastPos = i;
            other += `\n${colors.red('-')} ${expectedLines[i]}`;
            printedLines++;
        }
        else if (expectedLines.length < i + 1) {
            if (cur > 1 && i > 2) {
                if (cur > 4) {
                    res += `\n${colors.blue('...')}`;
                    skipped = true;
                }
                else if (cur > 3) {
                    res += `\n  ${actualLines[i - 2]}`;
                    printedLines++;
                }
                res += `\n  ${actualLines[i - 1]}`;
                printedLines++;
            }
            lastPos = i;
            res += `\n${colors.green('+')} ${actualLines[i]}`;
            printedLines++;
        }
        else {
            const expectedLine = expectedLines[i];
            let actualLine = actualLines[i];
            let divergingLines = (actualLine !== expectedLine && (!actualLine.endsWith(',')
                || actualLine.slice(0, -1) !== expectedLine));
            if (divergingLines
                && expectedLine.endsWith(',')
                && expectedLine.slice(0, -1) === actualLine) {
                divergingLines = false;
                actualLine += ',';
            }
            if (divergingLines) {
                if (cur > 1 && i > 2) {
                    if (cur > 4) {
                        res += `\n${colors.blue('...')}`;
                        skipped = true;
                    }
                    else if (cur > 3) {
                        res += `\n  ${actualLines[i - 2]}`;
                        printedLines++;
                    }
                    res += `\n  ${actualLines[i - 1]}`;
                    printedLines++;
                }
                lastPos = i;
                res += `\n${colors.green('+')} ${actualLine}`;
                other += `\n${colors.red('-')} ${expectedLine}`;
                printedLines += 2;
            }
            else {
                res += other;
                other = '';
                if (cur === 1 || i === 0) {
                    res += `\n  ${actualLine}`;
                    printedLines++;
                }
            }
        }
        if (printedLines > 1000 && i < maxLines - 2) {
            return `${msg}${skippedMsg}\n${res}\n${colors.blue('...')}${other}\n${colors.blue('...')}`;
        }
    }
    return `${msg}${skipped ? skippedMsg : ''}\n${res}${other}${end}${indicator}`;
}
const kObjectType = 0;
const kArrayType = 1;
const kArrayExtrasType = 2;
const idStart = new Int8Array(0x80);
const idPart = new Int8Array(0x80);
for (let i = 0; i < 0x80; ++i) {
    if (i === 36 /* Dollar */
        || i === 95 /* Underscore */
        || (i >= 65 /* UpperA */ && i <= 90 /* UpperZ */)
        || (i >= 97 /* LowerA */ && i <= 122 /* LowerZ */)) {
        idStart[i] = idPart[i] = 1;
    }
    else if (i >= 49 /* One */ && i <= 57 /* Nine */) {
        idPart[i] = 1;
    }
}
function isValidIdentifier(str) {
    if (idStart[str.charCodeAt(0)] !== 1) {
        return false;
    }
    const { length } = str;
    for (let i = 1; i < length; ++i) {
        if (idPart[str.charCodeAt(i)] !== 1) {
            return false;
        }
    }
    return true;
}
const readableRegExps = {};
const kMinLineLength = 16;
// Constants to map the iterator state.
const kWeak = 0;
const kIterator = 1;
const kMapEntries = 2;
function groupArrayElements(ctx, output) {
    let totalLength = 0;
    let maxLength = 0;
    let i = 0;
    const dataLen = new Array(output.length);
    // Calculate the total length of all output entries and the individual max
    // entries length of all output entries. We have to remove colors first,
    // otherwise the length would not be calculated properly.
    for (; i < output.length; i++) {
        const len = ctx.colors ? removeColors(output[i]).length : output[i].length;
        dataLen[i] = len;
        totalLength += len;
        if (maxLength < len) {
            maxLength = len;
        }
    }
    // Add two to `maxLength` as we add a single whitespace character plus a comma
    // in-between two entries.
    const actualMax = maxLength + 2;
    // Check if at least three entries fit next to each other and prevent grouping
    // of arrays that contains entries of very different length (i.e., if a single
    // entry is longer than 1/5 of all other entries combined). Otherwise the
    // space in-between small entries would be enormous.
    if (actualMax * 3 + ctx.indentationLvl < ctx.breakLength
        && (totalLength / maxLength > 5 || maxLength <= 6)) {
        const approxCharHeights = 2.5;
        const bias = 1;
        // Dynamically check how many columns seem possible.
        const columns = Math.min(
        // Ideally a square should be drawn. We expect a character to be about 2.5
        // times as high as wide. This is the area formula to calculate a square
        // which contains n rectangles of size `actualMax * approxCharHeights`.
        // Divide that by `actualMax` to receive the correct number of columns.
        // The added bias slightly increases the columns for short entries.
        Math.round(Math.sqrt(approxCharHeights * (actualMax - bias) * output.length)
            / (actualMax - bias)), 
        // Limit array grouping for small `compact` modes as the user requested
        // minimal grouping.
        ctx.compact * 3, 
        // Limit the columns to a maximum of ten.
        10);
        // Return with the original output if no grouping should happen.
        if (columns <= 1) {
            return output;
        }
        // Calculate the maximum length of all entries that are visible in the first
        // column of the group.
        const tmp = [];
        let firstLineMaxLength = dataLen[0];
        for (i = columns; i < dataLen.length; i += columns) {
            if (dataLen[i] > firstLineMaxLength) {
                firstLineMaxLength = dataLen[i];
            }
        }
        // Each iteration creates a single line of grouped entries.
        for (i = 0; i < output.length; i += columns) {
            // Calculate extra color padding in case it's active. This has to be done
            // line by line as some lines might contain more colors than others.
            let colorPadding = output[i].length - dataLen[i];
            // Add padding to the first column of the output.
            let str = output[i].padStart(firstLineMaxLength + colorPadding, ' ');
            // The last lines may contain less entries than columns.
            const max = Math.min(i + columns, output.length);
            for (let j = i + 1; j < max; j++) {
                colorPadding = output[j].length - dataLen[j];
                str += `, ${output[j].padStart(maxLength + colorPadding, ' ')}`;
            }
            tmp.push(str);
        }
        output = tmp;
    }
    return output;
}
function handleMaxCallStackSize(ctx, err, constructor, tag, indentationLvl) {
    if (isStackOverflowError(err)) {
        ctx.seen.pop();
        ctx.indentationLvl = indentationLvl;
        return ctx.stylize(`[${getCtxStyle(constructor, tag)}: Inspection interrupted prematurely. Maximum call stack size exceeded.]`, 'special');
    }
    throw err;
}
const typedArrayKeys = Object_freeze([
    'BYTES_PER_ELEMENT',
    'length',
    'byteLength',
    'byteOffset',
    'buffer'
]);
function entriesToArray(value) {
    const ret = [];
    for (const [k, v] of value) {
        ret.push(k, v);
    }
    return ret;
}
function isBelowBreakLength(ctx, output, start) {
    let totalLength = output.length + start;
    if (totalLength + output.length > ctx.breakLength) {
        return false;
    }
    for (let i = 0; i < output.length; i++) {
        if (ctx.colors) {
            totalLength += removeColors(output[i]).length;
        }
        else {
            totalLength += output[i].length;
        }
        if (totalLength > ctx.breakLength) {
            return false;
        }
    }
    return true;
}
function reduceToSingleString(ctx, output, base, braces, combine = false) {
    if (ctx.compact !== true) {
        if (combine) {
            const start = (output.length
                + ctx.indentationLvl
                + braces[0].length
                + base.length
                + 10);
            if (isBelowBreakLength(ctx, output, start)) {
                return `${base ? `${base} ` : ''}${braces[0]} ${join(output, ', ')} ${braces[1]}`;
            }
        }
        const indent = `\n${' '.repeat(ctx.indentationLvl)}`;
        return `${base ? `${base} ` : ''}${braces[0]}${indent}  ${join(output, `,${indent}  `)}${indent}${braces[1]}`;
    }
    if (isBelowBreakLength(ctx, output, 0)) {
        return `${braces[0]}${base ? ` ${base}` : ''} ${join(output, ', ')} ${braces[1]}`;
    }
    const indentation = ' '.repeat(ctx.indentationLvl);
    const ln = base === '' && braces[0].length === 1
        ? ' '
        : `${base ? ` ${base}` : ''}\n${indentation}  `;
    return `${braces[0]}${ln}${join(output, `,\n${indentation}  `)} ${braces[1]}`;
}
function getConstructorName(obj, ctx) {
    let firstProto;
    while (obj) {
        const descriptor = getOwnPropertyDescriptor(obj, 'constructor');
        if (!isUndefined(descriptor)
            && isFunction(descriptor.value)
            && descriptor.value.name !== '') {
            return descriptor.value.name;
        }
        obj = getPrototypeOf(obj);
        if (firstProto === void 0) {
            firstProto = obj;
        }
    }
    if (firstProto === null) {
        return null;
    }
    const newCtx = {
        ...ctx,
        customInspect: false,
    };
    return `<${inspect(firstProto, newCtx)}>`;
}
function getEmptyFormatArray() {
    return [];
}
function getPrefix(constructor, tag, fallback) {
    if (constructor === null) {
        if (tag !== '') {
            return `[${fallback}: null prototype] [${tag}] `;
        }
        return `[${fallback}: null prototype] `;
    }
    if (tag !== '' && constructor !== tag) {
        return `${constructor} [${tag}] `;
    }
    return `${constructor} `;
}
const getBoxedValue = formatPrimitive.bind(null, stylizeNoColor);
function getKeys(value, showHidden) {
    let keys;
    const symbols = getOwnPropertySymbols(value);
    if (showHidden) {
        keys = getOwnPropertyNames(value);
        if (symbols.length !== 0) {
            keys.push(...symbols);
        }
    }
    else {
        keys = Object_keys(value);
        if (symbols.length !== 0) {
            keys.push(...symbols.filter((key) => propertyIsEnumerable(value, key)));
        }
    }
    return keys;
}
function getCtxStyle(constructor, tag) {
    return constructor || tag || 'Object';
}
const typedConstructorMap = Object_freeze([
    [isUint8Array, Uint8Array],
    [isUint8ClampedArray, Uint8ClampedArray],
    [isUint16Array, Uint16Array],
    [isUint32Array, Uint32Array],
    [isInt8Array, Int8Array],
    [isInt16Array, Int16Array],
    [isInt32Array, Int32Array],
    [isFloat32Array, Float32Array],
    [isFloat64Array, Float64Array],
]);
const typedConstructorCount = typedConstructorMap.length;
function findTypedConstructor(value) {
    for (let i = 0; i < typedConstructorCount; ++i) {
        const [isType, Type] = typedConstructorMap[i];
        if (isType(value)) {
            return Type;
        }
    }
    return (void 0);
}
function setIteratorBraces(type, tag) {
    if (tag !== `${type} Iterator`) {
        if (tag !== '') {
            tag += '] [';
        }
        tag += `${type} Iterator`;
    }
    return [`[${tag}] {`, '}'];
}
let lazyNullPrototypeCache;
// Creates a subclass and name
// the constructor as `${clazz} : null prototype`
function clazzWithNullPrototype(clazz, name) {
    if (lazyNullPrototypeCache === undefined) {
        lazyNullPrototypeCache = new Map();
    }
    else {
        const cachedClass = lazyNullPrototypeCache.get(clazz);
        if (cachedClass !== undefined) {
            return cachedClass;
        }
    }
    class NullPrototype extends clazz {
        get [Symbol.toStringTag]() {
            return '';
        }
    }
    defineProperty(NullPrototype.prototype.constructor, 'name', { value: `[${name}: null prototype]` });
    lazyNullPrototypeCache.set(clazz, NullPrototype);
    return NullPrototype;
}
function noPrototypeIterator(ctx, value, recurseTimes) {
    let newVal;
    if (isSet(value)) {
        const clazz = clazzWithNullPrototype(Set, 'Set');
        newVal = new clazz(Set_values(value));
    }
    else if (isMap(value)) {
        const clazz = clazzWithNullPrototype(Map, 'Map');
        newVal = new clazz(Map_entries(value));
    }
    else if (Array.isArray(value)) {
        const clazz = clazzWithNullPrototype(Array, 'Array');
        newVal = new clazz(value.length);
    }
    else if (isTypedArray(value)) {
        const constructor = findTypedConstructor(value);
        const clazz = clazzWithNullPrototype(constructor, constructor.name);
        newVal = new clazz(value);
    }
    if (newVal !== undefined) {
        defineProperties(newVal, getOwnPropertyDescriptors(value));
        return formatRaw(ctx, newVal, recurseTimes);
    }
    return (void 0);
}
function formatNumber(fn, value) {
    return fn(Object_is(value, -0) ? '-0' : `${value}`, 'number');
}
function formatPrimitive(fn, value, ctx) {
    switch (typeof value) {
        case 'string':
            if (ctx.compact !== true &&
                ctx.indentationLvl + value.length > ctx.breakLength &&
                value.length > kMinLineLength) {
                const rawMaxLineLength = ctx.breakLength - ctx.indentationLvl;
                const maxLineLength = Math.max(rawMaxLineLength, kMinLineLength);
                const lines = Math.ceil(value.length / maxLineLength);
                const averageLineLength = Math.ceil(value.length / lines);
                const divisor = Math.max(averageLineLength, kMinLineLength);
                if (readableRegExps[divisor] === void 0) {
                    readableRegExps[divisor] = new RegExp(`(.|\\n){1,${divisor}}(\\s|$)|(\\n|.)+?(\\s|$)`, 'gm');
                }
                // eslint-disable-next-line @typescript-eslint/prefer-regexp-exec
                const matches = value.match(readableRegExps[divisor]);
                if (matches.length > 1) {
                    const indent = ' '.repeat(ctx.indentationLvl);
                    let res = `${fn(escapeAndQuoteString(matches[0]), 'string')} +\n`;
                    let i = 1;
                    for (; i < matches.length - 1; i++) {
                        res += `${indent}  ${fn(escapeAndQuoteString(matches[i]), 'string')} +\n`;
                    }
                    res += `${indent}  ${fn(escapeAndQuoteString(matches[i]), 'string')}`;
                    return res;
                }
            }
            return fn(escapeAndQuoteString(value), 'string');
        case 'number':
            return formatNumber(fn, value);
        case 'boolean':
            return fn(value.toString(), 'boolean');
        case 'undefined':
            return fn('undefined', 'undefined');
        case 'symbol':
            return fn(value.toString(), 'symbol');
    }
    throw new Error(`formatPrimitive only handles non-null primitives. Got: ${Object_toString(value)}`);
}
function formatError(value) {
    return value.stack || Error_toString(value);
}
function formatSpecialArray(ctx, value, recurseTimes, maxLength, output, i) {
    const keys = Object_keys(value);
    let index = i;
    for (; i < keys.length && output.length < maxLength; i++) {
        const key = keys[i];
        const tmp = +key;
        if (tmp > 2 ** 32 - 2) {
            break;
        }
        if (`${index}` !== key) {
            if (!isArrayIndex(key)) {
                break;
            }
            const emptyItems = tmp - index;
            const ending = emptyItems > 1 ? 's' : '';
            const message = `<${emptyItems} empty item${ending}>`;
            output.push(ctx.stylize(message, 'undefined'));
            index = tmp;
            if (output.length === maxLength) {
                break;
            }
        }
        output.push(formatProperty(ctx, value, recurseTimes, key, kArrayType));
        index++;
    }
    const remaining = value.length - index;
    if (output.length !== maxLength) {
        if (remaining > 0) {
            const ending = remaining > 1 ? 's' : '';
            const message = `<${remaining} empty item${ending}>`;
            output.push(ctx.stylize(message, 'undefined'));
        }
    }
    else if (remaining > 0) {
        output.push(`... ${remaining} more item${remaining > 1 ? 's' : ''}`);
    }
    return output;
}
function formatArrayBuffer(ctx, value) {
    const buffer = new Uint8Array(value);
    let str = join(buffer.slice(0, Math.min(ctx.maxArrayLength, buffer.length)).map(val => val.toString(16)), ' ');
    const remaining = buffer.length - ctx.maxArrayLength;
    if (remaining > 0) {
        str += ` ... ${remaining} more byte${remaining > 1 ? 's' : ''}`;
    }
    return [`${ctx.stylize('[Uint8Contents]', 'special')}: <${str}>`];
}
function formatArray(ctx, value, recurseTimes) {
    const valLen = value.length;
    const len = Math.min(Math.max(0, ctx.maxArrayLength), valLen);
    const remaining = valLen - len;
    const output = [];
    for (let i = 0; i < len; i++) {
        if (!hasOwnProperty(value, i)) {
            return formatSpecialArray(ctx, value, recurseTimes, len, output, i);
        }
        output.push(formatProperty(ctx, value, recurseTimes, i, kArrayType));
    }
    if (remaining > 0) {
        output.push(`... ${remaining} more item${remaining > 1 ? 's' : ''}`);
    }
    return output;
}
function formatTypedArray(ctx, value, recurseTimes) {
    const maxLength = Math.min(Math.max(0, ctx.maxArrayLength), value.length);
    const remaining = value.length - maxLength;
    const output = new Array(maxLength);
    let i = 0;
    for (; i < maxLength; ++i) {
        output[i] = formatNumber(ctx.stylize, value[i]);
    }
    if (remaining > 0) {
        output[i] = `... ${remaining} more item${remaining > 1 ? 's' : ''}`;
    }
    if (ctx.showHidden) {
        ctx.indentationLvl += 2;
        for (const key of typedArrayKeys) {
            const str = formatValue(ctx, value[key], recurseTimes, true);
            output.push(`[${key}]: ${str}`);
        }
        ctx.indentationLvl -= 2;
    }
    return output;
}
function formatSet(ctx, value, recurseTimes) {
    const output = [];
    ctx.indentationLvl += 2;
    for (const v of value) {
        output.push(formatValue(ctx, v, recurseTimes));
    }
    ctx.indentationLvl -= 2;
    if (ctx.showHidden) {
        output.push(`[size]: ${ctx.stylize(value.size.toString(), 'number')}`);
    }
    return output;
}
function formatMap(ctx, value, recurseTimes) {
    const output = [];
    ctx.indentationLvl += 2;
    for (const [k, v] of value) {
        output.push(`${formatValue(ctx, k, recurseTimes)} => ${formatValue(ctx, v, recurseTimes)}`);
    }
    ctx.indentationLvl -= 2;
    if (ctx.showHidden) {
        output.push(`[size]: ${ctx.stylize(value.size.toString(), 'number')}`);
    }
    return output;
}
function formatSetIterInner(ctx, recurseTimes, entries, state) {
    const maxArrayLength = Math.max(ctx.maxArrayLength, 0);
    const maxLength = Math.min(maxArrayLength, entries.length);
    const output = new Array(maxLength);
    ctx.indentationLvl += 2;
    for (let i = 0; i < maxLength; i++) {
        output[i] = formatValue(ctx, entries[i], recurseTimes);
    }
    ctx.indentationLvl -= 2;
    if (state === kWeak) {
        output.sort();
    }
    const remaining = entries.length - maxLength;
    if (remaining > 0) {
        output.push(`... ${remaining} more item${remaining > 1 ? 's' : ''}`);
    }
    return output;
}
function formatMapIterInner(ctx, recurseTimes, entries, state) {
    const maxArrayLength = Math.max(ctx.maxArrayLength, 0);
    const len = entries.length / 2;
    const remaining = len - maxArrayLength;
    const maxLength = Math.min(maxArrayLength, len);
    const output = new Array(maxLength);
    let start = '';
    let end = '';
    let middle = ' => ';
    let i = 0;
    if (state === kMapEntries) {
        start = '[ ';
        end = ' ]';
        middle = ', ';
    }
    ctx.indentationLvl += 2;
    for (; i < maxLength; i++) {
        const pos = i * 2;
        output[i] = `${start}${formatValue(ctx, entries[pos], recurseTimes)}` +
            `${middle}${formatValue(ctx, entries[pos + 1], recurseTimes)}${end}`;
    }
    ctx.indentationLvl -= 2;
    if (state === kWeak) {
        output.sort();
    }
    if (remaining > 0) {
        output.push(`... ${remaining} more item${remaining > 1 ? 's' : ''}`);
    }
    return output;
}
function formatWeakCollection(ctx) {
    return [ctx.stylize('<items unknown>', 'special')];
}
function formatWeakSet(ctx, value, recurseTimes) {
    return formatSetIterInner(ctx, recurseTimes, [], kWeak);
}
function formatWeakMap(ctx, value, recurseTimes) {
    return formatMapIterInner(ctx, recurseTimes, [], kWeak);
}
function formatIterator(ctx, value, recurseTimes, braces) {
    const entries = entriesToArray(value.entries());
    if (value instanceof Map) {
        braces[0] = braces[0].replace(/ Iterator] {$/, ' Entries] {');
        return formatMapIterInner(ctx, recurseTimes, entries, kMapEntries);
    }
    return formatSetIterInner(ctx, recurseTimes, entries, kIterator);
}
function formatPromise(ctx, value, recurseTimes) {
    return ['[object Promise]'];
}
function formatProperty(ctx, value, recurseTimes, key, type) {
    switch (key) {
        // Aurelia-specific:
        case '$controller':
            return `$controller: { id: ${value.$controller.id} } (omitted for brevity)`;
        case 'overrideContext':
            return 'overrideContext: (omitted for brevity)';
    }
    let name, str;
    let extra = ' ';
    const desc = (getOwnPropertyDescriptor(value, key)
        || ({
            value: value[key],
            enumerable: true,
        }));
    if (desc.value !== void 0) {
        const diff = (type !== kObjectType
            || ctx.compact !== true) ? 2 : 3;
        ctx.indentationLvl += diff;
        str = formatValue(ctx, desc.value, recurseTimes);
        if (diff === 3) {
            const len = ctx.colors
                ? removeColors(str).length
                : str.length;
            if (ctx.breakLength < len) {
                extra = `\n${' '.repeat(ctx.indentationLvl)}`;
            }
        }
        ctx.indentationLvl -= diff;
    }
    else if (desc.get !== void 0) {
        const label = desc.set !== void 0
            ? 'Getter/Setter'
            : 'Getter';
        const s = ctx.stylize;
        const sp = 'special';
        if (ctx.getters
            && (ctx.getters === true
                || ctx.getters === 'get' && desc.set === void 0
                || ctx.getters === 'set' && desc.set !== void 0)) {
            try {
                const tmp = value[key];
                ctx.indentationLvl += 2;
                if (tmp === null) {
                    str = `${s(`[${label}:`, sp)} ${s('null', 'null')}${s(']', sp)}`;
                }
                else if (typeof tmp === 'object') {
                    str = `${s(`[${label}]`, sp)} ${formatValue(ctx, tmp, recurseTimes)}`;
                }
                else {
                    const primitive = formatPrimitive(s, tmp, ctx);
                    str = `${s(`[${label}:`, sp)} ${primitive}${s(']', sp)}`;
                }
                ctx.indentationLvl -= 2;
            }
            catch (err) {
                const message = `<Inspection threw (${err.message})>`;
                str = `${s(`[${label}:`, sp)} ${message}${s(']', sp)}`;
            }
        }
        else {
            str = ctx.stylize(`[${label}]`, sp);
        }
    }
    else if (desc.set !== void 0) {
        str = ctx.stylize('[Setter]', 'special');
    }
    else {
        str = ctx.stylize('undefined', 'undefined');
    }
    if (type === kArrayType) {
        return str;
    }
    if (isSymbol(key)) {
        const tmp = escapeString(key.toString());
        name = `[${ctx.stylize(tmp, 'symbol')}]`;
    }
    else if (desc.enumerable === false) {
        name = `[${escapeString(key.toString())}]`;
    }
    else if (isValidIdentifier(key)) {
        name = ctx.stylize(key, 'name');
    }
    else {
        name = ctx.stylize(escapeAndQuoteString(key), 'string');
    }
    return `${name}:${extra}${str}`;
}
function formatRaw(ctx, value, recurseTimes, typedArray) {
    let keys = (void 0);
    const constructor = getConstructorName(value, ctx);
    switch (constructor) {
        // Aurelia-specific:
        // Skip some standard components as their difference will not matter in assertions, but they will
        // generate a lot of noise and slow down the inspection due to their size and property depth
        case 'Container':
        case 'ObserverLocator':
        // Also skip window object as it's not a node instance and therefore not filtered by formatProperty
        case 'Window':
            return ctx.stylize(`${constructor} (omitted for brevity)`, 'special');
        case 'Function':
            // It's likely a constructor, filter out some additional globals that don't matter in inspection
            if (value.name === 'Node') {
                return ctx.stylize('Node constructor (omitted for brevity)', 'special');
            }
    }
    let tag = value[Symbol.toStringTag];
    if (!isString(tag)) {
        tag = '';
    }
    let base = '';
    let formatter = getEmptyFormatArray;
    let braces = (void 0);
    let noIterator = true;
    let i = 0;
    let extrasType = kObjectType;
    // Iterators and the rest are split to reduce checks.
    if (value[Symbol.iterator]) {
        noIterator = false;
        if (Array.isArray(value)) {
            keys = getOwnNonIndexProperties(value, ctx.showHidden);
            // Only set the constructor for non ordinary ("Array [...]") arrays.
            const prefix = getPrefix(constructor, tag, 'Array');
            braces = [`${prefix === 'Array ' ? '' : prefix}[`, ']'];
            if (value.length === 0 && keys.length === 0) {
                return `${braces[0]}]`;
            }
            extrasType = kArrayExtrasType;
            formatter = formatArray;
        }
        else if (isSet(value)) {
            keys = getKeys(value, ctx.showHidden);
            const prefix = getPrefix(constructor, tag, 'Set');
            if (value.size === 0 && keys.length === 0) {
                return `${prefix}{}`;
            }
            braces = [`${prefix}{`, '}'];
            formatter = formatSet;
        }
        else if (isMap(value)) {
            keys = getKeys(value, ctx.showHidden);
            const prefix = getPrefix(constructor, tag, 'Map');
            if (value.size === 0 && keys.length === 0) {
                return `${prefix}{}`;
            }
            braces = [`${prefix}{`, '}'];
            formatter = formatMap;
        }
        else if (isTypedArray(value)) {
            keys = getOwnNonIndexProperties(value, ctx.showHidden);
            const prefix = constructor !== null
                ? getPrefix(constructor, tag)
                : getPrefix(constructor, tag, findTypedConstructor(value).name);
            braces = [`${prefix}[`, ']'];
            if (value.length === 0 && keys.length === 0 && !ctx.showHidden) {
                return `${braces[0]}]`;
            }
            formatter = formatTypedArray;
            extrasType = kArrayExtrasType;
        }
        else if (isMapIterator(value)) {
            keys = getKeys(value, ctx.showHidden);
            braces = setIteratorBraces('Map', tag);
            formatter = formatIterator;
        }
        else if (isSetIterator(value)) {
            keys = getKeys(value, ctx.showHidden);
            braces = setIteratorBraces('Set', tag);
            formatter = formatIterator;
        }
        else {
            noIterator = true;
        }
    }
    if (noIterator) {
        keys = getKeys(value, ctx.showHidden);
        braces = ['{', '}'];
        if (constructor === 'Object') {
            if (isArgumentsObject(value)) {
                braces[0] = '[Arguments] {';
            }
            else if (tag !== '') {
                braces[0] = `${getPrefix(constructor, tag, 'Object')}{`;
            }
            if (keys.length === 0) {
                return `${braces[0]}}`;
            }
        }
        else if (isFunction(value)) {
            const type = constructor || tag || 'Function';
            let name = `${type}`;
            if (value.name && isString(value.name)) {
                name += `: ${value.name}`;
            }
            if (keys.length === 0) {
                return ctx.stylize(`[${name}]`, 'special');
            }
            base = `[${name}]`;
        }
        else if (isRegExp(value)) {
            // Make RegExps say that they are RegExps
            base = RegExp_toString(constructor !== null ? value : new RegExp(value));
            const prefix = getPrefix(constructor, tag, 'RegExp');
            if (prefix !== 'RegExp ') {
                base = `${prefix}${base}`;
            }
            if (keys.length === 0 || recurseTimes > ctx.depth && ctx.depth !== null) {
                return ctx.stylize(base, 'regexp');
            }
        }
        else if (isDate(value)) {
            // Make dates with properties first say the date
            base = Number.isNaN(Date_getTime(value))
                ? Date_toString(value)
                : Date_toISOString(value);
            const prefix = getPrefix(constructor, tag, 'Date');
            if (prefix !== 'Date ') {
                base = `${prefix}${base}`;
            }
            if (keys.length === 0) {
                return ctx.stylize(base, 'date');
            }
        }
        else if (isError(value)) {
            // Make error with message first say the error.
            base = formatError(value);
            // Wrap the error in brackets in case it has no stack trace.
            const stackStart = base.indexOf('\n    at');
            if (stackStart === -1) {
                base = `[${base}]`;
            }
            // The message and the stack have to be indented as well!
            if (ctx.indentationLvl !== 0) {
                const indentation = ' '.repeat(ctx.indentationLvl);
                base = formatError(value).replace(/\n/g, `\n${indentation}`);
            }
            if (keys.length === 0) {
                return base;
            }
            if (ctx.compact === false && stackStart !== -1) {
                braces[0] += `${base.slice(stackStart)}`;
                base = `[${base.slice(0, stackStart)}]`;
            }
        }
        else if (isAnyArrayBuffer(value)) {
            // Fast path for ArrayBuffer and SharedArrayBuffer.
            // Can't do the same for DataView because it has a non-primitive
            // .buffer property that we need to recurse for.
            const arrayType = isArrayBuffer(value)
                ? 'ArrayBuffer'
                : 'SharedArrayBuffer';
            const prefix = getPrefix(constructor, tag, arrayType);
            if (typedArray === void 0) {
                formatter = formatArrayBuffer;
            }
            else if (keys.length === 0) {
                return `${prefix}{ byteLength: ${formatNumber(ctx.stylize, value.byteLength)} }`;
            }
            braces[0] = `${prefix}{`;
            keys.unshift('byteLength');
        }
        else if (isDataView(value)) {
            braces[0] = `${getPrefix(constructor, tag, 'DataView')}{`;
            // .buffer goes last, it's not a primitive like the others.
            keys.unshift('byteLength', 'byteOffset', 'buffer');
        }
        else if (isPromise(value)) {
            braces[0] = `${getPrefix(constructor, tag, 'Promise')}{`;
            formatter = formatPromise;
        }
        else if (isWeakSet(value)) {
            braces[0] = `${getPrefix(constructor, tag, 'WeakSet')}{`;
            formatter = ctx.showHidden ? formatWeakSet : formatWeakCollection;
        }
        else if (isWeakMap(value)) {
            braces[0] = `${getPrefix(constructor, tag, 'WeakMap')}{`;
            formatter = ctx.showHidden ? formatWeakMap : formatWeakCollection;
            // } else if (isModuleNamespaceObject(value)) {
            //   braces[0] = `[${tag}] {`;
            //   formatter = formatNamespaceObject;
        }
        else if (isBoxedPrimitive(value)) {
            let type;
            if (isNumberObject(value)) {
                base = `[Number: ${getBoxedValue(Number_valueOf(value), ctx)}]`;
                type = 'number';
            }
            else if (isStringObject(value)) {
                base = `[String: ${getBoxedValue(String_valueOf(value), ctx)}]`;
                type = 'string';
                // For boxed Strings, we have to remove the 0-n indexed entries,
                // since they just noisy up the output and are redundant
                // Make boxed primitive Strings look like such
                keys = keys.slice(value.length);
            }
            else if (isBooleanObject(value)) {
                base = `[Boolean: ${getBoxedValue(Boolean_valueOf(value), ctx)}]`;
                type = 'boolean';
            }
            else {
                base = `[Symbol: ${getBoxedValue(Symbol_valueOf(value), ctx)}]`;
                type = 'symbol';
            }
            if (keys.length === 0) {
                return ctx.stylize(base, type);
            }
        }
        else {
            // The input prototype got manipulated. Special handle these. We have to
            // rebuild the information so we are able to display everything.
            if (constructor === null) {
                const specialIterator = noPrototypeIterator(ctx, value, recurseTimes);
                if (specialIterator) {
                    return specialIterator;
                }
            }
            if (isMapIterator(value)) {
                braces = setIteratorBraces('Map', tag);
                formatter = formatIterator;
            }
            else if (isSetIterator(value)) {
                braces = setIteratorBraces('Set', tag);
                formatter = formatIterator;
                // Handle other regular objects again.
            }
            else if (keys.length === 0) {
                // if (isExternal(value)) {
                //   return ctx.stylize('[External]', 'special');
                // }
                return `${getPrefix(constructor, tag, 'Object')}{}`;
            }
            else {
                braces[0] = `${getPrefix(constructor, tag, 'Object')}{`;
            }
        }
    }
    if (recurseTimes > ctx.depth && ctx.depth !== null) {
        return ctx.stylize(`[${getCtxStyle(constructor, tag)}]`, 'special');
    }
    recurseTimes += 1;
    ctx.seen.push(value);
    ctx.currentDepth = recurseTimes;
    let output;
    const indentationLvl = ctx.indentationLvl;
    try {
        output = formatter(ctx, value, recurseTimes, keys, braces);
        let $key;
        const isNotNode = !(value instanceof PLATFORM.Node);
        for (i = 0; i < keys.length; i++) {
            $key = keys[i];
            if (
            // Aurelia-specific:
            // Don't deep inspect html nodes, they are huge, have many irrelevant properties and make the diff unreadable
            (isNotNode || $key === 'textContent' || $key === 'outerHTML')
                // Aurelia-specific:
                // By convention we use $$calls for the CallCollection tracker, never deep inspect that as it's never relevant to the assertion
                && $key !== '$$calls') {
                output.push(formatProperty(ctx, value, recurseTimes, keys[i], extrasType));
            }
        }
    }
    catch (err) {
        return handleMaxCallStackSize(ctx, err, constructor, tag, indentationLvl);
    }
    ctx.seen.pop();
    if (ctx.sorted) {
        const comparator = ctx.sorted === true ? undefined : ctx.sorted;
        if (extrasType === kObjectType) {
            output.sort(comparator);
        }
        else if (keys.length > 1) {
            const sorted = output.slice(output.length - keys.length).sort(comparator);
            output.splice(output.length - keys.length, keys.length, ...sorted);
        }
    }
    let combine = false;
    if (isNumber(ctx.compact)) {
        // Memorize the original output length. In case the the output is grouped,
        // prevent lining up the entries on a single line.
        const entries = output.length;
        // Group array elements together if the array contains at least six separate
        // entries.
        if (extrasType === kArrayExtrasType && output.length > 6) {
            output = groupArrayElements(ctx, output);
        }
        // `ctx.currentDepth` is set to the most inner depth of the currently
        // inspected object part while `recurseTimes` is the actual current depth
        // that is inspected.
        //
        // Example:
        //
        // const a = { first: [ 1, 2, 3 ], second: { inner: [ 1, 2, 3 ] } }
        //
        // The deepest depth of `a` is 2 (a.second.inner) and `a.first` has a max
        // depth of 1.
        //
        // Consolidate all entries of the local most inner depth up to
        // `ctx.compact`, as long as the properties are smaller than
        // `ctx.breakLength`.
        if (ctx.currentDepth - recurseTimes < ctx.compact
            && entries === output.length) {
            combine = true;
        }
    }
    const res = reduceToSingleString(ctx, output, base, braces, combine);
    const budget = ctx.budget[ctx.indentationLvl] || 0;
    const newLength = budget + res.length;
    ctx.budget[ctx.indentationLvl] = newLength;
    if (newLength > 2 ** 27) {
        ctx.stop = true;
    }
    return res;
}
function formatValue(ctx, value, recurseTimes, typedArray) {
    if (typeof value !== 'object' && typeof value !== 'function') {
        return formatPrimitive(ctx.stylize, value, ctx);
    }
    if (value === null) {
        return ctx.stylize('null', 'null');
    }
    if (ctx.stop !== void 0) {
        const name = getConstructorName(value, ctx) || value[Symbol.toStringTag];
        return ctx.stylize(`[${name || 'Object'}]`, 'special');
    }
    if (ctx.customInspect) {
        const maybeCustom = value[customInspectSymbol];
        if (isFunction(maybeCustom)
            && maybeCustom !== inspect
            && !(value.constructor && value.constructor.prototype === value)) {
            const depth = ctx.depth === null ? null : ctx.depth - recurseTimes;
            const ret = maybeCustom.call(value, depth, getUserOptions(ctx));
            if (ret !== value) {
                if (!isString(ret)) {
                    return formatValue(ctx, ret, recurseTimes);
                }
                return ret.replace(/\n/g, `\n${' '.repeat(ctx.indentationLvl)}`);
            }
        }
    }
    if (ctx.seen.includes(value)) {
        return ctx.stylize('[Circular]', 'special');
    }
    return formatRaw(ctx, value, recurseTimes, typedArray);
}
function inspect(value, opts = {}) {
    const ctx = getInspectContext(opts);
    return formatValue(ctx, value, 0);
}
function inspectValue(val) {
    return inspect(val, {
        compact: false,
        customInspect: false,
        depth: 100,
        maxArrayLength: Infinity,
        showHidden: false,
        breakLength: Infinity,
        showProxy: false,
        sorted: true,
        getters: true,
    });
}

// Disabling this as it this is nowhere used. And also the ast-serialization infra is moved to validation package.
// export function verifyASTEqual(actual: any, expected: any, errors?: string[], path?: string): any {
//   if (expected == null) {
//     if (actual != null) {
//       assert.strictEqual(actual, null, `actual`);
//     }
//   } else if (actual == null) {
//     const expectedSerialized = Serializer.serialize(expected);
//     assert.strictEqual(actual, expectedSerialized, `actual`);
//   } else {
//     const expectedSerialized = Serializer.serialize(expected);
//     const expectedUnparsed = Unparser.unparse(expected);
//     const actualSerialized = Serializer.serialize(actual);
//     const actualUnparsed = Unparser.unparse(actual);
//     if (actualSerialized !== expectedSerialized) {
//       assert.strictEqual(actualSerialized, expectedSerialized, `actualSerialized`);
//     }
//     if (actualUnparsed !== expectedUnparsed) {
//       assert.strictEqual(actualUnparsed, expectedUnparsed, `actualUnparsed`);
//     }
//   }
// }
function verifyEqual(actual, expected, depth, property, index) {
    if (depth === undefined) {
        depth = 0;
    }
    if (typeof expected !== 'object' || expected === null) {
        assert.strictEqual(actual, expected, `actual, depth=${depth}, prop=${property}, index=${index}`);
        return;
    }
    if (expected instanceof Array) {
        for (let i = 0; i < expected.length; i++) {
            verifyEqual(actual[i], expected[i], depth + 1, property, i);
        }
        return;
    }
    if (expected.nodeType > 0) {
        if (expected.nodeType === 11) {
            for (let i = 0; i < expected.childNodes.length; i++) {
                verifyEqual(actual.childNodes.item(i), expected.childNodes.item(i), depth + 1, property, i);
            }
        }
        else {
            assert.strictEqual(actual.outerHTML, expected.outerHTML, `actual.outerHTML, depth=${depth}, prop=${property}, index=${index}`);
        }
        return;
    }
    if (actual) {
        assert.strictEqual(actual.constructor.name, expected.constructor.name, `actual.constructor.name, depth=${depth}, prop=${property}, index=${index}`);
        assert.strictEqual(actual.toString(), expected.toString(), `actual.toString(), depth=${depth}, prop=${property}, index=${index}`);
        for (const prop of Object.keys(expected)) {
            verifyEqual(actual[prop], expected[prop], depth + 1, prop, index);
        }
    }
}
function nextAncestor(host, node) {
    var _a, _b, _c;
    const parent = (_b = (_a = node.parentNode) !== null && _a !== void 0 ? _a : node.host) !== null && _b !== void 0 ? _b : null;
    if (parent === null || parent === host) {
        return null;
    }
    return (_c = parent.nextSibling) !== null && _c !== void 0 ? _c : nextAncestor(host, parent);
}
function nextNode(host, node) {
    var _a, _b, _c, _d, _e;
    return (_e = (_d = (_c = (_b = (_a = CustomElement.for(node, { optional: true })) === null || _a === void 0 ? void 0 : _a.shadowRoot) === null || _b === void 0 ? void 0 : _b.firstChild) !== null && _c !== void 0 ? _c : node.firstChild) !== null && _d !== void 0 ? _d : node.nextSibling) !== null && _e !== void 0 ? _e : nextAncestor(host, node);
}
function getVisibleText(host, removeWhiteSpace) {
    var _a, _b, _c;
    let text = '';
    let cur = (_c = (_b = (_a = CustomElement.for(host, { optional: true })) === null || _a === void 0 ? void 0 : _a.shadowRoot) === null || _b === void 0 ? void 0 : _b.firstChild) !== null && _c !== void 0 ? _c : host.firstChild;
    while (cur !== null) {
        if (cur.nodeType === 3 /* Text */) {
            text += cur.data;
        }
        cur = nextNode(host, cur);
    }
    return removeWhiteSpace && text ? text.replace(/\s\s+/g, ' ').trim() : text;
}
function instructionTypeName(type) {
    switch (type) {
        case "ha" /* textBinding */:
            return 'textBinding';
        case "rf" /* interpolation */:
            return 'interpolation';
        case "rg" /* propertyBinding */:
            return 'propertyBinding';
        case "rk" /* iteratorBinding */:
            return 'iteratorBinding';
        case "hb" /* listenerBinding */:
            return 'listenerBinding';
        case "rh" /* callBinding */:
            return 'callBinding';
        case "rj" /* refBinding */:
            return 'refBinding';
        case "hd" /* stylePropertyBinding */:
            return 'stylePropertyBinding';
        case "re" /* setProperty */:
            return 'setProperty';
        case "he" /* setAttribute */:
            return 'setAttribute';
        case "ra" /* hydrateElement */:
            return 'hydrateElement';
        case "rb" /* hydrateAttribute */:
            return 'hydrateAttribute';
        case "rc" /* hydrateTemplateController */:
            return 'hydrateTemplateController';
        case "rd" /* hydrateLetElement */:
            return 'hydrateLetElement';
        case "ri" /* letBinding */:
            return 'letBinding';
        default:
            return type;
    }
}
function verifyBindingInstructionsEqual(actual, expected, errors, path) {
    if (path === undefined) {
        path = 'instruction';
    }
    if (errors === undefined) {
        errors = [];
    }
    if (!(expected instanceof Object) || !(actual instanceof Object)) {
        if (actual !== expected) {
            // Special treatment for generated names (TODO: we *can* predict the values and we might want to at some point,
            // because this exception is essentially a loophole that will eventually somehow cause a bug to slip through)
            if (path.endsWith('.name')) {
                if (String(expected) === 'unnamed' && String(actual).startsWith('unnamed-')) {
                    errors.push(`OK   : ${path} === ${expected} (${actual})`);
                }
            }
            else if (path.endsWith('.key')) {
                if (String(expected).endsWith('unnamed') && /unnamed-\d+$/.test(String(actual))) {
                    errors.push(`OK   : ${path} === ${expected} (${actual})`);
                }
            }
            else {
                if (typeof expected === 'object' && expected != null) {
                    expected = JSON.stringify(expected);
                }
                if (typeof actual === 'object' && actual != null) {
                    actual = JSON.stringify(actual);
                }
                if (path.endsWith('type')) {
                    expected = instructionTypeName(expected);
                    actual = instructionTypeName(actual);
                }
                errors.push(`WRONG: ${path} === ${actual} (expected: ${expected})`);
            }
        }
        else {
            errors.push(`OK   : ${path} === ${expected}`);
        }
    }
    else if (expected instanceof Array) {
        for (let i = 0, ii = Math.max(expected.length, actual.length); i < ii; ++i) {
            verifyBindingInstructionsEqual(actual[i], expected[i], errors, `${path}[${i}]`);
        }
    }
    else if (expected.nodeType > 0) {
        if (expected.nodeType === 11) {
            for (let i = 0, ii = Math.max(expected.childNodes.length, actual.childNodes.length); i < ii; ++i) {
                verifyBindingInstructionsEqual(actual.childNodes.item(i), expected.childNodes.item(i), errors, `${path}.childNodes[${i}]`);
            }
        }
        else {
            if (actual.outerHTML !== expected['outerHTML']) {
                errors.push(`WRONG: ${path}.outerHTML === ${actual.outerHTML} (expected: ${expected['outerHTML']})`);
            }
            else {
                errors.push(`OK   : ${path}.outerHTML === ${expected}`);
            }
        }
    }
    else if (actual) {
        const seen = {};
        for (const prop in expected) {
            verifyBindingInstructionsEqual(actual[prop], expected[prop], errors, `${path}.${prop}`);
            seen[prop] = true;
        }
        for (const prop in actual) {
            if (!seen[prop]) {
                verifyBindingInstructionsEqual(actual[prop], expected[prop], errors, `${path}.${prop}`);
            }
        }
    }
    if (path === 'instruction' && errors.some(e => e.startsWith('W'))) {
        throw new Error(`Failed assertion: binding instruction mismatch\n  - ${errors.join('\n  - ')}`);
    }
}

function ensureTaskQueuesEmpty(platform) {
    if (!platform) {
        platform = BrowserPlatform.getOrCreate(globalThis);
    }
    // canceling pending heading to remove the sticky tasks
    platform.taskQueue.flush();
    platform.taskQueue['pending'].forEach((x) => x.cancel());
    platform.domWriteQueue.flush();
    platform.domWriteQueue['pending'].forEach((x) => x.cancel());
    platform.domReadQueue.flush();
    platform.domReadQueue['pending'].forEach((x) => x.cancel());
}

// Significant portion of this code is copy-pasted from the node.js source
const noException = Symbol('noException');
function innerFail(obj) {
    if (isError(obj.message)) {
        throw obj.message;
    }
    throw new AssertionError(obj);
}
function innerOk(fn, argLen, value, message) {
    if (!value) {
        let generatedMessage = false;
        if (argLen === 0) {
            generatedMessage = true;
            message = 'No value argument passed to `assert.ok()`';
        }
        else if (isError(message)) {
            throw message;
        }
        const err = new AssertionError({
            actual: value,
            expected: true,
            message,
            operator: '==',
            stackStartFn: fn
        });
        err.generatedMessage = generatedMessage;
        throw err;
    }
}
class Comparison {
    constructor(obj, keys, actual) {
        for (const key of keys) {
            if (key in obj) {
                if (!isUndefined(actual)
                    && isString(actual[key])
                    && isRegExp(obj[key])
                    && obj[key].test(actual[key])) {
                    this[key] = actual[key];
                }
                else {
                    this[key] = obj[key];
                }
            }
        }
    }
}
function compareExceptionKey(actual, expected, key, message, keys) {
    if (!(key in actual)
        || !isDeepStrictEqual(actual[key], expected[key])) {
        if (!message) {
            // Create placeholder objects to create a nice output.
            const a = new Comparison(actual, keys);
            const b = new Comparison(expected, keys, actual);
            const err = new AssertionError({
                actual: a,
                expected: b,
                operator: 'deepStrictEqual',
                stackStartFn: throws
            });
            err.actual = actual;
            err.expected = expected;
            err.operator = 'throws';
            throw err;
        }
        innerFail({
            actual,
            expected,
            message,
            operator: 'throws',
            stackStartFn: throws
        });
    }
}
function expectedException(actual, expected, msg) {
    if (!isFunction(expected)) {
        if (isRegExp(expected)) {
            return expected.test(actual);
        }
        if (isPrimitive(actual)) {
            const err = new AssertionError({
                actual,
                expected,
                message: msg,
                operator: 'deepStrictEqual',
                stackStartFn: throws
            });
            err.operator = 'throws';
            throw err;
        }
        const keys = Object_keys(expected);
        if (isError(expected)) {
            keys.push('name', 'message');
        }
        for (const key of keys) {
            if (isString(actual[key])
                && isRegExp(expected[key])
                && expected[key].test(actual[key])) {
                continue;
            }
            compareExceptionKey(actual, expected, key, msg, keys);
        }
        return true;
    }
    if (expected.prototype !== void 0 && actual instanceof expected) {
        return true;
    }
    if (Object.prototype.isPrototypeOf.call(Error, expected)) {
        return false;
    }
    return expected.call({}, actual) === true;
}
function getActual(fn) {
    try {
        fn();
    }
    catch (e) {
        return e;
    }
    return noException;
}
async function waitForActual(promiseFn) {
    let resultPromise;
    if (isFunction(promiseFn)) {
        resultPromise = promiseFn();
    }
    else {
        resultPromise = promiseFn;
    }
    try {
        await resultPromise;
    }
    catch (e) {
        return e;
    }
    return noException;
}
function expectsError(stackStartFn, actual, error, message) {
    if (isString(error)) {
        message = error;
        error = void 0;
    }
    if (actual === noException) {
        let details = '';
        if (error && error.name) {
            details += ` (${error.name})`;
        }
        details += message ? `: ${message}` : '.';
        const fnType = stackStartFn.name === 'rejects' ? 'rejection' : 'exception';
        innerFail({
            actual: undefined,
            expected: error,
            operator: stackStartFn.name,
            message: `Missing expected ${fnType}${details}`,
            stackStartFn
        });
    }
    if (error && expectedException(actual, error, message) === false) {
        throw actual;
    }
}
function expectsNoError(stackStartFn, actual, error, message) {
    if (actual === noException) {
        return;
    }
    if (isString(error)) {
        message = error;
        error = void 0;
    }
    if (!error || expectedException(actual, error)) {
        const details = message ? `: ${message}` : '.';
        const fnType = stackStartFn.name === 'doesNotReject' ? 'rejection' : 'exception';
        innerFail({
            actual,
            expected: error,
            operator: stackStartFn.name,
            message: `Got unwanted ${fnType}${details}\nActual message: "${actual && actual.message}"`,
            stackStartFn
        });
    }
    throw actual;
}
function throws(fn, errorMatcher, message) {
    expectsError(throws, getActual(fn), errorMatcher, message);
}
async function rejects(promiseFn, errorMatcher, message) {
    expectsError(rejects, await waitForActual(promiseFn), errorMatcher, message);
}
function doesNotThrow(fn, errorMatcher, message) {
    expectsNoError(doesNotThrow, getActual(fn), errorMatcher, message);
}
async function doesNotReject(promiseFn, errorMatcher, message) {
    expectsNoError(doesNotReject, await waitForActual(promiseFn), errorMatcher, message);
}
function ok(...args) {
    innerOk(ok, args.length, ...args);
}
function fail(message = 'Failed') {
    if (isError(message)) {
        throw message;
    }
    const err = new AssertionError({
        message,
        actual: void 0,
        expected: void 0,
        operator: 'fail',
        stackStartFn: fail,
    });
    err.generatedMessage = message === 'Failed';
    throw err;
}
function visibleTextEqual(host, expectedText, message) {
    const actualText = getVisibleText(host);
    if (actualText !== expectedText) {
        innerFail({
            actual: actualText,
            expected: expectedText,
            message,
            operator: '==',
            stackStartFn: visibleTextEqual
        });
    }
}
function equal(actual, expected, message) {
    if (actual != expected) {
        innerFail({
            actual,
            expected,
            message,
            operator: '==',
            stackStartFn: equal
        });
    }
}
function typeOf(actual, expected, message) {
    if (typeof actual !== expected) {
        innerFail({
            actual,
            expected,
            message,
            operator: 'typeof',
            stackStartFn: typeOf
        });
    }
}
function instanceOf(actual, expected, message) {
    if (!(actual instanceof expected)) {
        innerFail({
            actual,
            expected,
            message,
            operator: 'instanceOf',
            stackStartFn: instanceOf
        });
    }
}
function notInstanceOf(actual, expected, message) {
    if (actual instanceof expected) {
        innerFail({
            actual,
            expected,
            message,
            operator: 'notInstanceOf',
            stackStartFn: notInstanceOf
        });
    }
}
function includes(outer, inner, message) {
    if (!outer.includes(inner)) {
        innerFail({
            actual: outer,
            expected: inner,
            message,
            operator: 'includes',
            stackStartFn: includes
        });
    }
}
function notIncludes(outer, inner, message) {
    if (outer.includes(inner)) {
        innerFail({
            actual: outer,
            expected: inner,
            message,
            operator: 'notIncludes',
            stackStartFn: notIncludes
        });
    }
}
function contains(outer, inner, message) {
    if (!outer.contains(inner)) {
        innerFail({
            actual: outer,
            expected: inner,
            message,
            operator: 'contains',
            stackStartFn: contains
        });
    }
}
function notContains(outer, inner, message) {
    if (outer.contains(inner)) {
        innerFail({
            actual: outer,
            expected: inner,
            message,
            operator: 'notContains',
            stackStartFn: notContains
        });
    }
}
function greaterThan(left, right, message) {
    if (!(left > right)) {
        innerFail({
            actual: left,
            expected: right,
            message,
            operator: 'greaterThan',
            stackStartFn: greaterThan
        });
    }
}
function greaterThanOrEqualTo(left, right, message) {
    if (!(left >= right)) {
        innerFail({
            actual: left,
            expected: right,
            message,
            operator: 'greaterThanOrEqualTo',
            stackStartFn: greaterThanOrEqualTo
        });
    }
}
function lessThan(left, right, message) {
    if (!(left < right)) {
        innerFail({
            actual: left,
            expected: right,
            message,
            operator: 'lessThan',
            stackStartFn: lessThan
        });
    }
}
function lessThanOrEqualTo(left, right, message) {
    if (!(left <= right)) {
        innerFail({
            actual: left,
            expected: right,
            message,
            operator: 'lessThanOrEqualTo',
            stackStartFn: lessThanOrEqualTo
        });
    }
}
function notEqual(actual, expected, message) {
    if (actual == expected) {
        innerFail({
            actual,
            expected,
            message,
            operator: '!=',
            stackStartFn: notEqual
        });
    }
}
function deepEqual(actual, expected, message) {
    if (!isDeepEqual(actual, expected)) {
        innerFail({
            actual,
            expected,
            message,
            operator: 'deepEqual',
            stackStartFn: deepEqual
        });
    }
}
function notDeepEqual(actual, expected, message) {
    if (isDeepEqual(actual, expected)) {
        innerFail({
            actual,
            expected,
            message,
            operator: 'notDeepEqual',
            stackStartFn: notDeepEqual
        });
    }
}
function deepStrictEqual(actual, expected, message) {
    if (!isDeepStrictEqual(actual, expected)) {
        innerFail({
            actual,
            expected,
            message,
            operator: 'deepStrictEqual',
            stackStartFn: deepStrictEqual
        });
    }
}
function notDeepStrictEqual(actual, expected, message) {
    if (isDeepStrictEqual(actual, expected)) {
        innerFail({
            actual,
            expected,
            message,
            operator: 'notDeepStrictEqual',
            stackStartFn: notDeepStrictEqual
        });
    }
}
function strictEqual(actual, expected, message) {
    if (!Object_is(actual, expected)) {
        innerFail({
            actual,
            expected,
            message,
            operator: 'strictEqual',
            stackStartFn: strictEqual
        });
    }
}
function notStrictEqual(actual, expected, message) {
    if (Object_is(actual, expected)) {
        innerFail({
            actual,
            expected,
            message,
            operator: 'notStrictEqual',
            stackStartFn: notStrictEqual
        });
    }
}
function match(actual, regex, message) {
    if (!regex.test(actual)) {
        innerFail({
            actual,
            expected: regex,
            message,
            operator: 'match',
            stackStartFn: match
        });
    }
}
function notMatch(actual, regex, message) {
    if (regex.test(actual)) {
        innerFail({
            actual,
            expected: regex,
            message,
            operator: 'notMatch',
            stackStartFn: notMatch
        });
    }
}
function isCustomElementType(actual, message) {
    if (!CustomElement.isType(actual)) {
        innerFail({
            actual: false,
            expected: true,
            message,
            operator: 'isCustomElementType',
            stackStartFn: isCustomElementType
        });
    }
}
function isCustomAttributeType(actual, message) {
    if (!CustomAttribute.isType(actual)) {
        innerFail({
            actual: false,
            expected: true,
            message,
            operator: 'isCustomAttributeType',
            stackStartFn: isCustomElementType
        });
    }
}
function getNode(elementOrSelector, root = PLATFORM.document) {
    return typeof elementOrSelector === "string"
        ? root.querySelector(elementOrSelector)
        : elementOrSelector;
}
function isTextContentEqual(elementOrSelector, expectedText, message, root) {
    const host = getNode(elementOrSelector, root);
    const actualText = host && getVisibleText(host, true);
    if (actualText !== expectedText) {
        innerFail({
            actual: actualText,
            expected: expectedText,
            message,
            operator: '==',
            stackStartFn: isTextContentEqual
        });
    }
}
function isValueEqual(inputElementOrSelector, expected, message, root) {
    const input = getNode(inputElementOrSelector, root);
    const actual = input instanceof HTMLInputElement && input.value;
    if (actual !== expected) {
        innerFail({
            actual: actual,
            expected: expected,
            message,
            operator: '==',
            stackStartFn: isValueEqual
        });
    }
}
function isInnerHtmlEqual(elementOrSelector, expected, message, root, compact = true) {
    const node = getNode(elementOrSelector, root);
    let actual = node.innerHTML;
    if (compact) {
        actual = actual
            .replace(/<!--au-start-->/g, '')
            .replace(/<!--au-end-->/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }
    if (actual !== expected) {
        innerFail({
            actual,
            expected: expected,
            message,
            operator: '==',
            stackStartFn: isInnerHtmlEqual
        });
    }
}
function matchStyle(element, expectedStyles) {
    const styles = PLATFORM.window.getComputedStyle(element);
    for (const [property, expected] of Object.entries(expectedStyles)) {
        const actual = styles[property];
        if (actual !== expected) {
            return { isMatch: false, property, actual, expected };
        }
    }
    return { isMatch: true };
}
function computedStyle(element, expectedStyles, message) {
    const result = matchStyle(element, expectedStyles);
    if (!result.isMatch) {
        const { property, actual, expected } = result;
        innerFail({
            actual: `${property}:${actual}`,
            expected: `${property}:${expected}`,
            message,
            operator: '==',
            stackStartFn: computedStyle
        });
    }
}
function notComputedStyle(element, expectedStyles, message) {
    const result = matchStyle(element, expectedStyles);
    if (result.isMatch) {
        const display = Object.entries(expectedStyles).map(([key, value]) => `${key}:${value}`).join(',');
        innerFail({
            actual: display,
            expected: display,
            message,
            operator: '!=',
            stackStartFn: notComputedStyle
        });
    }
}
const areTaskQueuesEmpty = (function () {
    function round(num) {
        return ((num * 10 + .5) | 0) / 10;
    }
    function reportTask(task) {
        var _a;
        const id = task.id;
        const created = round(task.createdTime);
        const queue = round(task.queueTime);
        const preempt = task.preempt;
        const reusable = task.reusable;
        const persistent = task.persistent;
        const status = task.status;
        return `    task id=${id} createdTime=${created} queueTime=${queue} preempt=${preempt} reusable=${reusable} persistent=${persistent} status=${status}\n`
            + `    task callback="${(_a = task.callback) === null || _a === void 0 ? void 0 : _a.toString()}"`;
    }
    function reportTaskQueue(name, taskQueue) {
        const processing = taskQueue['processing'];
        const pending = taskQueue['pending'];
        const delayed = taskQueue['delayed'];
        const flushReq = taskQueue['flushRequested'];
        let info = `${name} has processing=${processing.length} pending=${pending.length} delayed=${delayed.length} flushRequested=${flushReq}\n\n`;
        if (processing.length > 0) {
            info += `  Tasks in processing:\n${processing.map(reportTask).join('')}`;
        }
        if (pending.length > 0) {
            info += `  Tasks in pending:\n${pending.map(reportTask).join('')}`;
        }
        if (delayed.length > 0) {
            info += `  Tasks in delayed:\n${delayed.map(reportTask).join('')}`;
        }
        return info;
    }
    return function $areTaskQueuesEmpty(clearBeforeThrow) {
        const platform = BrowserPlatform.getOrCreate(globalThis);
        const domWriteQueue = platform.domWriteQueue;
        const taskQueue = platform.taskQueue;
        const domReadQueue = platform.domReadQueue;
        let isEmpty = true;
        let message = '';
        if (!domWriteQueue.isEmpty) {
            message += `\n${reportTaskQueue('domWriteQueue', domWriteQueue)}\n\n`;
            isEmpty = false;
        }
        if (!taskQueue.isEmpty) {
            message += `\n${reportTaskQueue('taskQueue', taskQueue)}\n\n`;
            isEmpty = false;
        }
        if (!domReadQueue.isEmpty) {
            message += `\n${reportTaskQueue('domReadQueue', domReadQueue)}\n\n`;
            isEmpty = false;
        }
        if (!isEmpty) {
            if (clearBeforeThrow === true) {
                ensureTaskQueuesEmpty(platform);
            }
            innerFail({
                actual: void 0,
                expected: void 0,
                message,
                operator: '',
                stackStartFn: $areTaskQueuesEmpty
            });
        }
    };
})();
const assert = Object_freeze({
    throws,
    doesNotThrow,
    rejects,
    doesNotReject,
    ok,
    fail,
    equal,
    typeOf,
    instanceOf,
    notInstanceOf,
    includes,
    notIncludes,
    contains,
    notContains,
    greaterThan,
    greaterThanOrEqualTo,
    lessThan,
    lessThanOrEqualTo,
    notEqual,
    deepEqual,
    notDeepEqual,
    deepStrictEqual,
    notDeepStrictEqual,
    strictEqual,
    notStrictEqual,
    match,
    notMatch,
    visibleTextEqual,
    areTaskQueuesEmpty,
    isCustomElementType,
    isCustomAttributeType,
    strict: {
        deepEqual: deepStrictEqual,
        notDeepEqual: notDeepStrictEqual,
        equal: strictEqual,
        notEqual: notStrictEqual,
    },
    html: {
        textContent: isTextContentEqual,
        innerEqual: isInnerHtmlEqual,
        value: isValueEqual,
        computedStyle: computedStyle,
        notComputedStyle: notComputedStyle
    }
});

/* THIS IS AN AUTOGENERATED FILE.  DO NOT EDIT */
/**
 * This file is automatically generated by `mach devtools-css-db`. It contains
 * a static list of CSS properties that can be computed by Gecko. The actual script
 * to generate these files can be found at devtools/shared/css/generate-properties-db.js.
 */
/**
 * A list of CSS Properties and their various characteristics.
 */
const CSS_PROPERTIES = {
    'align-content': {
        'values': [
            'baseline',
            'center',
            'end',
            'first baseline',
            'flex-end',
            'flex-start',
            'inherit',
            'initial',
            'last baseline',
            'normal',
            'safe',
            'space-around',
            'space-between',
            'space-evenly',
            'start',
            'stretch',
            'unsafe',
            'unset'
        ]
    },
    'align-items': {
        'values': [
            'baseline',
            'center',
            'end',
            'first baseline',
            'flex-end',
            'flex-start',
            'inherit',
            'initial',
            'last baseline',
            'normal',
            'safe',
            'self-end',
            'self-start',
            'start',
            'stretch',
            'unsafe',
            'unset'
        ]
    },
    'align-self': {
        'values': [
            'auto',
            'baseline',
            'center',
            'end',
            'first baseline',
            'flex-end',
            'flex-start',
            'inherit',
            'initial',
            'last baseline',
            'normal',
            'safe',
            'self-end',
            'self-start',
            'start',
            'stretch',
            'unsafe',
            'unset'
        ]
    },
    'all': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'animation': {
        'values': [
            'alternate',
            'alternate-reverse',
            'backwards',
            'both',
            'cubic-bezier',
            'ease',
            'ease-in',
            'ease-in-out',
            'ease-out',
            'forwards',
            'frames',
            'infinite',
            'inherit',
            'initial',
            'linear',
            'none',
            'normal',
            'paused',
            'reverse',
            'running',
            'step-end',
            'step-start',
            'steps',
            'unset'
        ]
    },
    'animation-delay': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'animation-direction': {
        'values': [
            'alternate',
            'alternate-reverse',
            'inherit',
            'initial',
            'normal',
            'reverse',
            'unset'
        ]
    },
    'animation-duration': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'animation-fill-mode': {
        'values': [
            'backwards',
            'both',
            'forwards',
            'inherit',
            'initial',
            'none',
            'unset'
        ]
    },
    'animation-iteration-count': {
        'values': [
            'infinite',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'animation-name': {
        'values': [
            'inherit',
            'initial',
            'none',
            'unset'
        ]
    },
    'animation-play-state': {
        'values': [
            'inherit',
            'initial',
            'paused',
            'running',
            'unset'
        ]
    },
    'animation-timing-function': {
        'values': [
            'cubic-bezier',
            'ease',
            'ease-in',
            'ease-in-out',
            'ease-out',
            'frames',
            'inherit',
            'initial',
            'linear',
            'step-end',
            'step-start',
            'steps',
            'unset'
        ]
    },
    'backface-visibility': {
        'values': [
            'hidden',
            'inherit',
            'initial',
            'unset',
            'visible'
        ]
    },
    'background': {
        'values': [
            'COLOR',
            'auto',
            'border-box',
            'bottom',
            'center',
            'contain',
            'content-box',
            'cover',
            'currentColor',
            'fixed',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'left',
            'linear-gradient',
            'local',
            'no-repeat',
            'none',
            'padding-box',
            'radial-gradient',
            'repeat',
            'repeat-x',
            'repeat-y',
            'repeating-linear-gradient',
            'repeating-radial-gradient',
            'rgb',
            'rgba',
            'right',
            'round',
            'scroll',
            'space',
            'text',
            'top',
            'transparent',
            'unset',
            'url'
        ]
    },
    'background-attachment': {
        'values': [
            'fixed',
            'inherit',
            'initial',
            'local',
            'scroll',
            'unset'
        ]
    },
    'background-blend-mode': {
        'values': [
            'color',
            'color-burn',
            'color-dodge',
            'darken',
            'difference',
            'exclusion',
            'hard-light',
            'hue',
            'inherit',
            'initial',
            'lighten',
            'luminosity',
            'multiply',
            'normal',
            'overlay',
            'saturation',
            'screen',
            'soft-light',
            'unset'
        ]
    },
    'background-clip': {
        'values': [
            'border-box',
            'content-box',
            'inherit',
            'initial',
            'padding-box',
            'text',
            'unset'
        ]
    },
    'background-color': {
        'values': [
            'COLOR',
            'currentColor',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'rgb',
            'rgba',
            'transparent',
            'unset'
        ]
    },
    'background-image': {
        'values': [
            'inherit',
            'initial',
            'linear-gradient',
            'none',
            'radial-gradient',
            'repeating-linear-gradient',
            'repeating-radial-gradient',
            'unset',
            'url'
        ]
    },
    'background-origin': {
        'values': [
            'border-box',
            'content-box',
            'inherit',
            'initial',
            'padding-box',
            'unset'
        ]
    },
    'background-position': {
        'values': [
            'bottom',
            'center',
            'inherit',
            'initial',
            'left',
            'right',
            'top',
            'unset'
        ]
    },
    'background-position-x': {
        'values': [
            'center',
            'inherit',
            'initial',
            'left',
            'right',
            'unset'
        ]
    },
    'background-position-y': {
        'values': [
            'bottom',
            'center',
            'inherit',
            'initial',
            'top',
            'unset'
        ]
    },
    'background-repeat': {
        'values': [
            'inherit',
            'initial',
            'no-repeat',
            'repeat',
            'repeat-x',
            'repeat-y',
            'round',
            'space',
            'unset'
        ]
    },
    'background-size': {
        'values': [
            'auto',
            'contain',
            'cover',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'block-size': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'border': {
        'values': [
            'COLOR',
            'currentColor',
            'dashed',
            'dotted',
            'double',
            'groove',
            'hidden',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'inset',
            'medium',
            'none',
            'outset',
            'rgb',
            'rgba',
            'ridge',
            'solid',
            'thick',
            'thin',
            'transparent',
            'unset'
        ]
    },
    'border-block-end': {
        'values': [
            'COLOR',
            'currentColor',
            'dashed',
            'dotted',
            'double',
            'groove',
            'hidden',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'inset',
            'medium',
            'none',
            'outset',
            'rgb',
            'rgba',
            'ridge',
            'solid',
            'thick',
            'thin',
            'transparent',
            'unset'
        ]
    },
    'border-block-end-color': {
        'values': [
            'COLOR',
            'currentColor',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'rgb',
            'rgba',
            'transparent',
            'unset'
        ]
    },
    'border-block-end-style': {
        'values': [
            'dashed',
            'dotted',
            'double',
            'groove',
            'hidden',
            'inherit',
            'initial',
            'inset',
            'none',
            'outset',
            'ridge',
            'solid',
            'unset'
        ]
    },
    'border-block-end-width': {
        'values': [
            'inherit',
            'initial',
            'medium',
            'thick',
            'thin',
            'unset'
        ]
    },
    'border-block-start': {
        'values': [
            'COLOR',
            'currentColor',
            'dashed',
            'dotted',
            'double',
            'groove',
            'hidden',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'inset',
            'medium',
            'none',
            'outset',
            'rgb',
            'rgba',
            'ridge',
            'solid',
            'thick',
            'thin',
            'transparent',
            'unset'
        ]
    },
    'border-block-start-color': {
        'values': [
            'COLOR',
            'currentColor',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'rgb',
            'rgba',
            'transparent',
            'unset'
        ]
    },
    'border-block-start-style': {
        'values': [
            'dashed',
            'dotted',
            'double',
            'groove',
            'hidden',
            'inherit',
            'initial',
            'inset',
            'none',
            'outset',
            'ridge',
            'solid',
            'unset'
        ]
    },
    'border-block-start-width': {
        'values': [
            'inherit',
            'initial',
            'medium',
            'thick',
            'thin',
            'unset'
        ]
    },
    'border-bottom': {
        'values': [
            'COLOR',
            'currentColor',
            'dashed',
            'dotted',
            'double',
            'groove',
            'hidden',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'inset',
            'medium',
            'none',
            'outset',
            'rgb',
            'rgba',
            'ridge',
            'solid',
            'thick',
            'thin',
            'transparent',
            'unset'
        ]
    },
    'border-bottom-color': {
        'values': [
            'COLOR',
            'currentColor',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'rgb',
            'rgba',
            'transparent',
            'unset'
        ]
    },
    'border-bottom-left-radius': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'border-bottom-right-radius': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'border-bottom-style': {
        'values': [
            'dashed',
            'dotted',
            'double',
            'groove',
            'hidden',
            'inherit',
            'initial',
            'inset',
            'none',
            'outset',
            'ridge',
            'solid',
            'unset'
        ]
    },
    'border-bottom-width': {
        'values': [
            'inherit',
            'initial',
            'medium',
            'thick',
            'thin',
            'unset'
        ]
    },
    'border-collapse': {
        'values': [
            'collapse',
            'inherit',
            'initial',
            'separate',
            'unset'
        ]
    },
    'border-color': {
        'values': [
            'COLOR',
            'currentColor',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'rgb',
            'rgba',
            'transparent',
            'unset'
        ]
    },
    'border-image': {
        'values': [
            'auto',
            'fill',
            'inherit',
            'initial',
            'linear-gradient',
            'none',
            'radial-gradient',
            'repeat',
            'repeating-linear-gradient',
            'repeating-radial-gradient',
            'round',
            'space',
            'stretch',
            'unset',
            'url'
        ]
    },
    'border-image-outset': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'border-image-repeat': {
        'values': [
            'inherit',
            'initial',
            'repeat',
            'round',
            'space',
            'stretch',
            'unset'
        ]
    },
    'border-image-slice': {
        'values': [
            'fill',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'border-image-source': {
        'values': [
            'inherit',
            'initial',
            'linear-gradient',
            'none',
            'radial-gradient',
            'repeating-linear-gradient',
            'repeating-radial-gradient',
            'unset',
            'url'
        ]
    },
    'border-image-width': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'border-inline-end': {
        'values': [
            'COLOR',
            'currentColor',
            'dashed',
            'dotted',
            'double',
            'groove',
            'hidden',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'inset',
            'medium',
            'none',
            'outset',
            'rgb',
            'rgba',
            'ridge',
            'solid',
            'thick',
            'thin',
            'transparent',
            'unset'
        ]
    },
    'border-inline-end-color': {
        'values': [
            'COLOR',
            'currentColor',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'rgb',
            'rgba',
            'transparent',
            'unset'
        ]
    },
    'border-inline-end-style': {
        'values': [
            'dashed',
            'dotted',
            'double',
            'groove',
            'hidden',
            'inherit',
            'initial',
            'inset',
            'none',
            'outset',
            'ridge',
            'solid',
            'unset'
        ]
    },
    'border-inline-end-width': {
        'values': [
            'inherit',
            'initial',
            'medium',
            'thick',
            'thin',
            'unset'
        ]
    },
    'border-inline-start': {
        'values': [
            'COLOR',
            'currentColor',
            'dashed',
            'dotted',
            'double',
            'groove',
            'hidden',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'inset',
            'medium',
            'none',
            'outset',
            'rgb',
            'rgba',
            'ridge',
            'solid',
            'thick',
            'thin',
            'transparent',
            'unset'
        ]
    },
    'border-inline-start-color': {
        'values': [
            'COLOR',
            'currentColor',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'rgb',
            'rgba',
            'transparent',
            'unset'
        ]
    },
    'border-inline-start-style': {
        'values': [
            'dashed',
            'dotted',
            'double',
            'groove',
            'hidden',
            'inherit',
            'initial',
            'inset',
            'none',
            'outset',
            'ridge',
            'solid',
            'unset'
        ]
    },
    'border-inline-start-width': {
        'values': [
            'inherit',
            'initial',
            'medium',
            'thick',
            'thin',
            'unset'
        ]
    },
    'border-left': {
        'values': [
            'COLOR',
            'currentColor',
            'dashed',
            'dotted',
            'double',
            'groove',
            'hidden',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'inset',
            'medium',
            'none',
            'outset',
            'rgb',
            'rgba',
            'ridge',
            'solid',
            'thick',
            'thin',
            'transparent',
            'unset'
        ]
    },
    'border-left-color': {
        'values': [
            'COLOR',
            'currentColor',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'rgb',
            'rgba',
            'transparent',
            'unset'
        ]
    },
    'border-left-style': {
        'values': [
            'dashed',
            'dotted',
            'double',
            'groove',
            'hidden',
            'inherit',
            'initial',
            'inset',
            'none',
            'outset',
            'ridge',
            'solid',
            'unset'
        ]
    },
    'border-left-width': {
        'values': [
            'inherit',
            'initial',
            'medium',
            'thick',
            'thin',
            'unset'
        ]
    },
    'border-radius': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'border-right': {
        'values': [
            'COLOR',
            'currentColor',
            'dashed',
            'dotted',
            'double',
            'groove',
            'hidden',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'inset',
            'medium',
            'none',
            'outset',
            'rgb',
            'rgba',
            'ridge',
            'solid',
            'thick',
            'thin',
            'transparent',
            'unset'
        ]
    },
    'border-right-color': {
        'values': [
            'COLOR',
            'currentColor',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'rgb',
            'rgba',
            'transparent',
            'unset'
        ]
    },
    'border-right-style': {
        'values': [
            'dashed',
            'dotted',
            'double',
            'groove',
            'hidden',
            'inherit',
            'initial',
            'inset',
            'none',
            'outset',
            'ridge',
            'solid',
            'unset'
        ]
    },
    'border-right-width': {
        'values': [
            'inherit',
            'initial',
            'medium',
            'thick',
            'thin',
            'unset'
        ]
    },
    'border-spacing': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'border-style': {
        'values': [
            'dashed',
            'dotted',
            'double',
            'groove',
            'hidden',
            'inherit',
            'initial',
            'inset',
            'none',
            'outset',
            'ridge',
            'solid',
            'unset'
        ]
    },
    'border-top': {
        'values': [
            'COLOR',
            'currentColor',
            'dashed',
            'dotted',
            'double',
            'groove',
            'hidden',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'inset',
            'medium',
            'none',
            'outset',
            'rgb',
            'rgba',
            'ridge',
            'solid',
            'thick',
            'thin',
            'transparent',
            'unset'
        ]
    },
    'border-top-color': {
        'values': [
            'COLOR',
            'currentColor',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'rgb',
            'rgba',
            'transparent',
            'unset'
        ]
    },
    'border-top-left-radius': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'border-top-right-radius': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'border-top-style': {
        'values': [
            'dashed',
            'dotted',
            'double',
            'groove',
            'hidden',
            'inherit',
            'initial',
            'inset',
            'none',
            'outset',
            'ridge',
            'solid',
            'unset'
        ]
    },
    'border-top-width': {
        'values': [
            'inherit',
            'initial',
            'medium',
            'thick',
            'thin',
            'unset'
        ]
    },
    'border-width': {
        'values': [
            'inherit',
            'initial',
            'medium',
            'thick',
            'thin',
            'unset'
        ]
    },
    'bottom': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'box-decoration-break': {
        'values': [
            'clone',
            'inherit',
            'initial',
            'slice',
            'unset'
        ]
    },
    'box-shadow': {
        'values': [
            'COLOR',
            'currentColor',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'inset',
            'none',
            'rgb',
            'rgba',
            'transparent',
            'unset'
        ]
    },
    'box-sizing': {
        'values': [
            'border-box',
            'content-box',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'caption-side': {
        'values': [
            'bottom',
            'bottom-outside',
            'inherit',
            'initial',
            'left',
            'right',
            'top',
            'top-outside',
            'unset'
        ]
    },
    'caret-color': {
        'values': [
            'COLOR',
            'auto',
            'currentColor',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'rgb',
            'rgba',
            'transparent',
            'unset'
        ]
    },
    'clear': {
        'values': [
            'both',
            'inherit',
            'initial',
            'inline-end',
            'inline-start',
            'left',
            'none',
            'right',
            'unset'
        ]
    },
    'clip': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'rect',
            'unset'
        ]
    },
    'clip-path': {
        'values': [
            'border-box',
            'circle',
            'content-box',
            'ellipse',
            'fill-box',
            'inherit',
            'initial',
            'inset',
            'margin-box',
            'none',
            'padding-box',
            'polygon',
            'stroke-box',
            'unset',
            'url',
            'view-box'
        ]
    },
    'clip-rule': {
        'values': [
            'evenodd',
            'inherit',
            'initial',
            'nonzero',
            'unset'
        ]
    },
    'color': {
        'values': [
            'COLOR',
            'currentColor',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'rgb',
            'rgba',
            'transparent',
            'unset'
        ]
    },
    'color-adjust': {
        'values': [
            'economy',
            'exact',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'color-interpolation': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'linearrgb',
            'srgb',
            'unset'
        ]
    },
    'color-interpolation-filters': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'linearrgb',
            'srgb',
            'unset'
        ]
    },
    'column-count': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'column-fill': {
        'values': [
            'auto',
            'balance',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'column-gap': {
        'values': [
            'inherit',
            'initial',
            'normal',
            'unset'
        ]
    },
    'column-rule': {
        'values': [
            'COLOR',
            'currentColor',
            'dashed',
            'dotted',
            'double',
            'groove',
            'hidden',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'inset',
            'medium',
            'none',
            'outset',
            'rgb',
            'rgba',
            'ridge',
            'solid',
            'thick',
            'thin',
            'transparent',
            'unset'
        ]
    },
    'column-rule-color': {
        'values': [
            'COLOR',
            'currentColor',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'rgb',
            'rgba',
            'transparent',
            'unset'
        ]
    },
    'column-rule-style': {
        'values': [
            'dashed',
            'dotted',
            'double',
            'groove',
            'hidden',
            'inherit',
            'initial',
            'inset',
            'none',
            'outset',
            'ridge',
            'solid',
            'unset'
        ]
    },
    'column-rule-width': {
        'values': [
            'inherit',
            'initial',
            'medium',
            'thick',
            'thin',
            'unset'
        ]
    },
    'column-width': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'columns': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'content': {
        'values': [
            'attr',
            'close-quote',
            'counter',
            'counters',
            'inherit',
            'initial',
            'no-close-quote',
            'no-open-quote',
            'none',
            'normal',
            'open-quote',
            'unset',
            'url'
        ]
    },
    'counter-increment': {
        'values': [
            'inherit',
            'initial',
            'none',
            'unset'
        ]
    },
    'counter-reset': {
        'values': [
            'inherit',
            'initial',
            'none',
            'unset'
        ]
    },
    'cursor': {
        'values': [
            'alias',
            'all-scroll',
            'auto',
            'cell',
            'col-resize',
            'context-menu',
            'copy',
            'crosshair',
            'default',
            'e-resize',
            'ew-resize',
            'grab',
            'grabbing',
            'help',
            'inherit',
            'initial',
            'move',
            'n-resize',
            'ne-resize',
            'nesw-resize',
            'no-drop',
            'none',
            'not-allowed',
            'ns-resize',
            'nw-resize',
            'nwse-resize',
            'pointer',
            'progress',
            'row-resize',
            's-resize',
            'se-resize',
            'sw-resize',
            'text',
            'unset',
            'url',
            'vertical-text',
            'w-resize',
            'wait',
            'zoom-in',
            'zoom-out'
        ]
    },
    'direction': {
        'values': [
            'inherit',
            'initial',
            'ltr',
            'rtl',
            'unset'
        ]
    },
    'display': {
        'values': [
            'block',
            'contents',
            'flex',
            'flow-root',
            'grid',
            'inherit',
            'initial',
            'inline',
            'inline-block',
            'inline-flex',
            'inline-grid',
            'inline-table',
            'list-item',
            'none',
            'ruby',
            'ruby-base',
            'ruby-base-container',
            'ruby-text',
            'ruby-text-container',
            'table',
            'table-caption',
            'table-cell',
            'table-column',
            'table-column-group',
            'table-footer-group',
            'table-header-group',
            'table-row',
            'table-row-group',
            'unset'
        ]
    },
    'dominant-baseline': {
        'values': [
            'alphabetic',
            'auto',
            'central',
            'hanging',
            'ideographic',
            'inherit',
            'initial',
            'mathematical',
            'middle',
            'no-change',
            'reset-size',
            'text-after-edge',
            'text-before-edge',
            'unset',
            'use-script'
        ]
    },
    'empty-cells': {
        'values': [
            'hide',
            'inherit',
            'initial',
            'show',
            'unset'
        ]
    },
    'fill': {
        'values': [
            'COLOR',
            'context-fill',
            'context-stroke',
            'currentColor',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'none',
            'rgb',
            'rgba',
            'transparent',
            'unset',
            'url'
        ]
    },
    'fill-opacity': {
        'values': [
            'context-fill-opacity',
            'context-stroke-opacity',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'fill-rule': {
        'values': [
            'evenodd',
            'inherit',
            'initial',
            'nonzero',
            'unset'
        ]
    },
    'filter': {
        'values': [
            'blur',
            'brightness',
            'contrast',
            'drop-shadow',
            'grayscale',
            'hue-rotate',
            'inherit',
            'initial',
            'invert',
            'none',
            'opacity',
            'saturate',
            'sepia',
            'unset',
            'url'
        ]
    },
    'flex': {
        'values': [
            'auto',
            'content',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'flex-basis': {
        'values': [
            'auto',
            'content',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'flex-direction': {
        'values': [
            'column',
            'column-reverse',
            'inherit',
            'initial',
            'row',
            'row-reverse',
            'unset'
        ]
    },
    'flex-flow': {
        'values': [
            'column',
            'column-reverse',
            'inherit',
            'initial',
            'nowrap',
            'row',
            'row-reverse',
            'unset',
            'wrap',
            'wrap-reverse'
        ]
    },
    'flex-grow': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'flex-shrink': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'flex-wrap': {
        'values': [
            'inherit',
            'initial',
            'nowrap',
            'unset',
            'wrap',
            'wrap-reverse'
        ]
    },
    'float': {
        'values': [
            'inherit',
            'initial',
            'inline-end',
            'inline-start',
            'left',
            'none',
            'right',
            'unset'
        ]
    },
    'flood-color': {
        'values': [
            'COLOR',
            'currentColor',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'rgb',
            'rgba',
            'transparent',
            'unset'
        ]
    },
    'flood-opacity': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'font': {
        'values': [
            'all-petite-caps',
            'all-small-caps',
            'bold',
            'bolder',
            'caption',
            'condensed',
            'expanded',
            'extra-condensed',
            'extra-expanded',
            'icon',
            'inherit',
            'initial',
            'italic',
            'large',
            'larger',
            'lighter',
            'medium',
            'menu',
            'message-box',
            'normal',
            'oblique',
            'petite-caps',
            'semi-condensed',
            'semi-expanded',
            'small',
            'small-caps',
            'small-caption',
            'smaller',
            'status-bar',
            'titling-caps',
            'ultra-condensed',
            'ultra-expanded',
            'unicase',
            'unset',
            'x-large',
            'x-small',
            'xx-large',
            'xx-small'
        ]
    },
    'font-family': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'font-feature-settings': {
        'values': [
            'inherit',
            'initial',
            'normal',
            'unset'
        ]
    },
    'font-kerning': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'none',
            'normal',
            'unset'
        ]
    },
    'font-language-override': {
        'values': [
            'inherit',
            'initial',
            'normal',
            'unset'
        ]
    },
    'font-optical-sizing': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'none',
            'unset'
        ]
    },
    'font-size': {
        'values': [
            'inherit',
            'initial',
            'large',
            'larger',
            'medium',
            'small',
            'smaller',
            'unset',
            'x-large',
            'x-small',
            'xx-large',
            'xx-small'
        ]
    },
    'font-size-adjust': {
        'values': [
            'inherit',
            'initial',
            'none',
            'unset'
        ]
    },
    'font-stretch': {
        'values': [
            'condensed',
            'expanded',
            'extra-condensed',
            'extra-expanded',
            'inherit',
            'initial',
            'normal',
            'semi-condensed',
            'semi-expanded',
            'ultra-condensed',
            'ultra-expanded',
            'unset'
        ]
    },
    'font-style': {
        'values': [
            'inherit',
            'initial',
            'italic',
            'normal',
            'oblique',
            'unset'
        ]
    },
    'font-synthesis': {
        'values': [
            'inherit',
            'initial',
            'style',
            'unset',
            'weight'
        ]
    },
    'font-variant': {
        'values': [
            'all-petite-caps',
            'all-small-caps',
            'annotation',
            'character-variant',
            'common-ligatures',
            'contextual',
            'diagonal-fractions',
            'discretionary-ligatures',
            'full-width',
            'historical-forms',
            'historical-ligatures',
            'inherit',
            'initial',
            'jis04',
            'jis78',
            'jis83',
            'jis90',
            'lining-nums',
            'no-common-ligatures',
            'no-contextual',
            'no-discretionary-ligatures',
            'no-historical-ligatures',
            'none',
            'normal',
            'oldstyle-nums',
            'ordinal',
            'ornaments',
            'petite-caps',
            'proportional-nums',
            'proportional-width',
            'ruby',
            'simplified',
            'slashed-zero',
            'small-caps',
            'stacked-fractions',
            'styleset',
            'stylistic',
            'sub',
            'super',
            'swash',
            'tabular-nums',
            'titling-caps',
            'traditional',
            'unicase',
            'unset'
        ]
    },
    'font-variant-alternates': {
        'values': [
            'annotation',
            'character-variant',
            'historical-forms',
            'inherit',
            'initial',
            'normal',
            'ornaments',
            'styleset',
            'stylistic',
            'swash',
            'unset'
        ]
    },
    'font-variant-caps': {
        'values': [
            'all-petite-caps',
            'all-small-caps',
            'inherit',
            'initial',
            'normal',
            'petite-caps',
            'small-caps',
            'titling-caps',
            'unicase',
            'unset'
        ]
    },
    'font-variant-east-asian': {
        'values': [
            'full-width',
            'inherit',
            'initial',
            'jis04',
            'jis78',
            'jis83',
            'jis90',
            'normal',
            'proportional-width',
            'ruby',
            'simplified',
            'traditional',
            'unset'
        ]
    },
    'font-variant-ligatures': {
        'values': [
            'common-ligatures',
            'contextual',
            'discretionary-ligatures',
            'historical-ligatures',
            'inherit',
            'initial',
            'no-common-ligatures',
            'no-contextual',
            'no-discretionary-ligatures',
            'no-historical-ligatures',
            'none',
            'normal',
            'unset'
        ]
    },
    'font-variant-numeric': {
        'values': [
            'diagonal-fractions',
            'inherit',
            'initial',
            'lining-nums',
            'normal',
            'oldstyle-nums',
            'ordinal',
            'proportional-nums',
            'slashed-zero',
            'stacked-fractions',
            'tabular-nums',
            'unset'
        ]
    },
    'font-variant-position': {
        'values': [
            'inherit',
            'initial',
            'normal',
            'sub',
            'super',
            'unset'
        ]
    },
    'font-variation-settings': {
        'values': [
            'inherit',
            'initial',
            'normal',
            'unset'
        ]
    },
    'font-weight': {
        'values': [
            'bold',
            'bolder',
            'inherit',
            'initial',
            'lighter',
            'normal',
            'unset'
        ]
    },
    'gap': {
        'values': [
            'inherit',
            'initial',
            'normal',
            'unset'
        ]
    },
    'grid': {
        'values': [
            'auto',
            'column',
            'dense',
            'fit-content',
            'inherit',
            'initial',
            'max-content',
            'min-content',
            'minmax',
            'none',
            'repeat',
            'row',
            'unset'
        ]
    },
    'grid-area': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'grid-auto-columns': {
        'values': [
            'auto',
            'fit-content',
            'inherit',
            'initial',
            'max-content',
            'min-content',
            'minmax',
            'unset'
        ]
    },
    'grid-auto-flow': {
        'values': [
            'column',
            'dense',
            'inherit',
            'initial',
            'row',
            'unset'
        ]
    },
    'grid-auto-rows': {
        'values': [
            'auto',
            'fit-content',
            'inherit',
            'initial',
            'max-content',
            'min-content',
            'minmax',
            'unset'
        ]
    },
    'grid-column': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'grid-column-end': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'grid-column-gap': {
        'values': [
            'inherit',
            'initial',
            'normal',
            'unset'
        ]
    },
    'grid-column-start': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'grid-gap': {
        'values': [
            'inherit',
            'initial',
            'normal',
            'unset'
        ]
    },
    'grid-row': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'grid-row-end': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'grid-row-gap': {
        'values': [
            'inherit',
            'initial',
            'normal',
            'unset'
        ]
    },
    'grid-row-start': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'grid-template': {
        'values': [
            'auto',
            'fit-content',
            'inherit',
            'initial',
            'max-content',
            'min-content',
            'minmax',
            'none',
            'repeat',
            'unset'
        ]
    },
    'grid-template-areas': {
        'values': [
            'inherit',
            'initial',
            'none',
            'unset'
        ]
    },
    'grid-template-columns': {
        'values': [
            'auto',
            'fit-content',
            'inherit',
            'initial',
            'max-content',
            'min-content',
            'minmax',
            'none',
            'repeat',
            'unset'
        ]
    },
    'grid-template-rows': {
        'values': [
            'auto',
            'fit-content',
            'inherit',
            'initial',
            'max-content',
            'min-content',
            'minmax',
            'none',
            'repeat',
            'unset'
        ]
    },
    'height': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'hyphens': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'manual',
            'none',
            'unset'
        ]
    },
    'image-orientation': {
        'values': [
            'from-image',
            'inherit',
            'initial',
            'none',
            'unset'
        ]
    },
    'image-rendering': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'optimizequality',
            'optimizespeed',
            'unset'
        ]
    },
    'ime-mode': {
        'values': [
            'active',
            'auto',
            'disabled',
            'inactive',
            'inherit',
            'initial',
            'normal',
            'unset'
        ]
    },
    'inline-size': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'inset-block-end': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'inset-block-start': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'inset-inline-end': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'inset-inline-start': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'isolation': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'isolate',
            'unset'
        ]
    },
    'justify-content': {
        'values': [
            'center',
            'end',
            'flex-end',
            'flex-start',
            'inherit',
            'initial',
            'left',
            'normal',
            'right',
            'safe',
            'space-around',
            'space-between',
            'space-evenly',
            'start',
            'stretch',
            'unsafe',
            'unset'
        ]
    },
    'justify-items': {
        'values': [
            'baseline',
            'center',
            'end',
            'first baseline',
            'flex-end',
            'flex-start',
            'inherit',
            'initial',
            'last baseline',
            'left',
            'legacy',
            'normal',
            'right',
            'safe',
            'self-end',
            'self-start',
            'start',
            'stretch',
            'unsafe',
            'unset'
        ]
    },
    'justify-self': {
        'values': [
            'auto',
            'baseline',
            'center',
            'end',
            'first baseline',
            'flex-end',
            'flex-start',
            'inherit',
            'initial',
            'last baseline',
            'left',
            'normal',
            'right',
            'safe',
            'self-end',
            'self-start',
            'start',
            'stretch',
            'unsafe',
            'unset'
        ]
    },
    'left': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'letter-spacing': {
        'values': [
            'inherit',
            'initial',
            'normal',
            'unset'
        ]
    },
    'lighting-color': {
        'values': [
            'COLOR',
            'currentColor',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'rgb',
            'rgba',
            'transparent',
            'unset'
        ]
    },
    'line-height': {
        'values': [
            'inherit',
            'initial',
            'normal',
            'unset'
        ]
    },
    'list-style': {
        'values': [
            'arabic-indic',
            'armenian',
            'bengali',
            'cambodian',
            'circle',
            'cjk-decimal',
            'cjk-earthly-branch',
            'cjk-heavenly-stem',
            'cjk-ideographic',
            'decimal',
            'decimal-leading-zero',
            'devanagari',
            'disc',
            'disclosure-closed',
            'disclosure-open',
            'ethiopic-numeric',
            'georgian',
            'gujarati',
            'gurmukhi',
            'hebrew',
            'hiragana',
            'hiragana-iroha',
            'inherit',
            'initial',
            'inside',
            'japanese-formal',
            'japanese-informal',
            'kannada',
            'katakana',
            'katakana-iroha',
            'khmer',
            'korean-hangul-formal',
            'korean-hanja-formal',
            'korean-hanja-informal',
            'lao',
            'lower-alpha',
            'lower-armenian',
            'lower-greek',
            'lower-latin',
            'lower-roman',
            'malayalam',
            'mongolian',
            'myanmar',
            'none',
            'oriya',
            'outside',
            'persian',
            'simp-chinese-formal',
            'simp-chinese-informal',
            'square',
            'symbols',
            'tamil',
            'telugu',
            'thai',
            'tibetan',
            'trad-chinese-formal',
            'trad-chinese-informal',
            'unset',
            'upper-alpha',
            'upper-armenian',
            'upper-latin',
            'upper-roman',
            'url'
        ]
    },
    'list-style-image': {
        'values': [
            'inherit',
            'initial',
            'none',
            'unset',
            'url'
        ]
    },
    'list-style-position': {
        'values': [
            'inherit',
            'initial',
            'inside',
            'outside',
            'unset'
        ]
    },
    'list-style-type': {
        'values': [
            'arabic-indic',
            'armenian',
            'bengali',
            'cambodian',
            'circle',
            'cjk-decimal',
            'cjk-earthly-branch',
            'cjk-heavenly-stem',
            'cjk-ideographic',
            'decimal',
            'decimal-leading-zero',
            'devanagari',
            'disc',
            'disclosure-closed',
            'disclosure-open',
            'ethiopic-numeric',
            'georgian',
            'gujarati',
            'gurmukhi',
            'hebrew',
            'hiragana',
            'hiragana-iroha',
            'inherit',
            'initial',
            'japanese-formal',
            'japanese-informal',
            'kannada',
            'katakana',
            'katakana-iroha',
            'khmer',
            'korean-hangul-formal',
            'korean-hanja-formal',
            'korean-hanja-informal',
            'lao',
            'lower-alpha',
            'lower-armenian',
            'lower-greek',
            'lower-latin',
            'lower-roman',
            'malayalam',
            'mongolian',
            'myanmar',
            'none',
            'oriya',
            'persian',
            'simp-chinese-formal',
            'simp-chinese-informal',
            'square',
            'symbols',
            'tamil',
            'telugu',
            'thai',
            'tibetan',
            'trad-chinese-formal',
            'trad-chinese-informal',
            'unset',
            'upper-alpha',
            'upper-armenian',
            'upper-latin',
            'upper-roman'
        ]
    },
    'margin': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'margin-block-end': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'margin-block-start': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'margin-bottom': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'margin-inline-end': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'margin-inline-start': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'margin-left': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'margin-right': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'margin-top': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'marker': {
        'values': [
            'inherit',
            'initial',
            'none',
            'unset',
            'url'
        ]
    },
    'marker-end': {
        'values': [
            'inherit',
            'initial',
            'none',
            'unset',
            'url'
        ]
    },
    'marker-mid': {
        'values': [
            'inherit',
            'initial',
            'none',
            'unset',
            'url'
        ]
    },
    'marker-start': {
        'values': [
            'inherit',
            'initial',
            'none',
            'unset',
            'url'
        ]
    },
    'mask': {
        'values': [
            'add',
            'alpha',
            'auto',
            'border-box',
            'bottom',
            'center',
            'contain',
            'content-box',
            'cover',
            'exclude',
            'fill-box',
            'inherit',
            'initial',
            'intersect',
            'left',
            'linear-gradient',
            'luminance',
            'match-source',
            'no-clip',
            'no-repeat',
            'none',
            'padding-box',
            'radial-gradient',
            'repeat',
            'repeat-x',
            'repeat-y',
            'repeating-linear-gradient',
            'repeating-radial-gradient',
            'right',
            'round',
            'space',
            'stroke-box',
            'subtract',
            'top',
            'unset',
            'url',
            'view-box'
        ]
    },
    'mask-clip': {
        'values': [
            'border-box',
            'content-box',
            'fill-box',
            'inherit',
            'initial',
            'no-clip',
            'padding-box',
            'stroke-box',
            'unset',
            'view-box'
        ]
    },
    'mask-composite': {
        'values': [
            'add',
            'exclude',
            'inherit',
            'initial',
            'intersect',
            'subtract',
            'unset'
        ]
    },
    'mask-image': {
        'values': [
            'inherit',
            'initial',
            'linear-gradient',
            'none',
            'radial-gradient',
            'repeating-linear-gradient',
            'repeating-radial-gradient',
            'unset',
            'url'
        ]
    },
    'mask-mode': {
        'values': [
            'alpha',
            'inherit',
            'initial',
            'luminance',
            'match-source',
            'unset'
        ]
    },
    'mask-origin': {
        'values': [
            'border-box',
            'content-box',
            'fill-box',
            'inherit',
            'initial',
            'padding-box',
            'stroke-box',
            'unset',
            'view-box'
        ]
    },
    'mask-position': {
        'values': [
            'bottom',
            'center',
            'inherit',
            'initial',
            'left',
            'right',
            'top',
            'unset'
        ]
    },
    'mask-position-x': {
        'values': [
            'center',
            'inherit',
            'initial',
            'left',
            'right',
            'unset'
        ]
    },
    'mask-position-y': {
        'values': [
            'bottom',
            'center',
            'inherit',
            'initial',
            'top',
            'unset'
        ]
    },
    'mask-repeat': {
        'values': [
            'inherit',
            'initial',
            'no-repeat',
            'repeat',
            'repeat-x',
            'repeat-y',
            'round',
            'space',
            'unset'
        ]
    },
    'mask-size': {
        'values': [
            'auto',
            'contain',
            'cover',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'mask-type': {
        'values': [
            'alpha',
            'inherit',
            'initial',
            'luminance',
            'unset'
        ]
    },
    'max-block-size': {
        'values': [
            'inherit',
            'initial',
            'none',
            'unset'
        ]
    },
    'max-height': {
        'values': [
            'inherit',
            'initial',
            'none',
            'unset'
        ]
    },
    'max-inline-size': {
        'values': [
            'inherit',
            'initial',
            'none',
            'unset'
        ]
    },
    'max-width': {
        'values': [
            'inherit',
            'initial',
            'none',
            'unset'
        ]
    },
    'min-block-size': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'min-height': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'min-inline-size': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'min-width': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'mix-blend-mode': {
        'values': [
            'color',
            'color-burn',
            'color-dodge',
            'darken',
            'difference',
            'exclusion',
            'hard-light',
            'hue',
            'inherit',
            'initial',
            'lighten',
            'luminosity',
            'multiply',
            'normal',
            'overlay',
            'saturation',
            'screen',
            'soft-light',
            'unset'
        ]
    },
    'object-fit': {
        'values': [
            'contain',
            'cover',
            'fill',
            'inherit',
            'initial',
            'none',
            'scale-down',
            'unset'
        ]
    },
    'object-position': {
        'values': [
            'bottom',
            'center',
            'inherit',
            'initial',
            'left',
            'right',
            'top',
            'unset'
        ]
    },
    'opacity': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'order': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'outline': {
        'values': [
            'COLOR',
            'auto',
            'currentColor',
            'dashed',
            'dotted',
            'double',
            'groove',
            'hidden',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'inset',
            'medium',
            'none',
            'outset',
            'rgb',
            'rgba',
            'ridge',
            'solid',
            'thick',
            'thin',
            'transparent',
            'unset'
        ]
    },
    'outline-color': {
        'values': [
            'COLOR',
            'currentColor',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'rgb',
            'rgba',
            'transparent',
            'unset'
        ]
    },
    'outline-offset': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'outline-style': {
        'values': [
            'auto',
            'dashed',
            'dotted',
            'double',
            'groove',
            'hidden',
            'inherit',
            'initial',
            'inset',
            'none',
            'outset',
            'ridge',
            'solid',
            'unset'
        ]
    },
    'outline-width': {
        'values': [
            'inherit',
            'initial',
            'medium',
            'thick',
            'thin',
            'unset'
        ]
    },
    'overflow': {
        'values': [
            'auto',
            'hidden',
            'inherit',
            'initial',
            'scroll',
            'unset',
            'visible'
        ]
    },
    'overflow-wrap': {
        'values': [
            'break-word',
            'inherit',
            'initial',
            'normal',
            'unset'
        ]
    },
    'overflow-x': {
        'values': [
            'auto',
            'hidden',
            'inherit',
            'initial',
            'scroll',
            'unset',
            'visible'
        ]
    },
    'overflow-y': {
        'values': [
            'auto',
            'hidden',
            'inherit',
            'initial',
            'scroll',
            'unset',
            'visible'
        ]
    },
    'overscroll-behavior': {
        'values': [
            'auto',
            'contain',
            'inherit',
            'initial',
            'none',
            'unset'
        ]
    },
    'overscroll-behavior-x': {
        'values': [
            'auto',
            'contain',
            'inherit',
            'initial',
            'none',
            'unset'
        ]
    },
    'overscroll-behavior-y': {
        'values': [
            'auto',
            'contain',
            'inherit',
            'initial',
            'none',
            'unset'
        ]
    },
    'padding': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'padding-block-end': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'padding-block-start': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'padding-bottom': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'padding-inline-end': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'padding-inline-start': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'padding-left': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'padding-right': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'padding-top': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'page-break-after': {
        'values': [
            'always',
            'auto',
            'avoid',
            'inherit',
            'initial',
            'left',
            'right',
            'unset'
        ]
    },
    'page-break-before': {
        'values': [
            'always',
            'auto',
            'avoid',
            'inherit',
            'initial',
            'left',
            'right',
            'unset'
        ]
    },
    'page-break-inside': {
        'values': [
            'auto',
            'avoid',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'paint-order': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'perspective': {
        'values': [
            'inherit',
            'initial',
            'none',
            'unset'
        ]
    },
    'perspective-origin': {
        'values': [
            'bottom',
            'center',
            'inherit',
            'initial',
            'left',
            'right',
            'top',
            'unset'
        ]
    },
    'place-content': {
        'values': [
            'baseline',
            'center',
            'end',
            'first baseline',
            'flex-end',
            'flex-start',
            'inherit',
            'initial',
            'last baseline',
            'left',
            'normal',
            'right',
            'safe',
            'space-around',
            'space-between',
            'space-evenly',
            'start',
            'stretch',
            'unsafe',
            'unset'
        ]
    },
    'place-items': {
        'values': [
            'baseline',
            'center',
            'end',
            'first baseline',
            'flex-end',
            'flex-start',
            'inherit',
            'initial',
            'last baseline',
            'left',
            'legacy',
            'normal',
            'right',
            'safe',
            'self-end',
            'self-start',
            'start',
            'stretch',
            'unsafe',
            'unset'
        ]
    },
    'place-self': {
        'values': [
            'auto',
            'baseline',
            'center',
            'end',
            'first baseline',
            'flex-end',
            'flex-start',
            'inherit',
            'initial',
            'last baseline',
            'left',
            'normal',
            'right',
            'safe',
            'self-end',
            'self-start',
            'start',
            'stretch',
            'unsafe',
            'unset'
        ]
    },
    'pointer-events': {
        'values': [
            'all',
            'auto',
            'fill',
            'inherit',
            'initial',
            'none',
            'painted',
            'stroke',
            'unset',
            'visible',
            'visiblefill',
            'visiblepainted',
            'visiblestroke'
        ]
    },
    'position': {
        'values': [
            'absolute',
            'fixed',
            'inherit',
            'initial',
            'relative',
            'static',
            'sticky',
            'unset'
        ]
    },
    'quotes': {
        'values': [
            'inherit',
            'initial',
            'none',
            'unset'
        ]
    },
    'resize': {
        'values': [
            'block',
            'both',
            'horizontal',
            'inherit',
            'initial',
            'inline',
            'none',
            'unset',
            'vertical'
        ]
    },
    'right': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'row-gap': {
        'values': [
            'inherit',
            'initial',
            'normal',
            'unset'
        ]
    },
    'ruby-align': {
        'values': [
            'center',
            'inherit',
            'initial',
            'space-around',
            'space-between',
            'start',
            'unset'
        ]
    },
    'ruby-position': {
        'values': [
            'inherit',
            'initial',
            'over',
            'under',
            'unset'
        ]
    },
    'scroll-behavior': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'smooth',
            'unset'
        ]
    },
    'scroll-snap-coordinate': {
        'values': [
            'bottom',
            'center',
            'inherit',
            'initial',
            'left',
            'none',
            'right',
            'top',
            'unset'
        ]
    },
    'scroll-snap-destination': {
        'values': [
            'bottom',
            'center',
            'inherit',
            'initial',
            'left',
            'right',
            'top',
            'unset'
        ]
    },
    'scroll-snap-points-x': {
        'values': [
            'inherit',
            'initial',
            'none',
            'repeat',
            'unset'
        ]
    },
    'scroll-snap-points-y': {
        'values': [
            'inherit',
            'initial',
            'none',
            'repeat',
            'unset'
        ]
    },
    'scroll-snap-type': {
        'values': [
            'inherit',
            'initial',
            'mandatory',
            'none',
            'proximity',
            'unset'
        ]
    },
    'scroll-snap-type-x': {
        'values': [
            'inherit',
            'initial',
            'mandatory',
            'none',
            'proximity',
            'unset'
        ]
    },
    'scroll-snap-type-y': {
        'values': [
            'inherit',
            'initial',
            'mandatory',
            'none',
            'proximity',
            'unset'
        ]
    },
    'shape-image-threshold': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'shape-margin': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'shape-outside': {
        'values': [
            'border-box',
            'circle',
            'content-box',
            'ellipse',
            'inherit',
            'initial',
            'inset',
            'linear-gradient',
            'margin-box',
            'none',
            'padding-box',
            'polygon',
            'radial-gradient',
            'repeating-linear-gradient',
            'repeating-radial-gradient',
            'unset',
            'url'
        ]
    },
    'shape-rendering': {
        'values': [
            'auto',
            'crispedges',
            'geometricprecision',
            'inherit',
            'initial',
            'optimizespeed',
            'unset'
        ]
    },
    'stop-color': {
        'values': [
            'COLOR',
            'currentColor',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'rgb',
            'rgba',
            'transparent',
            'unset'
        ]
    },
    'stop-opacity': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'stroke': {
        'values': [
            'COLOR',
            'context-fill',
            'context-stroke',
            'currentColor',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'none',
            'rgb',
            'rgba',
            'transparent',
            'unset',
            'url'
        ]
    },
    'stroke-dasharray': {
        'values': [
            'context-value',
            'inherit',
            'initial',
            'none',
            'unset'
        ]
    },
    'stroke-dashoffset': {
        'values': [
            'context-value',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'stroke-linecap': {
        'values': [
            'butt',
            'inherit',
            'initial',
            'round',
            'square',
            'unset'
        ]
    },
    'stroke-linejoin': {
        'values': [
            'bevel',
            'inherit',
            'initial',
            'miter',
            'round',
            'unset'
        ]
    },
    'stroke-miterlimit': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'stroke-opacity': {
        'values': [
            'context-fill-opacity',
            'context-stroke-opacity',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'stroke-width': {
        'values': [
            'context-value',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'table-layout': {
        'values': [
            'auto',
            'fixed',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'text-align': {
        'values': [
            'center',
            'end',
            'inherit',
            'initial',
            'justify',
            'left',
            'match-parent',
            'right',
            'start',
            'unset'
        ]
    },
    'text-align-last': {
        'values': [
            'auto',
            'center',
            'end',
            'inherit',
            'initial',
            'justify',
            'left',
            'right',
            'start',
            'unset'
        ]
    },
    'text-anchor': {
        'values': [
            'end',
            'inherit',
            'initial',
            'middle',
            'start',
            'unset'
        ]
    },
    'text-combine-upright': {
        'values': [
            'all',
            'inherit',
            'initial',
            'none',
            'unset'
        ]
    },
    'text-decoration': {
        'values': [
            'COLOR',
            'blink',
            'currentColor',
            'dashed',
            'dotted',
            'double',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'line-through',
            'none',
            'overline',
            'rgb',
            'rgba',
            'solid',
            'transparent',
            'underline',
            'unset',
            'wavy'
        ]
    },
    'text-decoration-color': {
        'values': [
            'COLOR',
            'currentColor',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'rgb',
            'rgba',
            'transparent',
            'unset'
        ]
    },
    'text-decoration-line': {
        'values': [
            'blink',
            'inherit',
            'initial',
            'line-through',
            'none',
            'overline',
            'underline',
            'unset'
        ]
    },
    'text-decoration-style': {
        'values': [
            'dashed',
            'dotted',
            'double',
            'inherit',
            'initial',
            'solid',
            'unset',
            'wavy'
        ]
    },
    'text-emphasis': {
        'values': [
            'COLOR',
            'circle',
            'currentColor',
            'dot',
            'double-circle',
            'filled',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'none',
            'open',
            'rgb',
            'rgba',
            'sesame',
            'transparent',
            'triangle',
            'unset'
        ]
    },
    'text-emphasis-color': {
        'values': [
            'COLOR',
            'currentColor',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'rgb',
            'rgba',
            'transparent',
            'unset'
        ]
    },
    'text-emphasis-position': {
        'values': [
            'inherit',
            'initial',
            'left',
            'over',
            'right',
            'under',
            'unset'
        ]
    },
    'text-emphasis-style': {
        'values': [
            'circle',
            'dot',
            'double-circle',
            'filled',
            'inherit',
            'initial',
            'none',
            'open',
            'sesame',
            'triangle',
            'unset'
        ]
    },
    'text-indent': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'text-justify': {
        'values': [
            'auto',
            'distribute',
            'inherit',
            'initial',
            'inter-character',
            'inter-word',
            'none',
            'unset'
        ]
    },
    'text-orientation': {
        'values': [
            'inherit',
            'initial',
            'mixed',
            'sideways',
            'sideways-right',
            'unset',
            'upright'
        ]
    },
    'text-overflow': {
        'values': [
            'clip',
            'ellipsis',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'text-rendering': {
        'values': [
            'auto',
            'geometricprecision',
            'inherit',
            'initial',
            'optimizelegibility',
            'optimizespeed',
            'unset'
        ]
    },
    'text-shadow': {
        'values': [
            'COLOR',
            'currentColor',
            'hsl',
            'hsla',
            'inherit',
            'initial',
            'none',
            'rgb',
            'rgba',
            'transparent',
            'unset'
        ]
    },
    'text-transform': {
        'values': [
            'capitalize',
            'full-width',
            'inherit',
            'initial',
            'lowercase',
            'none',
            'unset',
            'uppercase'
        ]
    },
    'top': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'touch-action': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'manipulation',
            'none',
            'pan-x',
            'pan-y',
            'unset'
        ]
    },
    'transform': {
        'values': [
            'accumulatematrix',
            'inherit',
            'initial',
            'interpolatematrix',
            'matrix',
            'matrix3d',
            'none',
            'perspective',
            'rotate',
            'rotate3d',
            'rotateX',
            'rotateY',
            'rotateZ',
            'scale',
            'scale3d',
            'scaleX',
            'scaleY',
            'scaleZ',
            'skew',
            'skewX',
            'skewY',
            'translate',
            'translate3d',
            'translateX',
            'translateY',
            'translateZ',
            'unset'
        ]
    },
    'transform-box': {
        'values': [
            'border-box',
            'fill-box',
            'inherit',
            'initial',
            'unset',
            'view-box'
        ]
    },
    'transform-origin': {
        'values': [
            'bottom',
            'center',
            'inherit',
            'initial',
            'left',
            'right',
            'top',
            'unset'
        ]
    },
    'transform-style': {
        'values': [
            'flat',
            'inherit',
            'initial',
            'preserve-3d',
            'unset'
        ]
    },
    'transition': {
        'values': [
            'all',
            'cubic-bezier',
            'ease',
            'ease-in',
            'ease-in-out',
            'ease-out',
            'frames',
            'inherit',
            'initial',
            'linear',
            'none',
            'step-end',
            'step-start',
            'steps',
            'unset'
        ]
    },
    'transition-delay': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'transition-duration': {
        'values': [
            'inherit',
            'initial',
            'unset'
        ]
    },
    'transition-property': {
        'values': [
            'all',
            'inherit',
            'initial',
            'none',
            'unset'
        ]
    },
    'transition-timing-function': {
        'values': [
            'cubic-bezier',
            'ease',
            'ease-in',
            'ease-in-out',
            'ease-out',
            'frames',
            'inherit',
            'initial',
            'linear',
            'step-end',
            'step-start',
            'steps',
            'unset'
        ]
    },
    'unicode-bidi': {
        'values': [
            'bidi-override',
            'embed',
            'inherit',
            'initial',
            'isolate',
            'isolate-override',
            'normal',
            'plaintext',
            'unset'
        ]
    },
    'vector-effect': {
        'values': [
            'inherit',
            'initial',
            'non-scaling-stroke',
            'none',
            'unset'
        ]
    },
    'vertical-align': {
        'values': [
            'baseline',
            'bottom',
            'inherit',
            'initial',
            'middle',
            'sub',
            'super',
            'text-bottom',
            'text-top',
            'top',
            'unset'
        ]
    },
    'visibility': {
        'values': [
            'collapse',
            'hidden',
            'inherit',
            'initial',
            'unset',
            'visible'
        ]
    },
    'white-space': {
        'values': [
            'inherit',
            'initial',
            'normal',
            'nowrap',
            'pre',
            'pre-line',
            'pre-wrap',
            'unset'
        ]
    },
    'width': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'will-change': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    },
    'word-break': {
        'values': [
            'break-all',
            'inherit',
            'initial',
            'keep-all',
            'normal',
            'unset'
        ]
    },
    'word-spacing': {
        'values': [
            'inherit',
            'initial',
            'normal',
            'unset'
        ]
    },
    'word-wrap': {
        'values': [
            'break-word',
            'inherit',
            'initial',
            'normal',
            'unset'
        ]
    },
    'writing-mode': {
        'values': [
            'horizontal-tb',
            'inherit',
            'initial',
            'lr',
            'lr-tb',
            'rl',
            'rl-tb',
            'sideways-lr',
            'sideways-rl',
            'tb',
            'tb-rl',
            'unset',
            'vertical-lr',
            'vertical-rl'
        ]
    },
    'z-index': {
        'values': [
            'auto',
            'inherit',
            'initial',
            'unset'
        ]
    }
};
/**
 * A list of the pseudo elements.
 */
const PSEUDO_ELEMENTS = [
    ':after',
    ':before',
    ':backdrop',
    ':cue',
    ':first-letter',
    ':first-line',
    ':selection',
    ':placeholder'
];
// https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes
// These attributes are valid on every HTML element and we want to rule out any potential quirk by ensuring
// the DataAttributeObserver functions correctly for each of them
const globalAttributeNames = [
    'xml:lang',
    'xml:base',
    'accesskey',
    'autocapitalize',
    'aria-foo',
    'class',
    'contenteditable',
    'contextmenu',
    'data-foo',
    'dir',
    'draggable',
    'dropzone',
    'hidden',
    'id',
    'is',
    'itemid',
    'itemprop',
    'itemref',
    'itemscope',
    'itemtype',
    'lang',
    'slot',
    'spellcheck',
    'style',
    'tabindex',
    'title',
    'translate',
    'onabort',
    'onautocomplete',
    'onautocompleteerror',
    'onblur',
    'oncancel',
    'oncanplay',
    'oncanplaythrough',
    'onchange',
    'onclick',
    'onclose',
    'oncontextmenu',
    'oncuechange',
    'ondblclick',
    'ondrag',
    'ondragend',
    'ondragenter',
    'ondragexit',
    'ondragleave',
    'ondragover',
    'ondragstart',
    'ondrop',
    'ondurationchange',
    'onemptied',
    'onended',
    'onerror',
    'onfocus',
    'oninput',
    'oninvalid',
    'onkeydown',
    'onkeypress',
    'onkeyup',
    'onload',
    'onloadeddata',
    'onloadedmetadata',
    'onloadstart',
    'onmousedown',
    'onmouseenter',
    'onmouseleave',
    'onmousemove',
    'onmouseout',
    'onmouseover',
    'onmouseup',
    'onmousewheel',
    'onpause',
    'onplay',
    'onplaying',
    'onprogress',
    'onratechange',
    'onreset',
    'onresize',
    'onscroll',
    'onseeked',
    'onseeking',
    'onselect',
    'onshow',
    'onsort',
    'onstalled',
    'onsubmit',
    'onsuspend',
    'ontimeupdate',
    'ontoggle',
    'onvolumechange',
    'onwaiting'
];

function eachCartesianJoinFactory(arrays, callback) {
    arrays = arrays.slice(0).filter(arr => arr.length > 0);
    if (typeof callback !== 'function') {
        throw new Error('Callback is not a function');
    }
    if (arrays.length === 0) {
        return;
    }
    const totalCallCount = arrays.reduce((count, arr) => count *= arr.length, 1);
    const argsIndices = Array(arrays.length).fill(0);
    const errors = [];
    let args = null;
    try {
        args = updateElementByIndicesFactory(arrays, Array(arrays.length), argsIndices);
        callback(...args);
    }
    catch (e) {
        errors.push(e);
    }
    let callCount = 1;
    if (totalCallCount === callCount) {
        return;
    }
    let stop = false;
    while (!stop) {
        const hasUpdate = updateIndices(arrays, argsIndices);
        if (hasUpdate) {
            try {
                callback(...updateElementByIndicesFactory(arrays, args, argsIndices));
            }
            catch (e) {
                errors.push(e);
            }
            callCount++;
            if (totalCallCount < callCount) {
                throw new Error('Invalid loop implementation.');
            }
        }
        else {
            stop = true;
        }
    }
    if (errors.length > 0) {
        const msg = `eachCartesionJoinFactory failed to load ${errors.length} tests:\n\n${errors.map(e => e.message).join('\n')}`;
        throw new Error(msg);
    }
}
function updateElementByIndicesFactory(arrays, args, indices) {
    for (let i = 0, ii = arrays.length; ii > i; ++i) {
        args[i] = arrays[i][indices[i]](...args);
    }
    return args;
}
function eachCartesianJoin(arrays, callback) {
    arrays = arrays.slice(0).filter(arr => arr.length > 0);
    if (typeof callback !== 'function') {
        throw new Error('Callback is not a function');
    }
    if (arrays.length === 0) {
        return;
    }
    const totalCallCount = arrays.reduce((count, arr) => count *= arr.length, 1);
    const argsIndices = Array(arrays.length).fill(0);
    const args = updateElementByIndices(arrays, Array(arrays.length), argsIndices);
    callback(...args, 0);
    let callCount = 1;
    if (totalCallCount === callCount) {
        return;
    }
    let stop = false;
    while (!stop) {
        const hasUpdate = updateIndices(arrays, argsIndices);
        if (hasUpdate) {
            callback(...updateElementByIndices(arrays, args, argsIndices), callCount);
            callCount++;
            if (totalCallCount < callCount) {
                throw new Error('Invalid loop implementation.');
            }
        }
        else {
            stop = true;
        }
    }
}
async function eachCartesianJoinAsync(arrays, callback) {
    arrays = arrays.slice(0).filter(arr => arr.length > 0);
    if (typeof callback !== 'function') {
        throw new Error('Callback is not a function');
    }
    if (arrays.length === 0) {
        return;
    }
    const totalCallCount = arrays.reduce((count, arr) => count *= arr.length, 1);
    const argsIndices = Array(arrays.length).fill(0);
    const args = updateElementByIndices(arrays, Array(arrays.length), argsIndices);
    await callback(...args, 0);
    let callCount = 1;
    if (totalCallCount === callCount) {
        return;
    }
    let stop = false;
    while (!stop) {
        const hasUpdate = updateIndices(arrays, argsIndices);
        if (hasUpdate) {
            await callback(...updateElementByIndices(arrays, args, argsIndices), callCount);
            callCount++;
            if (totalCallCount < callCount) {
                throw new Error('Invalid loop implementation.');
            }
        }
        else {
            stop = true;
        }
    }
}
function updateIndices(arrays, indices) {
    let arrIndex = arrays.length;
    while (arrIndex--) {
        if (indices[arrIndex] === arrays[arrIndex].length - 1) {
            if (arrIndex === 0) {
                return false;
            }
            continue;
        }
        indices[arrIndex] += 1;
        for (let i = arrIndex + 1, ii = arrays.length; ii > i; ++i) {
            indices[i] = 0;
        }
        return true;
    }
    return false;
}
function updateElementByIndices(arrays, args, indices) {
    for (let i = 0, ii = arrays.length; ii > i; ++i) {
        args[i] = arrays[i][indices[i]];
    }
    return args;
}
function* generateCartesianProduct(arrays) {
    const [head, ...tail] = arrays;
    const tailCombinations = tail.length > 0 ? generateCartesianProduct(tail) : [[]];
    for (const t of tailCombinations) {
        for (const h of head) {
            yield [h, ...t];
        }
    }
}

function h(name, attrs = null, ...children) {
    const doc = PLATFORM.document;
    const el = doc.createElement(name);
    for (const attr in attrs) {
        if (attr === 'class' || attr === 'className' || attr === 'cls') {
            let value = attrs[attr];
            value = value === undefined || value === null
                ? emptyArray
                : Array.isArray(value)
                    ? value
                    : (`${value}`).split(' ');
            el.classList.add(...value.filter(Boolean));
        }
        else if (attr in el || attr === 'data' || attr.startsWith('_')) {
            el[attr.replace(/^_/, '')] = attrs[attr];
        }
        else {
            el.setAttribute(attr, attrs[attr]);
        }
    }
    const childrenCt = el.tagName === 'TEMPLATE' ? el.content : el;
    for (const child of children) {
        if (child === null || child === undefined) {
            continue;
        }
        childrenCt.appendChild(isNodeOrTextOrComment(child)
            ? child
            : doc.createTextNode(`${child}`));
    }
    return el;
}
function isNodeOrTextOrComment(obj) {
    return obj.nodeType > 0;
}
const eventCmds = { delegate: 1, capture: 1, call: 1 };
/**
 * jsx with aurelia binding command friendly version of h
 */
const hJsx = function (name, attrs, ...children) {
    const doc = PLATFORM.document;
    const el = doc.createElement(name === 'let$' ? 'let' : name);
    if (attrs != null) {
        let value;
        for (const attr in attrs) {
            value = attrs[attr];
            // if attr is class or its alias
            // split up by splace and add to element via classList API
            if (attr === 'class' || attr === 'className' || attr === 'cls') {
                value = value == null
                    ? []
                    : Array.isArray(value)
                        ? value
                        : (`${value}`).split(' ');
                el.classList.add(...value);
            }
            else if (attr in el || attr === 'data' || attr.startsWith('_')) {
                // for attributes with matching properties, simply assign
                // other if special attribute like data, or ones start with _
                // assign as well
                // @ts-ignore // TODO: https://github.com/microsoft/TypeScript/issues/31904
                el[attr] = value;
            }
            else if (attr === 'asElement') {
                // if it's an asElement attribute, camel case it
                el.setAttribute('as-element', value);
            }
            else {
                // ortherwise do fallback check
                // is it an event handler?
                if (attr.startsWith('o') && attr[1] === 'n' && !attr.endsWith('$')) {
                    const decoded = kebabCase(attr.slice(2));
                    const parts = decoded.split('-');
                    if (parts.length > 1) {
                        const lastPart = parts[parts.length - 1];
                        const cmd = eventCmds[lastPart] ? lastPart : 'trigger';
                        el.setAttribute(`${parts.slice(0, -1).join('-')}.${cmd}`, value);
                    }
                    else {
                        el.setAttribute(`${parts[0]}.trigger`, value);
                    }
                }
                else {
                    const parts = attr.split('$');
                    if (parts.length === 1) {
                        el.setAttribute(kebabCase(attr), value);
                    }
                    else {
                        if (parts[parts.length - 1] === '') {
                            parts[parts.length - 1] = 'bind';
                        }
                        el.setAttribute(parts.map(kebabCase).join('.'), value);
                    }
                    // const lastIdx = attr.lastIndexOf('$');
                    // if (lastIdx === -1) {
                    //   el.setAttribute(kebabCase(attr), value);
                    // } else {
                    //   let cmd = attr.slice(lastIdx + 1);
                    //   cmd = cmd ? kebabCase(cmd) : 'bind';
                    //   el.setAttribute(`${kebabCase(attr.slice(0, lastIdx))}.${cmd}`, value);
                    // }
                }
            }
        }
    }
    const appender = el.content != null ? el.content : el;
    for (const child of children) {
        if (child == null) {
            continue;
        }
        if (Array.isArray(child)) {
            for (const child_child of child) {
                appender.appendChild(child_child instanceof PLATFORM.Node ? child_child : doc.createTextNode(`${child_child}`));
            }
        }
        else {
            appender.appendChild(child instanceof PLATFORM.Node ? child : doc.createTextNode(`${child}`));
        }
    }
    return el;
};

function createFixture(template, $class, registrations = [], autoStart = true, ctx = TestContext.create()) {
    const { container, platform, observerLocator } = ctx;
    container.register(...registrations);
    const root = ctx.doc.body.appendChild(ctx.doc.createElement('div'));
    const host = root.appendChild(ctx.createElement('app'));
    const au = new Aurelia(container);
    const App = CustomElement.define({ name: 'app', template }, $class || class {
    });
    if (container.has(App, true)) {
        throw new Error('Container of the context cotains instance of the application root component. ' +
            'Consider using a different class, or context as it will likely cause surprises in tests.');
    }
    const component = container.get(App);
    let startPromise = void 0;
    if (autoStart) {
        au.app({ host: host, component });
        startPromise = au.start();
    }
    return {
        startPromise,
        ctx,
        host: ctx.doc.firstElementChild,
        container,
        platform,
        testHost: root,
        appHost: host,
        au,
        component,
        observerLocator,
        start: async () => {
            await au.app({ host: host, component }).start();
        },
        tearDown: async () => {
            await au.stop();
            root.remove();
            au.dispose();
        }
    };
}

class MockBinding {
    constructor() {
        this.interceptor = this;
        this.calls = [];
    }
    updateTarget(value, flags) {
        this.trace('updateTarget', value, flags);
    }
    updateSource(value, flags) {
        this.trace('updateSource', value, flags);
    }
    handleChange(newValue, _previousValue, flags) {
        this.trace('handleChange', newValue, _previousValue, flags);
    }
    handleCollectionChange(indexMap, flags) {
        this.trace('handleCollectionChange', indexMap, flags);
    }
    observe(obj, propertyName) {
        this.trace('observe', obj, propertyName);
    }
    observeCollection(col) {
        this.trace('observeCollection', col);
    }
    subscribeTo(subscribable) {
        this.trace('subscribeTo', subscribable);
    }
    $bind(flags, scope) {
        this.trace('$bind', flags, scope);
    }
    $unbind(flags) {
        this.trace('$unbind', flags);
    }
    trace(fnName, ...args) {
        this.calls.push([fnName, ...args]);
    }
    dispose() {
        this.trace('dispose');
    }
}
class MockBindingBehavior {
    constructor() {
        this.calls = [];
    }
    bind(flags, scope, binding, ...rest) {
        this.trace('bind', flags, scope, binding, ...rest);
    }
    unbind(flags, scope, binding, ...rest) {
        this.trace('unbind', flags, scope, binding, ...rest);
    }
    trace(fnName, ...args) {
        this.calls.push([fnName, ...args]);
    }
}
class MockServiceLocator {
    constructor(registrations) {
        this.registrations = registrations;
        this.calls = [];
    }
    get(key) {
        this.trace('get', key);
        return this.registrations.get(key);
    }
    trace(fnName, ...args) {
        this.calls.push([fnName, ...args]);
    }
}
class MockSignaler {
    constructor() {
        this.calls = [];
    }
    dispatchSignal(...args) {
        this.trace('dispatchSignal', ...args);
    }
    addSignalListener(...args) {
        this.trace('addSignalListener', ...args);
    }
    removeSignalListener(...args) {
        this.trace('removeSignalListener', ...args);
    }
    trace(fnName, ...args) {
        this.calls.push([fnName, ...args]);
    }
}
class MockPropertySubscriber {
    constructor() {
        this.calls = [];
    }
    handleChange(newValue, previousValue, flags) {
        this.trace(`handleChange`, newValue, previousValue, flags);
    }
    trace(fnName, ...args) {
        this.calls.push([fnName, ...args]);
    }
}
class MockTracingExpression {
    constructor(inner) {
        this.inner = inner;
        this.$kind = 2048 /* HasBind */ | 4096 /* HasUnbind */;
        this.calls = [];
    }
    evaluate(...args) {
        this.trace('evaluate', ...args);
        return this.inner.evaluate(...args);
    }
    assign(...args) {
        this.trace('assign', ...args);
        return this.inner.assign(...args);
    }
    connect(...args) {
        this.trace('connect', ...args);
        this.inner.connect(...args);
    }
    bind(...args) {
        this.trace('bind', ...args);
        if (this.inner.bind) {
            this.inner.bind(...args);
        }
    }
    unbind(...args) {
        this.trace('unbind', ...args);
        if (this.inner.unbind) {
            this.inner.unbind(...args);
        }
    }
    accept(...args) {
        this.trace('accept', ...args);
        this.inner.accept(...args);
    }
    trace(fnName, ...args) {
        this.calls.push([fnName, ...args]);
    }
}
class MockValueConverter {
    constructor(methods) {
        this.calls = [];
        for (const method of methods) {
            this[method] = this[`$${method}`];
        }
    }
    $fromView(value, ...args) {
        this.trace('fromView', value, ...args);
        return value;
    }
    $toView(value, ...args) {
        this.trace('toView', value, ...args);
        return value;
    }
    trace(fnName, ...args) {
        this.calls.push([fnName, ...args]);
    }
}
class MockContext {
    constructor() {
        this.log = [];
    }
}
class MockBrowserHistoryLocation {
    constructor() {
        this.states = [{}];
        this.paths = [''];
        this.index = 0;
    }
    get length() {
        return this.states.length;
    }
    get state() {
        return this.states[this.index];
    }
    get path() {
        return this.paths[this.index];
    }
    get pathname() {
        const parts = this.parts;
        // parts.shift();
        let path = parts.shift();
        if (!path.startsWith('/')) {
            path = `/${path}`;
        }
        return path;
    }
    get search() {
        const parts = this.parts;
        // if (parts.shift()) {
        //   parts.shift();
        // }
        parts.shift();
        const part = parts.shift();
        return part !== undefined ? `?${part}` : '';
    }
    get hash() {
        const parts = this.parts;
        // if (!parts.shift()) {
        //   parts.shift();
        // }
        parts.shift();
        parts.shift();
        const part = parts.shift();
        return part !== undefined ? `#${part}` : '';
    }
    set hash(value) {
        if (value.startsWith('#')) {
            value = value.substring(1);
        }
        const parts = this.parts;
        // const hashFirst = parts.shift();
        let path = parts.shift();
        // if (hashFirst) {
        //   parts.shift();
        //   path += `#${value}`;
        //   const part = parts.shift();
        //   if (part !== undefined) {
        //     path += `?${part}`;
        //   }
        // } else {
        const part = parts.shift();
        if (part !== undefined) {
            path += `?${part}`;
        }
        parts.shift();
        path += `#${value}`;
        // }
        this.pushState({}, null, path);
        this.notifyChange();
    }
    activate() { return; }
    deactivate() { return; }
    // TODO: Fix a better split
    get parts() {
        const parts = [];
        const ph = this.path.split('#');
        if (ph.length > 1) {
            parts.unshift(ph.pop());
        }
        else {
            parts.unshift(undefined);
        }
        const pq = ph[0].split('?');
        if (pq.length > 1) {
            parts.unshift(pq.pop());
        }
        else {
            parts.unshift(undefined);
        }
        parts.unshift(pq[0]);
        // const parts: (string | boolean)[] = this.path.split(/[#?]/);
        // let search = this.path.indexOf('?') >= 0 ? this.path.indexOf('?') : 99999;
        // let hash = this.path.indexOf('#') >= 0 ? this.path.indexOf('#') : 99999;
        // parts.unshift(hash < search);
        return parts;
    }
    pushState(data, title, path) {
        this.states.splice(this.index + 1);
        this.paths.splice(this.index + 1);
        this.states.push(data);
        this.paths.push(path);
        this.index++;
    }
    replaceState(data, title, path) {
        this.states[this.index] = data;
        this.paths[this.index] = path;
    }
    go(movement) {
        const newIndex = this.index + movement;
        if (newIndex >= 0 && newIndex < this.states.length) {
            this.index = newIndex;
            this.notifyChange();
        }
    }
    notifyChange() {
        if (this.changeCallback) {
            this.changeCallback(null).catch((error) => { throw error; });
        }
    }
}
class ChangeSet {
    constructor(index, flags, newValue, oldValue) {
        this.index = index;
        this.flags = flags;
        this._newValue = newValue;
        this._oldValue = oldValue;
    }
    get newValue() {
        return this._newValue;
    }
    get oldValue() {
        return this._oldValue;
    }
    dispose() {
        this._newValue = (void 0);
        this._oldValue = (void 0);
    }
}
class ProxyChangeSet {
    constructor(index, flags, key, newValue, oldValue) {
        this.index = index;
        this.flags = flags;
        this.key = key;
        this._newValue = newValue;
        this._oldValue = oldValue;
    }
    get newValue() {
        return this._newValue;
    }
    get oldValue() {
        return this._oldValue;
    }
    dispose() {
        this._newValue = (void 0);
        this._oldValue = (void 0);
    }
}
class CollectionChangeSet {
    constructor(index, flags, indexMap) {
        this.index = index;
        this.flags = flags;
        this._indexMap = indexMap;
    }
    get indexMap() {
        return this._indexMap;
    }
    dispose() {
        this._indexMap = (void 0);
    }
}
class SpySubscriber {
    constructor() {
        this._changes = void 0;
        this._proxyChanges = void 0;
        this._collectionChanges = void 0;
        this._callCount = 0;
    }
    get changes() {
        if (this._changes === void 0) {
            return emptyArray;
        }
        return this._changes;
    }
    get proxyChanges() {
        if (this._proxyChanges === void 0) {
            return emptyArray;
        }
        return this._proxyChanges;
    }
    get collectionChanges() {
        if (this._collectionChanges === void 0) {
            return emptyArray;
        }
        return this._collectionChanges;
    }
    get hasChanges() {
        return this._changes !== void 0;
    }
    get hasProxyChanges() {
        return this._proxyChanges !== void 0;
    }
    get hasCollectionChanges() {
        return this._collectionChanges !== void 0;
    }
    get callCount() {
        return this._callCount;
    }
    handleChange(newValue, oldValue, flags) {
        if (this._changes === void 0) {
            this._changes = [new ChangeSet(this._callCount++, flags, newValue, oldValue)];
        }
        else {
            this._changes.push(new ChangeSet(this._callCount++, flags, newValue, oldValue));
        }
    }
    handleProxyChange(key, newValue, oldValue, flags) {
        if (this._proxyChanges === void 0) {
            this._proxyChanges = [new ProxyChangeSet(this._callCount++, flags, key, newValue, oldValue)];
        }
        else {
            this._proxyChanges.push(new ProxyChangeSet(this._callCount++, flags, key, newValue, oldValue));
        }
    }
    handleCollectionChange(indexMap, flags) {
        if (this._collectionChanges === void 0) {
            this._collectionChanges = [new CollectionChangeSet(this._callCount++, flags, indexMap)];
        }
        else {
            this._collectionChanges.push(new CollectionChangeSet(this._callCount++, flags, indexMap));
        }
    }
    dispose() {
        if (this._changes !== void 0) {
            this._changes.forEach(c => c.dispose());
            this._changes = void 0;
        }
        if (this._proxyChanges !== void 0) {
            this._proxyChanges.forEach(c => c.dispose());
            this._proxyChanges = void 0;
        }
        if (this._collectionChanges !== void 0) {
            this._collectionChanges.forEach(c => c.dispose());
            this._collectionChanges = void 0;
        }
        this._callCount = 0;
    }
}

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

let SortValueConverter = class SortValueConverter {
    toView(arr, prop, dir = 'asc') {
        if (Array.isArray(arr)) {
            const factor = dir === 'asc' ? 1 : -1;
            if (prop && prop.length) {
                arr.sort((a, b) => a[prop] - b[prop] * factor);
            }
            else {
                arr.sort((a, b) => a - b * factor);
            }
        }
        return arr;
    }
};
SortValueConverter = __decorate([
    valueConverter('sort')
], SortValueConverter);
let JsonValueConverter = class JsonValueConverter {
    toView(input) {
        return JSON.stringify(input);
    }
    fromView(input) {
        return JSON.parse(input);
    }
};
JsonValueConverter = __decorate([
    valueConverter('json')
], JsonValueConverter);
let NameTag = class NameTag {
};
__decorate([
    bindable()
], NameTag.prototype, "name", void 0);
NameTag = __decorate([
    customElement({
        name: 'name-tag',
        template: `<template>\${name}</template>`,
        needsCompile: true,
        dependencies: [],
        instructions: [],
        surrogates: []
    })
], NameTag);
const globalResources = [
    SortValueConverter,
    JsonValueConverter,
    NameTag
];
const TestConfiguration = {
    register(container) {
        container.register(...globalResources);
    }
};

/**
 * Template tag function that properly stringifies the template parameters. Currently supports:
 *
 * - undefined
 * - null
 * - boolean
 * - number
 * - Array (recurses through the items and wraps them in brackets)
 * - Event (returns the type name)
 * - Node (returns textContent or innerHTML)
 * - Object (returns json representation)
 * - Class constructor (returns class name)
 * - Instance of custom class (returns class name + json representation)
 */
function _(strings, ...vars) {
    const ctx = { result: '' };
    const length = vars.length;
    for (let i = 0; i < length; ++i) {
        ctx.result = ctx.result + strings[i] + stringify(vars[i], ctx);
    }
    return ctx.result + strings[length];
}
const newline = /\r?\n/g;
const whitespace = /\s+/g;
const toStringTag = Object.prototype.toString;
/**
 * stringify primitive value (null -> 'null' and undefined -> 'undefined') or complex values with recursion guard
 */
function stringify(value, ctx) {
    const Type = toStringTag.call(value);
    switch (Type) {
        case '[object Undefined]':
            return 'undefined';
        case '[object Null]':
            return 'null';
        case '[object String]':
            return `'${value}'`;
        case '[object Boolean]':
        case '[object Number]':
            return value;
        case '[object Array]':
            return `[${value.map((x) => stringify(x, ctx)).join(',')}]`;
        case '[object Event]':
            return `'${value.type}'`;
        case '[object Object]': {
            const proto = Object.getPrototypeOf(value);
            if (!proto || !proto.constructor || proto.constructor.name === 'Object') {
                return jsonStringify(value, ctx);
            }
            return `class ${proto.constructor.name}${jsonStringify(value, ctx)}`;
        }
        case '[object Function]':
            if (value.name && value.name.length) {
                return `class ${value.name}`;
            }
            return value.toString().replace(whitespace, '');
        default:
            return jsonStringify(value, ctx);
    }
}
function jsonStringify(o, ctx) {
    if (ctx.result.length > 100) {
        return '(json string)';
    }
    try {
        let cache = [];
        let depth = 0;
        const result = JSON.stringify(o, function (_key, value) {
            if (_key === 'dom') {
                return '(dom)';
            }
            if (++depth === 2) {
                return String(value);
            }
            if (typeof value === 'object' && value !== null) {
                if (value.nodeType > 0) {
                    --depth;
                    return htmlStringify(value, ctx);
                }
                if (cache.includes(value)) {
                    try {
                        --depth;
                        return JSON.parse(JSON.stringify(value));
                    }
                    catch (error) {
                        return void 0;
                    }
                }
                cache.push(value);
            }
            --depth;
            return value;
        });
        cache = void 0;
        let ret = result.replace(newline, '');
        if (ret.length > 25) {
            const len = ret.length;
            ret = `${ret.slice(0, 25)}...(+${len - 25})`;
        }
        ctx.result += ret;
        return ret;
    }
    catch (e) {
        return `error stringifying to json: ${e}`;
    }
}
function htmlStringify(node, ctx) {
    if (ctx.result.length > 100) {
        return '(html string)';
    }
    if (node === null) {
        return 'null';
    }
    if (node === undefined) {
        return 'undefined';
    }
    if ((node.textContent != null && node.textContent.length) || node.nodeType === 3 /* Text */ || node.nodeType === 8 /* Comment */) {
        const ret = node.textContent.replace(newline, '');
        if (ret.length > 10) {
            const len = ret.length;
            return `${ret.slice(0, 10)}...(+${len - 10})`;
        }
        return ret;
    }
    if (node.nodeType === 1 /* Element */) {
        if (node.innerHTML.length) {
            const ret = node.innerHTML.replace(newline, '');
            if (ret.length > 10) {
                const len = ret.length;
                return `${ret.slice(0, 10)}...(+${len - 10})`;
            }
            return ret;
        }
        if (node.nodeName === 'TEMPLATE') {
            return htmlStringify(node.content, ctx);
        }
    }
    let val = '';
    for (let i = 0, ii = node.childNodes.length; i < ii; ++i) {
        const child = node.childNodes[i];
        val += htmlStringify(child, ctx);
    }
    return val;
}
/**
 * pad a string with spaces on the right-hand side until it's the specified length
 */
function padRight(input, len) {
    const str = `${input}`;
    const strLen = str.length;
    if (strLen >= len) {
        return str;
    }
    return str + new Array(len - strLen + 1).join(' ');
}
/**
 * pad a string with spaces on the left-hand side until it's the specified length
 */
function padLeft(input, len) {
    const str = `${input}`;
    const strLen = str.length;
    if (strLen >= len) {
        return str;
    }
    return new Array(len - strLen + 1).join(' ') + str;
}

// import {
//   IInstruction,
//   NodeSequenceFactory,
//   TextBindingInstruction,
// } from '@aurelia/runtime-html';
// import {
//   FakeView,
//   FakeViewFactory,
// } from './fakes.js';
// import { TestContext } from './html-test-context.js';
// import {
//   defineComponentLifecycleMock,
//   IComponentLifecycleMock,
// } from './mocks.js';
// export type TemplateCb = (builder: TemplateBuilder) => TemplateBuilder;
// export type InstructionCb = (builder: InstructionBuilder) => InstructionBuilder;
// export type DefinitionCb = (builder: DefinitionBuilder) => DefinitionBuilder;
// export class TemplateBuilder {
//   private template: HTMLTemplateElement;
//   constructor() {
//     this.template = document.createElement('template');
//   }
//   public static interpolation(): TemplateBuilder {
//     return new TemplateBuilder().interpolation();
//   }
//   public static behavior(): TemplateBuilder {
//     return new TemplateBuilder().behavior();
//   }
//   public interpolation(): TemplateBuilder {
//     const marker = document.createElement('au-m');
//     marker['classList'].add('au');
//     const text = document.createTextNode(' ');
//     this.template.content['appendChild'](marker);
//     this.template.content['appendChild'](text);
//     return this;
//   }
//   public behavior(): TemplateBuilder {
//     const marker = document.createElement('au-m');
//     marker['classList'].add('au');
//     this.template.content['appendChild'](marker);
//     return this;
//   }
//   public build(): HTMLTemplateElement {
//     const { template } = this;
//     this.template = null!;
//     return template;
//   }
// }
// export class InstructionBuilder {
//   private instructions: IInstruction[];
//   constructor() {
//     this.instructions = [];
//   }
//   public static interpolation(source: string): InstructionBuilder;
//   public static interpolation(parts: ReadonlyArray<string>): InstructionBuilder;
//   public static interpolation(parts: ReadonlyArray<string>, sources: ReadonlyArray<string>): InstructionBuilder;
//   public static interpolation(partsOrSource: ReadonlyArray<string> | string, sources?: ReadonlyArray<string>): InstructionBuilder;
//   public static interpolation(partsOrSource: ReadonlyArray<string> | string, sources?: ReadonlyArray<string>): InstructionBuilder {
//     return new InstructionBuilder().interpolation(partsOrSource, sources);
//   }
//   public static iterator(source: string, target: string): InstructionBuilder {
//     return new InstructionBuilder().iterator(source, target);
//   }
//   public static toView(source: string, target?: string): InstructionBuilder {
//     return new InstructionBuilder().toView(source, target);
//   }
//   public interpolation(source: string): InstructionBuilder;
//   public interpolation(parts: ReadonlyArray<string>): InstructionBuilder;
//   public interpolation(parts: ReadonlyArray<string>, sources: ReadonlyArray<string>): InstructionBuilder;
//   public interpolation(partsOrSource: ReadonlyArray<string> | string, sources?: ReadonlyArray<string>): InstructionBuilder;
//   public interpolation(partsOrSource: ReadonlyArray<string> | string, sources?: ReadonlyArray<string>): InstructionBuilder {
//     let parts: string[];
//     let expressions: IsBindingBehavior[];
//     if (Array.isArray(partsOrSource)) {
//       parts = partsOrSource;
//       expressions = [];
//       if (Array.isArray(sources)) {
//         for (const source of sources) {
//           expressions.push(parseExpression(source as string, BindingType.None as any) as any);
//         }
//       }
//     } else {
//       parts = ['', ''];
//       expressions = [parseExpression(partsOrSource as string, BindingType.None as any) as any];
//     }
//     const instruction = new TextBindingInstruction(
//       new Interpolation(parts, expressions)
//     );
//     this.instructions.push(instruction);
//     return this;
//   }
//   public iterator(source: string, target: string): InstructionBuilder {
//     const statement = parseExpression(source, BindingType.ForCommand as any) as any;
//     const instruction = new IteratorBindingInstruction(statement, target);
//     this.instructions.push(instruction);
//     return this;
//   }
//   public toView(source: string, target?: string): InstructionBuilder {
//     const statement = parseExpression(source, BindingType.ToViewCommand as any) as any;
//     const instruction = new ToViewBindingInstruction(statement, target || 'value');
//     this.instructions.push(instruction);
//     return this;
//   }
//   public templateController(
//     res: string,
//     insCbOrBuilder: InstructionCb | InstructionBuilder,
//     defCbOrBuilder: DefinitionCb | DefinitionBuilder
//   ): InstructionBuilder {
//     let childInstructions: IInstruction[];
//     let definition: PartialCustomElementDefinition;
//     if (insCbOrBuilder instanceof InstructionBuilder) {
//       childInstructions = insCbOrBuilder.build();
//     } else {
//       childInstructions = insCbOrBuilder(new InstructionBuilder()).build();
//     }
//     if (defCbOrBuilder instanceof DefinitionBuilder) {
//       definition = defCbOrBuilder.build();
//     } else {
//       definition = defCbOrBuilder(new DefinitionBuilder()).build();
//     }
//     const instruction = new HydrateTemplateController(definition, res, childInstructions, res === 'else');
//     this.instructions.push(instruction);
//     return this;
//   }
//   public element(res: string, ins: InstructionCb): InstructionBuilder {
//     const childInstructions = ins(new InstructionBuilder()).build();
//     const instruction = new HydrateElementInstruction(res, childInstructions);
//     this.instructions.push(instruction);
//     return this;
//   }
//   public attribute(res: string, ins: InstructionCb): InstructionBuilder {
//     const childInstructions = ins(new InstructionBuilder()).build();
//     const instruction = new HydrateAttributeInstruction(res, childInstructions);
//     this.instructions.push(instruction);
//     return this;
//   }
//   public build(): IInstruction[] {
//     const { instructions } = this;
//     this.instructions = null!;
//     return instructions;
//   }
// }
// export class DefinitionBuilder {
//   private static lastId: number = 0;
//   private name: string;
//   private templateBuilder: TemplateBuilder;
//   private instructionBuilder: InstructionBuilder;
//   private instructions: IInstruction[][];
//   constructor(name?: string) {
//     // eslint-disable-next-line prefer-template
//     this.name = name || ('$' + ++DefinitionBuilder.lastId);
//     this.templateBuilder = new TemplateBuilder();
//     this.instructionBuilder = new InstructionBuilder();
//     this.instructions = [];
//   }
//   public static element(name?: string): DefinitionBuilder {
//     return new DefinitionBuilder(name);
//   }
//   public static app(): DefinitionBuilder {
//     return new DefinitionBuilder('app');
//   }
//   public static repeat(insCb: InstructionCb, defCb: DefinitionCb): DefinitionBuilder;
//   public static repeat(insBuilder: InstructionBuilder, defBuilder: DefinitionBuilder): DefinitionBuilder;
//   public static repeat(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder;
//   public static repeat(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder {
//     return new DefinitionBuilder().repeat(insCbOrBuilder, defCbOrBuilder);
//   }
//   public static if(insCb: InstructionCb, defCb: DefinitionCb): DefinitionBuilder;
//   public static if(insBuilder: InstructionBuilder, defBuilder: DefinitionBuilder): DefinitionBuilder;
//   public static if(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder;
//   public static if(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder {
//     return new DefinitionBuilder().if(insCbOrBuilder, defCbOrBuilder);
//   }
//   public static with(insCb: InstructionCb, defCb: DefinitionCb): DefinitionBuilder;
//   public static with(insBuilder: InstructionBuilder, defBuilder: DefinitionBuilder): DefinitionBuilder;
//   public static with(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder;
//   public static with(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder {
//     return new DefinitionBuilder().with(insCbOrBuilder, defCbOrBuilder);
//   }
//   public static else(def: DefinitionCb): DefinitionBuilder {
//     return new DefinitionBuilder().else(def);
//   }
//   public static compose(ins: InstructionCb): DefinitionBuilder {
//     return new DefinitionBuilder().compose(ins);
//   }
//   public static replaceable(insCb: InstructionCb, defCb: DefinitionCb): DefinitionBuilder;
//   public static replaceable(insBuilder: InstructionBuilder, defBuilder: DefinitionBuilder): DefinitionBuilder;
//   public static replaceable(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder;
//   public static replaceable(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder {
//     return new DefinitionBuilder().replaceable(insCbOrBuilder, defCbOrBuilder);
//   }
//   public static interpolation(source: string): DefinitionBuilder;
//   public static interpolation(parts: ReadonlyArray<string>): DefinitionBuilder;
//   public static interpolation(parts: ReadonlyArray<string>, sources: ReadonlyArray<string>): DefinitionBuilder;
//   public static interpolation(partsOrSource: ReadonlyArray<string> | string, sources?: ReadonlyArray<string>): DefinitionBuilder;
//   public static interpolation(partsOrSource: ReadonlyArray<string> | string, sources?: ReadonlyArray<string>): DefinitionBuilder {
//     return new DefinitionBuilder().interpolation(partsOrSource, sources);
//   }
//   public repeat(insCb: InstructionCb, defCb: DefinitionCb): DefinitionBuilder;
//   public repeat(insBuilder: InstructionBuilder, defBuilder: DefinitionBuilder): DefinitionBuilder;
//   public repeat(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder;
//   public repeat(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder {
//     this.instructionBuilder.templateController('repeat', insCbOrBuilder, defCbOrBuilder);
//     this.templateBuilder.behavior();
//     return this.next();
//   }
//   public if(insCb: InstructionCb, defCb: DefinitionCb): DefinitionBuilder;
//   public if(insBuilder: InstructionBuilder, defBuilder: DefinitionBuilder): DefinitionBuilder;
//   public if(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder;
//   public if(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder {
//     this.instructionBuilder.templateController('if', insCbOrBuilder, defCbOrBuilder);
//     this.templateBuilder.behavior();
//     return this.next();
//   }
//   public with(insCb: InstructionCb, defCb: DefinitionCb): DefinitionBuilder;
//   public with(insBuilder: InstructionBuilder, defBuilder: DefinitionBuilder): DefinitionBuilder;
//   public with(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder;
//   public with(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder {
//     this.instructionBuilder.templateController('with', insCbOrBuilder, defCbOrBuilder);
//     this.templateBuilder.behavior();
//     return this.next();
//   }
//   public else(defCb: DefinitionCb): DefinitionBuilder;
//   public else(defBuilder: DefinitionBuilder): DefinitionBuilder;
//   public else(defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder;
//   public else(defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder {
//     this.instructionBuilder.templateController('else', b => b, defCbOrBuilder);
//     this.templateBuilder.behavior();
//     return this.next();
//   }
//   public compose(ins: InstructionCb): DefinitionBuilder {
//     this.instructionBuilder.element('au-compose', ins);
//     this.templateBuilder.behavior();
//     return this.next();
//   }
//   public replaceable(insCb: InstructionCb, defCb: DefinitionCb): DefinitionBuilder;
//   public replaceable(insBuilder: InstructionBuilder, defBuilder: DefinitionBuilder): DefinitionBuilder;
//   public replaceable(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder;
//   public replaceable(insCbOrBuilder: InstructionCb | InstructionBuilder, defCbOrBuilder: DefinitionCb | DefinitionBuilder): DefinitionBuilder {
//     this.instructionBuilder.templateController('replaceable', insCbOrBuilder, defCbOrBuilder);
//     this.templateBuilder.behavior();
//     return this.next();
//   }
//   public interpolation(source: string): DefinitionBuilder;
//   public interpolation(parts: ReadonlyArray<string>): DefinitionBuilder;
//   public interpolation(parts: ReadonlyArray<string>, sources: ReadonlyArray<string>): DefinitionBuilder;
//   public interpolation(partsOrSource: ReadonlyArray<string> | string, sources?: ReadonlyArray<string>): DefinitionBuilder;
//   public interpolation(partsOrSource: ReadonlyArray<string> | string, sources?: ReadonlyArray<string>): DefinitionBuilder {
//     this.instructionBuilder.interpolation(partsOrSource, sources);
//     this.templateBuilder.interpolation();
//     return this.next();
//   }
//   public build(): PartialCustomElementDefinition {
//     const { name, templateBuilder, instructions } = this;
//     const definition = { name, template: templateBuilder.build(), instructions };
//     this.name = null!;
//     this.templateBuilder = null!;
//     this.instructionBuilder = null!;
//     this.instructions = null!;
//     return definition;
//   }
//   private next(): DefinitionBuilder {
//     this.instructions.push(this.instructionBuilder.build());
//     this.instructionBuilder = new InstructionBuilder();
//     return this;
//   }
// }
// export class TestBuilder<T extends Constructable> {
//   private readonly container: IContainer;
//   private readonly Type: T;
//   constructor(Type: T) {
//     this.container = StandardConfiguration.createContainer();
//     this.container.register(Type as any);
//     this.Type = Type;
//   }
//   public static app<T extends object>(obj: T, defBuilder: DefinitionBuilder): T extends Constructable ? TestBuilder<Class<InstanceType<T>, T>> : TestBuilder<Class<T, {}>>;
//   public static app<T extends object>(obj: T, defCb: DefinitionCb): T extends Constructable ? TestBuilder<Class<InstanceType<T>, T>> : TestBuilder<Class<T, {}>>;
//   public static app<T extends object>(obj: T, defCbOrBuilder: DefinitionCb | DefinitionBuilder): T extends Constructable ? TestBuilder<Class<InstanceType<T>, T>> : TestBuilder<Class<T, {}>> {
//     let definition: PartialCustomElementDefinition;
//     if (defCbOrBuilder instanceof DefinitionBuilder) {
//       definition = defCbOrBuilder.build();
//     } else {
//       definition = defCbOrBuilder(DefinitionBuilder.app()).build();
//     }
//     const Type = (obj as { prototype?: any })['prototype'] ? obj : function (this: any): void {
//       Object.assign(this, obj);
//     };
//     const App = CustomElement.define(definition, Type as any);
//     return new TestBuilder(App) as any;
//   }
//   public element(obj: Record<string, unknown>, def: DefinitionCb): TestBuilder<T> {
//     const definition = def(DefinitionBuilder.element()).build();
//     const Type = (obj as { prototype?: any })['prototype'] ? obj : function (this: any): void {
//       Object.assign(this, obj);
//     };
//     const Resource = CustomElement.define(definition, Type as any);
//     this.container.register(Resource);
//     return this;
//   }
//   public build(): TestContext<InstanceType<T>> {
//     const { container, Type } = this;
//     const host = document.createElement('div');
//     const component = new Type();
//     return new TestContext(container, host, component as any);
//   }
// }
// export class TestContext<T extends object> {
//   public container: IContainer;
//   public host: INode;
//   public component: IViewModel & T;
//   public lifecycle: ILifecycle;
//   public isHydrated: boolean;
//   public assertCount: number;
//   constructor(
//     container: IContainer,
//     host: INode,
//     component: IViewModel & T
//   ) {
//     this.container = container;
//     this.host = host;
//     this.component = component;
//     this.lifecycle = container.get<ILifecycle>(ILifecycle);
//     this.isHydrated = false;
//     this.assertCount = 0;
//   }
//   public hydrate(renderingEngine?: IRenderingEngine, host?: INode): void {
//     renderingEngine = renderingEngine || this.container.get(IRenderingEngine);
//     host = host || this.host;
//     this.component.$hydrate(LF.none, this.container, host);
//   }
//   public bind(flags?: LF): void {
//     flags = arguments.length === 1 ? flags : LF.fromAppTask | LF.fromBind;
//     this.component.$bind(flags!);
//   }
//   public attach(flags?: LF): void {
//     flags = arguments.length === 1 ? flags : LF.fromAppTask | LF.fromAttach;
//     this.component.$attach(flags!);
//   }
//   public detach(flags?: LF): void {
//     flags = arguments.length === 1 ? flags : LF.fromStopTask | LF.fromDetach;
//     this.component.$detach(flags!);
//   }
//   public unbind(flags?: LF): void {
//     flags = arguments.length === 1 ? flags : LF.fromStopTask | LF.fromUnbind;
//     this.component.$unbind(flags!);
//   }
//   public start(): void {
//     if (this.isHydrated === false) {
//       this.hydrate();
//     }
//     this.bind();
//     this.attach();
//   }
//   public startAndAssertTextContentEquals(text: string): void {
//     this.start();
//     this.assertTextContentEquals(text);
//   }
//   public stop(): void {
//     this.detach();
//     this.unbind();
//   }
//   public stopAndAssertTextContentEmpty(): void {
//     this.stop();
//     this.assertTextContentEmpty();
//   }
//   public flush(flags?: LF): void {
//     flags = arguments.length === 1 ? flags : LF.fromAsyncFlush;
//     this.lifecycle.processFlushQueue(flags!);
//   }
//   public assertTextContentEquals(text: string): void {
//     ++this.assertCount;
//     const { textContent } = this.host as { textContent?: string };
//     if (textContent !== text) {
//       throw new Error(`Expected host.textContent to equal "${text}", but got: "${textContent}" (assert #${this.assertCount})`);
//     }
//   }
//   public assertTextContentEmpty(): void {
//     ++this.assertCount;
//     const { textContent } = this.host as { textContent?: string };
//     if (textContent !== '') {
//       throw new Error(`Expected host.textContent to be empty, but got: "${textContent}" (assert #${this.assertCount})`);
//     }
//   }
//   public dispose(): void {
//     this.container = null!;
//     this.host = null!;
//     this.component = null!;
//     this.lifecycle = null!;
//     this.isHydrated = null!;
//   }
// }
function createObserverLocator(containerOrLifecycle) {
    let container;
    if (containerOrLifecycle === undefined || !('get' in containerOrLifecycle)) {
        container = createContainer();
    }
    else {
        container = containerOrLifecycle;
    }
    const dummyLocator = {
        handles() {
            return false;
        }
    };
    Registration.instance(IDirtyChecker, null).register(container);
    Registration.instance(INodeObserverLocator, dummyLocator).register(container);
    return container.get(IObserverLocator);
}
function createScopeForTest(bindingContext = {}, parentBindingContext, isBoundary) {
    return parentBindingContext
        ? Scope.fromParent(Scope.create(parentBindingContext), bindingContext)
        : Scope.create(bindingContext, OverrideContext.create(bindingContext), isBoundary);
}
// export type CustomAttribute = Writable<IViewModel> & IComponentLifecycleMock;
// export function createCustomAttribute(nameOrDef: string | PartialCustomAttributeDefinition = 'foo') {
//   const Type = customAttribute(nameOrDef)(defineComponentLifecycleMock());
//   const sut: CustomAttribute = new (Type as any)();
//   return { Type, sut };
// }
// export function createTemplateController(nameOrDef: string | PartialCustomAttributeDefinition = 'foo') {
//   const Type = templateController(nameOrDef)(defineComponentLifecycleMock());
//   const sut: CustomAttribute = new (Type as any)();
//   return { Type, sut };
// }
// export type CustomElement = Writable<IViewModel> & IComponentLifecycleMock;
// export function createCustomElement(nameOrDef: string | PartialCustomElementDefinition) {
//   if (arguments.length === 0) {
//     nameOrDef = 'foo';
//   }
//   const Type = customElement(nameOrDef)(defineComponentLifecycleMock());
//   const sut: CustomElement = new (Type as any)();
//   return { Type, sut };
// }
// export function hydrateCustomElement<T>(Type: Constructable<T>, ctx: TestContext) {
//   const { container, dom } = ctx;
//   const ElementType: ICustomElementType = Type as any;
//   const parent = ctx.createElement('div');
//   const host = ctx.createElement(ElementType.description.name);
//   const createView = (factory: IViewFactory<T>): IController<T> => {
//     const view = new FakeView(ctx.lifecycle, factory);
//     view.$nodes = new NodeSequenceFactory(dom, '<div>Fake View</div>').createNodeSequence() as INodeSequence<T>;
//     return view;
//   };
//   const composable = new FakeViewFactory('fake-view', createView, ctx.lifecycle).create();
//   const instruction: IHydrateElementInstruction = {
//     type: InstructionType.composeElement,
//     res: 'au-compose',
//     instructions: []
//   };
//   dom.appendChild(parent, host);
//   const composableProvider = new InstanceProvider();
//   const elementProvider = new InstanceProvider();
//   const instructionProvider = new InstanceProvider<IInstruction>();
//   composableProvider.prepare(composable);
//   elementProvider.prepare(host);
//   instructionProvider.prepare(instruction);
//   container.register(ElementType);
//   container.registerResolver(IController, composableProvider);
//   container.registerResolver(IInstruction, instructionProvider);
//   dom.registerElementResolver(container, elementProvider);
//   const element = container.get<T & IViewModel>(
//     CustomElement.keyFrom(ElementType.description.name)
//   ) as T & IViewModel & InstanceType<typeof Type>;
//   element.$hydrate(LF.none, container, host);
//   return { element, parent };
// }

class Call {
    constructor(instance, args, method, index) {
        this.instance = instance;
        this.args = args;
        this.method = method;
        this.index = index;
    }
}
class CallCollection {
    constructor() {
        this.calls = [];
    }
    static register(container) {
        container.register(Registration.singleton(this, this));
    }
    addCall(instance, method, ...args) {
        this.calls.push(new Call(instance, args, method, this.calls.length));
        return this;
    }
}
function recordCalls(ctor, calls) {
    const proto = ctor.prototype;
    const properties = getOwnPropertyDescriptors(proto);
    for (const key in properties) {
        const property = properties[key];
        if (key !== 'constructor'
            && typeof property.value === 'function'
            && property.configurable === true
            && property.writable === true) {
            const original = property.value;
            const wrapper = function (...args) {
                calls.addCall(this, key, ...args);
                return Reflect_apply(original, this, args);
            };
            Reflect.defineProperty(wrapper, 'original', {
                value: original,
                writable: true,
                configurable: true,
                enumerable: false,
            });
            Reflect.defineProperty(proto, key, {
                value: wrapper,
                writable: property.writable,
                configurable: property.configurable,
                enumerable: property.enumerable,
            });
        }
        else {
            const { get, set } = property;
            let newGet, newSet;
            if (get) {
                newGet = function () {
                    calls.addCall(this, `get ${key}`, emptyArray);
                    return Reflect_apply(get, this, emptyArray);
                };
                Reflect.defineProperty(newGet, 'original', { value: get });
            }
            if (set) {
                newSet = function (valueToSet) {
                    calls.addCall(this, `get ${key}`, emptyArray);
                    Reflect_apply(set, this, [valueToSet]);
                };
                Reflect.defineProperty(newSet, 'original', { value: set });
            }
            if (get || set) {
                Reflect.defineProperty(proto, key, { ...property, get: newGet, set: newSet });
            }
        }
    }
}
function stopRecordingCalls(ctor) {
    const proto = ctor.prototype;
    const properties = getOwnPropertyDescriptors(proto);
    for (const key in properties) {
        const property = properties[key];
        if (key !== 'constructor'
            && typeof property.value === 'function'
            && property.configurable === true
            && property.writable === true) {
            Reflect.defineProperty(proto, key, {
                value: property.value.original,
                writable: property.writable,
                configurable: property.configurable,
                enumerable: property.enumerable,
            });
        }
        else {
            const { get, set } = property;
            if (get || set) {
                Reflect.defineProperty(proto, key, {
                    ...property,
                    get: get && Reflect.get(get, 'original'),
                    set: set && Reflect.get(set, 'original')
                });
            }
        }
    }
}
function trace(calls) {
    return function (ctor) {
        recordCalls(ctor, calls);
    };
}

export { CSS_PROPERTIES, Call, CallCollection, ChangeSet, CollectionChangeSet, JsonValueConverter, MockBinding, MockBindingBehavior, MockBrowserHistoryLocation, MockContext, MockPropertySubscriber, MockServiceLocator, MockSignaler, MockTracingExpression, MockValueConverter, PLATFORM, PLATFORMRegistration, PSEUDO_ELEMENTS, ProxyChangeSet, SortValueConverter, SpySubscriber, TestConfiguration, TestContext, _, assert, createContainer, createFixture, createObserverLocator, createScopeForTest, createSpy, eachCartesianJoin, eachCartesianJoinAsync, eachCartesianJoinFactory, ensureTaskQueuesEmpty, fail, generateCartesianProduct, getVisibleText, globalAttributeNames, h, hJsx, htmlStringify, inspect, instructionTypeName, jsonStringify, padLeft, padRight, recordCalls, setPlatform, stopRecordingCalls, stringify, trace, trimFull, verifyBindingInstructionsEqual, verifyEqual };
//# sourceMappingURL=index.dev.js.map
