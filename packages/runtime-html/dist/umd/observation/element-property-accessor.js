(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Property accessor for HTML Elements.
     * Note that Aurelia works with properties, so in all case it will try to assign to property instead of attributes.
     * Unless the property falls into a special set, then it will use attribute for it.
     *
     * @see DataAttributeAccessor
     */
    class ElementPropertyAccessor {
        constructor(scheduler, flags, obj, propertyKey) {
            this.scheduler = scheduler;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.currentValue = void 0;
            this.oldValue = void 0;
            this.hasChanges = false;
            this.task = null;
            this.persistentFlags = flags & 805306383 /* targetObserverFlags */;
        }
        getValue() {
            return this.currentValue;
        }
        setValue(newValue, flags) {
            this.currentValue = newValue;
            this.hasChanges = newValue !== this.oldValue;
            if ((flags & 4096 /* fromBind */) > 0 || this.persistentFlags === 268435456 /* noTargetObserverQueue */) {
                this.flushChanges(flags);
            }
            else if (this.persistentFlags !== 536870912 /* persistentTargetObserverQueue */ && this.task === null) {
                this.task = this.scheduler.queueRenderTask(() => {
                    this.flushChanges(flags);
                    this.task = null;
                });
            }
        }
        flushChanges(flags) {
            if (this.hasChanges) {
                this.hasChanges = false;
                const { currentValue } = this;
                this.oldValue = currentValue;
                this.obj[this.propertyKey] = currentValue;
            }
        }
        bind(flags) {
            if (this.persistentFlags === 536870912 /* persistentTargetObserverQueue */) {
                if (this.task !== null) {
                    this.task.cancel();
                }
                this.task = this.scheduler.queueRenderTask(() => this.flushChanges(flags), { persistent: true });
            }
            this.currentValue = this.oldValue = this.obj[this.propertyKey];
        }
        unbind(flags) {
            if (this.task !== null) {
                this.task.cancel();
                this.task = null;
            }
        }
    }
    exports.ElementPropertyAccessor = ElementPropertyAccessor;
});
//# sourceMappingURL=element-property-accessor.js.map