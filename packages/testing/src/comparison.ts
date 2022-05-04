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

import {
  IIndexable,
  Primitive,
} from '@aurelia/kernel';
import {
  ArrayBuffer_isView,
  Boolean_valueOf,
  Date_getTime,
  FloatArray,
  getEnumerables,
  getOwnNonIndexProperties,
  getOwnPropertySymbols,
  getPrototypeOf,
  hasOwnProperty,
  isAnyArrayBuffer,
  isBooleanObject,
  isBoxedPrimitive,
  isDate,
  isError,
  isFloat32Array,
  isFloat64Array,
  isMap,
  isNumber,
  isNumberObject,
  isObject,
  isRegExp,
  isSet,
  isStringObject,
  isSymbolObject,
  Number_isNaN,
  Number_valueOf,
  Object_is,
  Object_keys,
  Object_toString,
  propertyIsEnumerable,
  String_valueOf,
  Symbol_valueOf,
  TypedArray,
} from './util';

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types */

export const enum IterationType {
  noIterator = 0,
  isArray = 1,
  isSet = 2,
  isMap = 3,
}

export type Memos = {
  val1: Map<any, any>;
  val2: Map<any, any>;
  position: number;
};

export function areSimilarRegExps(a: RegExp, b: RegExp): boolean {
  return a.source === b.source && a.flags === b.flags;
}

export function areSimilarFloatArrays(a: FloatArray, b: FloatArray): boolean {
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

export function compare(a: ArrayLike<any>, b: ArrayLike<any>): number {
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

export function areSimilarTypedArrays(a: TypedArray | ArrayBufferView, b: TypedArray | ArrayBufferView): boolean {
  if (a.byteLength !== b.byteLength) {
    return false;
  }

  return compare(
    new Uint8Array(a.buffer, a.byteOffset, a.byteLength),
    new Uint8Array(b.buffer, b.byteOffset, b.byteLength),
  ) === 0;
}

export function areEqualArrayBuffers(buf1: ArrayBuffer, buf2: ArrayBuffer): boolean {
  return (
    buf1.byteLength === buf2.byteLength
    && compare(
      new Uint8Array(buf1),
      new Uint8Array(buf2)
    ) === 0
  );
}

export function isEqualBoxedPrimitive(val1: unknown, val2: unknown): boolean {
  if (isNumberObject(val1)) {
    return (
      isNumberObject(val2)
      && Object_is(Number_valueOf(val1), Number_valueOf(val2))
    );
  }
  if (isStringObject(val1)) {
    return (
      isStringObject(val2)
      && String_valueOf(val1) === String_valueOf(val2)
    );
  }
  if (isBooleanObject(val1)) {
    return (
      isBooleanObject(val2)
      && Boolean_valueOf(val1) === Boolean_valueOf(val2)
    );
  }
  return (
    isSymbolObject(val2)
    && Symbol_valueOf(val1) === Symbol_valueOf(val2)
  );
}

export function innerDeepEqual(
  val1: unknown,
  val2: unknown,
  strict: boolean,
  memos?: Memos,
): boolean {
  if (val1 === val2) {
    if (val1 !== 0) {
      return true;
    }
    return strict ? Object_is(val1, val2) : true;
  }

  if (strict) {
    if (typeof val1 !== 'object') {
      return (
        isNumber(val1)
        && Number_isNaN(val1)
        && Number_isNaN(val2 as number)
      );
    }
    if (typeof val2 !== 'object' || val1 === null || val2 === null) {
      return false;
    }
    if (getPrototypeOf(val1) !== getPrototypeOf(val2)) {
      return false;
    }
  } else {
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
    return innerDeepEqual(
      Array.from((val1 as URLSearchParams & { entries(): IterableIterator<[string, string]> }).entries()),
      Array.from((val2 as URLSearchParams & { entries(): IterableIterator<[string, string]> }).entries()),
      strict,
      memos,
    );
  }
  if (Array.isArray(val1)) {
    if (val1.length !== (val2 as typeof val1).length) {
      return false;
    }
    const keys1 = getOwnNonIndexProperties(val1, false);
    const keys2 = getOwnNonIndexProperties(val2 as typeof val1, false);
    if (keys1.length !== keys2.length) {
      return false;
    }
    return keyCheck(val1, val2 as typeof val1, strict, memos, IterationType.isArray, keys1);
  }
  if (val1Tag === '[object Object]') {
    return keyCheck(val1 as {}, val2 as {}, strict, memos, IterationType.noIterator);
  }
  if (isDate(val1)) {
    if (Date_getTime(val1) !== Date_getTime(val2)) {
      return false;
    }
  } else if (isRegExp(val1)) {
    if (!areSimilarRegExps(val1, (val2 as typeof val1))) {
      return false;
    }
  } else if (isError(val1)) {
    if (val1.message !== (val2 as typeof val1).message || val1.name !== (val2 as typeof val1).name) {
      return false;
    }
  } else if (ArrayBuffer_isView(val1)) {
    if (!strict && (isFloat32Array(val1) || isFloat64Array(val1))) {
      if (!areSimilarFloatArrays(val1, (val2 as typeof val1))) {
        return false;
      }
    } else if (!areSimilarTypedArrays(val1, (val2 as typeof val1))) {
      return false;
    }
    const keys1 = getOwnNonIndexProperties(val1, false);
    const keys2 = getOwnNonIndexProperties(val2 as typeof val1, false);
    if (keys1.length !== keys2.length) {
      return false;
    }
    return keyCheck(val1, val2 as typeof val1, strict, memos, IterationType.noIterator, keys1);
  } else if (isSet(val1)) {
    if (!isSet(val2) || val1.size !== val2.size) {
      return false;
    }
    return keyCheck(val1, val2, strict, memos, IterationType.isSet);
  } else if (isMap(val1)) {
    if (!isMap(val2) || val1.size !== val2.size) {
      return false;
    }
    return keyCheck(val1, val2, strict, memos, IterationType.isMap);
  } else if (isAnyArrayBuffer(val1)) {
    if (!areEqualArrayBuffers(val1, val2 as typeof val1)) {
      return false;
    }
  } else if (isBoxedPrimitive(val1) && !isEqualBoxedPrimitive(val1, val2)) {
    return false;
  }
  return keyCheck(val1 as {}, val2 as {}, strict, memos, IterationType.noIterator);
}

export function keyCheck(
  val1: {},
  val2: {},
  strict: boolean,
  memos: Memos | undefined,
  iterationType: IterationType,
  aKeys?: PropertyKey[],
): boolean {
  if (arguments.length === 5) {
    aKeys = Object_keys(val1);
    const bKeys = Object_keys(val2);

    if (aKeys.length !== bKeys.length) {
      return false;
    }
  }

  let i = 0;
  for (; i < aKeys!.length; i++) {
    if (!hasOwnProperty(val2, aKeys![i])) {
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
          aKeys!.push(key);
          count++;
        } else if (propertyIsEnumerable(val2, key)) {
          return false;
        }
      }
      const symbolKeysB = getOwnPropertySymbols(val2);
      if (
        symbolKeysA.length !== symbolKeysB.length
        && getEnumerables(val2, symbolKeysB).length !== count
      ) {
        return false;
      }
    } else {
      const symbolKeysB = getOwnPropertySymbols(val2);
      if (
        symbolKeysB.length !== 0
        && getEnumerables(val2, symbolKeysB).length !== 0
      ) {
        return false;
      }
    }
  }

  if (
    aKeys!.length === 0
    && (
      iterationType === IterationType.noIterator
      || iterationType === IterationType.isArray && (val1 as any[]).length === 0
      || (val1 as Map<any, any> | Set<any>).size === 0
    )
  ) {
    return true;
  }

  if (memos === void 0) {
    memos = {
      val1: new Map(),
      val2: new Map(),
      position: 0
    };
  } else {
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

  const areEq = objEquiv(val1, val2, strict, aKeys!, memos, iterationType);

  memos.val1.delete(val1);
  memos.val2.delete(val2);

  return areEq;
}

export function setHasEqualElement(
  set: Set<any>,
  val1: any,
  strict: boolean,
  memos?: Memos,
): boolean {
  for (const val2 of set) {
    if (innerDeepEqual(val1, val2, strict, memos)) {
      set.delete(val2);
      return true;
    }
  }

  return false;
}

export function findLooseMatchingPrimitives(val: Primitive): Primitive {
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

export function setMightHaveLoosePrimitive(
  a: Set<any>,
  b: Set<any>,
  val: Primitive,
): Primitive {
  const altValue = findLooseMatchingPrimitives(val);
  if (altValue != null) {
    return altValue;
  }

  return b.has(altValue) && !a.has(altValue);
}

export function mapMightHaveLoosePrimitive(
  a: Map<any, any>,
  b: Map<any, any>,
  val: Primitive,
  item: any,
  memos?: Memos,
): Primitive {
  const altValue = findLooseMatchingPrimitives(val);
  if (altValue != null) {
    return altValue;
  }
  const curB = b.get(altValue);
  if (
    curB === void 0 && !b.has(altValue)
    || !innerDeepEqual(item, curB, false, memos)
  ) {
    return false;
  }
  return !a.has(altValue) && innerDeepEqual(item, curB, false, memos);
}

export function setEquiv(
  a: Set<any>,
  b: Set<any>,
  strict: boolean,
  memos?: Memos,
): boolean {
  let set = null;
  for (const val of a) {
    if (isObject(val)) {
      if (set === null) {
        set = new Set();
      }
      set.add(val);
    } else if (!b.has(val)) {
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
      } else if (
        !strict
        && !a.has(val)
        && !setHasEqualElement(set, val, strict, memos)
      ) {
        return false;
      }
    }
    return set.size === 0;
  }

  return true;
}

export function mapHasEqualEntry(
  set: Set<any>,
  map: Map<any, any>,
  key1: PropertyKey,
  item1: any,
  strict: boolean,
  memos?: Memos,
): boolean {
  for (const key2 of set) {
    if (
      innerDeepEqual(key1, key2, strict, memos)
      && innerDeepEqual(item1, map.get(key2), strict, memos)
    ) {
      set.delete(key2);
      return true;
    }
  }

  return false;
}

export function mapEquiv(
  a: Map<any, any>,
  b: Map<any, any>,
  strict: boolean,
  memos?: Memos,
): boolean {
  let set = null;

  for (const [key, item1] of a) {
    if (isObject(key)) {
      if (set === null) {
        set = new Set();
      }
      set.add(key);
    } else {
      const item2 = b.get(key);
      if (
        (item2 === void 0 && !b.has(key)
        || !innerDeepEqual(item1, item2, strict, memos))
      ) {
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
      } else if (
        !strict
        && (!a.has(key) || !innerDeepEqual(a.get(key), item, false, memos))
        && !mapHasEqualEntry(set, a, key, item, false, memos)
      ) {
        return false;
      }
    }
    return set.size === 0;
  }

  return true;
}

export function objEquiv(
  a: Object,
  b: Object,
  strict: boolean,
  keys: PropertyKey[],
  memos: Memos | undefined,
  iterationType: IterationType,
): boolean {
  let i = 0;

  if (iterationType === IterationType.isSet) {
    if (!setEquiv(a as Set<any>, b as Set<any>, strict, memos)) {
      return false;
    }
  } else if (iterationType === IterationType.isMap) {
    if (!mapEquiv(a as Map<any, any>, b as Map<any, any>, strict, memos)) {
      return false;
    }
  } else if (iterationType === IterationType.isArray) {
    for (; i < (a as any[]).length; i++) {
      if (hasOwnProperty(a, i)) {
        if (
          !hasOwnProperty(b, i)
          || !innerDeepEqual((a as any[])[i], (b as any[])[i], strict, memos)
        ) {
          return false;
        }
      } else if (hasOwnProperty(b, i)) {
        return false;
      } else {
        const keysA = Object_keys(a);
        for (; i < keysA.length; i++) {
          const key = keysA[i];
          if (
            !hasOwnProperty(b, key)
            || !innerDeepEqual((a as IIndexable)[key], (b as IIndexable)[key], strict, memos)
          ) {
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
    if (!innerDeepEqual((a as IIndexable)[key as string], (b as IIndexable)[key as string], strict, memos)) {
      return false;
    }
  }
  return true;
}

export function isDeepEqual(val1: unknown, val2: unknown): boolean {
  return innerDeepEqual(val1, val2, false);
}

export function isDeepStrictEqual(val1: unknown, val2: unknown): boolean {
  return innerDeepEqual(val1, val2, true);
}
