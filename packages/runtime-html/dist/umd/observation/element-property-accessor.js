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
    exports.elementPropertyAccessor = exports.ElementPropertyAccessor = void 0;
    /**
     * Property accessor for HTML Elements.
     * Note that Aurelia works with properties, so in all case it will try to assign to property instead of attributes.
     * Unless the property falls into a special set, then it will use attribute for it.
     *
     * @see DataAttributeAccessor
     */
    class ElementPropertyAccessor {
        constructor() {
            this.currentValue = void 0;
            // ObserverType.Layout is not always true, it depends on the property
            // but for simplicity, always treat as such
            this.type = 2 /* Node */ | 64 /* Layout */;
        }
        getValue(obj, key) {
            return obj[key];
        }
        setValue(newValue, flags, obj, key) {
            obj[key] = newValue;
        }
    }
    exports.ElementPropertyAccessor = ElementPropertyAccessor;
    exports.elementPropertyAccessor = new ElementPropertyAccessor();
});
//# sourceMappingURL=element-property-accessor.js.map