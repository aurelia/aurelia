import * as tslib_1 from "tslib";
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
OneTimeBindingBehavior = tslib_1.__decorate([
    bindingBehavior('oneTime')
], OneTimeBindingBehavior);
export { OneTimeBindingBehavior };
let ToViewBindingBehavior = class ToViewBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(BindingMode.toView);
    }
};
ToViewBindingBehavior = tslib_1.__decorate([
    bindingBehavior('toView')
], ToViewBindingBehavior);
export { ToViewBindingBehavior };
let FromViewBindingBehavior = class FromViewBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(BindingMode.fromView);
    }
};
FromViewBindingBehavior = tslib_1.__decorate([
    bindingBehavior('fromView')
], FromViewBindingBehavior);
export { FromViewBindingBehavior };
let TwoWayBindingBehavior = class TwoWayBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(BindingMode.twoWay);
    }
};
TwoWayBindingBehavior = tslib_1.__decorate([
    bindingBehavior('twoWay')
], TwoWayBindingBehavior);
export { TwoWayBindingBehavior };
//# sourceMappingURL=binding-mode.js.map