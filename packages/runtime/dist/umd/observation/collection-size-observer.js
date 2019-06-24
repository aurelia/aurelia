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
    let CollectionSizeObserver = class CollectionSizeObserver {
        constructor(obj) {
            this.obj = obj;
            this.currentValue = obj.size;
        }
        getValue() {
            return this.obj.size;
        }
        setValue(newValue, flags) {
            const { currentValue } = this;
            if (newValue !== currentValue) {
                this.currentValue = newValue;
                this.callSubscribers(newValue, currentValue, flags | 16 /* updateTargetInstance */);
            }
        }
    };
    CollectionSizeObserver = tslib_1.__decorate([
        subscriber_collection_1.subscriberCollection()
    ], CollectionSizeObserver);
    exports.CollectionSizeObserver = CollectionSizeObserver;
});
//# sourceMappingURL=collection-size-observer.js.map