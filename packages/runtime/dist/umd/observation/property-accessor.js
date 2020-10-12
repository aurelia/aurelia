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
    exports.propertyAccessor = exports.PropertyAccessor = void 0;
    class PropertyAccessor {
        constructor() {
            this.task = null;
            // the only thing can be guaranteed is it's an object
            // even if this property accessor is used to access an element
            this.type = 4 /* Obj */;
        }
        getValue(obj, key) {
            return obj[key];
        }
        setValue(value, flags, obj, key) {
            obj[key] = value;
        }
    }
    exports.PropertyAccessor = PropertyAccessor;
    exports.propertyAccessor = new PropertyAccessor();
});
//# sourceMappingURL=property-accessor.js.map