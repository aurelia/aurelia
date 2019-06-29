import { IContainer } from '@aurelia/kernel';
import { PropertyBinding } from '../../binding/property-binding';
import { Priority } from '../../lifecycle';
import { IBindingBehaviorDefinition, IBindingBehaviorResource } from '../binding-behavior';
export declare class PriorityBindingBehavior {
    [id: number]: number | undefined;
    static readonly kind: IBindingBehaviorResource;
    static readonly description: Required<IBindingBehaviorDefinition>;
    static register(container: IContainer): void;
    bind(binding: PropertyBinding, priority?: number | keyof typeof Priority): void;
    unbind(binding: PropertyBinding): void;
}
//# sourceMappingURL=priority.d.ts.map