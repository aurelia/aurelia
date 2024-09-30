import { type Scope } from '@aurelia/runtime';
import { type BindingBehaviorInstance, BindingBehaviorStaticAuDefinition } from '../binding-behavior';
import { type IBinding } from '../../binding/interfaces-bindings';
export declare class ThrottleBindingBehavior implements BindingBehaviorInstance {
    static readonly $au: BindingBehaviorStaticAuDefinition;
    constructor();
    bind(scope: Scope, binding: IBinding, delay?: number, signals?: string | string[]): void;
    unbind(scope: Scope, binding: IBinding): void;
}
//# sourceMappingURL=throttle.d.ts.map