"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveAll = exports.onResolve = exports.isNativeFunction = exports.toLookup = exports.getPrototypeChain = exports.firstDefined = exports.mergeObjects = exports.mergeArrays = exports.bound = exports.mergeDistinct = exports.compareNumber = exports.resetId = exports.nextId = exports.toArray = exports.kebabCase = exports.pascalCase = exports.camelCase = exports.isStringOrDate = exports.isNumberOrBigInt = exports.isArrayIndex = void 0;
const platform_js_1 = require("./platform.js");
const isNumericLookup = {};
/**
 * Efficiently determine whether the provided property key is numeric
 * (and thus could be an array indexer) or not.
 *
 * Always returns true for values of type `'number'`.
 *
 * Otherwise, only returns true for strings that consist only of positive integers.
 *
 * Results are cached.
 */
function isArrayIndex(value) {
    switch (typeof value) {
        case 'number':
            return value >= 0 && (value | 0) === value;
        case 'string': {
            const result = isNumericLookup[value];
            if (result !== void 0) {
                return result;
            }
            const length = value.length;
            if (length === 0) {
                return isNumericLookup[value] = false;
            }
            let ch = 0;
            for (let i = 0; i < length; ++i) {
                ch = value.charCodeAt(i);
                if (i === 0 && ch === 0x30 && length > 1 /* must not start with 0 */ || ch < 0x30 /* 0 */ || ch > 0x39 /* 9 */) {
                    return isNumericLookup[value] = false;
                }
            }
            return isNumericLookup[value] = true;
        }
        default:
            return false;
    }
}
exports.isArrayIndex = isArrayIndex;
/**
 * Determines if the value passed is a number or bigint for parsing purposes
 *
 * @param value - Value to evaluate
 */
function isNumberOrBigInt(value) {
    switch (typeof value) {
        case 'number':
        case 'bigint':
            return true;
        default:
            return false;
    }
}
exports.isNumberOrBigInt = isNumberOrBigInt;
/**
 * Determines if the value passed is a number or bigint for parsing purposes
 *
 * @param value - Value to evaluate
 */
function isStringOrDate(value) {
    switch (typeof value) {
        case 'string':
            return true;
        case 'object':
            return value instanceof Date;
        default:
            return false;
    }
}
exports.isStringOrDate = isStringOrDate;
/**
 * Base implementation of camel and kebab cases
 */
const baseCase = (function () {
    let CharKind;
    (function (CharKind) {
        CharKind[CharKind["none"] = 0] = "none";
        CharKind[CharKind["digit"] = 1] = "digit";
        CharKind[CharKind["upper"] = 2] = "upper";
        CharKind[CharKind["lower"] = 3] = "lower";
    })(CharKind || (CharKind = {}));
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const isDigit = Object.assign(Object.create(null), {
        '0': true,
        '1': true,
        '2': true,
        '3': true,
        '4': true,
        '5': true,
        '6': true,
        '7': true,
        '8': true,
        '9': true,
    });
    function charToKind(char) {
        if (char === '') {
            // We get this if we do charAt() with an index out of range
            return 0 /* none */;
        }
        if (char !== char.toUpperCase()) {
            return 3 /* lower */;
        }
        if (char !== char.toLowerCase()) {
            return 2 /* upper */;
        }
        if (isDigit[char] === true) {
            return 1 /* digit */;
        }
        return 0 /* none */;
    }
    return function (input, cb) {
        const len = input.length;
        if (len === 0) {
            return input;
        }
        let sep = false;
        let output = '';
        let prevKind;
        let curChar = '';
        let curKind = 0 /* none */;
        let nextChar = input.charAt(0);
        let nextKind = charToKind(nextChar);
        for (let i = 0; i < len; ++i) {
            prevKind = curKind;
            curChar = nextChar;
            curKind = nextKind;
            nextChar = input.charAt(i + 1);
            nextKind = charToKind(nextChar);
            if (curKind === 0 /* none */) {
                if (output.length > 0) {
                    // Only set sep to true if it's not at the beginning of output.
                    sep = true;
                }
            }
            else {
                if (!sep && output.length > 0 && curKind === 2 /* upper */) {
                    // Separate UAFoo into UA Foo.
                    // Separate uaFOO into ua FOO.
                    sep = prevKind === 3 /* lower */ || nextKind === 3 /* lower */;
                }
                output += cb(curChar, sep);
                sep = false;
            }
        }
        return output;
    };
})();
/**
 * Efficiently convert a string to camelCase.
 *
 * Non-alphanumeric characters are treated as separators.
 *
 * Primarily used by Aurelia to convert DOM attribute names to ViewModel property names.
 *
 * Results are cached.
 */
exports.camelCase = (function () {
    const cache = Object.create(null);
    function callback(char, sep) {
        return sep ? char.toUpperCase() : char.toLowerCase();
    }
    return function (input) {
        let output = cache[input];
        if (output === void 0) {
            output = cache[input] = baseCase(input, callback);
        }
        return output;
    };
})();
/**
 * Efficiently convert a string to PascalCase.
 *
 * Non-alphanumeric characters are treated as separators.
 *
 * Primarily used by Aurelia to convert element names to class names for synthetic types.
 *
 * Results are cached.
 */
exports.pascalCase = (function () {
    const cache = Object.create(null);
    return function (input) {
        let output = cache[input];
        if (output === void 0) {
            output = exports.camelCase(input);
            if (output.length > 0) {
                output = output[0].toUpperCase() + output.slice(1);
            }
            cache[input] = output;
        }
        return output;
    };
})();
/**
 * Efficiently convert a string to kebab-case.
 *
 * Non-alphanumeric characters are treated as separators.
 *
 * Primarily used by Aurelia to convert ViewModel property names to DOM attribute names.
 *
 * Results are cached.
 */
exports.kebabCase = (function () {
    const cache = Object.create(null);
    function callback(char, sep) {
        return sep ? `-${char.toLowerCase()}` : char.toLowerCase();
    }
    return function (input) {
        let output = cache[input];
        if (output === void 0) {
            output = cache[input] = baseCase(input, callback);
        }
        return output;
    };
})();
/**
 * Efficiently (up to 10x faster than `Array.from`) convert an `ArrayLike` to a real array.
 *
 * Primarily used by Aurelia to convert DOM node lists to arrays.
 */
function toArray(input) {
    // benchmark: http://jsben.ch/xjsyF
    const { length } = input;
    const arr = Array(length);
    for (let i = 0; i < length; ++i) {
        arr[i] = input[i];
    }
    return arr;
}
exports.toArray = toArray;
const ids = {};
/**
 * Retrieve the next ID in a sequence for a given string, starting with `1`.
 *
 * Used by Aurelia to assign unique ID's to controllers and resources.
 *
 * Aurelia will always prepend the context name with `au$`, so as long as you avoid
 * using that convention you should be safe from collisions.
 */
function nextId(context) {
    if (ids[context] === void 0) {
        ids[context] = 0;
    }
    return ++ids[context];
}
exports.nextId = nextId;
/**
 * Reset the ID for the given string, so that `nextId` will return `1` again for the next call.
 *
 * Used by Aurelia to reset ID's in between unit tests.
 */
function resetId(context) {
    ids[context] = 0;
}
exports.resetId = resetId;
/**
 * A compare function to pass to `Array.prototype.sort` for sorting numbers.
 * This is needed for numeric sort, since the default sorts them as strings.
 */
function compareNumber(a, b) {
    return a - b;
}
exports.compareNumber = compareNumber;
/**
 * Efficiently merge and deduplicate the (primitive) values in two arrays.
 *
 * Does not deduplicate existing values in the first array.
 *
 * Guards against null or undefined arrays.
 *
 * Returns `emptyArray` if both arrays are either `null`, `undefined` or `emptyArray`
 *
 * @param slice - If `true`, always returns a new array copy (unless neither array is/has a value)
 */
function mergeDistinct(arr1, arr2, slice) {
    if (arr1 === void 0 || arr1 === null || arr1 === platform_js_1.emptyArray) {
        if (arr2 === void 0 || arr2 === null || arr2 === platform_js_1.emptyArray) {
            return platform_js_1.emptyArray;
        }
        else {
            return slice ? arr2.slice(0) : arr2;
        }
    }
    else if (arr2 === void 0 || arr2 === null || arr2 === platform_js_1.emptyArray) {
        return slice ? arr1.slice(0) : arr1;
    }
    const lookup = {};
    const arr3 = slice ? arr1.slice(0) : arr1;
    let len1 = arr1.length;
    let len2 = arr2.length;
    while (len1-- > 0) {
        lookup[arr1[len1]] = true;
    }
    let item;
    while (len2-- > 0) {
        item = arr2[len2];
        if (lookup[item] === void 0) {
            arr3.push(item);
            lookup[item] = true;
        }
    }
    return arr3;
}
exports.mergeDistinct = mergeDistinct;
/**
 * Decorator. (lazily) bind the method to the class instance on first call.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
function bound(target, key, descriptor) {
    return {
        configurable: true,
        enumerable: descriptor.enumerable,
        get() {
            const boundFn = descriptor.value.bind(this);
            Reflect.defineProperty(this, key, {
                value: boundFn,
                writable: true,
                configurable: true,
                enumerable: descriptor.enumerable,
            });
            return boundFn;
        },
    };
}
exports.bound = bound;
function mergeArrays(...arrays) {
    const result = [];
    let k = 0;
    const arraysLen = arrays.length;
    let arrayLen = 0;
    let array;
    for (let i = 0; i < arraysLen; ++i) {
        array = arrays[i];
        if (array !== void 0) {
            arrayLen = array.length;
            for (let j = 0; j < arrayLen; ++j) {
                result[k++] = array[j];
            }
        }
    }
    return result;
}
exports.mergeArrays = mergeArrays;
function mergeObjects(...objects) {
    const result = {};
    const objectsLen = objects.length;
    let object;
    let key;
    for (let i = 0; i < objectsLen; ++i) {
        object = objects[i];
        if (object !== void 0) {
            for (key in object) {
                result[key] = object[key];
            }
        }
    }
    return result;
}
exports.mergeObjects = mergeObjects;
function firstDefined(...values) {
    const len = values.length;
    let value;
    for (let i = 0; i < len; ++i) {
        value = values[i];
        if (value !== void 0) {
            return value;
        }
    }
    throw new Error(`No default value found`);
}
exports.firstDefined = firstDefined;
exports.getPrototypeChain = (function () {
    const functionPrototype = Function.prototype;
    const getPrototypeOf = Object.getPrototypeOf;
    const cache = new WeakMap();
    let proto = functionPrototype;
    let i = 0;
    let chain = void 0;
    return function (Type) {
        chain = cache.get(Type);
        if (chain === void 0) {
            cache.set(Type, chain = [proto = Type]);
            i = 0;
            while ((proto = getPrototypeOf(proto)) !== functionPrototype) {
                chain[++i] = proto;
            }
        }
        return chain;
    };
})();
function toLookup(...objs) {
    return Object.assign(Object.create(null), ...objs);
}
exports.toLookup = toLookup;
/**
 * Determine whether the value is a native function.
 *
 * @param fn - The function to check.
 * @returns `true` is the function is a native function, otherwise `false`
 */
exports.isNativeFunction = (function () {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const lookup = new WeakMap();
    let isNative = false;
    let sourceText = '';
    let i = 0;
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (fn) {
        isNative = lookup.get(fn);
        if (isNative === void 0) {
            sourceText = fn.toString();
            i = sourceText.length;
            // http://www.ecma-international.org/ecma-262/#prod-NativeFunction
            isNative = (
            // 29 is the length of 'function () { [native code] }' which is the smallest length of a native function string
            i >= 29 &&
                // 100 seems to be a safe upper bound of the max length of a native function. In Chrome and FF it's 56, in Edge it's 61.
                i <= 100 &&
                // This whole heuristic *could* be tricked by a comment. Do we need to care about that?
                sourceText.charCodeAt(i - 1) === 0x7D && // }
                // TODO: the spec is a little vague about the precise constraints, so we do need to test this across various browsers to make sure just one whitespace is a safe assumption.
                sourceText.charCodeAt(i - 2) <= 0x20 && // whitespace
                sourceText.charCodeAt(i - 3) === 0x5D && // ]
                sourceText.charCodeAt(i - 4) === 0x65 && // e
                sourceText.charCodeAt(i - 5) === 0x64 && // d
                sourceText.charCodeAt(i - 6) === 0x6F && // o
                sourceText.charCodeAt(i - 7) === 0x63 && // c
                sourceText.charCodeAt(i - 8) === 0x20 && //
                sourceText.charCodeAt(i - 9) === 0x65 && // e
                sourceText.charCodeAt(i - 10) === 0x76 && // v
                sourceText.charCodeAt(i - 11) === 0x69 && // i
                sourceText.charCodeAt(i - 12) === 0x74 && // t
                sourceText.charCodeAt(i - 13) === 0x61 && // a
                sourceText.charCodeAt(i - 14) === 0x6E && // n
                sourceText.charCodeAt(i - 15) === 0x58 // [
            );
            lookup.set(fn, isNative);
        }
        return isNative;
    };
})();
/**
 * Normalize a potential promise via a callback, to ensure things stay synchronous when they can.
 *
 * If the value is a promise, it is `then`ed before the callback is invoked. Otherwise the callback is invoked synchronously.
 */
function onResolve(maybePromise, resolveCallback) {
    if (maybePromise instanceof Promise) {
        return maybePromise.then(resolveCallback);
    }
    return resolveCallback(maybePromise);
}
exports.onResolve = onResolve;
/**
 * Normalize an array of potential promises, to ensure things stay synchronous when they can.
 *
 * If exactly one value is a promise, then that promise is returned.
 *
 * If more than one value is a promise, a new `Promise.all` is returned.
 *
 * If none of the values is a promise, nothing is returned, to indicate that things can stay synchronous.
 */
function resolveAll(...maybePromises) {
    let maybePromise = void 0;
    let firstPromise = void 0;
    let promises = void 0;
    for (let i = 0, ii = maybePromises.length; i < ii; ++i) {
        maybePromise = maybePromises[i];
        if ((maybePromise = maybePromises[i]) instanceof Promise) {
            if (firstPromise === void 0) {
                firstPromise = maybePromise;
            }
            else if (promises === void 0) {
                promises = [firstPromise, maybePromise];
            }
            else {
                promises.push(maybePromise);
            }
        }
    }
    if (promises === void 0) {
        return firstPromise;
    }
    return Promise.all(promises);
}
exports.resolveAll = resolveAll;
//# sourceMappingURL=functions.js.map