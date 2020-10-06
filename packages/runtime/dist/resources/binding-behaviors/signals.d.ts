import { IConnectableBinding } from '../../binding/connectable';
import { LifecycleFlags } from '../../flags';
import { IScope } from '../../observation';
import { ISignaler } from '../../observation/signaler';
import { BindingBehaviorInstance } from '../binding-behavior';
export declare class SignalBindingBehavior implements BindingBehaviorInstance {
    private readonly signaler;
    private readonly lookup;
    constructor(signaler: ISignaler);
    bind(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding, ...names: string[]): void;
    unbind(flags: LifecycleFlags, scope: IScope, hostScope: IScope | null, binding: IConnectableBinding): void;
}
//# sourceMappingURL=signals.d.ts.map