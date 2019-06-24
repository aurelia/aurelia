(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "../../binding/binding", "../../flags", "../binding-behavior"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const binding_1 = require("../../binding/binding");
    const flags_1 = require("../../flags");
    const binding_behavior_1 = require("../binding-behavior");
    /** @internal */
    function throttle(newValue) {
        const state = this.throttleState;
        const elapsed = +new Date() - state.last;
        if (elapsed >= state.delay) {
            kernel_1.PLATFORM.global.clearTimeout(state.timeoutId);
            state.timeoutId = -1;
            state.last = +new Date();
            this.throttledMethod(newValue);
            return;
        }
        state.newValue = newValue;
        if (state.timeoutId === -1) {
            const timeoutId = kernel_1.PLATFORM.global.setTimeout(() => {
                state.timeoutId = -1;
                state.last = +new Date();
                this.throttledMethod(state.newValue);
            }, state.delay - elapsed);
            state.timeoutId = timeoutId;
        }
    }
    exports.throttle = throttle;
    class ThrottleBindingBehavior {
        bind(flags, scope, binding, delay = 200) {
            let methodToThrottle;
            if (binding instanceof binding_1.Binding) {
                if (binding.mode === flags_1.BindingMode.twoWay) {
                    methodToThrottle = 'updateSource';
                }
                else {
                    methodToThrottle = 'updateTarget';
                }
            }
            else {
                methodToThrottle = 'callSource';
            }
            // stash the original method and it's name.
            // note: a generic name like "originalMethod" is not used to avoid collisions
            // with other binding behavior types.
            binding.throttledMethod = binding[methodToThrottle];
            binding.throttledMethod.originalName = methodToThrottle;
            // replace the original method with the throttling version.
            binding[methodToThrottle] = throttle;
            // create the throttle state.
            binding.throttleState = {
                delay: delay,
                last: 0,
                timeoutId: -1
            };
        }
        unbind(flags, scope, binding) {
            // restore the state of the binding.
            const methodToRestore = binding.throttledMethod.originalName;
            binding[methodToRestore] = binding.throttledMethod;
            binding.throttledMethod = null;
            kernel_1.PLATFORM.global.clearTimeout(binding.throttleState.timeoutId);
            binding.throttleState = null;
        }
    }
    exports.ThrottleBindingBehavior = ThrottleBindingBehavior;
    binding_behavior_1.BindingBehaviorResource.define('throttle', ThrottleBindingBehavior);
});
//# sourceMappingURL=throttle.js.map