/**
 * Attribute accessor in a XML document/element that can be accessed via a namespace.
 * Wraps [`getAttributeNS`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNS).
 */
export class AttributeNSAccessor {
    constructor(scheduler, flags, obj, propertyKey, namespace) {
        this.scheduler = scheduler;
        this.propertyKey = propertyKey;
        this.namespace = namespace;
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
                this.obj.removeAttributeNS(this.namespace, this.propertyKey);
            }
            else {
                this.obj.setAttributeNS(this.namespace, this.propertyKey, currentValue);
            }
        }
    }
    bind(flags) {
        this.currentValue = this.oldValue = this.obj.getAttributeNS(this.namespace, this.propertyKey);
    }
}
//# sourceMappingURL=attribute-ns-accessor.js.map