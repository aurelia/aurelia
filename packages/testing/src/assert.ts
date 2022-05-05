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

import { Task, TaskQueue, TaskQueuePriority } from '@aurelia/platform';
import { IIndexable } from '@aurelia/kernel';
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
import { BrowserPlatform } from '@aurelia/platform-browser';
import {
  CustomElement,
  CustomAttribute,
} from '@aurelia/runtime-html';
import { ensureTaskQueuesEmpty } from './scheduler';
import { PLATFORM } from './test-context';

/* eslint-disable @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any */

type ErrorMatcher = string | Error | RegExp | Function;

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

  public constructor(
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
  if (Object.prototype.isPrototypeOf.call(Error, expected)) {
    return false;
  }
  return expected.call({}, actual) === true;
}

function getActual(fn: (...args: any[]) => any): Error | symbol {
  try {
    fn();
  } catch (e) {
    return e as Error;
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
    return e as Error;
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

export function visibleTextEqual(host: Node, expectedText: string, message?: string): void {
  const actualText = getVisibleText(host);
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

export function typeOf(actual: any, expected: any, message?: string): void {
  if (typeof actual !== expected) {
    innerFail({
      actual,
      expected,
      message,
      operator: 'typeof' as any,
      stackStartFn: typeOf
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

export function isCustomElementType(actual: any, message?: string): void {
  if (!CustomElement.isType(actual)) {
    innerFail({
      actual: false,
      expected: true,
      message,
      operator: 'isCustomElementType' as any,
      stackStartFn: isCustomElementType
    });
  }
}

export function isCustomAttributeType(actual: any, message?: string): void {
  if (!CustomAttribute.isType(actual)) {
    innerFail({
      actual: false,
      expected: true,
      message,
      operator: 'isCustomAttributeType' as any,
      stackStartFn: isCustomElementType
    });
  }
}

function getNode(elementOrSelector: string | Node, root: Node = PLATFORM.document) {
  return typeof elementOrSelector === "string"
    ? (root as Element).querySelector(elementOrSelector)
    : elementOrSelector;
}
function isTextContentEqual(elementOrSelector: string | Node, expectedText: string, message?: string, root?: Node) {
  const host = getNode(elementOrSelector, root);
  const actualText = host && getVisibleText(host, true);
  if (actualText !== expectedText) {
    innerFail({
      actual: actualText,
      expected: expectedText,
      message,
      operator: '==' as any,
      stackStartFn: isTextContentEqual
    });
  }
}
function isValueEqual(inputElementOrSelector: string | Node, expected: unknown, message?: string, root?: Node) {
  const input = getNode(inputElementOrSelector, root);
  const actual = input instanceof HTMLInputElement && input.value;
  if (actual !== expected) {
    innerFail({
      actual: actual,
      expected: expected,
      message,
      operator: '==' as any,
      stackStartFn: isValueEqual
    });
  }
}
function isInnerHtmlEqual(elementOrSelector: string | Node, expected: string, message?: string, root?: Node, compact: boolean = true) {
  const node = getNode(elementOrSelector, root) as HTMLElement;
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
      operator: '==' as any,
      stackStartFn: isInnerHtmlEqual
    });
  }
}

type styleMatch = { isMatch: true } | { isMatch: false; property: string; actual: string; expected: string };
function matchStyle(element: Node, expectedStyles: Record<string, string>): styleMatch {
  const styles = PLATFORM.window.getComputedStyle(element as Element);
  for (const [property, expected] of Object.entries(expectedStyles)) {
    const actual: string = styles[property as any];
    if (actual !== expected) {
      return { isMatch: false, property, actual, expected };
    }
  }
  return { isMatch: true };
}
function computedStyle(element: Node, expectedStyles: Record<string, string>, message?: string) {
  const result = matchStyle(element, expectedStyles);
  if (!result.isMatch) {
    const { property, actual, expected } = result;
    innerFail({
      actual: `${property}:${actual}`,
      expected: `${property}:${expected}`,
      message,
      operator: '==' as any,
      stackStartFn: computedStyle
    });
  }
}
function notComputedStyle(element: Node, expectedStyles: Record<string, string>, message?: string) {
  const result = matchStyle(element, expectedStyles);
  if (result.isMatch) {
    const display = Object.entries(expectedStyles).map(([key, value]) => `${key}:${value}`).join(',');
    innerFail({
      actual: display,
      expected: display,
      message,
      operator: '!=' as any,
      stackStartFn: notComputedStyle
    });
  }
}

const areTaskQueuesEmpty = (function () {
  function priorityToString(priority: TaskQueuePriority) {
    switch (priority) {
      case TaskQueuePriority.render:
        return 'render';
      case TaskQueuePriority.macroTask:
        return 'macroTask';
      case TaskQueuePriority.postRender:
        return 'postRender';
      default:
        return 'unknown';
    }
  }

  function round(num: number) {
    return ((num * 10 + .5) | 0) / 10;
  }

  function reportTask(task: Task) {
    const id = task.id;
    const created = round(task.createdTime);
    const queue = round(task.queueTime);
    const preempt = task.preempt;
    const reusable = task.reusable;
    const persistent = task.persistent;
    const status = task.status;

    return `    task id=${id} createdTime=${created} queueTime=${queue} preempt=${preempt} reusable=${reusable} persistent=${persistent} status=${status}\n`
      + `    task callback="${task.callback?.toString()}"`;
  }

  function reportTaskQueue(name: string, taskQueue: TaskQueue) {
    const processing = taskQueue['processing'] as any[];
    const pending = taskQueue['pending'] as any[];
    const delayed = taskQueue['delayed'] as any[];
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

  return function $areTaskQueuesEmpty(clearBeforeThrow?: any) {
    const platform = BrowserPlatform.getOrCreate(globalThis)!;

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
        operator: '' as any,
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

export { assert };
