import { Constructable } from '@aurelia/kernel';
import { BindableSource, IBindableDescription } from '../definitions';
/**
 * Decorator: Specifies custom behavior for a bindable property.
 * @param config The overrides
 */
export declare function bindable(config?: BindableSource): BindableDecorator;
/**
 * Decorator: Specifies a bindable property on a class.
 * @param prop The property name
 */
export declare function bindable(prop: string): ClassDecorator;
/**
 * Decorator: Specifies a bindable property on a class.
 * @param target The class
 * @param prop The property name
 */
export declare function bindable<T extends InstanceType<Constructable & Partial<WithBindables>>>(target: T, prop: string): void;
export declare type WithBindables = {
    bindables: Record<string, IBindableDescription>;
};
export declare type BindableDecorator = <T extends InstanceType<Constructable & Partial<WithBindables>>>(target: T, prop: string) => void;
//# sourceMappingURL=bindable.d.ts.map