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

import { isArrayIndex, noop, Primitive } from '@aurelia/kernel';

/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any, no-control-regex */

export type BoxedPrimitive = Number | Boolean | String | Symbol;

export type IntArray = Int8Array | Int16Array | Int32Array | Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array;
export type FloatArray = Float32Array | Float64Array;
export type TypedArray = IntArray | FloatArray;

export type IntArrayConstructor = Int8ArrayConstructor | Int16ArrayConstructor | Int32ArrayConstructor | Uint8ArrayConstructor | Uint8ClampedArrayConstructor | Uint16ArrayConstructor | Uint32ArrayConstructor;
export type FloatArrayConstructor = Float32ArrayConstructor | Float64ArrayConstructor;
export type TypedArrayConstructor = IntArrayConstructor | FloatArrayConstructor;

export const {
  getPrototypeOf,
  getOwnPropertyDescriptor,
  getOwnPropertyDescriptors,
  getOwnPropertyNames,
  getOwnPropertySymbols,
  defineProperty,
  defineProperties,
} = Object;

export const Object_keys = Object.keys;
export const Object_is = Object.is;
export const Object_freeze = Object.freeze;
export const Object_assign = Object.assign;
export const Object_create = Object.create;

export const Number_isNaN = Number.isNaN;

export const Reflect_apply = Reflect.apply;

export const ArrayBuffer_isView = ArrayBuffer.isView;

export function uncurryThis<TArgs extends any[], TRet>(func: (...args: TArgs) => TRet): (thisArg: unknown, ...args: TArgs) => TRet {
  return (thisArg: unknown, ...args: TArgs) => Reflect_apply(func, thisArg, args);
}

export const hasOwnProperty = uncurryThis(Object.prototype.hasOwnProperty);
export const propertyIsEnumerable = uncurryThis(Object.prototype.propertyIsEnumerable);

export const TypedArrayPrototype = getPrototypeOf(Uint8Array.prototype);

const TypedArrayProto_toStringTag = uncurryThis(
  (getOwnPropertyDescriptor(TypedArrayPrototype, Symbol.toStringTag) as PropertyDescriptor).get as () => string
);

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

export function createNullObject<T>(input: T): Readonly<T> {
  return Object_assign(Object_create(null), input);
}

export function createFrozenNullObject<T>(input: T): Readonly<T> {
  return Object_freeze(createNullObject(input));
}

export function isBoolean(arg: unknown): arg is boolean {
  return typeof arg === 'boolean';
}

export function isNull(arg: unknown): arg is null {
  return arg === null;
}

export function isNullOrUndefined(arg: unknown): arg is null | undefined {
  return arg === null || arg === void 0;
}

export function isNumber(arg: unknown): arg is number {
  return typeof arg === 'number';
}

export function isString(arg: unknown): arg is string {
  return typeof arg === 'string';
}

export function isSymbol(arg: unknown): arg is symbol {
  return typeof arg === 'symbol';
}

export function isUndefined(arg: unknown): arg is undefined {
  return arg === void 0;
}

export function isObject(arg: unknown): arg is Object {
  return arg !== null && typeof arg === 'object';
}

export function isFunction(arg: unknown): arg is Function {
  return typeof arg === 'function';
}

export function isPrimitive(arg: unknown): arg is Primitive {
  return arg === null || typeof arg !== 'object' && typeof arg !== 'function';
}

export function isArrayBuffer(arg: unknown): arg is ArrayBuffer {
  return arg instanceof ArrayBuffer;
}

export function isSharedArrayBuffer(arg: unknown): arg is SharedArrayBuffer {
  return arg instanceof SharedArrayBuffer;
}

export function isAnyArrayBuffer(arg: unknown): arg is ArrayBuffer | SharedArrayBuffer {
  return arg instanceof ArrayBuffer || arg instanceof SharedArrayBuffer;
}

export function isDate(arg: unknown): arg is Date {
  return arg instanceof Date;
}

export function isMap(arg: unknown): arg is Map<any, any> {
  return arg instanceof Map;
}

export function isMapIterator(arg: unknown): arg is IterableIterator<[any, any]> {
  return Object_toString(arg) === '[object Map Iterator]';
}

export function isRegExp(arg: unknown): arg is RegExp {
  return arg instanceof RegExp;
}

export function isSet(arg: unknown): arg is Set<any> {
  return arg instanceof Set;
}

export function isSetIterator(arg: unknown): arg is IterableIterator<[any, any]> {
  return Object_toString(arg) === '[object Set Iterator]';
}

export function isError(arg: unknown): arg is Error {
  return arg instanceof Error;
}

export function isNumberObject(arg: unknown): arg is Number {
  return arg instanceof Number;
}

export function isStringObject(arg: unknown): arg is String {
  return arg instanceof String;
}

export function isBooleanObject(arg: unknown): arg is Boolean {
  return arg instanceof Boolean;
}

export function isSymbolObject(arg: unknown): arg is Symbol {
  return arg instanceof Symbol;
}

export function isBoxedPrimitive(arg: unknown): arg is BoxedPrimitive {
  return (
    isNumberObject(arg)
    || isStringObject(arg)
    || isBooleanObject(arg)
    || isSymbolObject(arg)
  );
}

export function isTypedArray(value: unknown): value is TypedArray {
  return TypedArrayProto_toStringTag(value) !== void 0;
}

export function isUint8Array(value: unknown): value is Uint8Array {
  return TypedArrayProto_toStringTag(value) === 'Uint8Array';
}

export function isUint8ClampedArray(value: unknown): value is Uint8ClampedArray {
  return TypedArrayProto_toStringTag(value) === 'Uint8ClampedArray';
}

export function isUint16Array(value: unknown): value is Uint16Array {
  return TypedArrayProto_toStringTag(value) === 'Uint16Array';
}

export function isUint32Array(value: unknown): value is Uint32Array {
  return TypedArrayProto_toStringTag(value) === 'Uint32Array';
}

export function isInt8Array(value: unknown): value is Int8Array {
  return TypedArrayProto_toStringTag(value) === 'Int8Array';
}

export function isInt16Array(value: unknown): value is Int16Array {
  return TypedArrayProto_toStringTag(value) === 'Int16Array';
}

export function isInt32Array(value: unknown): value is Int32Array {
  return TypedArrayProto_toStringTag(value) === 'Int32Array';
}

export function isFloat32Array(value: unknown): value is Float32Array {
  return TypedArrayProto_toStringTag(value) === 'Float32Array';
}

export function isFloat64Array(value: unknown): value is Float64Array {
  return TypedArrayProto_toStringTag(value) === 'Float64Array';
}

export function isArgumentsObject(value: unknown): value is IArguments {
  return Object_toString(value) === '[object Arguments]';
}

export function isDataView(value: unknown): value is DataView {
  return Object_toString(value) === '[object DataView]';
}

export function isPromise(value: unknown): value is Promise<any> {
  return Object_toString(value) === '[object Promise]';
}

export function isWeakSet(value: unknown): value is WeakSet<any> {
  return Object_toString(value) === '[object WeakSet]';
}

export function isWeakMap(value: unknown): value is WeakMap<any, any> {
  return Object_toString(value) === '[object WeakMap]';
}

export function getOwnNonIndexProperties(
  val: ArrayLike<any> | ArrayBufferLike | ArrayBufferView,
  showHidden: boolean,
): string[] {
  if (showHidden) {
    return getOwnPropertyNames(val).filter(k => !isArrayIndex(k));
  } else {
    return Object_keys(val).filter(k => !isArrayIndex(k));
  }
}

export function getEnumerables(val: unknown, keys: PropertyKey[]): PropertyKey[] {
  return keys.filter(k => propertyIsEnumerable(val, k));
}

interface IColors {
  bold(str: string): string;
  italic(str: string): string;
  underline(str: string): string;
  inverse(str: string): string;
  white(str: string): string;
  grey(str: string): string;
  black(str: string): string;
  blue(str: string): string;
  cyan(str: string): string;
  green(str: string): string;
  magenta(str: string): string;
  red(str: string): string;
  yellow(str: string): string;
}

// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
export const colors: Readonly<IColors> = Object_freeze(
  {
    bold(str: string): string {
      return `\u001b[1m${str}\u001b[22m`;
    },
    italic(str: string): string {
      return `\u001b[3m${str}\u001b[23m`;
    },
    underline(str: string): string {
      return `\u001b[4m${str}\u001b[24m`;
    },
    inverse(str: string): string {
      return `\u001b[7m${str}\u001b[27m`;
    },
    white(str: string): string {
      return `\u001b[37m${str}\u001b[39m`;
    },
    grey(str: string): string {
      return `\u001b[90m${str}\u001b[39m`;
    },
    black(str: string): string {
      return `\u001b[30m${str}\u001b[39m`;
    },
    blue(str: string): string {
      return `\u001b[34m${str}\u001b[39m`;
    },
    cyan(str: string): string {
      return `\u001b[36m${str}\u001b[39m`;
    },
    green(str: string): string {
      return `\u001b[32m${str}\u001b[39m`;
    },
    magenta(str: string): string {
      return `\u001b[35m${str}\u001b[39m`;
    },
    red(str: string): string {
      return `\u001b[31m${str}\u001b[39m`;
    },
    yellow(str: string): string {
      return `\u001b[33m${str}\u001b[39m`;
    },
  },
);

const colorRegExp = /\u001b\[\d\d?m/g;

const strEscapeSequencesRegExp = /[\x00-\x1f\x27\x5c]/;
const strEscapeSequencesReplacer = /[\x00-\x1f\x27\x5c]/g;
const strEscapeSequencesRegExpSingle = /[\x00-\x1f\x5c]/;
const strEscapeSequencesReplacerSingle = /[\x00-\x1f\x5c]/g;

export function removeColors(str: string): string {
  return str.replace(colorRegExp, '');
}

export function join(output: string[], separator: string): string {
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

function addQuotes(str: string, quotes: number): string {
  if (quotes === -1) {
    return `"${str}"`;
  }
  if (quotes === -2) {
    return `\`${str}\``;
  }
  return `'${str}'`;
}

const escapeFn = (str: string) => asciiEscape[str.charCodeAt(0)];

export function escapeAndQuoteString(str: string): string {
  let escapeTest = strEscapeSequencesRegExp;
  let escapeReplace = strEscapeSequencesReplacer;
  let singleQuote = 39;

  if (str.includes('\'')) {
    if (!str.includes('"')) {
      singleQuote = -1;
    } else if (!str.includes('`') && !str.includes('${')) {
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
      } else {
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

export function escapeString(str: string): string {
  return str.replace(strEscapeSequencesReplacer, escapeFn);
}

export function truncate<T>(s: T, n: number): T {
  if (typeof s === 'string') {
    return (s.length < n ? s : s.slice(0, n)) as T & string;
  } else {
    return s;
  }
}

export const trimFull = (function () {
  const cache: Record<string, string | undefined> = {};

  return function (input: string) {
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

type AnyFunction = (...args: unknown[]) => unknown;
type VoidFunction = (...args: unknown[]) => void;

export type ISpy<
  T extends AnyFunction = AnyFunction
> = T & {
  readonly calls: (readonly unknown[])[];
  restore(): void;
  reset(): void;
};

export function createSpy<
  T extends {},
  K extends keyof T,
>(instance: T, key: K): T[K] extends AnyFunction ? ISpy<T[K]> : never;
export function createSpy<
  T extends {},
  K extends keyof T,
  F extends AnyFunction,
>(instance: T, key: K, innerFn: F): T[K] extends AnyFunction ? ISpy<T[K]> : never;
export function createSpy<
  T extends {},
  K extends keyof T,
>(instance: T, key: K, callThrough: true): T[K] extends AnyFunction ? ISpy<T[K]> : never;
export function createSpy<
  T extends AnyFunction = VoidFunction,
>(innerFn: T): ISpy<T>;
export function createSpy(): ISpy<VoidFunction>;
export function createSpy<
  T extends {} | AnyFunction = VoidFunction,
  K extends keyof T | never = never,
  F extends AnyFunction | never = never,
>(instanceOrInnerFn?: T, key?: K, callThroughOrInnerFn?: true | F) {
  const calls: (readonly unknown[])[] = [];

  function reset() {
    calls.length = 0;
  }

  let $spy: AnyFunction;
  let $restore: () => void;

  if (instanceOrInnerFn === void 0) {
    $spy = function spy(...args: unknown[]) {
      calls.push(args);
    };
    $restore = noop;
  } else if (key === void 0) {
    $spy = function spy(...args: unknown[]) {
      calls.push(args);
      return (instanceOrInnerFn as AnyFunction)(...args);
    };
    $restore = noop;
  } else {
    if (!(key in instanceOrInnerFn)) {
      throw new Error(`No method named '${key}' exists in object of type ${Reflect.getPrototypeOf(instanceOrInnerFn)!.constructor.name}`);
    }
    let descriptorOwner = instanceOrInnerFn;
    let descriptor = Reflect.getOwnPropertyDescriptor(descriptorOwner, key)!;
    while (descriptor === void 0) {
      descriptorOwner = Reflect.getPrototypeOf(descriptorOwner) as T;
      descriptor = Reflect.getOwnPropertyDescriptor(descriptorOwner, key)!;
    }

    // Already wrapped, restore first
    if (descriptor.value !== null && (typeof descriptor.value === 'object' || typeof descriptor.value === 'function') && typeof descriptor.value.restore === 'function') {
      (descriptor.value as ISpy).restore();
      descriptor = Reflect.getOwnPropertyDescriptor(descriptorOwner, key)!;
    }

    $restore = function restore() {
      if (instanceOrInnerFn === descriptorOwner) {
        Reflect.defineProperty(instanceOrInnerFn, key, descriptor);
      } else {
        Reflect.deleteProperty(instanceOrInnerFn, key);
      }
    };

    if (callThroughOrInnerFn === void 0) {
      $spy = function spy(...args: unknown[]) {
        calls.push(args);
      };
    } else if (callThroughOrInnerFn === true) {
      $spy = function spy(...args: unknown[]) {
        calls.push(args);
        return (descriptor.value as AnyFunction).apply(instanceOrInnerFn, args);
      };
    } else if (typeof callThroughOrInnerFn === 'function') {
      $spy = function spy(...args: unknown[]) {
        calls.push(args);
        return callThroughOrInnerFn(...args);
      };
    } else {
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
