"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenPromise = void 0;
class OpenPromise {
    constructor() {
        this.isPending = true;
        this.promise = new Promise((res, rej) => {
            this.res = res;
            this.rej = rej;
        });
    }
    resolve(value) {
        this.res(value);
        this.isPending = false;
    }
    reject(value) {
        this.rej(value);
        this.isPending = false;
    }
}
exports.OpenPromise = OpenPromise;
//# sourceMappingURL=open-promise.js.map