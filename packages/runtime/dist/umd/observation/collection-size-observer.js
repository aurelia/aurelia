var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./subscriber-collection.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CollectionSizeObserver = void 0;
    const subscriber_collection_js_1 = require("./subscriber-collection.js");
    let CollectionSizeObserver = class CollectionSizeObserver {
        constructor(obj) {
            this.obj = obj;
            this.type = 4 /* Obj */;
            this.currentValue = obj.size;
        }
        getValue() {
            return this.obj.size;
        }
        setValue() {
            throw new Error('collection "size" is a readonly property');
        }
        notify() {
            const oldValue = this.currentValue;
            this.callSubscribers(this.currentValue = this.obj.size, oldValue, 8 /* updateTarget */);
        }
    };
    CollectionSizeObserver = __decorate([
        subscriber_collection_js_1.subscriberCollection()
    ], CollectionSizeObserver);
    exports.CollectionSizeObserver = CollectionSizeObserver;
});
//# sourceMappingURL=collection-size-observer.js.map