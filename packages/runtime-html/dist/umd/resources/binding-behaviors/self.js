(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/kernel", "@aurelia/runtime", "../../observation/event-manager"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    const event_manager_1 = require("../../observation/event-manager");
    /** @internal */
    function handleSelfEvent(event) {
        const target = event_manager_1.findOriginalEventTarget(event);
        if (this.target !== target) {
            return;
        }
        return this.selfEventCallSource(event);
    }
    exports.handleSelfEvent = handleSelfEvent;
    let SelfBindingBehavior = class SelfBindingBehavior {
        bind(flags, scope, binding) {
            if (!binding.callSource || !binding.targetEvent) {
                throw kernel_1.Reporter.error(8);
            }
            binding.selfEventCallSource = binding.callSource;
            binding.callSource = handleSelfEvent;
        }
        unbind(flags, scope, binding) {
            binding.callSource = binding.selfEventCallSource;
            binding.selfEventCallSource = null;
        }
    };
    SelfBindingBehavior = tslib_1.__decorate([
        runtime_1.bindingBehavior('self')
    ], SelfBindingBehavior);
    exports.SelfBindingBehavior = SelfBindingBehavior;
});
//# sourceMappingURL=self.js.map