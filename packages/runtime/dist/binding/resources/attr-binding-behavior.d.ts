import { IRegistry } from '@aurelia/kernel';
import { IScope, LifecycleFlags } from '../../observation';
import { Binding } from '../binding';
export declare class AttrBindingBehavior {
    static register: IRegistry['register'];
    bind(flags: LifecycleFlags, scope: IScope, binding: Binding): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: Binding): void;
}
//# sourceMappingURL=attr-binding-behavior.d.ts.map