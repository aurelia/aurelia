import { bindingBehavior, BindingMode } from '@aurelia/runtime';
export class BindingModeBehavior {
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
export class OneTimeBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(BindingMode.oneTime);
    }
}
export class ToViewBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(BindingMode.toView);
    }
}
export class FromViewBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(BindingMode.fromView);
    }
}
export class TwoWayBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(BindingMode.twoWay);
    }
}
bindingBehavior('oneTime')(OneTimeBindingBehavior);
bindingBehavior('toView')(ToViewBindingBehavior);
bindingBehavior('fromView')(FromViewBindingBehavior);
bindingBehavior('twoWay')(TwoWayBindingBehavior);
//# sourceMappingURL=binding-mode.js.map