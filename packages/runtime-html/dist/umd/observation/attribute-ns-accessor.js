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
     * Attribute accessor in a XML document/element that can be accessed via a namespace.
     * Wraps [`getAttributeNS`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAttributeNS).
     */
    class AttributeNSAccessor {
        constructor(scheduler, flags, obj, propertyKey, namespace) {
            this.scheduler = scheduler;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.namespace = namespace;
            this.currentValue = null;
            this.oldValue = null;
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
                if (currentValue == void 0) {
                    this.obj.removeAttributeNS(this.namespace, this.propertyKey);
                }
                else {
                    this.obj.setAttributeNS(this.namespace, this.propertyKey, currentValue);
                }
            }
        }
        bind(flags) {
            if (this.persistentFlags === 536870912 /* persistentTargetObserverQueue */) {
                if (this.task !== null) {
                    this.task.cancel();
                }
                this.task = this.scheduler.queueRenderTask(() => this.flushChanges(flags), { persistent: true });
            }
            this.currentValue = this.oldValue = this.obj.getAttributeNS(this.namespace, this.propertyKey);
        }
        unbind(flags) {
            if (this.task !== null) {
                this.task.cancel();
                this.task = null;
            }
        }
    }
    exports.AttributeNSAccessor = AttributeNSAccessor;
});
//# sourceMappingURL=attribute-ns-accessor.js.map