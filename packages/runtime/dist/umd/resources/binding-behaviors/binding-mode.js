(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../../flags", "../binding-behavior"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const flags_1 = require("../../flags");
    const binding_behavior_1 = require("../binding-behavior");
    const { oneTime, toView, fromView, twoWay } = flags_1.BindingMode;
    class BindingModeBehavior {
        constructor(mode) {
            this.mode = mode;
        }
        bind(flags, scope, binding) {
            binding.originalMode = binding.mode;
            binding.mode = this.mode;
        }
        unbind(flags, scope, binding) {
            binding.mode = binding.originalMode;
            binding.originalMode = null;
        }
    }
    exports.BindingModeBehavior = BindingModeBehavior;
    class OneTimeBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(oneTime);
        }
    }
    exports.OneTimeBindingBehavior = OneTimeBindingBehavior;
    binding_behavior_1.BindingBehavior.define('oneTime', OneTimeBindingBehavior);
    class ToViewBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(toView);
        }
    }
    exports.ToViewBindingBehavior = ToViewBindingBehavior;
    binding_behavior_1.BindingBehavior.define('toView', ToViewBindingBehavior);
    class FromViewBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(fromView);
        }
    }
    exports.FromViewBindingBehavior = FromViewBindingBehavior;
    binding_behavior_1.BindingBehavior.define('fromView', FromViewBindingBehavior);
    class TwoWayBindingBehavior extends BindingModeBehavior {
        constructor() {
            super(twoWay);
        }
    }
    exports.TwoWayBindingBehavior = TwoWayBindingBehavior;
    binding_behavior_1.BindingBehavior.define('twoWay', TwoWayBindingBehavior);
});
//# sourceMappingURL=binding-mode.js.map