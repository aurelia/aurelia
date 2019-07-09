import { IRegistry } from '@aurelia/kernel';
import { IScope, LifecycleFlags, PropertyBinding } from '@aurelia/runtime';
export declare class AttrBindingBehavior {
    static readonly register: IRegistry['register'];
    bind(flags: LifecycleFlags, scope: IScope, binding: PropertyBinding): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: PropertyBinding): void;
}
//# sourceMappingURL=attr.d.ts.map