import { BindingBehaviorInstance, BindingMode, LifecycleFlags } from '@aurelia/runtime';
import type { Scope } from '@aurelia/runtime';
import type { PropertyBinding } from '../binding/property-binding.js';
export declare abstract class BindingModeBehavior implements BindingBehaviorInstance {
    private readonly mode;
    constructor(mode: BindingMode);
    bind(flags: LifecycleFlags, scope: Scope, binding: PropertyBinding): void;
    unbind(flags: LifecycleFlags, scope: Scope, binding: PropertyBinding): void;
}
export declare class OneTimeBindingBehavior extends BindingModeBehavior {
    constructor();
}
export declare class ToViewBindingBehavior extends BindingModeBehavior {
    constructor();
}
export declare class FromViewBindingBehavior extends BindingModeBehavior {
    constructor();
}
export declare class TwoWayBindingBehavior extends BindingModeBehavior {
    constructor();
}
//# sourceMappingURL=binding-mode.d.ts.map