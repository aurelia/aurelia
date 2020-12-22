import { noop } from '@aurelia/kernel';
import { subscriberCollection } from '@aurelia/runtime';
export class BindableObserver {
    constructor(obj, propertyKey, cbName, set, $controller) {
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.set = set;
        this.$controller = $controller;
        this.currentValue = void 0;
        this.oldValue = void 0;
        const cb = obj[cbName];
        const cbAll = obj.propertyChanged;
        const hasCb = this.hasCb = typeof cb === 'function';
        const hasCbAll = this.hasCbAll = typeof cbAll === 'function';
        const hasSetter = this.hasSetter = set !== noop;
        this.cb = hasCb ? cb : noop;
        this.cbAll = this.hasCbAll ? cbAll : noop;
        // when user declare @bindable({ set })
        // it's expected to work from the start,
        // regardless where the assignment comes from: either direct view model assignment or from binding during render
        // so if either getter/setter config is present, alter the accessor straight await
        if (this.cb === void 0 && !hasCbAll && !hasSetter) {
            this.observing = false;
        }
        else {
            this.observing = true;
            const val = obj[propertyKey];
            this.currentValue = hasSetter && val !== void 0 ? set(val) : val;
            this.createGetterSetter();
        }
    }
    get type() { return 1 /* Observer */; }
    getValue() {
        return this.currentValue;
    }
    setValue(newValue, flags) {
        if (this.hasSetter) {
            newValue = this.set(newValue);
        }
        if (this.observing) {
            const currentValue = this.currentValue;
            if (Object.is(newValue, currentValue)) {
                return;
            }
            this.currentValue = newValue;
            // todo: controller (if any) state should determine the invocation instead
            if ((flags & 32 /* fromBind */) === 0 || (flags & 16 /* updateSource */) > 0) {
                if (this.hasCb) {
                    this.cb.call(this.obj, newValue, currentValue, flags);
                }
                if (this.hasCbAll) {
                    this.cbAll.call(this.obj, this.propertyKey, newValue, currentValue, flags);
                }
            }
            this.subs.notify(newValue, currentValue, flags);
        }
        else {
            // See SetterObserver.setValue for explanation
            this.obj[this.propertyKey] = newValue;
        }
    }
    subscribe(subscriber) {
        if (!this.observing === false) {
            this.observing = true;
            const currentValue = this.obj[this.propertyKey];
            this.currentValue = this.hasSetter
                ? this.set(currentValue)
                : currentValue;
            this.createGetterSetter();
        }
        this.subs.add(subscriber);
    }
    createGetterSetter() {
        Reflect.defineProperty(this.obj, this.propertyKey, {
            enumerable: true,
            configurable: true,
            get: ( /* Bindable Observer */) => this.currentValue,
            set: (/* Bindable Observer */ value) => {
                this.setValue(value, 0 /* none */);
            }
        });
    }
}
subscriberCollection(BindableObserver);
//# sourceMappingURL=bindable-observer.js.map