import { BindingMode } from '../../flags';
import { BindingBehavior } from '../binding-behavior';
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
BindingBehavior.define('oneTime', OneTimeBindingBehavior);
export class ToViewBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(toView);
    }
}
BindingBehavior.define('toView', ToViewBindingBehavior);
export class FromViewBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(fromView);
    }
}
BindingBehavior.define('fromView', FromViewBindingBehavior);
export class TwoWayBindingBehavior extends BindingModeBehavior {
    constructor() {
        super(twoWay);
    }
}
BindingBehavior.define('twoWay', TwoWayBindingBehavior);
//# sourceMappingURL=binding-mode.js.map