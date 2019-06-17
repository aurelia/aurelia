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
} from '@aurelia/kernel';

import {
  CompositionRoot,
} from '@aurelia/runtime';

import {
  isDeepEqual,
  isDeepStrictEqual,
} from './comparison';
import {
  AssertionError,
  IAssertionErrorOpts,
  inspect,
} from './inspect';
import { getVisibleText } from './specialized-assertions';
import {
  isError,
  isFunction,
  isNullOrUndefined,
  isObject,
  isPrimitive,
  isRegExp,
  isString,
  isUndefined,
  Object_freeze,
  Object_is,
  Object_keys,
} from './util';

// tslint:disable: no-commented-code
// tslint:disable: ban-types
// tslint:disable: no-non-null-assertion
// tslint:disable: no-any
// tslint:disable: completed-docs
// tslint:disable: strict-boolean-expressions

type ErrorMatcher = string | Error | RegExp;

const noException = Symbol('noException');

function innerFail(obj: IAssertionErrorOpts): never {
  if (isError(obj.message)) {
    throw obj.message;
  }

  throw new AssertionError(obj);
}

function innerOk(fn: Function, argLen: number, value: any, message: string | Error): void {
  if (!value) {
    let generatedMessage = false;

    if (argLen === 0) {
      generatedMessage = true;
      message = 'No value argument passed to `assert.ok()`';
    } else if (isError(message)) {
      throw message;
    }

    const err = new AssertionError({
      actual: value,
      expected: true,
      message,
      operator: '==' as any,
      stackStartFn: fn
    });
    err.generatedMessage = generatedMessage;
    throw err;
  }
}

class Comparison {
  [key: string]: unknown;

  constructor(
    obj: IIndexable,
    keys: string[],
    actual?: IIndexable,
  ) {
    for (const key of keys) {
      if (key in obj) {
        if (
          !isUndefined(actual)
          && isString(actual[key])
          && isRegExp(obj[key])
          && (obj[key] as RegExp).test(actual[key] as string)
        ) {
          this[key] = actual[key];
        } else {
          this[key] = obj[key];
        }
      }
    }
  }
}

function compareExceptionKey(
  actual: IIndexable,
  expected: IIndexable,
  key: string,
  message: string | undefined,
  keys: string[],
): void {
  if (
    !(key in actual)
    || !isDeepStrictEqual(actual[key], expected[key])
  ) {
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
      err.operator = 'throws' as any;
      throw err;
    }
    innerFail({
      actual,
      expected,
      message,
      operator: 'throws' as any,
      stackStartFn: throws
    });
  }
}

function expectedException(
  actual: string | Error | IIndexable | symbol,
  expected: Function | Error | RegExp | IIndexable,
  msg?: string,
): boolean {
  if (!isFunction(expected)) {
    if (isRegExp(expected)) {
      return expected.test(actual as string);
    }

    if (isPrimitive(actual)) {
      const err = new AssertionError({
        actual,
        expected,
        message: msg!,
        operator: 'deepStrictEqual',
        stackStartFn: throws
      });
      err.operator = 'throws' as any;
      throw err;
    }

    const keys = Object_keys(expected);
    if (isError(expected)) {
      keys.push('name', 'message');
    }
    for (const key of keys) {
      if (
        isString((actual as IIndexable)[key])
        && isRegExp((expected as IIndexable)[key])
        && ((expected as IIndexable)[key] as RegExp).test((actual as IIndexable)[key] as string)
      ) {
        continue;
      }
      compareExceptionKey(actual as IIndexable, expected as IIndexable, key, msg, keys);
    }
    return true;
  }
  if (expected.prototype !== void 0 && actual instanceof expected) {
    return true;
  }
  if (Error.isPrototypeOf(expected)) {
    return false;
  }
  return expected.call({}, actual) === true;
}

function getActual(fn: (...args: any[]) => any): Error | symbol {
  try {
    fn();
  } catch (e) {
    return e;
  }
  return noException;
}

async function waitForActual(promiseFn: (() => Promise<any>) | Promise<any>): Promise<Error | symbol> {
  let resultPromise;
  if (isFunction(promiseFn)) {
    resultPromise = promiseFn();
  } else {
    resultPromise = promiseFn;
  }

  try {
    await resultPromise;
  } catch (e) {
    return e;
  }
  return noException;
}

function expectsError(
  stackStartFn: Function,
  actual: Error | symbol,
  error?: ErrorMatcher,
  message?: string,
): void {
  if (isString(error)) {
    message = error;
    error = void 0;
  }

  if (actual === noException) {
    let details = '';
    if (error && (error as Error).name) {
      details += ` (${(error as Error).name})`;
    }
    details += message ? `: ${message}` : '.';
    const fnType = stackStartFn.name === 'rejects' ? 'rejection' : 'exception';
    innerFail({
      actual: undefined,
      expected: error,
      operator: stackStartFn.name as any,
      message: `Missing expected ${fnType}${details}`,
      stackStartFn
    });
  }
  if (error && expectedException(actual, error, message) === false) {
    throw actual;
  }
}

function expectsNoError(
  stackStartFn: Function,
  actual: Error | symbol,
  error?: ErrorMatcher,
  message?: string,
): void {
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
      operator: stackStartFn.name as any,
      message: `Got unwanted ${fnType}${details}\nActual message: "${actual && (actual as Error).message}"`,
      stackStartFn
    });
  }
  throw actual;
}

export function throws(
  fn: () => any,
  errorMatcher?: ErrorMatcher,
  message?: string,
): void {
  expectsError(throws, getActual(fn), errorMatcher, message);
}

export async function rejects(
  promiseFn: () => Promise<any>,
  errorMatcher?: ErrorMatcher,
  message?: string,
): Promise<void> {
  expectsError(rejects, await waitForActual(promiseFn), errorMatcher, message);
}

export function doesNotThrow(
  fn: () => any,
  errorMatcher?: ErrorMatcher,
  message?: string,
): void {
  expectsNoError(doesNotThrow, getActual(fn), errorMatcher, message);
}

export async function doesNotReject(
  promiseFn: () => Promise<any>,
  errorMatcher?: ErrorMatcher,
  message?: string,
): Promise<void> {
  expectsNoError(doesNotReject, await waitForActual(promiseFn), errorMatcher, message);
}

export function ifError(err?: Error): void {
  if (!isNullOrUndefined(err)) {
    let message = 'ifError got unwanted exception: ';
    if (isObject(err) && isString(err.message)) {
      if (err.message.length === 0 && err.constructor) {
        message += err.constructor.name;
      } else {
        message += err.message;
      }
    } else {
      message += inspect(err);
    }

    const newErr = new AssertionError({
      actual: err,
      expected: null,
      operator: 'ifError' as any,
      message,
      stackStartFn: ifError
    });

    const origStack = err.stack;

    if (isString(origStack)) {
      const tmp2 = origStack.split('\n');
      tmp2.shift();
      let tmp1 = newErr.stack!.split('\n');
      for (let i = 0; i < tmp2.length; i++) {
        const pos = tmp1.indexOf(tmp2[i]);
        if (pos !== -1) {
          tmp1 = tmp1.slice(0, pos);
          break;
        }
      }
      newErr.stack = `${tmp1.join('\n')}\n${tmp2.join('\n')}`;
    }

    throw newErr;
  }
}

export function ok(...args: [any, string | Error]): void {
  innerOk(ok, args.length, ...args);
}

export function fail(message: string | Error = 'Failed'): never {
  if (isError(message)) {
    throw message;
  }

  const err = new AssertionError({
    message,
    actual: void 0,
    expected: void 0,
    operator: 'fail' as any,
    stackStartFn: fail,
  });
  err.generatedMessage = message === 'Failed';

  throw err;
}

export function visibleTextEqual(root: CompositionRoot, expectedText: string, message?: string): void {
  const actualText = getVisibleText(root.controller, root.host as Node);
  if (actualText !== expectedText) {
    innerFail({
      actual: actualText,
      expected: expectedText,
      message,
      operator: '==' as any,
      stackStartFn: visibleTextEqual
    });
  }
}

export function equal(actual: any, expected: any, message?: string): void {
  if (actual != expected) {
    innerFail({
      actual,
      expected,
      message,
      operator: '==' as any,
      stackStartFn: equal
    });
  }
}

export function instanceOf(actual: any, expected: any, message?: string): void {
  if (!(actual instanceof expected)) {
    innerFail({
      actual,
      expected,
      message,
      operator: 'instanceOf' as any,
      stackStartFn: instanceOf
    });
  }
}

export function notInstanceOf(actual: any, expected: any, message?: string): void {
  if (actual instanceof expected) {
    innerFail({
      actual,
      expected,
      message,
      operator: 'notInstanceOf' as any,
      stackStartFn: notInstanceOf
    });
  }
}

export function includes(outer: any[], inner: any, message?: string): void;
export function includes(outer: string, inner: string, message?: string): void;
export function includes(outer: any[] | string, inner: any, message?: string): void {
  if (!outer.includes(inner)) {
    innerFail({
      actual: outer,
      expected: inner,
      message,
      operator: 'includes' as any,
      stackStartFn: includes
    });
  }
}

export function notIncludes(outer: any[], inner: any, message?: string): void;
export function notIncludes(outer: string, inner: string, message?: string): void;
export function notIncludes(outer: any[] | string, inner: any, message?: string): void {
  if (outer.includes(inner)) {
    innerFail({
      actual: outer,
      expected: inner,
      message,
      operator: 'notIncludes' as any,
      stackStartFn: notIncludes
    });
  }
}

export function contains(outer: any, inner: any, message?: string): void {
  if (!outer.contains(inner)) {
    innerFail({
      actual: outer,
      expected: inner,
      message,
      operator: 'contains' as any,
      stackStartFn: contains
    });
  }
}

export function notContains(outer: any, inner: any, message?: string): void {
  if (outer.contains(inner)) {
    innerFail({
      actual: outer,
      expected: inner,
      message,
      operator: 'notContains' as any,
      stackStartFn: notContains
    });
  }
}

export function greaterThan(left: any, right: any, message?: string): void {
  if (!(left > right)) {
    innerFail({
      actual: left,
      expected: right,
      message,
      operator: 'greaterThan' as any,
      stackStartFn: greaterThan
    });
  }
}

export function greaterThanOrEqualTo(left: any, right: any, message?: string): void {
  if (!(left >= right)) {
    innerFail({
      actual: left,
      expected: right,
      message,
      operator: 'greaterThanOrEqualTo' as any,
      stackStartFn: greaterThanOrEqualTo
    });
  }
}

export function lessThan(left: any, right: any, message?: string): void {
  if (!(left < right)) {
    innerFail({
      actual: left,
      expected: right,
      message,
      operator: 'lessThan' as any,
      stackStartFn: lessThan
    });
  }
}

export function lessThanOrEqualTo(left: any, right: any, message?: string): void {
  if (!(left <= right)) {
    innerFail({
      actual: left,
      expected: right,
      message,
      operator: 'lessThanOrEqualTo' as any,
      stackStartFn: lessThanOrEqualTo
    });
  }
}

export function notEqual(actual: any, expected: any, message?: string): void {
  if (actual == expected) {
    innerFail({
      actual,
      expected,
      message,
      operator: '!=' as any,
      stackStartFn: notEqual
    });
  }
}

export function deepEqual(actual: any, expected: any, message?: string): void {
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

export function notDeepEqual(actual: any, expected: any, message?: string): void {
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

export function deepStrictEqual(actual: any, expected: any, message?: string): void {
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

export function notDeepStrictEqual(actual: any, expected: any, message?: string): void {
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

export function strictEqual(actual: any, expected: any, message?: string): void {
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

export function notStrictEqual(actual: any, expected: any, message?: string): void {
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

export function match(actual: any, regex: RegExp, message?: string): void {
  if (!regex.test(actual)) {
    innerFail({
      actual,
      expected: regex,
      message,
      operator: 'match' as any,
      stackStartFn: match
    });
  }
}

export function notMatch(actual: any, regex: RegExp, message?: string): void {
  if (regex.test(actual)) {
    innerFail({
      actual,
      expected: regex,
      message,
      operator: 'notMatch' as any,
      stackStartFn: notMatch
    });
  }
}

const assert = Object_freeze({
  throws,
  doesNotThrow,
  rejects,
  doesNotReject,
  ok,
  fail,
  equal,
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
  strict: {
    deepEqual: deepStrictEqual,
    notDeepEqual: notDeepStrictEqual,
    equal: strictEqual,
    notEqual: notStrictEqual,
  }
});

export { assert };
