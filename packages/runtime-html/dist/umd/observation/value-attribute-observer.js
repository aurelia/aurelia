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
        define(["require", "exports", "@aurelia/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ValueAttributeObserver = void 0;
    const runtime_1 = require("@aurelia/runtime");
    // TODO: handle file attribute properly again, etc
    /**
     * Observer for non-radio, non-checkbox input.
     */
    let ValueAttributeObserver = class ValueAttributeObserver {
        constructor(scheduler, flags, handler, obj, propertyKey) {
            this.scheduler = scheduler;
            this.handler = handler;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.currentValue = '';
            this.oldValue = '';
            this.hasChanges = false;
            this.task = null;
            // ObserverType.Layout is not always true, it depends on the element & property combo
            // but for simplicity, always treat as such
            this.type = 2 /* Node */ | 1 /* Observer */ | 64 /* Layout */;
            this.persistentFlags = flags & 12295 /* targetObserverFlags */;
        }
        getValue() {
            // is it safe to assume the observer has the latest value?
            // todo: ability to turn on/off cache based on type
            return this.currentValue;
        }
        setValue(newValue, flags) {
            this.currentValue = newValue;
            this.hasChanges = newValue !== this.oldValue;
            if ((flags & 4096 /* noTargetObserverQueue */) === 0) {
                this.flushChanges(flags);
            }
        }
        flushChanges(flags) {
            if (this.hasChanges) {
                this.hasChanges = false;
                const currentValue = this.currentValue;
                const oldValue = this.oldValue;
                this.oldValue = currentValue;
                if (currentValue == void 0) {
                    this.obj[this.propertyKey] = '';
                }
                else {
                    this.obj[this.propertyKey] = currentValue;
                }
                if ((flags & 32 /* fromBind */) === 0) {
                    this.callSubscribers(currentValue, oldValue, flags);
                }
            }
        }
        handleEvent() {
            const oldValue = this.oldValue = this.currentValue;
            const currentValue = this.currentValue = this.obj[this.propertyKey];
            if (oldValue !== currentValue) {
                this.oldValue = currentValue;
                this.callSubscribers(currentValue, oldValue, 0 /* none */);
            }
        }
        subscribe(subscriber) {
            if (!this.hasSubscribers()) {
                this.handler.subscribe(this.obj, this);
                this.currentValue = this.oldValue = this.obj[this.propertyKey];
            }
            this.addSubscriber(subscriber);
        }
        unsubscribe(subscriber) {
            this.removeSubscriber(subscriber);
            if (!this.hasSubscribers()) {
                this.handler.dispose();
            }
        }
    };
    ValueAttributeObserver = __decorate([
        runtime_1.subscriberCollection(),
        __metadata("design:paramtypes", [Object, Number, Object, Object, String])
    ], ValueAttributeObserver);
    exports.ValueAttributeObserver = ValueAttributeObserver;
});
//# sourceMappingURL=value-attribute-observer.js.map