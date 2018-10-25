import { BindingFlags, IScope } from '../../observation';
import { Binding } from '../binding';
import { BindingMode } from '../binding-mode';
export declare type WithMode = {
    mode: BindingMode;
    originalMode?: BindingMode;
};
export declare abstract class BindingModeBehavior {
    private mode;
    constructor(mode: BindingMode);
    bind(flags: BindingFlags, scope: IScope, binding: Binding & WithMode): void;
    unbind(flags: BindingFlags, scope: IScope, binding: Binding & WithMode): void;
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
//# sourceMappingURL=binding-mode-behaviors.d.ts.map