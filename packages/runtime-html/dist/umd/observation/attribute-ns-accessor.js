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
    class AttributeNSAccessor {
        constructor(lifecycle, obj, propertyKey, namespace) {
            this.lifecycle = lifecycle;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.currentValue = null;
            this.oldValue = null;
            this.namespace = namespace;
            this.hasChanges = false;
            this.priority = 12288 /* propagate */;
        }
        getValue() {
            return this.currentValue;
        }
        setValue(newValue, flags) {
            this.currentValue = newValue;
            this.hasChanges = newValue !== this.oldValue;
            if ((flags & 4096 /* fromBind */) > 0) {
                this.flushRAF(flags);
            }
        }
        flushRAF(flags) {
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
            this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
            this.currentValue = this.oldValue = this.obj.getAttributeNS(this.namespace, this.propertyKey);
        }
        unbind(flags) {
            this.lifecycle.dequeueRAF(this.flushRAF, this);
        }
    }
    exports.AttributeNSAccessor = AttributeNSAccessor;
});
//# sourceMappingURL=attribute-ns-accessor.js.map