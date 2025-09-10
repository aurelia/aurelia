import { type Class, type Constructable } from '@aurelia/kernel';
import type { InterceptorFunc } from '@aurelia/runtime';
import { BindingMode, IComponentBindablePropDefinition } from '@aurelia/template-compiler';
type PropertyType = typeof Number | typeof String | typeof Boolean | typeof BigInt | {
    coercer: InterceptorFunc;
} | Class<unknown>;
export type PartialBindableDefinition = Omit<IComponentBindablePropDefinition, 'name'> & {
    callback?: string;
    name?: string;
    set?: InterceptorFunc;
    type?: PropertyType;
    /**
     * When set to `false` and automatic type-coercion is enabled, `null` and `undefined` will be coerced into target type.
     *
     * @default true
     */
    nullable?: boolean;
};
/**
 * Decorator: Specifies a bindable property on a class property.
 *
 * @example
 * ```ts
 * class Foo {
 *   ⁣@bindable bar: string;
 * }
 * ```
 */
export declare function bindable(_: undefined, context: ClassFieldDecoratorContext): void;
export declare function bindable(_: Function, context: ClassGetterDecoratorContext): void;
/**
 * Decorator: Specifies custom behavior for a bindable property.
 * This can be either be a property decorator or a class decorator.
 *
 * @param config - The overrides
 */
export declare function bindable(config?: Omit<PartialBindableDefinition, 'name'>): (target: unknown, context: ClassDecoratorContext | ClassFieldDecoratorContext | ClassGetterDecoratorContext) => void;
/**
 * Decorator: Specifies a bindable property on a class.
 *
 * @param prop - The property name
 */
export declare function bindable(prop: string): (target: Constructable, context: ClassDecoratorContext) => void;
export declare const Bindable: Readonly<{
    name: string;
    keyFrom: (name: string) => string;
    from(...bindableLists: readonly (BindableDefinition | Record<string, Exclude<PartialBindableDefinition, "name"> | true> | readonly (string | (PartialBindableDefinition & {
        name: string;
    }))[] | undefined)[]): Record<string, BindableDefinition>;
    getAll(Type: Constructable): readonly BindableDefinition[];
    /** @internal */
    _add(bindable: BindableDefinition, Type: Constructable): void;
}>;
export declare class BindableDefinition {
    readonly attribute: string;
    readonly callback: string;
    readonly mode: BindingMode;
    readonly primary: boolean;
    readonly name: string;
    readonly set: InterceptorFunc;
    private constructor();
    static toAttr(prop: string): string;
    static create(prop: string, def?: PartialBindableDefinition): BindableDefinition;
}
type CoercerFunction<This extends Constructable> = (this: This, value: unknown) => InstanceType<This>;
export declare function coercer<This extends Constructable, TCoercer extends CoercerFunction<This>>(target: TCoercer, context: ClassMethodDecoratorContext<This, TCoercer>): void;
export {};
//# sourceMappingURL=bindable.d.ts.map