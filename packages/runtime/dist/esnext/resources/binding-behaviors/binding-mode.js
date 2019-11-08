import { __decorate, __metadata } from "tslib";
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
    bindingBehavior('oneTime'),
    __metadata("design:paramtypes", [])
], OneTimeBindingBehavior);
export { OneTimeBindingBehavior };
let ToViewBindingBehavior = class ToViewBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(BindingMode.toView);
    }
};
ToViewBindingBehavior = __decorate([
    bindingBehavior('toView'),
    __metadata("design:paramtypes", [])
], ToViewBindingBehavior);
export { ToViewBindingBehavior };
let FromViewBindingBehavior = class FromViewBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(BindingMode.fromView);
    }
};
FromViewBindingBehavior = __decorate([
    bindingBehavior('fromView'),
    __metadata("design:paramtypes", [])
], FromViewBindingBehavior);
export { FromViewBindingBehavior };
let TwoWayBindingBehavior = class TwoWayBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(BindingMode.twoWay);
    }
};
TwoWayBindingBehavior = __decorate([
    bindingBehavior('twoWay'),
    __metadata("design:paramtypes", [])
], TwoWayBindingBehavior);
export { TwoWayBindingBehavior };
//# sourceMappingURL=binding-mode.js.map