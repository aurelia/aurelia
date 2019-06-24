import { BindingMode } from '../../flags';
import { BindingBehaviorResource } from '../binding-behavior';
const { oneTime, toView, fromView, twoWay } = BindingMode;
export class BindingModeBehavior {
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
export class OneTimeBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(oneTime);
    }
}
BindingBehaviorResource.define('oneTime', OneTimeBindingBehavior);
export class ToViewBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(toView);
    }
}
BindingBehaviorResource.define('toView', ToViewBindingBehavior);
export class FromViewBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(fromView);
    }
}
BindingBehaviorResource.define('fromView', FromViewBindingBehavior);
export class TwoWayBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(twoWay);
    }
}
BindingBehaviorResource.define('twoWay', TwoWayBindingBehavior);
//# sourceMappingURL=binding-mode.js.map