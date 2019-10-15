import { __decorate } from "tslib";
import { Reporter } from '@aurelia/kernel';
import { subscriberCollection } from './subscriber-collection';
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
                Reporter.write(1, this.propertyKey, this.obj);
            }
        }
        this.addSubscriber(subscriber);
    }
};
SetterObserver = __decorate([
    subscriberCollection()
], SetterObserver);
export { SetterObserver };
//# sourceMappingURL=setter-observer.js.map