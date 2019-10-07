import { __decorate } from "tslib";
import { subscriberCollection, } from '@aurelia/runtime';
const childObserverOptions = {
    childList: true,
    subtree: true,
    characterData: true
};
function defaultMatcher(a, b) {
    return a === b;
}
let SelectValueObserver = class SelectValueObserver {
    constructor(lifecycle, flags, observerLocator, dom, handler, obj) {
        this.lifecycle = lifecycle;
        this.observerLocator = observerLocator;
        this.dom = dom;
        this.obj = obj;
        this.handler = handler;
        this.currentValue = void 0;
        this.oldValue = void 0;
        this.hasChanges = false;
        this.priority = 12288 /* propagate */;
        this.arrayObserver = void 0;
        this.nodeObserver = void 0;
        this.handleNodeChange = this.handleNodeChange.bind(this);
        this.persistentFlags = flags & 805306383 /* targetObserverFlags */;
    }
    getValue() {
        return this.currentValue;
    }
    setValue(newValue, flags) {
        this.currentValue = newValue;
        this.hasChanges = newValue !== this.oldValue;
        if ((flags & 4096 /* fromBind */) > 0 || this.persistentFlags === 268435456 /* noTargetObserverQueue */) {
            this.flushRAF(flags);
        }
        else if (this.persistentFlags !== 536870912 /* persistentTargetObserverQueue */) {
            this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority, true);
        }
    }
    flushRAF(flags) {
        if (this.hasChanges) {
            this.hasChanges = false;
            const { currentValue } = this;
            this.oldValue = currentValue;
            const isArray = Array.isArray(currentValue);
            if (!isArray && currentValue != void 0 && this.obj.multiple) {
                throw new Error('Only null or Array instances can be bound to a multi-select.');
            }
            if (this.arrayObserver) {
                this.arrayObserver.unsubscribeFromCollection(this);
                this.arrayObserver = void 0;
            }
            if (isArray) {
                this.arrayObserver = this.observerLocator.getArrayObserver(flags, currentValue);
                this.arrayObserver.subscribeToCollection(this);
            }
            this.synchronizeOptions();
            this.notify(flags);
        }
    }
    handleCollectionChange(indexMap, flags) {
        if ((flags & 4096 /* fromBind */) > 0 || this.persistentFlags === 268435456 /* noTargetObserverQueue */) {
            this.synchronizeOptions();
        }
        else {
            this.hasChanges = true;
        }
        if (this.persistentFlags !== 536870912 /* persistentTargetObserverQueue */) {
            this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority, true);
        }
        this.callSubscribers(this.currentValue, this.oldValue, flags);
    }
    handleChange(newValue, previousValue, flags) {
        if ((flags & 4096 /* fromBind */) > 0 || this.persistentFlags === 268435456 /* noTargetObserverQueue */) {
            this.synchronizeOptions();
        }
        else {
            this.hasChanges = true;
        }
        if (this.persistentFlags !== 536870912 /* persistentTargetObserverQueue */) {
            this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority, true);
        }
        this.callSubscribers(newValue, previousValue, flags);
    }
    notify(flags) {
        if ((flags & 4096 /* fromBind */) > 0 || this.persistentFlags === 268435456 /* noTargetObserverQueue */) {
            return;
        }
        const oldValue = this.oldValue;
        const newValue = this.currentValue;
        if (newValue === oldValue) {
            return;
        }
        this.callSubscribers(newValue, oldValue, flags);
    }
    handleEvent() {
        // "from-view" changes are always synchronous now, so immediately sync the value and notify subscribers
        const shouldNotify = this.synchronizeValue();
        if (shouldNotify) {
            this.callSubscribers(this.currentValue, this.oldValue, 131072 /* fromDOMEvent */ | 524288 /* allowPublishRoundtrip */);
        }
    }
    synchronizeOptions(indexMap) {
        const { currentValue, obj } = this;
        const isArray = Array.isArray(currentValue);
        const matcher = obj.matcher !== void 0 ? obj.matcher : defaultMatcher;
        const options = obj.options;
        let i = options.length;
        while (i-- > 0) {
            const option = options[i];
            const optionValue = Object.prototype.hasOwnProperty.call(option, 'model') ? option.model : option.value;
            if (isArray) {
                option.selected = currentValue.findIndex(item => !!matcher(optionValue, item)) !== -1;
                continue;
            }
            option.selected = !!matcher(optionValue, currentValue);
        }
    }
    synchronizeValue() {
        // Spec for synchronizing value from `SelectObserver` to `<select/>`
        // When synchronizing value to observed <select/> element, do the following steps:
        // A. If `<select/>` is multiple
        //    1. Check if current value, called `currentValue` is an array
        //      a. If not an array, return true to signal value has changed
        //      b. If is an array:
        //        i. gather all current selected <option/>, in to array called `values`
        //        ii. loop through the `currentValue` array and remove items that are nolonger selected based on matcher
        //        iii. loop through the `values` array and add items that are selected based on matcher
        //        iv. Return false to signal value hasn't changed
        // B. If the select is single
        //    1. Let `value` equal the first selected option, if no option selected, then `value` is `null`
        //    2. assign `this.currentValue` to `this.oldValue`
        //    3. assign `value` to `this.currentValue`
        //    4. return `true` to signal value has changed
        const obj = this.obj;
        const options = obj.options;
        const len = options.length;
        const currentValue = this.currentValue;
        let i = 0;
        if (obj.multiple) {
            // A.
            if (!Array.isArray(currentValue)) {
                // A.1.a
                return true;
            }
            // A.1.b
            // multi select
            let option;
            const matcher = obj.matcher || defaultMatcher;
            // A.1.b.i
            const values = [];
            while (i < len) {
                option = options[i];
                if (option.selected) {
                    values.push(Object.prototype.hasOwnProperty.call(option, 'model')
                        ? option.model
                        : option.value);
                }
                ++i;
            }
            // A.1.b.ii
            i = 0;
            while (i < currentValue.length) {
                const a = currentValue[i];
                // Todo: remove arrow fn
                if (values.findIndex(b => !!matcher(a, b)) === -1) {
                    currentValue.splice(i, 1);
                }
                else {
                    ++i;
                }
            }
            // A.1.b.iii
            i = 0;
            while (i < values.length) {
                const a = values[i];
                // Todo: remove arrow fn
                if (currentValue.findIndex(b => !!matcher(a, b)) === -1) {
                    currentValue.push(a);
                }
                ++i;
            }
            // A.1.b.iv
            return false;
        }
        // B. single select
        // B.1
        let value = null;
        while (i < len) {
            const option = options[i];
            if (option.selected) {
                value = Object.prototype.hasOwnProperty.call(option, 'model')
                    ? option.model
                    : option.value;
                break;
            }
            ++i;
        }
        // B.2
        this.oldValue = this.currentValue;
        // B.3
        this.currentValue = value;
        // B.4
        return true;
    }
    bind(flags) {
        this.nodeObserver = this.dom.createNodeObserver(this.obj, this.handleNodeChange, childObserverOptions);
        if (this.persistentFlags === 536870912 /* persistentTargetObserverQueue */) {
            this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
        }
    }
    unbind(flags) {
        this.nodeObserver.disconnect();
        this.nodeObserver = null;
        if (this.persistentFlags === 536870912 /* persistentTargetObserverQueue */) {
            this.lifecycle.dequeueRAF(this.flushRAF, this);
        }
        if (this.arrayObserver) {
            this.arrayObserver.unsubscribeFromCollection(this);
            this.arrayObserver = null;
        }
    }
    handleNodeChange() {
        this.synchronizeOptions();
        const shouldNotify = this.synchronizeValue();
        if (shouldNotify) {
            this.notify(131072 /* fromDOMEvent */);
        }
    }
    subscribe(subscriber) {
        if (!this.hasSubscribers()) {
            this.handler.subscribe(this.obj, this);
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
SelectValueObserver = __decorate([
    subscriberCollection()
], SelectValueObserver);
export { SelectValueObserver };
//# sourceMappingURL=select-value-observer.js.map