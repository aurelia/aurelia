var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BindingMode } from '../observation.js';
import { bindingBehavior } from '../binding-behavior.js';
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