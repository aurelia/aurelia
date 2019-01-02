import { IRegistry } from '@aurelia/kernel';
import { Binding, IScope, LifecycleFlags } from '@aurelia/runtime';
export declare class AttrBindingBehavior {
    static readonly register: IRegistry['register'];
    bind(flags: LifecycleFlags, scope: IScope, binding: Binding): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: Binding): void;
}
//# sourceMappingURL=attr.d.ts.map