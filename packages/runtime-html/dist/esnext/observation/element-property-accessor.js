/**
 * Property accessor for HTML Elements.
 * Note that Aurelia works with properties, so in all case it will try to assign to property instead of attributes.
 * Unless the property falls into a special set, then it will use attribute for it.
 *
 * @see DataAttributeAccessor
 */
export class ElementPropertyAccessor {
    constructor(scheduler, flags, obj, propertyKey) {
        this.scheduler = scheduler;
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.currentValue = void 0;
        this.oldValue = void 0;
        this.hasChanges = false;
        this.task = null;
        // ObserverType.Layout is not always true, it depends on the property
        // but for simplicity, always treat as such
        this.type = 2 /* Node */ | 64 /* Layout */;
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
            this.obj[this.propertyKey] = currentValue;
        }
    }
    bind(flags) {
        this.currentValue = this.oldValue = this.obj[this.propertyKey];
    }
}
//# sourceMappingURL=element-property-accessor.js.map