import { IRegistry } from '@aurelia/kernel';
import { IScope, LifecycleFlags } from '@aurelia/runtime';
import { Listener } from '../../binding/listener';
export declare type SelfableBinding = Listener & {
    selfEventCallSource: Listener['callSource'];
};
export declare class SelfBindingBehavior {
    static register: IRegistry['register'];
    bind(flags: LifecycleFlags, scope: IScope, binding: SelfableBinding): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: SelfableBinding): void;
}
//# sourceMappingURL=self.d.ts.map