// Significant portion of this code is copy-pasted from the node.js source
// Modifications consist primarily of removing dependencies on v8 natives and adding typings
// Original license:
/*
 * Copyright Joyent, Inc. and other Node contributors. All rights reserved.
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */
import { isArrayIndex, noop } from '@aurelia/kernel';
export const { getPrototypeOf, getOwnPropertyDescriptor, getOwnPropertyDescriptors, getOwnPropertyNames, getOwnPropertySymbols, defineProperty, defineProperties, } = Object;
export const Object_keys = Object.keys;
export const Object_is = Object.is;
export const Object_freeze = Object.freeze;
export const Object_assign = Object.assign;
export const Object_create = Object.create;
export const Number_isNaN = Number.isNaN;
export const Reflect_apply = Reflect.apply;
export const ArrayBuffer_isView = ArrayBuffer.isView;
export function uncurryThis(func) {
    return (thisArg, ...args) => Reflect_apply(func, thisArg, args);
}
export const hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);
export const propertyIsEnumerable = uncurryThis(Object.prototype.propertyIsEnumerable);
export const TypedArrayPrototype = getPrototypeOf(Uint8Array.prototype);
const TypedArrayProto_toStringTag = uncurryThis(getOwnPropertyDescriptor(TypedArrayPrototype, Symbol.toStringTag).get);
export const Object_toString = uncurryThis(Object.prototype.toString);
export const RegExp_toString = uncurryThis(RegExp.prototype.toString);
export const Date_toISOString = uncurryThis(Date.prototype.toISOString);
export const Date_toString = uncurryThis(Date.prototype.toString);
export const Error_toString = uncurryThis(Error.prototype.toString);
export const Date_getTime = uncurryThis(Date.prototype.getTime);
export const Set_values = uncurryThis(Set.prototype.values);
export const Map_entries = uncurryThis(Map.prototype.entries);
export const Boolean_valueOf = uncurryThis(Boolean.prototype.valueOf);
export const Number_valueOf = uncurryThis(Number.prototype.valueOf);
export const Symbol_valueOf = uncurryThis(Symbol.prototype.valueOf);
export const String_valueOf = uncurryThis(String.prototype.valueOf);
export function createNullObject(input) {
    return Object_assign(Object_create(null), input);
}
export function createFrozenNullObject(input) {
    return Object_freeze(createNullObject(input));
}
export function isBoolean(arg) {
    return typeof arg === 'boolean';
}
export function isNull(arg) {
    return arg === null;
}
export function isNullOrUndefined(arg) {
    return arg === null || arg === void 0;
}
export function isNumber(arg) {
    return typeof arg === 'number';
}
export function isString(arg) {
    return typeof arg === 'string';
}
export function isSymbol(arg) {
    return typeof arg === 'symbol';
}
export function isUndefined(arg) {
    return arg === void 0;
}
export function isObject(arg) {
    return arg !== null && typeof arg === 'object';
}
export function isFunction(arg) {
    return typeof arg === 'function';
}
export function isPrimitive(arg) {
    return arg === null || typeof arg !== 'object' && typeof arg !== 'function';
}
export function isArrayBuffer(arg) {
    return arg instanceof ArrayBuffer;
}
export function isSharedArrayBuffer(arg) {
    return arg instanceof SharedArrayBuffer;
}
export function isAnyArrayBuffer(arg) {
    return arg instanceof ArrayBuffer || arg instanceof SharedArrayBuffer;
}
export function isDate(arg) {
    return arg instanceof Date;
}
export function isMap(arg) {
    return arg instanceof Map;
}
export function isMapIterator(arg) {
    return Object_toString(arg) === '[object Map Iterator]';
}
export function isRegExp(arg) {
    return arg instanceof RegExp;
}
export function isSet(arg) {
    return arg instanceof Set;
}
export function isSetIterator(arg) {
    return Object_toString(arg) === '[object Set Iterator]';
}
export function isError(arg) {
    return arg instanceof Error;
}
export function isNumberObject(arg) {
    return arg instanceof Number;
}
export function isStringObject(arg) {
    return arg instanceof String;
}
export function isBooleanObject(arg) {
    return arg instanceof Boolean;
}
export function isSymbolObject(arg) {
    return arg instanceof Symbol;
}
export function isBoxedPrimitive(arg) {
    return (isNumberObject(arg)
        || isStringObject(arg)
        || isBooleanObject(arg)
        || isSymbolObject(arg));
}
export function isTypedArray(value) {
    return TypedArrayProto_toStringTag(value) !== void 0;
}
export function isUint8Array(value) {
    return TypedArrayProto_toStringTag(value) === 'Uint8Array';
}
export function isUint8ClampedArray(value) {
    return TypedArrayProto_toStringTag(value) === 'Uint8ClampedArray';
}
export function isUint16Array(value) {
    return TypedArrayProto_toStringTag(value) === 'Uint16Array';
}
export function isUint32Array(value) {
    return TypedArrayProto_toStringTag(value) === 'Uint32Array';
}
export function isInt8Array(value) {
    return TypedArrayProto_toStringTag(value) === 'Int8Array';
}
export function isInt16Array(value) {
    return TypedArrayProto_toStringTag(value) === 'Int16Array';
}
export function isInt32Array(value) {
    return TypedArrayProto_toStringTag(value) === 'Int32Array';
}
export function isFloat32Array(value) {
    return TypedArrayProto_toStringTag(value) === 'Float32Array';
}
export function isFloat64Array(value) {
    return TypedArrayProto_toStringTag(value) === 'Float64Array';
}
export function isArgumentsObject(value) {
    return Object_toString(value) === '[object Arguments]';
}
export function isDataView(value) {
    return Object_toString(value) === '[object DataView]';
}
export function isPromise(value) {
    return Object_toString(value) === '[object Promise]';
}
export function isWeakSet(value) {
    return Object_toString(value) === '[object WeakSet]';
}
export function isWeakMap(value) {
    return Object_toString(value) === '[object WeakMap]';
}
export function getOwnNonIndexProperties(val, showHidden) {
    if (showHidden) {
        return getOwnPropertyNames(val).filter(k => !isArrayIndex(k));
    }
    else {
        return Object_keys(val).filter(k => !isArrayIndex(k));
    }
}
export function getEnumerables(val, keys) {
    return keys.filter(k => propertyIsEnumerable(val, k));
}
// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
export const colors = Object_freeze({
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
export function removeColors(str) {
    return str.replace(colorRegExp, '');
}
export function join(output, separator) {
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
export function escapeAndQuoteString(str) {
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
export function escapeString(str) {
    return str.replace(strEscapeSequencesReplacer, escapeFn);
}
export function truncate(s, n) {
    if (typeof s === 'string') {
        return (s.length < n ? s : s.slice(0, n));
    }
    else {
        return s;
    }
}
export const trimFull = (function () {
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
export function createSpy(instanceOrInnerFn, key, callThroughOrInnerFn) {
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
//# sourceMappingURL=util.js.map