import { ISignaler, LifecycleFlags } from '@aurelia/runtime';
import type { BindingBehaviorInstance, IConnectableBinding, Scope } from '@aurelia/runtime';
export declare class SignalBindingBehavior implements BindingBehaviorInstance {
    constructor(signaler: ISignaler);
    bind(flags: LifecycleFlags, scope: Scope, binding: IConnectableBinding, ...names: string[]): void;
    unbind(flags: LifecycleFlags, scope: Scope, binding: IConnectableBinding): void;
}
//# sourceMappingURL=signals.d.ts.map