import { IRegistry, Key } from '@aurelia/kernel';
import { PropertyBinding } from '../../binding/property-binding';
import { LifecycleFlags } from '../../flags';
import { IScope } from '../../observation';
import { ISignaler } from '../../observation/signaler';
export declare type SignalableBinding = PropertyBinding & {
    signal: string | string[];
};
export declare class SignalBindingBehavior {
    static readonly inject: readonly Key[];
    static register: IRegistry['register'];
    private readonly signaler;
    constructor(signaler: ISignaler);
    bind(flags: LifecycleFlags, scope: IScope, binding: SignalableBinding, ...args: string[]): void;
    unbind(flags: LifecycleFlags, scope: IScope, binding: SignalableBinding): void;
}
//# sourceMappingURL=signals.d.ts.map