"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionSizeObserver = exports.CollectionLengthObserver = void 0;
const kernel_1 = require("@aurelia/kernel");
const subscriber_collection_js_1 = require("./subscriber-collection.js");
const utilities_objects_js_1 = require("../utilities-objects.js");
const flush_queue_js_1 = require("./flush-queue.js");
class CollectionLengthObserver {
    constructor(owner) {
        this.owner = owner;
        this.f = 0 /* none */;
        this.type = 18 /* Array */;
        this.value = this.oldvalue = (this.obj = owner.collection).length;
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
            if ((flags & 256 /* noFlush */) === 0) {
                this.obj.length = newValue;
            }
            this.value = newValue;
            this.oldvalue = currentValue;
            this.f = flags;
            this.queue.add(this);
        }
    }
    handleCollectionChange(_, flags) {
        const oldValue = this.value;
        const value = this.obj.length;
        if ((this.value = value) !== oldValue) {
            this.oldvalue = oldValue;
            this.f = flags;
            this.queue.add(this);
        }
    }
    flush() {
        oV = this.oldvalue;
        this.oldvalue = this.value;
        this.subs.notify(this.value, oV, this.f);
    }
}
exports.CollectionLengthObserver = CollectionLengthObserver;
class CollectionSizeObserver {
    constructor(owner) {
        this.owner = owner;
        this.f = 0 /* none */;
        this.value = this.oldvalue = (this.obj = owner.collection).size;
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
        if ((this.value = value) !== oldValue) {
            this.oldvalue = oldValue;
            this.f = flags;
            this.queue.add(this);
        }
    }
    flush() {
        oV = this.oldvalue;
        this.oldvalue = this.value;
        this.subs.notify(this.value, oV, this.f);
    }
}
exports.CollectionSizeObserver = CollectionSizeObserver;
function implementLengthObserver(klass) {
    const proto = klass.prototype;
    utilities_objects_js_1.ensureProto(proto, 'subscribe', subscribe, true);
    utilities_objects_js_1.ensureProto(proto, 'unsubscribe', unsubscribe, true);
    flush_queue_js_1.withFlushQueue(klass);
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
// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV = void 0;
//# sourceMappingURL=collection-length-observer.js.map