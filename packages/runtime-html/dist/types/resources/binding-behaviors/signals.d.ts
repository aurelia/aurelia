import { type Scope } from '@aurelia/runtime';
import { type BindingBehaviorInstance, type BindingBehaviorStaticAuDefinition } from '../binding-behavior';
import { IBinding } from '../../binding/interfaces-bindings';
export declare class SignalBindingBehavior implements BindingBehaviorInstance {
    static readonly $au: BindingBehaviorStaticAuDefinition;
    bind(scope: Scope, binding: IBinding, ...names: string[]): void;
    unbind(scope: Scope, binding: IBinding): void;
}
//# sourceMappingURL=signals.d.ts.map