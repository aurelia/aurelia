import { PropertyBinding } from '../../binding/property-binding';
import { BindingMode, LifecycleFlags } from '../../flags';
import { IScope } from '../../observation';
import { BindingBehaviorInstance } from '../binding-behavior';
export declare abstract class BindingModeBehavior implements BindingBehaviorInstance {
    private readonly mode;
    private readonly originalModes;
    constructor(mode: BindingMode);
    bind(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: PropertyBinding): void;
    unbind(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: PropertyBinding): void;
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