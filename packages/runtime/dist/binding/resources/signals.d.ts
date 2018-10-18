import { Binding } from '../binding';
import { IScope } from '../binding-context';
import { BindingFlags } from '../binding-flags';
import { ISignaler } from '../signaler';
export declare type SignalableBinding = Binding & {
    signal: string | string[];
};
export declare class SignalBindingBehavior {
    private signaler;
    constructor(signaler: ISignaler);
    bind(flags: BindingFlags, scope: IScope, binding: SignalableBinding): void;
    unbind(flags: BindingFlags, scope: IScope, binding: SignalableBinding): void;
}
//# sourceMappingURL=signals.d.ts.map