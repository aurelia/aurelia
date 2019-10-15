(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/kernel", "./proxy-observer", "./subscriber-collection"], factory);
    }
})(function (require, exports) {
    "use strict";
    var SelfObserver_1;
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@aurelia/kernel");
    const proxy_observer_1 = require("./proxy-observer");
    const subscriber_collection_1 = require("./subscriber-collection");
    let SelfObserver = SelfObserver_1 = class SelfObserver {
        constructor(lifecycle, flags, obj, propertyName, cbName) {
            this.lifecycle = lifecycle;
            let isProxy = false;
            if (proxy_observer_1.ProxyObserver.isProxy(obj)) {
                isProxy = true;
                obj.$observer.subscribe(this, propertyName);
                this.obj = obj.$raw;
            }
            else {
                this.obj = obj;
            }
            this.propertyKey = propertyName;
            this.currentValue = void 0;
            this.oldValue = void 0;
            this.inBatch = false;
            this.callback = this.obj[cbName];
            if (this.callback === void 0) {
                this.observing = false;
            }
            else {
                this.observing = true;
                this.currentValue = this.obj[this.propertyKey];
                if (!isProxy) {
                    this.createGetterSetter();
                }
            }
            this.persistentFlags = flags & 2080374799 /* persistentBindingFlags */;
        }
        handleChange(newValue, oldValue, flags) {
            this.setValue(newValue, flags);
        }
        getValue() {
            return this.currentValue;
        }
        setValue(newValue, flags) {
            if (this.observing) {
                const currentValue = this.currentValue;
                this.currentValue = newValue;
                if (this.lifecycle.batch.depth === 0) {
                    this.callSubscribers(newValue, currentValue, this.persistentFlags | flags);
                    // eslint-disable-next-line sonarjs/no-collapsible-if
                    if ((flags & 4096 /* fromBind */) === 0 || (flags & 32 /* updateSourceExpression */) > 0) {
                        const callback = this.callback;
                        if (callback !== void 0) {
                            callback.call(this.obj, newValue, currentValue, this.persistentFlags | flags);
                        }
                    }
                }
                else if (!this.inBatch) {
                    this.inBatch = true;
                    this.oldValue = currentValue;
                    this.lifecycle.batch.add(this);
                }
            }
            else {
                // See SetterObserver.setValue for explanation
                this.obj[this.propertyKey] = newValue;
            }
        }
        subscribe(subscriber) {
            if (this.observing === false) {
                this.observing = true;
                this.currentValue = this.obj[this.propertyKey];
                this.createGetterSetter();
            }
            this.addSubscriber(subscriber);
        }
        createGetterSetter() {
            if (!Reflect.defineProperty(this.obj, this.propertyKey, {
                enumerable: true,
                configurable: true,
                get: () => {
                    return this.currentValue;
                },
                set: value => {
                    this.setValue(value, 0 /* none */);
                },
            })) {
                kernel_1.Reporter.write(1, this.propertyKey, this.obj);
            }
        }
    };
    SelfObserver = SelfObserver_1 = tslib_1.__decorate([
        subscriber_collection_1.subscriberCollection()
    ], SelfObserver);
    exports.SelfObserver = SelfObserver;
});
//# sourceMappingURL=self-observer.js.map