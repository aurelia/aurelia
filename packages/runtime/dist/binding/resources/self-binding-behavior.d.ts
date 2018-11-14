import { IScope, LifecycleFlags } from '../../observation';
import { Listener } from '../listener';
export declare type SelfableBinding = Listener & {
    selfEventCallSource: Listener['callSource'];
};
export declare class SelfBindingBehavior {
    bind(flags: LifecycleFlags, scope: IScope, binding: SelfableBinding): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: SelfableBinding): void;
}
//# sourceMappingURL=self-binding-behavior.d.ts.map