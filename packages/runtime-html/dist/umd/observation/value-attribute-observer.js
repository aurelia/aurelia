(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
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
            this.persistentFlags = flags & 805306383 /* targetObserverFlags */;
        }
        getValue() {
            return this.currentValue;
        }
        setValue(newValue, flags) {
            this.currentValue = newValue;
            this.hasChanges = newValue !== this.oldValue;
            if ((flags & 4096 /* fromBind */) > 0 || this.persistentFlags === 268435456 /* noTargetObserverQueue */) {
                this.flushChanges(flags);
            }
            else if (this.persistentFlags !== 536870912 /* persistentTargetObserverQueue */ && this.task === null) {
                this.task = this.scheduler.queueRenderTask(() => {
                    this.flushChanges(flags);
                    this.task = null;
                });
            }
        }
        flushChanges(flags) {
            if (this.hasChanges) {
                this.hasChanges = false;
                const { currentValue, oldValue } = this;
                this.oldValue = currentValue;
                if (currentValue == void 0) {
                    this.obj[this.propertyKey] = '';
                }
                else {
                    this.obj[this.propertyKey] = currentValue;
                }
                if ((flags & 4096 /* fromBind */) === 0) {
                    this.callSubscribers(currentValue, oldValue, flags);
                }
            }
        }
        handleEvent() {
            const oldValue = this.oldValue = this.currentValue;
            const currentValue = this.currentValue = this.obj[this.propertyKey];
            if (oldValue !== currentValue) {
                this.oldValue = currentValue;
                this.callSubscribers(currentValue, oldValue, 131072 /* fromDOMEvent */ | 524288 /* allowPublishRoundtrip */);
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
        bind(flags) {
            if (this.persistentFlags === 536870912 /* persistentTargetObserverQueue */) {
                if (this.task !== null) {
                    this.task.cancel();
                }
                this.task = this.scheduler.queueRenderTask(() => this.flushChanges(flags), { persistent: true });
            }
        }
        unbind(flags) {
            if (this.task !== null) {
                this.task.cancel();
                this.task = null;
            }
        }
    };
    ValueAttributeObserver = tslib_1.__decorate([
        runtime_1.subscriberCollection()
    ], ValueAttributeObserver);
    exports.ValueAttributeObserver = ValueAttributeObserver;
});
//# sourceMappingURL=value-attribute-observer.js.map