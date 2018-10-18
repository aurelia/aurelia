import { IScope } from '../binding-context';
import { BindingFlags } from '../binding-flags';
import { Listener } from '../listener';
export declare type SelfableBinding = Listener & {
    selfEventCallSource: Listener['callSource'];
};
export declare class SelfBindingBehavior {
    bind(flags: BindingFlags, scope: IScope, binding: SelfableBinding): void;
    unbind(flags: BindingFlags, scope: IScope, binding: SelfableBinding): void;
}
//# sourceMappingURL=self-binding-behavior.d.ts.map