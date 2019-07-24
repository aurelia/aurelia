(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "./subscriber-collection"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const subscriber_collection_1 = require("./subscriber-collection");
    let CollectionLengthObserver = class CollectionLengthObserver {
        constructor(obj) {
            this.obj = obj;
            this.currentValue = obj.length;
        }
        getValue() {
            return this.obj.length;
        }
        setValue(newValue, flags) {
            const { currentValue } = this;
            if (newValue !== currentValue) {
                this.currentValue = newValue;
                this.callSubscribers(newValue, currentValue, flags | 16 /* updateTargetInstance */);
            }
        }
    };
    CollectionLengthObserver = tslib_1.__decorate([
        subscriber_collection_1.subscriberCollection()
    ], CollectionLengthObserver);
    exports.CollectionLengthObserver = CollectionLengthObserver;
});
//# sourceMappingURL=collection-length-observer.js.map