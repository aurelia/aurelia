import { IRegistry } from '@aurelia/kernel';
import { Binding } from '../../binding/binding';
import { LifecycleFlags } from '../../flags';
import { IScope } from '../../observation';
export declare class KeyedBindingBehavior {
    static register: IRegistry['register'];
    bind(flags: LifecycleFlags, scope: IScope, binding: Binding, key: string): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: Binding): void;
}
//# sourceMappingURL=keyed.d.ts.map