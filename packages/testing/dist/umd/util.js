// Significant portion of this code is copy-pasted from the node.js source
// Modifications consist primarily of removing dependencies on v8 natives and adding typings
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
    const kernel_1 = require("@aurelia/kernel");
    exports.getPrototypeOf = Object.getPrototypeOf, exports.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor, exports.getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors, exports.getOwnPropertyNames = Object.getOwnPropertyNames, exports.getOwnPropertySymbols = Object.getOwnPropertySymbols, exports.defineProperty = Object.defineProperty, exports.defineProperties = Object.defineProperties;
    exports.Object_keys = Object.keys;
    exports.Object_is = Object.is;
    exports.Object_freeze = Object.freeze;
    exports.Object_assign = Object.assign;
    exports.Object_create = Object.create;
    exports.Number_isNaN = Number.isNaN;
    exports.Reflect_apply = Reflect.apply;
    exports.ArrayBuffer_isView = ArrayBuffer.isView;
    function uncurryThis(func) {
        return (thisArg, ...args) => exports.Reflect_apply(func, thisArg, args);
    }
    exports.uncurryThis = uncurryThis;
    exports.hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);
    exports.propertyIsEnumerable = uncurryThis(Object.prototype.propertyIsEnumerable);
    exports.TypedArrayPrototype = exports.getPrototypeOf(Uint8Array.prototype);
    const TypedArrayProto_toStringTag = uncurryThis(exports.getOwnPropertyDescriptor(exports.TypedArrayPrototype, Symbol.toStringTag).get);
    exports.Object_toString = uncurryThis(Object.prototype.toString);
    exports.RegExp_toString = uncurryThis(RegExp.prototype.toString);
    exports.Date_toISOString = uncurryThis(Date.prototype.toISOString);
    exports.Date_toString = uncurryThis(Date.prototype.toString);
    exports.Error_toString = uncurryThis(Error.prototype.toString);
    exports.Date_getTime = uncurryThis(Date.prototype.getTime);
    exports.Set_values = uncurryThis(Set.prototype.values);
    exports.Map_entries = uncurryThis(Map.prototype.entries);
    exports.Boolean_valueOf = uncurryThis(Boolean.prototype.valueOf);
    exports.Number_valueOf = uncurryThis(Number.prototype.valueOf);
    exports.Symbol_valueOf = uncurryThis(Symbol.prototype.valueOf);
    exports.String_valueOf = uncurryThis(String.prototype.valueOf);
    function createNullObject(input) {
        return exports.Object_assign(exports.Object_create(null), input);
    }
    exports.createNullObject = createNullObject;
    function createFrozenNullObject(input) {
        return exports.Object_freeze(createNullObject(input));
    }
    exports.createFrozenNullObject = createFrozenNullObject;
    function isBoolean(arg) {
        return typeof arg === 'boolean';
    }
    exports.isBoolean = isBoolean;
    function isNull(arg) {
        return arg === null;
    }
    exports.isNull = isNull;
    function isNullOrUndefined(arg) {
        return arg === null || arg === void 0;
    }
    exports.isNullOrUndefined = isNullOrUndefined;
    function isNumber(arg) {
        return typeof arg === 'number';
    }
    exports.isNumber = isNumber;
    function isString(arg) {
        return typeof arg === 'string';
    }
    exports.isString = isString;
    function isSymbol(arg) {
        return typeof arg === 'symbol';
    }
    exports.isSymbol = isSymbol;
    function isUndefined(arg) {
        return arg === void 0;
    }
    exports.isUndefined = isUndefined;
    function isObject(arg) {
        return arg !== null && typeof arg === 'object';
    }
    exports.isObject = isObject;
    function isFunction(arg) {
        return typeof arg === 'function';
    }
    exports.isFunction = isFunction;
    function isPrimitive(arg) {
        return arg === null || typeof arg !== 'object' && typeof arg !== 'function';
    }
    exports.isPrimitive = isPrimitive;
    function isArrayBuffer(arg) {
        return arg instanceof ArrayBuffer;
    }
    exports.isArrayBuffer = isArrayBuffer;
    function isSharedArrayBuffer(arg) {
        return arg instanceof SharedArrayBuffer;
    }
    exports.isSharedArrayBuffer = isSharedArrayBuffer;
    function isAnyArrayBuffer(arg) {
        return arg instanceof ArrayBuffer || arg instanceof SharedArrayBuffer;
    }
    exports.isAnyArrayBuffer = isAnyArrayBuffer;
    function isDate(arg) {
        return arg instanceof Date;
    }
    exports.isDate = isDate;
    function isMap(arg) {
        return arg instanceof Map;
    }
    exports.isMap = isMap;
    function isMapIterator(arg) {
        return exports.Object_toString(arg) === '[object Map Iterator]';
    }
    exports.isMapIterator = isMapIterator;
    function isRegExp(arg) {
        return arg instanceof RegExp;
    }
    exports.isRegExp = isRegExp;
    function isSet(arg) {
        return arg instanceof Set;
    }
    exports.isSet = isSet;
    function isSetIterator(arg) {
        return exports.Object_toString(arg) === '[object Set Iterator]';
    }
    exports.isSetIterator = isSetIterator;
    function isError(arg) {
        return arg instanceof Error;
    }
    exports.isError = isError;
    function isNumberObject(arg) {
        return arg instanceof Number;
    }
    exports.isNumberObject = isNumberObject;
    function isStringObject(arg) {
        return arg instanceof String;
    }
    exports.isStringObject = isStringObject;
    function isBooleanObject(arg) {
        return arg instanceof Boolean;
    }
    exports.isBooleanObject = isBooleanObject;
    function isSymbolObject(arg) {
        return arg instanceof Symbol;
    }
    exports.isSymbolObject = isSymbolObject;
    function isBoxedPrimitive(arg) {
        return (isNumberObject(arg)
            || isStringObject(arg)
            || isBooleanObject(arg)
            || isSymbolObject(arg));
    }
    exports.isBoxedPrimitive = isBoxedPrimitive;
    function isTypedArray(value) {
        return TypedArrayProto_toStringTag(value) !== void 0;
    }
    exports.isTypedArray = isTypedArray;
    function isUint8Array(value) {
        return TypedArrayProto_toStringTag(value) === 'Uint8Array';
    }
    exports.isUint8Array = isUint8Array;
    function isUint8ClampedArray(value) {
        return TypedArrayProto_toStringTag(value) === 'Uint8ClampedArray';
    }
    exports.isUint8ClampedArray = isUint8ClampedArray;
    function isUint16Array(value) {
        return TypedArrayProto_toStringTag(value) === 'Uint16Array';
    }
    exports.isUint16Array = isUint16Array;
    function isUint32Array(value) {
        return TypedArrayProto_toStringTag(value) === 'Uint32Array';
    }
    exports.isUint32Array = isUint32Array;
    function isInt8Array(value) {
        return TypedArrayProto_toStringTag(value) === 'Int8Array';
    }
    exports.isInt8Array = isInt8Array;
    function isInt16Array(value) {
        return TypedArrayProto_toStringTag(value) === 'Int16Array';
    }
    exports.isInt16Array = isInt16Array;
    function isInt32Array(value) {
        return TypedArrayProto_toStringTag(value) === 'Int32Array';
    }
    exports.isInt32Array = isInt32Array;
    function isFloat32Array(value) {
        return TypedArrayProto_toStringTag(value) === 'Float32Array';
    }
    exports.isFloat32Array = isFloat32Array;
    function isFloat64Array(value) {
        return TypedArrayProto_toStringTag(value) === 'Float64Array';
    }
    exports.isFloat64Array = isFloat64Array;
    function isArgumentsObject(value) {
        return exports.Object_toString(value) === '[object Arguments]';
    }
    exports.isArgumentsObject = isArgumentsObject;
    function isDataView(value) {
        return exports.Object_toString(value) === '[object DataView]';
    }
    exports.isDataView = isDataView;
    function isPromise(value) {
        return exports.Object_toString(value) === '[object Promise]';
    }
    exports.isPromise = isPromise;
    function isWeakSet(value) {
        return exports.Object_toString(value) === '[object WeakSet]';
    }
    exports.isWeakSet = isWeakSet;
    function isWeakMap(value) {
        return exports.Object_toString(value) === '[object WeakMap]';
    }
    exports.isWeakMap = isWeakMap;
    function getOwnNonIndexProperties(val, showHidden) {
        if (showHidden) {
            return exports.getOwnPropertyNames(val).filter(k => !kernel_1.isNumeric(k));
        }
        else {
            return exports.Object_keys(val).filter(k => !kernel_1.isNumeric(k));
        }
    }
    exports.getOwnNonIndexProperties = getOwnNonIndexProperties;
    function getEnumerables(val, keys) {
        return keys.filter(k => exports.propertyIsEnumerable(val, k));
    }
    exports.getEnumerables = getEnumerables;
    // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
    exports.colors = exports.Object_freeze({
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
    exports.removeColors = removeColors;
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
    exports.join = join;
    const asciiEscape = exports.Object_freeze([
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
    exports.escapeAndQuoteString = escapeAndQuoteString;
    function escapeString(str) {
        return str.replace(strEscapeSequencesReplacer, escapeFn);
    }
    exports.escapeString = escapeString;
    function truncate(s, n) {
        if (typeof s === 'string') {
            return (s.length < n ? s : s.slice(0, n));
        }
        else {
            return s;
        }
    }
    exports.truncate = truncate;
    exports.trimFull = (function () {
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
            $restore = kernel_1.PLATFORM.noop;
        }
        else if (key === void 0) {
            $spy = function spy(...args) {
                calls.push(args);
                return instanceOrInnerFn(...args);
            };
            $restore = kernel_1.PLATFORM.noop;
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
    exports.createSpy = createSpy;
});
//# sourceMappingURL=util.js.map