"use strict";
// export class OpenPromise<T> {
//   public isPending: boolean = true;
//   public promise!: Promise<T>;
//   public resolve!: (value: T | PromiseLike<T>) => void;
//   public reject!: () => void;
// }
Object.defineProperty(exports, "__esModule", { value: true });
exports.AwaitableMap = void 0;
const open_promise_js_1 = require("./open-promise.js");
class AwaitableMap {
    constructor() {
        this.map = new Map();
    }
    set(key, value) {
        const openPromise = this.map.get(key);
        if (openPromise instanceof open_promise_js_1.OpenPromise) {
            openPromise.resolve(value);
            // openPromise.isPending = false;
        }
        this.map.set(key, value);
    }
    delete(key) {
        const current = this.map.get(key);
        if (current instanceof open_promise_js_1.OpenPromise) {
            current.reject();
            // current.isPending = false;
        }
        this.map.delete(key);
    }
    await(key) {
        if (!this.map.has(key)) {
            const openPromise = new open_promise_js_1.OpenPromise();
            // openPromise.promise = new Promise((res, rej) => {
            //   openPromise.resolve = res;
            //   openPromise.reject = rej;
            // });
            this.map.set(key, openPromise);
            return openPromise.promise;
        }
        const current = this.map.get(key);
        if (current instanceof open_promise_js_1.OpenPromise) {
            return current.promise;
        }
        return current;
    }
    has(key) {
        return this.map.has(key) && !(this.map.get(key) instanceof open_promise_js_1.OpenPromise);
    }
    clone() {
        const clone = new AwaitableMap();
        clone.map = new Map(this.map);
        return clone;
    }
}
exports.AwaitableMap = AwaitableMap;
//# sourceMappingURL=awaitable-map.js.map