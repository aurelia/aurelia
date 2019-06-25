(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const slice = Array.prototype.slice;
    class PropertyAccessor {
        constructor(obj, propertyKey) {
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.enter('PropertyAccessor', 'constructor', slice.call(arguments));
            }
            this.obj = obj;
            this.propertyKey = propertyKey;
            if (obj.$observers !== void 0
                && obj.$observers[propertyKey] !== void 0
                && obj.$observers[propertyKey].setValue !== void 0) {
                this.setValue = this.setValueDirect;
            }
            if (kernel_1.Tracer.enabled) {
                kernel_1.Tracer.leave();
            }
        }
        getValue() {
            return this.obj[this.propertyKey];
        }
        setValue(value, flags) {
            this.obj[this.propertyKey] = value;
        }
        setValueDirect(value, flags) {
            this.obj.$observers[this.propertyKey].setValue(value, flags);
        }
    }
    exports.PropertyAccessor = PropertyAccessor;
});
//# sourceMappingURL=property-accessor.js.map