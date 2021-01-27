"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureString = exports.ensureArrayOfStrings = exports.tryStringify = exports.mergeDistinct = exports.createExposedPromise = exports.resolveAll = exports.Batch = void 0;
class Batch {
    constructor(stack, cb, head) {
        this.stack = stack;
        this.cb = cb;
        this.done = false;
        this.next = null;
        this.head = head ?? this;
    }
    static start(cb) {
        return new Batch(0, cb, null);
    }
    push() {
        let cur = this;
        do {
            ++cur.stack;
            cur = cur.next;
        } while (cur !== null);
    }
    pop() {
        let cur = this;
        do {
            if (--cur.stack === 0) {
                cur.invoke();
            }
            cur = cur.next;
        } while (cur !== null);
    }
    invoke() {
        const cb = this.cb;
        if (cb !== null) {
            this.cb = null;
            cb(this);
            this.done = true;
        }
    }
    continueWith(cb) {
        if (this.next === null) {
            return this.next = new Batch(this.stack, cb, this.head);
        }
        else {
            return this.next.continueWith(cb);
        }
    }
    start() {
        this.head.push();
        this.head.pop();
        return this;
    }
}
exports.Batch = Batch;
/**
 * Normalize an array of potential promises, to ensure things stay synchronous when they can.
 *
 * If exactly one value is a promise, then that promise is returned.
 *
 * If more than one value is a promise, a new `Promise.all` is returned.
 *
 * If none of the values is a promise, nothing is returned, to indicate that things can stay synchronous.
 */
function resolveAll(maybePromises) {
    const promises = [];
    for (const maybePromise of maybePromises) {
        if (maybePromise instanceof Promise) {
            promises.push(maybePromise);
        }
    }
    switch (promises.length) {
        case 0:
            return;
        case 1:
            return promises[0];
        default:
            return Promise.all(promises);
    }
}
exports.resolveAll = resolveAll;
function createExposedPromise() {
    let $resolve = (void 0);
    let $reject = (void 0);
    const promise = new Promise(function (resolve, reject) {
        $resolve = resolve;
        $reject = reject;
    });
    promise.resolve = $resolve;
    promise.reject = $reject;
    return promise;
}
exports.createExposedPromise = createExposedPromise;
function mergeDistinct(prev, next) {
    prev = prev.slice();
    next = next.slice();
    const merged = [];
    while (prev.length > 0) {
        const p = prev.shift();
        if (merged.every(m => m.context.vpa !== p.context.vpa)) {
            const i = next.findIndex(n => n.context.vpa === p.context.vpa);
            if (i >= 0) {
                merged.push(...next.splice(0, i + 1));
            }
            else {
                merged.push(p);
            }
        }
    }
    merged.push(...next);
    return merged;
}
exports.mergeDistinct = mergeDistinct;
function tryStringify(value) {
    try {
        return JSON.stringify(value);
    }
    catch {
        return Object.prototype.toString.call(value);
    }
}
exports.tryStringify = tryStringify;
function ensureArrayOfStrings(value) {
    return typeof value === 'string' ? [value] : value;
}
exports.ensureArrayOfStrings = ensureArrayOfStrings;
function ensureString(value) {
    return typeof value === 'string' ? value : value[0];
}
exports.ensureString = ensureString;
//# sourceMappingURL=util.js.map