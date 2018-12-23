import { IRegistry } from '@aurelia/kernel';
import { Binding } from '../../binding/binding';
import { IScope, LifecycleFlags } from '../../observation';
import { ISignaler } from '../../observation/signaler';
export declare type SignalableBinding = Binding & {
    signal: string | string[];
};
export declare class SignalBindingBehavior {
    static register: IRegistry['register'];
    private signaler;
    constructor(signaler: ISignaler);
    bind(flags: LifecycleFlags, scope: IScope, binding: SignalableBinding, ...args: string[]): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: SignalableBinding): void;
}
//# sourceMappingURL=signals.d.ts.map