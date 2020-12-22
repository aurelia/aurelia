"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoWayBindingBehavior = exports.FromViewBindingBehavior = exports.ToViewBindingBehavior = exports.OneTimeBindingBehavior = exports.BindingModeBehavior = void 0;
const runtime_1 = require("@aurelia/runtime");
class BindingModeBehavior {
    constructor(mode) {
        this.mode = mode;
        this.originalModes = new Map();
    }
    bind(flags, scope, hostScope, binding) {
        this.originalModes.set(binding, binding.mode);
        binding.mode = this.mode;
    }
    unbind(flags, scope, hostScope, binding) {
        binding.mode = this.originalModes.get(binding);
        this.originalModes.delete(binding);
    }
}
exports.BindingModeBehavior = BindingModeBehavior;
class OneTimeBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(runtime_1.BindingMode.oneTime);
    }
}
exports.OneTimeBindingBehavior = OneTimeBindingBehavior;
class ToViewBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(runtime_1.BindingMode.toView);
    }
}
exports.ToViewBindingBehavior = ToViewBindingBehavior;
class FromViewBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(runtime_1.BindingMode.fromView);
    }
}
exports.FromViewBindingBehavior = FromViewBindingBehavior;
class TwoWayBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(runtime_1.BindingMode.twoWay);
    }
}
exports.TwoWayBindingBehavior = TwoWayBindingBehavior;
runtime_1.bindingBehavior('oneTime')(OneTimeBindingBehavior);
runtime_1.bindingBehavior('toView')(ToViewBindingBehavior);
runtime_1.bindingBehavior('fromView')(FromViewBindingBehavior);
runtime_1.bindingBehavior('twoWay')(TwoWayBindingBehavior);
//# sourceMappingURL=binding-mode.js.map