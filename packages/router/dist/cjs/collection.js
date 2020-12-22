"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collection = void 0;
const utils_js_1 = require("./utils.js");
/**
 * @internal - Helper class
 */
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
        utils_js_1.arrayRemove(this, value => value === instruction);
    }
}
exports.Collection = Collection;
//# sourceMappingURL=collection.js.map