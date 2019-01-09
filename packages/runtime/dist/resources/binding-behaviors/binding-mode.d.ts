import { IRegistry } from '@aurelia/kernel';
import { Binding } from '../../binding/binding';
import { BindingMode } from '../../binding/binding-mode';
import { IScope, LifecycleFlags } from '../../observation';
export declare type WithMode = {
    mode: BindingMode;
    originalMode?: BindingMode;
};
export declare abstract class BindingModeBehavior {
    private readonly mode;
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
//# sourceMappingURL=binding-mode.d.ts.map