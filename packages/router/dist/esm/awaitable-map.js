// export class OpenPromise<T> {
//   public isPending: boolean = true;
//   public promise!: Promise<T>;
//   public resolve!: (value: T | PromiseLike<T>) => void;
//   public reject!: () => void;
// }
import { OpenPromise } from './open-promise.js';
export class AwaitableMap {
    constructor() {
        this.map = new Map();
    }
    set(key, value) {
        const openPromise = this.map.get(key);
        if (openPromise instanceof OpenPromise) {
            openPromise.resolve(value);
            // openPromise.isPending = false;
        }
        this.map.set(key, value);
    }
    delete(key) {
        const current = this.map.get(key);
        if (current instanceof OpenPromise) {
            current.reject();
            // current.isPending = false;
        }
        this.map.delete(key);
    }
    await(key) {
        if (!this.map.has(key)) {
            const openPromise = new OpenPromise();
            // openPromise.promise = new Promise((res, rej) => {
            //   openPromise.resolve = res;
            //   openPromise.reject = rej;
            // });
            this.map.set(key, openPromise);
            return openPromise.promise;
        }
        const current = this.map.get(key);
        if (current instanceof OpenPromise) {
            return current.promise;
        }
        return current;
    }
    has(key) {
        return this.map.has(key) && !(this.map.get(key) instanceof OpenPromise);
    }
    clone() {
        const clone = new AwaitableMap();
        clone.map = new Map(this.map);
        return clone;
    }
}
//# sourceMappingURL=awaitable-map.js.map