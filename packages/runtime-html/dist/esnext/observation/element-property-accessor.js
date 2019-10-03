export class ElementPropertyAccessor {
    constructor(lifecycle, flags, obj, propertyKey) {
        this.lifecycle = lifecycle;
        this.obj = obj;
        this.propertyKey = propertyKey;
        this.currentValue = void 0;
        this.oldValue = void 0;
        this.hasChanges = false;
        this.priority = 12288 /* propagate */;
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
            this.obj[this.propertyKey] = currentValue;
        }
    }
    bind(flags) {
        if (this.persistentFlags === 536870912 /* persistentTargetObserverQueue */) {
            this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
        }
        this.currentValue = this.oldValue = this.obj[this.propertyKey];
    }
    unbind(flags) {
        if (this.persistentFlags === 536870912 /* persistentTargetObserverQueue */) {
            this.lifecycle.dequeueRAF(this.flushRAF, this);
        }
    }
}
//# sourceMappingURL=element-property-accessor.js.map