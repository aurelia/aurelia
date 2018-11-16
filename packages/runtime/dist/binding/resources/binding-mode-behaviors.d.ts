import { IRegistry } from '@aurelia/kernel';
import { IScope, LifecycleFlags } from '../../observation';
import { Binding } from '../binding';
import { BindingMode } from '../binding-mode';
export declare type WithMode = {
    mode: BindingMode;
    originalMode?: BindingMode;
};
export declare abstract class BindingModeBehavior {
    private mode;
    constructor(mode: BindingMode);
    bind(flags: LifecycleFlags, scope: IScope, binding: Binding & WithMode): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: Binding & WithMode): void;
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
//# sourceMappingURL=binding-mode-behaviors.d.ts.map