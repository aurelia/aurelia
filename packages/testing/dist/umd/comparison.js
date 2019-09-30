// Significant portion of this code is copy-pasted from the node.js source
// Modifications consist primarily of removing dependencies on v8 natives and adding typings
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./util"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const util_1 = require("./util");
    /* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-non-null-assertion, @typescript-eslint/ban-types */
    var IterationType;
    (function (IterationType) {
        IterationType[IterationType["noIterator"] = 0] = "noIterator";
        IterationType[IterationType["isArray"] = 1] = "isArray";
        IterationType[IterationType["isSet"] = 2] = "isSet";
        IterationType[IterationType["isMap"] = 3] = "isMap";
    })(IterationType = exports.IterationType || (exports.IterationType = {}));
    function areSimilarRegExps(a, b) {
        return a.source === b.source && a.flags === b.flags;
    }
    exports.areSimilarRegExps = areSimilarRegExps;
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
    exports.areSimilarFloatArrays = areSimilarFloatArrays;
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
    exports.compare = compare;
    function areSimilarTypedArrays(a, b) {
        if (a.byteLength !== b.byteLength) {
            return false;
        }
        return compare(new Uint8Array(a.buffer, a.byteOffset, a.byteLength), new Uint8Array(b.buffer, b.byteOffset, b.byteLength)) === 0;
    }
    exports.areSimilarTypedArrays = areSimilarTypedArrays;
    function areEqualArrayBuffers(buf1, buf2) {
        return (buf1.byteLength === buf2.byteLength
            && compare(new Uint8Array(buf1), new Uint8Array(buf2)) === 0);
    }
    exports.areEqualArrayBuffers = areEqualArrayBuffers;
    function isEqualBoxedPrimitive(val1, val2) {
        if (util_1.isNumberObject(val1)) {
            return (util_1.isNumberObject(val2)
                && util_1.Object_is(util_1.Number_valueOf(val1), util_1.Number_valueOf(val2)));
        }
        if (util_1.isStringObject(val1)) {
            return (util_1.isStringObject(val2)
                && util_1.String_valueOf(val1) === util_1.String_valueOf(val2));
        }
        if (util_1.isBooleanObject(val1)) {
            return (util_1.isBooleanObject(val2)
                && util_1.Boolean_valueOf(val1) === util_1.Boolean_valueOf(val2));
        }
        return (util_1.isSymbolObject(val2)
            && util_1.Symbol_valueOf(val1) === util_1.Symbol_valueOf(val2));
    }
    exports.isEqualBoxedPrimitive = isEqualBoxedPrimitive;
    function innerDeepEqual(val1, val2, strict, memos) {
        if (val1 === val2) {
            if (val1 !== 0) {
                return true;
            }
            return strict ? util_1.Object_is(val1, val2) : true;
        }
        if (strict) {
            if (typeof val1 !== 'object') {
                return (util_1.isNumber(val1)
                    && util_1.Number_isNaN(val1)
                    && util_1.Number_isNaN(val2));
            }
            if (typeof val2 !== 'object' || val1 === null || val2 === null) {
                return false;
            }
            if (util_1.getPrototypeOf(val1) !== util_1.getPrototypeOf(val2)) {
                return false;
            }
        }
        else {
            if (!util_1.isObject(val1)) {
                if (!util_1.isObject(val2)) {
                    return val1 == val2;
                }
                return false;
            }
            if (!util_1.isObject(val2)) {
                return false;
            }
        }
        const val1Tag = util_1.Object_toString(val1);
        const val2Tag = util_1.Object_toString(val2);
        if (val1Tag !== val2Tag) {
            return false;
        }
        if (Array.isArray(val1)) {
            if (val1.length !== val2.length) {
                return false;
            }
            const keys1 = util_1.getOwnNonIndexProperties(val1, false);
            const keys2 = util_1.getOwnNonIndexProperties(val2, false);
            if (keys1.length !== keys2.length) {
                return false;
            }
            return keyCheck(val1, val2, strict, memos, 1 /* isArray */, keys1);
        }
        if (val1Tag === '[object Object]') {
            return keyCheck(val1, val2, strict, memos, 0 /* noIterator */);
        }
        if (util_1.isDate(val1)) {
            if (util_1.Date_getTime(val1) !== util_1.Date_getTime(val2)) {
                return false;
            }
        }
        else if (util_1.isRegExp(val1)) {
            if (!areSimilarRegExps(val1, val2)) {
                return false;
            }
        }
        else if (util_1.isError(val1)) {
            if (val1.message !== val2.message || val1.name !== val2.name) {
                return false;
            }
        }
        else if (util_1.ArrayBuffer_isView(val1)) {
            if (!strict && (util_1.isFloat32Array(val1) || util_1.isFloat64Array(val1))) {
                if (!areSimilarFloatArrays(val1, val2)) {
                    return false;
                }
            }
            else if (!areSimilarTypedArrays(val1, val2)) {
                return false;
            }
            const keys1 = util_1.getOwnNonIndexProperties(val1, false);
            const keys2 = util_1.getOwnNonIndexProperties(val2, false);
            if (keys1.length !== keys2.length) {
                return false;
            }
            return keyCheck(val1, val2, strict, memos, 0 /* noIterator */, keys1);
        }
        else if (util_1.isSet(val1)) {
            if (!util_1.isSet(val2) || val1.size !== val2.size) {
                return false;
            }
            return keyCheck(val1, val2, strict, memos, 2 /* isSet */);
        }
        else if (util_1.isMap(val1)) {
            if (!util_1.isMap(val2) || val1.size !== val2.size) {
                return false;
            }
            return keyCheck(val1, val2, strict, memos, 3 /* isMap */);
        }
        else if (util_1.isAnyArrayBuffer(val1)) {
            if (!areEqualArrayBuffers(val1, val2)) {
                return false;
            }
        }
        else if (util_1.isBoxedPrimitive(val1) && !isEqualBoxedPrimitive(val1, val2)) {
            return false;
        }
        return keyCheck(val1, val2, strict, memos, 0 /* noIterator */);
    }
    exports.innerDeepEqual = innerDeepEqual;
    function keyCheck(val1, val2, strict, memos, iterationType, aKeys) {
        if (arguments.length === 5) {
            aKeys = util_1.Object_keys(val1);
            const bKeys = util_1.Object_keys(val2);
            if (aKeys.length !== bKeys.length) {
                return false;
            }
        }
        let i = 0;
        for (; i < aKeys.length; i++) {
            if (!util_1.hasOwnProperty(val2, aKeys[i])) {
                return false;
            }
        }
        if (strict && arguments.length === 5) {
            const symbolKeysA = util_1.getOwnPropertySymbols(val1);
            if (symbolKeysA.length !== 0) {
                let count = 0;
                for (i = 0; i < symbolKeysA.length; i++) {
                    const key = symbolKeysA[i];
                    if (util_1.propertyIsEnumerable(val1, key)) {
                        if (!util_1.propertyIsEnumerable(val2, key)) {
                            return false;
                        }
                        aKeys.push(key);
                        count++;
                    }
                    else if (util_1.propertyIsEnumerable(val2, key)) {
                        return false;
                    }
                }
                const symbolKeysB = util_1.getOwnPropertySymbols(val2);
                if (symbolKeysA.length !== symbolKeysB.length
                    && util_1.getEnumerables(val2, symbolKeysB).length !== count) {
                    return false;
                }
            }
            else {
                const symbolKeysB = util_1.getOwnPropertySymbols(val2);
                if (symbolKeysB.length !== 0
                    && util_1.getEnumerables(val2, symbolKeysB).length !== 0) {
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
    exports.keyCheck = keyCheck;
    function setHasEqualElement(set, val1, strict, memos) {
        for (const val2 of set) {
            if (innerDeepEqual(val1, val2, strict, memos)) {
                set.delete(val2);
                return true;
            }
        }
        return false;
    }
    exports.setHasEqualElement = setHasEqualElement;
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
                if (util_1.Number_isNaN(val)) {
                    return false;
                }
        }
        return true;
    }
    exports.findLooseMatchingPrimitives = findLooseMatchingPrimitives;
    function setMightHaveLoosePrimitive(a, b, val) {
        const altValue = findLooseMatchingPrimitives(val);
        if (altValue != null) {
            return altValue;
        }
        return b.has(altValue) && !a.has(altValue);
    }
    exports.setMightHaveLoosePrimitive = setMightHaveLoosePrimitive;
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
    exports.mapMightHaveLoosePrimitive = mapMightHaveLoosePrimitive;
    function setEquiv(a, b, strict, memos) {
        let set = null;
        for (const val of a) {
            if (util_1.isObject(val)) {
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
                if (util_1.isObject(val)) {
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
    exports.setEquiv = setEquiv;
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
    exports.mapHasEqualEntry = mapHasEqualEntry;
    function mapEquiv(a, b, strict, memos) {
        let set = null;
        for (const [key, item1] of a) {
            if (util_1.isObject(key)) {
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
                if (util_1.isObject(key)) {
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
    exports.mapEquiv = mapEquiv;
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
                if (util_1.hasOwnProperty(a, i)) {
                    if (!util_1.hasOwnProperty(b, i)
                        || !innerDeepEqual(a[i], b[i], strict, memos)) {
                        return false;
                    }
                }
                else if (util_1.hasOwnProperty(b, i)) {
                    return false;
                }
                else {
                    const keysA = util_1.Object_keys(a);
                    for (; i < keysA.length; i++) {
                        const key = keysA[i];
                        if (!util_1.hasOwnProperty(b, key)
                            || !innerDeepEqual(a[key], b[key], strict, memos)) {
                            return false;
                        }
                    }
                    if (keysA.length !== util_1.Object_keys(b).length) {
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
    exports.objEquiv = objEquiv;
    function isDeepEqual(val1, val2) {
        return innerDeepEqual(val1, val2, false);
    }
    exports.isDeepEqual = isDeepEqual;
    function isDeepStrictEqual(val1, val2) {
        return innerDeepEqual(val1, val2, true);
    }
    exports.isDeepStrictEqual = isDeepStrictEqual;
});
//# sourceMappingURL=comparison.js.map