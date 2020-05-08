var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "../lifecycle", "./subscriber-collection"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const lifecycle_1 = require("../lifecycle");
    const subscriber_collection_1 = require("./subscriber-collection");
    /**
     * Observer for the mutation of object property value employing getter-setter strategy.
     * This is used for observing object properties that has no decorator.
     */
    let SetterObserver = class SetterObserver {
        constructor(lifecycle, flags, obj, propertyKey) {
            this.lifecycle = lifecycle;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.currentValue = void 0;
            this.oldValue = void 0;
            this.inBatch = false;
            this.observing = false;
            this.persistentFlags = flags & 2080374799 /* persistentBindingFlags */;
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
                }
                else if (!this.inBatch) {
                    this.inBatch = true;
                    this.oldValue = currentValue;
                    this.lifecycle.batch.add(this);
                }
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
        flushBatch(flags) {
            this.inBatch = false;
            const currentValue = this.currentValue;
            const oldValue = this.oldValue;
            this.oldValue = currentValue;
            this.callSubscribers(currentValue, oldValue, this.persistentFlags | flags);
        }
        subscribe(subscriber) {
            if (this.observing === false) {
                this.observing = true;
                this.currentValue = this.obj[this.propertyKey];
                if (!Reflect.defineProperty(this.obj, this.propertyKey, {
                    enumerable: true,
                    configurable: true,
                    get: () => {
                        return this.getValue();
                    },
                    set: value => {
                        this.setValue(value, 0 /* none */);
                    },
                })) {
                    kernel_1.Reporter.write(1, this.propertyKey, this.obj);
                }
            }
            this.addSubscriber(subscriber);
        }
    };
    SetterObserver = __decorate([
        subscriber_collection_1.subscriberCollection(),
        __metadata("design:paramtypes", [Object, Number, Object, String])
    ], SetterObserver);
    exports.SetterObserver = SetterObserver;
});
//# sourceMappingURL=setter-observer.js.map