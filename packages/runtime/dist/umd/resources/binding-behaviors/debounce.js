(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "../../binding/property-binding", "../../flags", "../binding-behavior"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const property_binding_1 = require("../../binding/property-binding");
    const flags_1 = require("../../flags");
    const binding_behavior_1 = require("../binding-behavior");
    const unset = {};
    /** @internal */
    function debounceCallSource(newValue, oldValue, flags) {
        const state = this.debounceState;
        kernel_1.PLATFORM.global.clearTimeout(state.timeoutId);
        state.timeoutId = kernel_1.PLATFORM.global.setTimeout(() => { this.debouncedMethod(newValue, oldValue, flags); }, state.delay);
    }
    exports.debounceCallSource = debounceCallSource;
    /** @internal */
    function debounceCall(newValue, oldValue, flags) {
        const state = this.debounceState;
        kernel_1.PLATFORM.global.clearTimeout(state.timeoutId);
        if (!(flags & state.callContextToDebounce)) {
            state.oldValue = unset;
            this.debouncedMethod(newValue, oldValue, flags);
            return;
        }
        if (state.oldValue === unset) {
            state.oldValue = oldValue;
        }
        const timeoutId = kernel_1.PLATFORM.global.setTimeout(() => {
            const ov = state.oldValue;
            state.oldValue = unset;
            this.debouncedMethod(newValue, ov, flags);
        }, state.delay);
        state.timeoutId = timeoutId;
    }
    exports.debounceCall = debounceCall;
    const fromView = flags_1.BindingMode.fromView;
    class DebounceBindingBehavior {
        bind(flags, scope, binding, delay = 200) {
            let methodToDebounce;
            let callContextToDebounce;
            let debouncer;
            if (binding instanceof property_binding_1.PropertyBinding) {
                methodToDebounce = 'handleChange';
                debouncer = debounceCall;
                callContextToDebounce = binding.mode & fromView ? 32 /* updateSourceExpression */ : 16 /* updateTargetInstance */;
            }
            else {
                methodToDebounce = 'callSource';
                debouncer = debounceCallSource;
                callContextToDebounce = 16 /* updateTargetInstance */;
            }
            // stash the original method and it's name.
            // note: a generic name like "originalMethod" is not used to avoid collisions
            // with other binding behavior types.
            binding.debouncedMethod = binding[methodToDebounce];
            binding.debouncedMethod.originalName = methodToDebounce;
            // replace the original method with the debouncing version.
            binding[methodToDebounce] = debouncer;
            // create the debounce state.
            binding.debounceState = {
                callContextToDebounce,
                delay,
                timeoutId: 0,
                oldValue: unset
            };
        }
        unbind(flags, scope, binding) {
            // restore the state of the binding.
            const methodToRestore = binding.debouncedMethod.originalName;
            binding[methodToRestore] = binding.debouncedMethod;
            binding.debouncedMethod = null;
            kernel_1.PLATFORM.global.clearTimeout(binding.debounceState.timeoutId);
            binding.debounceState = null;
        }
    }
    exports.DebounceBindingBehavior = DebounceBindingBehavior;
    binding_behavior_1.BindingBehavior.define('debounce', DebounceBindingBehavior);
});
//# sourceMappingURL=debounce.js.map