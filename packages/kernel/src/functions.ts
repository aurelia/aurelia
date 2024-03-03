import { ErrorNames, createMappedError } from './errors';
import { Constructable, Overwrite } from './interfaces';
import { createObject } from './utilities';

const isNumericLookup: Record<string, boolean> = {};

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
export const isArrayIndex = (value: unknown): value is number | string => {
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
      let i = 0;
      for (; i < length; ++i) {
        ch = charCodeAt(value, i);
        if (i === 0 && ch === 0x30 && length > 1 /* must not start with 0 */ || ch < 0x30 /* 0 */ || ch > 0x39/* 9 */) {
          return isNumericLookup[value] = false;
        }
      }
      return isNumericLookup[value] = true;
    }
    default:
      return false;
  }
};

/**
 * Base implementation of camel and kebab cases
 */
const baseCase = /*@__PURE__*/(function () {
  _START_CONST_ENUM();
  const enum CharKind {
    none  = 0,
    digit = 1,
    upper = 2,
    lower = 3,
  }
  _END_CONST_ENUM();

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const isDigit = Object.assign(createObject(), {
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
  } as Record<string, true | undefined>);

  const charToKind = (char: string): CharKind => {
    if (char === '') {
      // We get this if we do charAt() with an index out of range
      return CharKind.none;
    }

    if (char !== char.toUpperCase()) {
      return CharKind.lower;
    }

    if (char !== char.toLowerCase()) {
      return CharKind.upper;
    }

    if (isDigit[char] === true) {
      return CharKind.digit;
    }

    return CharKind.none;
  };

  return (input: string, cb: (char: string, sep: boolean) => string): string => {
    const len = input.length;
    if (len === 0) {
      return input;
    }

    let sep = false;
    let output = '';

    let prevKind: CharKind;

    let curChar = '';
    let curKind = CharKind.none;

    let nextChar = input.charAt(0);
    let nextKind = charToKind(nextChar);

    let i = 0;
    for (; i < len; ++i) {
      prevKind = curKind;

      curChar = nextChar;
      curKind = nextKind;

      nextChar = input.charAt(i + 1);
      nextKind = charToKind(nextChar);

      if (curKind === CharKind.none) {
        if (output.length > 0) {
          // Only set sep to true if it's not at the beginning of output.
          sep = true;
        }
      } else {
        if (!sep && output.length > 0 && curKind === CharKind.upper) {
          // Separate UAFoo into UA Foo.
          // Separate uaFOO into ua FOO.
          sep = prevKind === CharKind.lower || nextKind === CharKind.lower;
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
export const camelCase = /*@__PURE__*/(function () {
  const cache: Record<string, string | undefined> = createObject();

  const callback = (char: string, sep: boolean): string => {
    return sep ? char.toUpperCase() : char.toLowerCase();
  };

  return (input: string): string => {
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
export const pascalCase = /*@__PURE__*/(function () {
  const cache: Record<string, string | undefined> = createObject();

  return (input: string): string => {
    let output = cache[input];
    if (output === void 0) {
      output = camelCase(input);
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
export const kebabCase = /*@__PURE__*/(function () {
  const cache: Record<string, string | undefined> = createObject();

  const callback = (char: string, sep: boolean): string => {
    return sep ? `-${char.toLowerCase()}` : char.toLowerCase();
  };

  return (input: string): string => {
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
export const toArray = <T = unknown>(input: ArrayLike<T>): T[] => {
  // benchmark: http://jsben.ch/xjsyF
  const length = input.length;
  const arr = Array(length) as T[];
  let i = 0;
  for (; i < length; ++i) {
    arr[i] = input[i];
  }
  return arr;
};

/**
 * Decorator. (lazily) bind the method to the class instance on first call.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const bound = <T extends Function>(target: Object, key: string | symbol, descriptor: TypedPropertyDescriptor<T>): TypedPropertyDescriptor<T> => {
  return {
    configurable: true,
    enumerable: descriptor.enumerable,
    get(): T {
      const boundFn = descriptor.value!.bind(this) as TypedPropertyDescriptor<T>;
      Reflect.defineProperty(this, key, {
        value: boundFn,
        writable: true,
        configurable: true,
        enumerable: descriptor.enumerable,
      });
      return boundFn as T;
    },
  };
};

export const mergeArrays = <T>(...arrays: (readonly T[] | undefined)[]): T[] => {
  const result: T[] = [];
  let k = 0;
  const arraysLen = arrays.length;
  let arrayLen = 0;
  let array: readonly T[] | undefined;
  let i = 0;
  for (; i < arraysLen; ++i) {
    array = arrays[i];
    if (array !== void 0) {
      arrayLen = array.length;
      let j = 0;
      for (; j < arrayLen; ++j) {
        result[k++] = array[j];
      }
    }
  }
  return result;
};

export const firstDefined = <T>(...values: readonly (T | undefined)[]): T => {
  const len = values.length;
  let value: T | undefined;
  let i = 0;
  for (; len > i; ++i) {
    value = values[i];
    if (value !== void 0) {
      return value;
    }
  }
  throw createMappedError(ErrorNames.first_defined_no_value);
};

/**
 * Get the prototypes of a class hierarchy. Es6 classes have their parent class as prototype
 * so this will return a list of constructors
 *
 * @example
 * ```ts
 * class A {}
 * class B extends A {}
 *
 * assert.deepStrictEqual(getPrototypeChain(A), [A])
 * assert.deepStrictEqual(getPrototypeChain(B), [B, A])
 * ```
 */
export const getPrototypeChain = /*@__PURE__*/(function () {
  const functionPrototype = Function.prototype;
  const getPrototypeOf = Object.getPrototypeOf;

  const cache = new WeakMap<Constructable, [Constructable, ...Constructable[]]>();
  let proto = functionPrototype as Constructable;
  let i = 0;
  let chain: [Constructable, ...Constructable[]] | undefined = void 0;

  return function <T extends Constructable> (Type: T): readonly [T, ...Constructable[]] {
    chain = cache.get(Type);
    if (chain === void 0) {
      cache.set(Type, chain = [proto = Type]);
      i = 0;
      while ((proto = getPrototypeOf(proto)) !== functionPrototype) {
        chain[++i] = proto;
      }
    }
    return chain as [T, ...Constructable[]];
  };
})();

export function toLookup<
  T1 extends {},
>(
  obj1: T1,
): T1;
export function toLookup<
  T1 extends {},
  T2 extends {},
>(
  obj1: T1,
  obj2: T2,
): Overwrite<T1, T2>;
export function toLookup<
  T1 extends {},
  T2 extends {},
  T3 extends {},
>(
  obj1: T1,
  obj2: T2,
  obj3: T3,
): Overwrite<T1, Overwrite<T1, T2>>;
export function toLookup<
  T1 extends {},
  T2 extends {},
  T3 extends {},
  T4 extends {},
>(
  obj1: T1,
  obj2: T2,
  obj3: T3,
  obj4: T4,
): Readonly<T1 & T2 & T3 & T4>;
export function toLookup<
  T1 extends {},
  T2 extends {},
  T3 extends {},
  T4 extends {},
  T5 extends {},
>(
  obj1: T1,
  obj2: T2,
  obj3: T3,
  obj4: T4,
  obj5: T5,
): Readonly<T1 & T2 & T3 & T4 & T5>;
export function toLookup(...objs: {}[]): Readonly<{}> {
  return Object.assign(createObject(), ...objs);
}

/**
 * Determine whether the value is a native function.
 *
 * @param fn - The function to check.
 * @returns `true` is the function is a native function, otherwise `false`
 */
export const isNativeFunction = /*@__PURE__*/(function () {
  // eslint-disable-next-line @typescript-eslint/ban-types
  const lookup: WeakMap<Function, boolean> = new WeakMap();
  let isNative = false as boolean | undefined;
  let sourceText = '';
  let i = 0;

  // eslint-disable-next-line @typescript-eslint/ban-types
  return (fn: Function) => {
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
        charCodeAt(sourceText, i -  1) === 0x7D && // }
        // TODO: the spec is a little vague about the precise constraints, so we do need to test this across various browsers to make sure just one whitespace is a safe assumption.
        charCodeAt(sourceText, i -  2)  <= 0x20 && // whitespace
        charCodeAt(sourceText, i -  3) === 0x5D && // ]
        charCodeAt(sourceText, i -  4) === 0x65 && // e
        charCodeAt(sourceText, i -  5) === 0x64 && // d
        charCodeAt(sourceText, i -  6) === 0x6F && // o
        charCodeAt(sourceText, i -  7) === 0x63 && // c
        charCodeAt(sourceText, i -  8) === 0x20 && //
        charCodeAt(sourceText, i -  9) === 0x65 && // e
        charCodeAt(sourceText, i - 10) === 0x76 && // v
        charCodeAt(sourceText, i - 11) === 0x69 && // i
        charCodeAt(sourceText, i - 12) === 0x74 && // t
        charCodeAt(sourceText, i - 13) === 0x61 && // a
        charCodeAt(sourceText, i - 14) === 0x6E && // n
        charCodeAt(sourceText, i - 15) === 0x5B    // [
      );
      lookup.set(fn, isNative);
    }
    return isNative;
  };
})();

type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
type MaybePromise<T> = T extends Promise<infer R> ? (T | R) : (T | Promise<T>);

/**
 * Normalize a potential promise via a callback, to ensure things stay synchronous when they can.
 *
 * If the value is a promise, it is `then`ed before the callback is invoked. Otherwise the callback is invoked synchronously.
 */
export const onResolve = <TValue, TRet>(
  maybePromise: TValue,
  resolveCallback: (value: UnwrapPromise<TValue>) => TRet,
): MaybePromise<TRet> => {
  if (maybePromise instanceof Promise) {
    return maybePromise.then(resolveCallback) as MaybePromise<TRet>;
  }
  return resolveCallback(maybePromise as UnwrapPromise<TValue>) as MaybePromise<TRet>;
};

/**
 * Normalize an array of potential promises, to ensure things stay synchronous when they can.
 *
 * If exactly one value is a promise, then that promise is returned.
 *
 * If more than one value is a promise, a new `Promise.all` is returned.
 *
 * If none of the values is a promise, nothing is returned, to indicate that things can stay synchronous.
 */
export const onResolveAll = (
  ...maybePromises: (void | Promise<void>)[]
): void | Promise<void> => {
  let maybePromise: Promise<void> | void = void 0;
  let firstPromise: Promise<void> | void = void 0;
  let promises: Promise<void>[] | undefined = void 0;
  let i = 0;
  // eslint-disable-next-line
  let ii = maybePromises.length;
  for (; i < ii; ++i) {
    maybePromise = maybePromises[i];
    if ((maybePromise = maybePromises[i]) instanceof Promise) {
      if (firstPromise === void 0) {
        firstPromise = maybePromise;
      } else if (promises === void 0) {
        promises = [firstPromise, maybePromise];
      } else {
        promises.push(maybePromise);
      }
    }
  }

  if (promises === void 0) {
    return firstPromise;
  }
  return Promise.all(promises) as unknown as Promise<void>;
};

const charCodeAt = (str: string, index: number) => str.charCodeAt(index);
