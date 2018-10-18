import { Omit } from '@aurelia/kernel';
import { BindingMode } from '../binding/binding-mode';
export declare type BindableSource = Omit<IBindableDescription, 'property'>;
export interface IBindableDescription {
    mode?: BindingMode;
    callback?: string;
    attribute?: string;
    property?: string;
}
/**
 * Decorator: Specifies custom behavior for a bindable property.
 * @param configOrTarget The overrides.
 */
export declare function bindable(configOrTarget?: BindableSource | Object, key?: any, descriptor?: any): any;
//# sourceMappingURL=bindable.d.ts.map