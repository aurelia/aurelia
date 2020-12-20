(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./subscriber-collection.js", "../utilities-objects.js"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.CollectionSizeObserver = exports.CollectionLengthObserver = void 0;
    const kernel_1 = require("@aurelia/kernel");
    const subscriber_collection_js_1 = require("./subscriber-collection.js");
    const utilities_objects_js_1 = require("../utilities-objects.js");
    class CollectionLengthObserver {
        constructor(owner) {
            this.owner = owner;
            this.type = 18 /* Array */;
            this.value = (this.obj = owner.collection).length;
        }
        getValue() {
            return this.obj.length;
        }
        setValue(newValue, flags) {
            const currentValue = this.value;
            // if in the template, length is two-way bound directly
            // then there's a chance that the new value is invalid
            // add a guard so that we don't accidentally broadcast invalid values
            if (newValue !== currentValue && kernel_1.isArrayIndex(newValue)) {
                if ((flags & 4096 /* noFlush */) === 0) {
                    this.obj.length = newValue;
                }
                this.value = newValue;
                this.subs.notify(newValue, currentValue, flags | 8 /* updateTarget */);
            }
        }
        handleCollectionChange(_, flags) {
            const oldValue = this.value;
            const value = this.obj.length;
            if ((this.value = value) !== oldValue) {
                this.subs.notify(value, oldValue, flags);
            }
        }
    }
    exports.CollectionLengthObserver = CollectionLengthObserver;
    class CollectionSizeObserver {
        constructor(owner) {
            this.owner = owner;
            this.value = (this.obj = owner.collection).size;
            this.type = this.obj instanceof Map ? 66 /* Map */ : 34 /* Set */;
        }
        getValue() {
            return this.obj.size;
        }
        setValue() {
            throw new Error('Map/Set "size" is a readonly property');
        }
        handleCollectionChange(_, flags) {
            const oldValue = this.value;
            const value = this.obj.size;
            this.value = value;
            if (value !== oldValue) {
                this.subs.notify(value, oldValue, flags);
            }
        }
    }
    exports.CollectionSizeObserver = CollectionSizeObserver;
    function implementLengthObserver(klass) {
        const proto = klass.prototype;
        utilities_objects_js_1.ensureProto(proto, 'subscribe', subscribe, true);
        utilities_objects_js_1.ensureProto(proto, 'unsubscribe', unsubscribe, true);
        subscriber_collection_js_1.subscriberCollection(klass);
    }
    function subscribe(subscriber) {
        if (this.subs.add(subscriber) && this.subs.count === 1) {
            this.owner.subscribe(this);
        }
    }
    function unsubscribe(subscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
            this.owner.subscribe(this);
        }
    }
    implementLengthObserver(CollectionLengthObserver);
    implementLengthObserver(CollectionSizeObserver);
});
//# sourceMappingURL=collection-length-observer.js.map