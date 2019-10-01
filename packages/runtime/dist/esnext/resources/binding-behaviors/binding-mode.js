import { __decorate } from "tslib";
import { BindingMode } from '../../flags';
import { bindingBehavior } from '../binding-behavior';
export class BindingModeBehavior {
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
let OneTimeBindingBehavior = class OneTimeBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(BindingMode.oneTime);
    }
};
OneTimeBindingBehavior = __decorate([
    bindingBehavior('oneTime')
], OneTimeBindingBehavior);
export { OneTimeBindingBehavior };
let ToViewBindingBehavior = class ToViewBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(BindingMode.toView);
    }
};
ToViewBindingBehavior = __decorate([
    bindingBehavior('toView')
], ToViewBindingBehavior);
export { ToViewBindingBehavior };
let FromViewBindingBehavior = class FromViewBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(BindingMode.fromView);
    }
};
FromViewBindingBehavior = __decorate([
    bindingBehavior('fromView')
], FromViewBindingBehavior);
export { FromViewBindingBehavior };
let TwoWayBindingBehavior = class TwoWayBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(BindingMode.twoWay);
    }
};
TwoWayBindingBehavior = __decorate([
    bindingBehavior('twoWay')
], TwoWayBindingBehavior);
export { TwoWayBindingBehavior };
//# sourceMappingURL=binding-mode.js.map