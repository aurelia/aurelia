"use strict";
// Significant portion of this code is copy-pasted from the node.js source
// Modifications consist primarily of removing dependencies on v8 natives and adding typings
Object.defineProperty(exports, "__esModule", { value: true });
exports.assert = exports.isCustomAttributeType = exports.isCustomElementType = exports.notMatch = exports.match = exports.notStrictEqual = exports.strictEqual = exports.notDeepStrictEqual = exports.deepStrictEqual = exports.notDeepEqual = exports.deepEqual = exports.notEqual = exports.lessThanOrEqualTo = exports.lessThan = exports.greaterThanOrEqualTo = exports.greaterThan = exports.notContains = exports.contains = exports.notIncludes = exports.includes = exports.notInstanceOf = exports.instanceOf = exports.typeOf = exports.equal = exports.visibleTextEqual = exports.fail = exports.ok = exports.ifError = exports.doesNotReject = exports.doesNotThrow = exports.rejects = exports.throws = void 0;
const comparison_js_1 = require("./comparison.js");
const inspect_js_1 = require("./inspect.js");
const specialized_assertions_js_1 = require("./specialized-assertions.js");
const util_js_1 = require("./util.js");
const runtime_html_1 = require("@aurelia/runtime-html");
const scheduler_js_1 = require("./scheduler.js");
const test_context_js_1 = require("./test-context.js");
const noException = Symbol('noException');
function innerFail(obj) {
    if (util_js_1.isError(obj.message)) {
        throw obj.message;
    }
    throw new inspect_js_1.AssertionError(obj);
}
function innerOk(fn, argLen, value, message) {
    if (!value) {
        let generatedMessage = false;
        if (argLen === 0) {
            generatedMessage = true;
            message = 'No value argument passed to `assert.ok()`';
        }
        else if (util_js_1.isError(message)) {
            throw message;
        }
        const err = new inspect_js_1.AssertionError({
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
                if (!util_js_1.isUndefined(actual)
                    && util_js_1.isString(actual[key])
                    && util_js_1.isRegExp(obj[key])
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
        || !comparison_js_1.isDeepStrictEqual(actual[key], expected[key])) {
        if (!message) {
            // Create placeholder objects to create a nice output.
            const a = new Comparison(actual, keys);
            const b = new Comparison(expected, keys, actual);
            const err = new inspect_js_1.AssertionError({
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
    if (!util_js_1.isFunction(expected)) {
        if (util_js_1.isRegExp(expected)) {
            return expected.test(actual);
        }
        if (util_js_1.isPrimitive(actual)) {
            const err = new inspect_js_1.AssertionError({
                actual,
                expected,
                message: msg,
                operator: 'deepStrictEqual',
                stackStartFn: throws
            });
            err.operator = 'throws';
            throw err;
        }
        const keys = util_js_1.Object_keys(expected);
        if (util_js_1.isError(expected)) {
            keys.push('name', 'message');
        }
        for (const key of keys) {
            if (util_js_1.isString(actual[key])
                && util_js_1.isRegExp(expected[key])
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
    if (util_js_1.isFunction(promiseFn)) {
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
    if (util_js_1.isString(error)) {
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
    if (util_js_1.isString(error)) {
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
exports.throws = throws;
async function rejects(promiseFn, errorMatcher, message) {
    expectsError(rejects, await waitForActual(promiseFn), errorMatcher, message);
}
exports.rejects = rejects;
function doesNotThrow(fn, errorMatcher, message) {
    expectsNoError(doesNotThrow, getActual(fn), errorMatcher, message);
}
exports.doesNotThrow = doesNotThrow;
async function doesNotReject(promiseFn, errorMatcher, message) {
    expectsNoError(doesNotReject, await waitForActual(promiseFn), errorMatcher, message);
}
exports.doesNotReject = doesNotReject;
function ifError(err) {
    if (!util_js_1.isNullOrUndefined(err)) {
        let message = 'ifError got unwanted exception: ';
        if (util_js_1.isObject(err) && util_js_1.isString(err.message)) {
            if (err.message.length === 0 && err.constructor) {
                message += err.constructor.name;
            }
            else {
                message += err.message;
            }
        }
        else {
            message += inspect_js_1.inspect(err);
        }
        const newErr = new inspect_js_1.AssertionError({
            actual: err,
            expected: null,
            operator: 'ifError',
            message,
            stackStartFn: ifError
        });
        const origStack = err.stack;
        if (util_js_1.isString(origStack)) {
            const tmp2 = origStack.split('\n');
            tmp2.shift();
            let tmp1 = newErr.stack.split('\n');
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
exports.ifError = ifError;
function ok(...args) {
    innerOk(ok, args.length, ...args);
}
exports.ok = ok;
function fail(message = 'Failed') {
    if (util_js_1.isError(message)) {
        throw message;
    }
    const err = new inspect_js_1.AssertionError({
        message,
        actual: void 0,
        expected: void 0,
        operator: 'fail',
        stackStartFn: fail,
    });
    err.generatedMessage = message === 'Failed';
    throw err;
}
exports.fail = fail;
function visibleTextEqual(host, expectedText, message) {
    const actualText = specialized_assertions_js_1.getVisibleText(host);
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
exports.visibleTextEqual = visibleTextEqual;
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
exports.equal = equal;
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
exports.typeOf = typeOf;
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
exports.instanceOf = instanceOf;
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
exports.notInstanceOf = notInstanceOf;
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
exports.includes = includes;
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
exports.notIncludes = notIncludes;
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
exports.contains = contains;
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
exports.notContains = notContains;
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
exports.greaterThan = greaterThan;
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
exports.greaterThanOrEqualTo = greaterThanOrEqualTo;
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
exports.lessThan = lessThan;
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
exports.lessThanOrEqualTo = lessThanOrEqualTo;
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
exports.notEqual = notEqual;
function deepEqual(actual, expected, message) {
    if (!comparison_js_1.isDeepEqual(actual, expected)) {
        innerFail({
            actual,
            expected,
            message,
            operator: 'deepEqual',
            stackStartFn: deepEqual
        });
    }
}
exports.deepEqual = deepEqual;
function notDeepEqual(actual, expected, message) {
    if (comparison_js_1.isDeepEqual(actual, expected)) {
        innerFail({
            actual,
            expected,
            message,
            operator: 'notDeepEqual',
            stackStartFn: notDeepEqual
        });
    }
}
exports.notDeepEqual = notDeepEqual;
function deepStrictEqual(actual, expected, message) {
    if (!comparison_js_1.isDeepStrictEqual(actual, expected)) {
        innerFail({
            actual,
            expected,
            message,
            operator: 'deepStrictEqual',
            stackStartFn: deepStrictEqual
        });
    }
}
exports.deepStrictEqual = deepStrictEqual;
function notDeepStrictEqual(actual, expected, message) {
    if (comparison_js_1.isDeepStrictEqual(actual, expected)) {
        innerFail({
            actual,
            expected,
            message,
            operator: 'notDeepStrictEqual',
            stackStartFn: notDeepStrictEqual
        });
    }
}
exports.notDeepStrictEqual = notDeepStrictEqual;
function strictEqual(actual, expected, message) {
    if (!util_js_1.Object_is(actual, expected)) {
        innerFail({
            actual,
            expected,
            message,
            operator: 'strictEqual',
            stackStartFn: strictEqual
        });
    }
}
exports.strictEqual = strictEqual;
function notStrictEqual(actual, expected, message) {
    if (util_js_1.Object_is(actual, expected)) {
        innerFail({
            actual,
            expected,
            message,
            operator: 'notStrictEqual',
            stackStartFn: notStrictEqual
        });
    }
}
exports.notStrictEqual = notStrictEqual;
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
exports.match = match;
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
exports.notMatch = notMatch;
function isCustomElementType(actual, message) {
    if (!runtime_html_1.CustomElement.isType(actual)) {
        innerFail({
            actual: false,
            expected: true,
            message,
            operator: 'isCustomElementType',
            stackStartFn: isCustomElementType
        });
    }
}
exports.isCustomElementType = isCustomElementType;
function isCustomAttributeType(actual, message) {
    if (!runtime_html_1.CustomAttribute.isType(actual)) {
        innerFail({
            actual: false,
            expected: true,
            message,
            operator: 'isCustomAttributeType',
            stackStartFn: isCustomElementType
        });
    }
}
exports.isCustomAttributeType = isCustomAttributeType;
function getNode(elementOrSelector, root = test_context_js_1.PLATFORM.document) {
    return typeof elementOrSelector === "string"
        ? root.querySelector(elementOrSelector)
        : elementOrSelector;
}
function isTextContentEqual(elementOrSelector, expectedText, message, root) {
    const host = getNode(elementOrSelector, root);
    const actualText = host && specialized_assertions_js_1.getVisibleText(host, true);
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
    const styles = test_context_js_1.PLATFORM.window.getComputedStyle(element);
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
    function priorityToString(priority) {
        switch (priority) {
            case 0 /* render */:
                return 'render';
            case 1 /* macroTask */:
                return 'macroTask';
            case 2 /* postRender */:
                return 'postRender';
            default:
                return 'unknown';
        }
    }
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
        const status = task['_status'];
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
        const platform = runtime_html_1.BrowserPlatform.getOrCreate(globalThis);
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
                scheduler_js_1.ensureTaskQueuesEmpty(platform);
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
const assert = util_js_1.Object_freeze({
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
exports.assert = assert;
//# sourceMappingURL=assert.js.map