var SelfObserver_1;
import { __decorate } from "tslib";
import { Reporter } from '@aurelia/kernel';
import { ProxyObserver } from './proxy-observer';
import { subscriberCollection } from './subscriber-collection';
let SelfObserver = SelfObserver_1 = class SelfObserver {
    constructor(lifecycle, flags, obj, propertyName, cbName) {
        this.lifecycle = lifecycle;
        let isProxy = false;
        if (ProxyObserver.isProxy(obj)) {
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
            Reporter.write(1, this.propertyKey, this.obj);
        }
    }
};
SelfObserver = SelfObserver_1 = __decorate([
    subscriberCollection()
], SelfObserver);
export { SelfObserver };
//# sourceMappingURL=self-observer.js.map