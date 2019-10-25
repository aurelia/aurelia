(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/runtime", "../../observation/data-attribute-accessor"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const runtime_1 = require("@aurelia/runtime");
    const data_attribute_accessor_1 = require("../../observation/data-attribute-accessor");
    let AttrBindingBehavior = class AttrBindingBehavior {
        bind(flags, scope, binding) {
            binding.targetObserver = new data_attribute_accessor_1.DataAttributeAccessor(binding.locator.get(runtime_1.IScheduler), flags, binding.target, binding.targetProperty);
        }
        unbind(flags, scope, binding) {
            return;
        }
    };
    AttrBindingBehavior = tslib_1.__decorate([
        runtime_1.bindingBehavior('attr')
    ], AttrBindingBehavior);
    exports.AttrBindingBehavior = AttrBindingBehavior;
});
//# sourceMappingURL=attr.js.map