"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetterNotifier = exports.SetterObserver = void 0;
const subscriber_collection_js_1 = require("./subscriber-collection.js");
const utilities_objects_js_1 = require("../utilities-objects.js");
/**
 * Observer for the mutation of object property value employing getter-setter strategy.
 * This is used for observing object properties that has no decorator.
 */
class SetterObserver {
    constructor(obj, propertyKey) {
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.currentValue = void 0;
        this.oldValue = void 0;
        this.inBatch = false;
        this.observing = false;
        // todo(bigopon): tweak the flag based on typeof obj (array/set/map/iterator/proxy etc...)
        this.type = 1 /* Observer */;
    }
    getValue() {
        return this.currentValue;
    }
    setValue(newValue, flags) {
        if (this.observing) {
            const currentValue = this.currentValue;
            if (Object.is(newValue, currentValue)) {
                return;
            }
            this.currentValue = newValue;
            this.subs.notify(newValue, currentValue, flags);
        }
        else {
            // If subscribe() has been called, the target property descriptor is replaced by these getter/setter methods,
            // so calling obj[propertyKey] will actually return this.currentValue.
            // However, if subscribe() was not yet called (indicated by !this.observing), the target descriptor
            // is unmodified and we need to explicitly set the property value.
            // This will happen in one-time, to-view and two-way bindings during $bind, meaning that the $bind will not actually update the target value.
            // This wasn't visible in vCurrent due to connect-queue always doing a delayed update, so in many cases it didn't matter whether $bind updated the target or not.
            this.obj[this.propertyKey] = newValue;
        }
    }
    subscribe(subscriber) {
        if (this.observing === false) {
            this.start();
        }
        this.subs.add(subscriber);
    }
    start() {
        if (this.observing === false) {
            this.observing = true;
            this.currentValue = this.obj[this.propertyKey];
            utilities_objects_js_1.def(this.obj, this.propertyKey, {
                enumerable: true,
                configurable: true,
                get: ( /* Setter Observer */) => this.getValue(),
                set: (/* Setter Observer */ value) => {
                    this.setValue(value, 0 /* none */);
                },
            });
        }
        return this;
    }
    stop() {
        if (this.observing) {
            utilities_objects_js_1.def(this.obj, this.propertyKey, {
                enumerable: true,
                configurable: true,
                writable: true,
                value: this.currentValue,
            });
            this.observing = false;
            // todo(bigopon/fred): add .removeAllSubscribers()
        }
        return this;
    }
}
exports.SetterObserver = SetterObserver;
class SetterNotifier {
    constructor(obj, callbackKey, set, initialValue) {
        this.type = 1 /* Observer */;
        /**
         * @internal
         */
        this.v = void 0;
        this.obj = obj;
        this.s = set;
        const callback = obj[callbackKey];
        this.cb = typeof callback === 'function' ? callback : void 0;
        this.v = initialValue;
    }
    getValue() {
        return this.v;
    }
    setValue(value, flags) {
        var _a;
        if (typeof this.s === 'function') {
            value = this.s(value);
        }
        const oldValue = this.v;
        if (!Object.is(value, oldValue)) {
            this.v = value;
            (_a = this.cb) === null || _a === void 0 ? void 0 : _a.call(this.obj, value, oldValue, flags);
            // there's a chance that cb.call(...)
            // changes the latest value of this observer
            // and thus making `value` stale
            // so for now, call with this.v
            // todo: should oldValue be treated the same way?
            this.subs.notify(this.v, oldValue, flags);
        }
    }
}
exports.SetterNotifier = SetterNotifier;
subscriber_collection_js_1.subscriberCollection(SetterObserver);
subscriber_collection_js_1.subscriberCollection(SetterNotifier);
//# sourceMappingURL=setter-observer.js.map