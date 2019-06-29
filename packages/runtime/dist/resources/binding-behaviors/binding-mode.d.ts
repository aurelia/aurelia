import { IRegistry } from '@aurelia/kernel';
import { PropertyBinding } from '../../binding/property-binding';
import { BindingMode, LifecycleFlags } from '../../flags';
import { IScope } from '../../observation';
export declare type WithMode = {
    mode: BindingMode;
    originalMode?: BindingMode;
};
export declare abstract class BindingModeBehavior {
    private readonly mode;
    constructor(mode: BindingMode);
    bind(flags: LifecycleFlags, scope: IScope, binding: PropertyBinding & WithMode): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: PropertyBinding & WithMode): void;
}
export declare class OneTimeBindingBehavior extends BindingModeBehavior {
    static register: IRegistry['register'];
    constructor();
}
export declare class ToViewBindingBehavior extends BindingModeBehavior {
    static register: IRegistry['register'];
    constructor();
}
export declare class FromViewBindingBehavior extends BindingModeBehavior {
    static register: IRegistry['register'];
    constructor();
}
export declare class TwoWayBindingBehavior extends BindingModeBehavior {
    static register: IRegistry['register'];
    constructor();
}
//# sourceMappingURL=binding-mode.d.ts.map