(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "../../flags", "../binding-behavior"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const flags_1 = require("../../flags");
    const binding_behavior_1 = require("../binding-behavior");
    class BindingModeBehavior {
        constructor(mode) {
            this.mode = mode;
            this.originalModes = new WeakMap();
        }
        bind(flags, scope, binding) {
            this.originalModes.set(binding, binding.mode);
            binding.mode = this.mode;
        }
        unbind(flags, scope, binding) {
            binding.mode = this.originalModes.get(binding);
        }
    }
    exports.BindingModeBehavior = BindingModeBehavior;
    let OneTimeBindingBehavior = class OneTimeBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(flags_1.BindingMode.oneTime);
        }
    };
    OneTimeBindingBehavior = tslib_1.__decorate([
        binding_behavior_1.bindingBehavior('oneTime')
    ], OneTimeBindingBehavior);
    exports.OneTimeBindingBehavior = OneTimeBindingBehavior;
    let ToViewBindingBehavior = class ToViewBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(flags_1.BindingMode.toView);
        }
    };
    ToViewBindingBehavior = tslib_1.__decorate([
        binding_behavior_1.bindingBehavior('toView')
    ], ToViewBindingBehavior);
    exports.ToViewBindingBehavior = ToViewBindingBehavior;
    let FromViewBindingBehavior = class FromViewBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(flags_1.BindingMode.fromView);
        }
    };
    FromViewBindingBehavior = tslib_1.__decorate([
        binding_behavior_1.bindingBehavior('fromView')
    ], FromViewBindingBehavior);
    exports.FromViewBindingBehavior = FromViewBindingBehavior;
    let TwoWayBindingBehavior = class TwoWayBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(flags_1.BindingMode.twoWay);
        }
    };
    TwoWayBindingBehavior = tslib_1.__decorate([
        binding_behavior_1.bindingBehavior('twoWay')
    ], TwoWayBindingBehavior);
    exports.TwoWayBindingBehavior = TwoWayBindingBehavior;
});
//# sourceMappingURL=binding-mode.js.map