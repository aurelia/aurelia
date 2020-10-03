import { IScope, LifecycleFlags } from '@aurelia/runtime';
import { Listener } from '../../binding/listener';
export declare type SelfableBinding = Listener & {
    selfEventCallSource: Listener['callSource'];
};
export declare class SelfBindingBehavior {
    bind(flags: LifecycleFlags, _scope: IScope, _hostScope: IScope | null, binding: SelfableBinding): void;
    unbind(flags: LifecycleFlags, _scope: IScope, _hostScope: IScope | null, binding: SelfableBinding): void;
}
//# sourceMappingURL=self.d.ts.map