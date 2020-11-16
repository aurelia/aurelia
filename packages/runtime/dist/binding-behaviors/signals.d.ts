import { IConnectableBinding } from '../binding/connectable.js';
import { LifecycleFlags } from '../observation.js';
import { ISignaler } from '../observation/signaler.js';
import { BindingBehaviorInstance } from '../binding-behavior.js';
import type { Scope } from '../observation/binding-context.js';
export declare class SignalBindingBehavior implements BindingBehaviorInstance {
    private readonly signaler;
    private readonly lookup;
    constructor(signaler: ISignaler);
    bind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null, binding: IConnectableBinding, ...names: string[]): void;
    unbind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null, binding: IConnectableBinding): void;
}
//# sourceMappingURL=signals.d.ts.map