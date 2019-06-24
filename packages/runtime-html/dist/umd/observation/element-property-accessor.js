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
    class ElementPropertyAccessor {
        constructor(lifecycle, obj, propertyKey) {
            this.lifecycle = lifecycle;
            this.obj = obj;
            this.propertyKey = propertyKey;
            this.currentValue = void 0;
            this.oldValue = void 0;
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
                this.obj[this.propertyKey] = currentValue;
            }
        }
        bind(flags) {
            this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
            this.currentValue = this.oldValue = this.obj[this.propertyKey];
        }
        unbind(flags) {
            this.lifecycle.dequeueRAF(this.flushRAF, this);
        }
    }
    exports.ElementPropertyAccessor = ElementPropertyAccessor;
});
//# sourceMappingURL=element-property-accessor.js.map