"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueAttributeObserver = void 0;
const runtime_1 = require("@aurelia/runtime");
/**
 * Observer for non-radio, non-checkbox input.
 */
class ValueAttributeObserver {
    constructor(obj, propertyKey, handler) {
        this.propertyKey = propertyKey;
        this.handler = handler;
        this.currentValue = '';
        this.oldValue = '';
        this.hasChanges = false;
        // ObserverType.Layout is not always true, it depends on the element & property combo
        // but for simplicity, always treat as such
        this.type = 2 /* Node */ | 1 /* Observer */ | 4 /* Layout */;
        this.obj = obj;
    }
    getValue() {
        // is it safe to assume the observer has the latest value?
        // todo: ability to turn on/off cache based on type
        return this.currentValue;
    }
    setValue(newValue, flags) {
        this.currentValue = newValue;
        this.hasChanges = newValue !== this.oldValue;
        if (!this.handler.config.readonly && (flags & 4096 /* noFlush */) === 0) {
            this.flushChanges(flags);
        }
    }
    flushChanges(flags) {
        if (this.hasChanges) {
            this.hasChanges = false;
            const currentValue = this.currentValue;
            const oldValue = this.oldValue;
            this.oldValue = currentValue;
            this.obj[this.propertyKey] = currentValue !== null && currentValue !== void 0 ? currentValue : this.handler.config.default;
            if ((flags & 32 /* fromBind */) === 0) {
                this.subs.notify(currentValue, oldValue, flags);
            }
        }
    }
    handleEvent() {
        const oldValue = this.oldValue = this.currentValue;
        const currentValue = this.currentValue = this.obj[this.propertyKey];
        if (oldValue !== currentValue) {
            this.oldValue = currentValue;
            this.subs.notify(currentValue, oldValue, 0 /* none */);
        }
    }
    subscribe(subscriber) {
        if (this.subs.add(subscriber) && this.subs.count === 1) {
            this.handler.subscribe(this.obj, this);
            this.currentValue = this.oldValue = this.obj[this.propertyKey];
        }
    }
    unsubscribe(subscriber) {
        if (this.subs.remove(subscriber) && this.subs.count === 0) {
            this.handler.dispose();
        }
    }
}
exports.ValueAttributeObserver = ValueAttributeObserver;
runtime_1.subscriberCollection(ValueAttributeObserver);
//# sourceMappingURL=value-attribute-observer.js.map