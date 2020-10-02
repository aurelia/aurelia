/**
 * Attribute accessor for HTML elements.
 * Note that Aurelia works with properties, so in all case it will try to assign to property instead of attributes.
 * Unless the property falls into a special set, then it will use attribute for it.
 *
 * @see ElementPropertyAccessor
 */
export class DataAttributeAccessor {
    constructor(scheduler, flags, obj, propertyKey) {
        this.scheduler = scheduler;
        this.propertyKey = propertyKey;
        this.currentValue = null;
        this.oldValue = null;
        this.hasChanges = false;
        this.task = null;
        // ObserverType.Layout is not always true, it depends on the property
        // but for simplicity, always treat as such
        this.type = 2 /* Node */ | 64 /* Layout */;
        this.obj = obj;
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
            this.oldValue = currentValue;
            if (currentValue == void 0) {
                this.obj.removeAttribute(this.propertyKey);
            }
            else {
                this.obj.setAttribute(this.propertyKey, currentValue);
            }
        }
    }
    bind(flags) {
        this.currentValue = this.oldValue = this.obj.getAttribute(this.propertyKey);
    }
}
//# sourceMappingURL=data-attribute-accessor.js.map