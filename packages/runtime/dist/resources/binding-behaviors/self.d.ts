import { IRegistry } from '@aurelia/kernel';
import { Listener } from '../../binding/listener';
import { IScope, LifecycleFlags } from '../../observation';
export declare type SelfableBinding = Listener & {
    selfEventCallSource: Listener['callSource'];
};
export declare class SelfBindingBehavior {
    static register: IRegistry['register'];
    bind(flags: LifecycleFlags, scope: IScope, binding: SelfableBinding): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: SelfableBinding): void;
}
//# sourceMappingURL=self.d.ts.map