import { PropertyBinding } from '../../binding/property-binding';
import { BindingMode, LifecycleFlags } from '../../flags';
import { IScope } from '../../observation';
export declare type WithMode = {
    mode: BindingMode;
};
export declare abstract class BindingModeBehavior {
    private readonly mode;
    private readonly originalModes;
    constructor(mode: BindingMode);
    bind(flags: LifecycleFlags, scope: IScope, binding: PropertyBinding & WithMode): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: PropertyBinding & WithMode): void;
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