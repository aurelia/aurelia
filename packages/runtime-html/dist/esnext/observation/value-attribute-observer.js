import * as tslib_1 from "tslib";
import { subscriberCollection, } from '@aurelia/runtime';
// TODO: handle file attribute properly again, etc
let ValueAttributeObserver = class ValueAttributeObserver {
    constructor(lifecycle, handler, obj, propertyKey) {
        this.lifecycle = lifecycle;
        this.handler = handler;
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.currentValue = '';
        this.oldValue = '';
        this.hasChanges = false;
        this.priority = 12288 /* propagate */;
    }
    getValue() {
        return this.currentValue;
    }
    setValue(newValue, flags) {
        this.currentValue = newValue;
        this.hasChanges = newValue !== this.oldValue;
        if ((flags & 4096 /* fromBind */) > 0) {
            this.flushRAF(flags);
        }
    }
    flushRAF(flags) {
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
        this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
    }
    unbind(flags) {
        this.lifecycle.dequeueRAF(this.flushRAF, this);
    }
};
ValueAttributeObserver = tslib_1.__decorate([
    subscriberCollection()
], ValueAttributeObserver);
export { ValueAttributeObserver };
//# sourceMappingURL=value-attribute-observer.js.map