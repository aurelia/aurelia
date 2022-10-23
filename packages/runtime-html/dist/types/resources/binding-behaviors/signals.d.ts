import { ISignaler } from '@aurelia/runtime';
import type { BindingBehaviorInstance, IConnectableBinding, Scope } from '@aurelia/runtime';
export declare class SignalBindingBehavior implements BindingBehaviorInstance {
    constructor(signaler: ISignaler);
    bind(scope: Scope, binding: IConnectableBinding, ...names: string[]): void;
    unbind(scope: Scope, binding: IConnectableBinding): void;
}
//# sourceMappingURL=signals.d.ts.map