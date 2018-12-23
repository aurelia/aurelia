import { IRegistry } from '@aurelia/kernel';
import { Binding } from '../../binding/binding';
import { IScope, LifecycleFlags } from '../../observation';
export declare class AttrBindingBehavior {
    static register: IRegistry['register'];
    bind(flags: LifecycleFlags, scope: IScope, binding: Binding): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: Binding): void;
}
//# sourceMappingURL=attr.d.ts.map