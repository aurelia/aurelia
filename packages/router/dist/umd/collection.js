(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const utils_1 = require("./utils");
    class Collection extends Array {
        constructor() {
            super(...arguments);
            this.currentIndex = -1;
        }
        next() {
            if (this.length > this.currentIndex + 1) {
                return this[++this.currentIndex];
            }
            else {
                this.currentIndex = -1;
                return null;
            }
        }
        removeCurrent() {
            this.splice(this.currentIndex--, 1);
        }
        remove(instruction) {
            utils_1.arrayRemove(this, value => value === instruction);
        }
    }
    exports.Collection = Collection;
});
//# sourceMappingURL=collection.js.map