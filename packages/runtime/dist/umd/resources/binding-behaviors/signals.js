(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/kernel", "../../observation/signaler", "../binding-behavior"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const kernel_1 = require("@aurelia/kernel");
    const signaler_1 = require("../../observation/signaler");
    const binding_behavior_1 = require("../binding-behavior");
    let SignalBindingBehavior = class SignalBindingBehavior {
        constructor(signaler) {
            this.signaler = signaler;
        }
        bind(flags, scope, binding, ...args) {
            if (!binding.updateTarget) {
                throw kernel_1.Reporter.error(11);
            }
            if (arguments.length === 4) {
                const name = args[0];
                this.signaler.addSignalListener(name, binding);
                binding.signal = name;
            }
            else if (arguments.length > 4) {
                const names = Array.prototype.slice.call(args.length + 3, 3);
                let i = names.length;
                while (i--) {
                    const name = names[i];
                    this.signaler.addSignalListener(name, binding);
                }
                binding.signal = names;
            }
            else {
                throw kernel_1.Reporter.error(12);
            }
        }
        unbind(flags, scope, binding) {
            const name = binding.signal;
            binding.signal = null;
            if (Array.isArray(name)) {
                const names = name;
                let i = names.length;
                while (i--) {
                    this.signaler.removeSignalListener(names[i], binding);
                }
            }
            else {
                this.signaler.removeSignalListener(name, binding);
            }
        }
    };
    SignalBindingBehavior = tslib_1.__decorate([
        binding_behavior_1.bindingBehavior('signal'),
        tslib_1.__param(0, signaler_1.ISignaler)
    ], SignalBindingBehavior);
    exports.SignalBindingBehavior = SignalBindingBehavior;
});
//# sourceMappingURL=signals.js.map