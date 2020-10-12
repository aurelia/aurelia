import { IConnectableBinding } from '../../binding/connectable';
import { LifecycleFlags } from '../../flags';
import { ISignaler } from '../../observation/signaler';
import { BindingBehaviorInstance } from '../binding-behavior';
import type { Scope } from '../../observation/binding-context';
export declare class SignalBindingBehavior implements BindingBehaviorInstance {
    private readonly signaler;
    private readonly lookup;
    constructor(signaler: ISignaler);
    bind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null, binding: IConnectableBinding, ...names: string[]): void;
    unbind(flags: LifecycleFlags, scope: Scope, hostScope: Scope | null, binding: IConnectableBinding): void;
}
//# sourceMappingURL=signals.d.ts.map