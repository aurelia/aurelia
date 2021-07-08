import { LifecycleFlags } from '@aurelia/runtime';
import { Listener } from '../../binding/listener.js';
import type { Scope } from '@aurelia/runtime';
export declare type SelfableBinding = Listener & {
    selfEventCallSource: Listener['callSource'];
};
export declare class SelfBindingBehavior {
    bind(flags: LifecycleFlags, _scope: Scope, _hostScope: Scope | null, binding: SelfableBinding): void;
    unbind(flags: LifecycleFlags, _scope: Scope, _hostScope: Scope | null, binding: SelfableBinding): void;
}
//# sourceMappingURL=self.d.ts.map