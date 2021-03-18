import { subscriberCollection, withFlushQueue } from '../../../../runtime/dist/native-modules/index.js';
/**
 * Observer for non-radio, non-checkbox input.
 */
export class ValueAttributeObserver {
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
        if (Object.is(newValue, this.currentValue)) {
            return;
        }
        this.oldValue = this.currentValue;
        this.currentValue = newValue;
        this.hasChanges = true;
        if (!this.handler.config.readonly && (flags & 256 /* noFlush */) === 0) {
            this.flushChanges(flags);
        }
    }
    flushChanges(flags) {
        var _a;
        if (this.hasChanges) {
            this.hasChanges = false;
            this.obj[this.propertyKey] = (_a = this.currentValue) !== null && _a !== void 0 ? _a : this.handler.config.default;
            if ((flags & 2 /* fromBind */) === 0) {
                this.queue.add(this);
            }
        }
    }
    handleEvent() {
        const oldValue = this.oldValue = this.currentValue;
        const currentValue = this.currentValue = this.obj[this.propertyKey];
        if (oldValue !== currentValue) {
            this.hasChanges = false;
            this.queue.add(this);
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
    flush() {
        oV = this.oldValue;
        this.oldValue = this.currentValue;
        this.subs.notify(this.currentValue, oV, 0 /* none */);
    }
}
subscriberCollection(ValueAttributeObserver);
withFlushQueue(ValueAttributeObserver);
// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV = void 0;
//# sourceMappingURL=value-attribute-observer.js.map