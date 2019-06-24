(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/runtime", "../../observation/data-attribute-accessor"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const runtime_1 = require("@aurelia/runtime");
    const data_attribute_accessor_1 = require("../../observation/data-attribute-accessor");
    class AttrBindingBehavior {
        bind(flags, scope, binding) {
            binding.targetObserver = new data_attribute_accessor_1.DataAttributeAccessor(binding.locator.get(runtime_1.ILifecycle), binding.target, binding.targetProperty);
        }
        unbind(flags, scope, binding) {
            return;
        }
    }
    exports.AttrBindingBehavior = AttrBindingBehavior;
    runtime_1.BindingBehaviorResource.define('attr', AttrBindingBehavior);
});
//# sourceMappingURL=attr.js.map