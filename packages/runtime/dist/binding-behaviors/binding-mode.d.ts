import { PropertyBinding } from '../binding/property-binding.js';
import { BindingMode, LifecycleFlags } from '../observation.js';
import { BindingBehaviorInstance } from '../binding-behavior.js';
import type { Scope } from '../observation/binding-context.js';
export declare abstract class BindingModeBehavior implements BindingBehaviorInstance {
    private readonly mode;
    private readonly originalModes;
    constructor(mode: BindingMode);
    bind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null, binding: PropertyBinding): void;
    unbind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null, binding: PropertyBinding): void;
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