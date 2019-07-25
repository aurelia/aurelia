import { PropertyBinding } from '../../binding/property-binding';
import { Priority } from '../../lifecycle';
export declare class PriorityBindingBehavior {
    [id: number]: number | undefined;
    bind(binding: PropertyBinding, priority?: number | keyof typeof Priority): void;
    unbind(binding: PropertyBinding): void;
}
//# sourceMappingURL=priority.d.ts.map