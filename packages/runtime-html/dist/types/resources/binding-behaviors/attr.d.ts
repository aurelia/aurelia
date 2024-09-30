import { type Scope } from '@aurelia/runtime';
import { IBinding } from '../../binding/interfaces-bindings';
import { type BindingBehaviorInstance, type BindingBehaviorStaticAuDefinition } from '../binding-behavior';
export declare class AttrBindingBehavior implements BindingBehaviorInstance {
    static readonly $au: BindingBehaviorStaticAuDefinition;
    bind(_scope: Scope, binding: IBinding): void;
}
//# sourceMappingURL=attr.d.ts.map