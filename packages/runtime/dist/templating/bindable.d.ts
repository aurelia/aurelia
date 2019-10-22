import { Constructable } from '@aurelia/kernel';
import { BindingMode } from '../flags';
export declare type PartialBindableDefinition = {
    mode?: BindingMode;
    callback?: string;
    attribute?: string;
    property?: string;
    primary?: boolean;
};
declare type PartialBindableDefinitionPropertyRequired = PartialBindableDefinition & {
    property: string;
};
declare type PartialBindableDefinitionPropertyOmitted = Omit<PartialBindableDefinition, 'property'>;
/**
 * Decorator: Specifies custom behavior for a bindable property.
 *
 * @param config - The overrides
 */
export declare function bindable(config?: PartialBindableDefinitionPropertyOmitted): (target: {}, property: string) => void;
/**
 * Decorator: Specifies a bindable property on a class.
 *
 * @param prop - The property name
 */
export declare function bindable(prop: string): (target: Constructable) => void;
/**
 * Decorator: Specifies a bindable property on a class.
 *
 * @param target - The class
 * @param prop - The property name
 */
export declare function bindable(target: {}, prop: string): void;
declare type BFluent = {
    add(config: PartialBindableDefinitionPropertyRequired): BFluent;
    add(property: string): BFluent & B1234;
};
declare type B1<T = {}> = {
    mode(mode: BindingMode): BFluent & T;
};
declare type B2<T = {}> = {
    callback(callback: string): BFluent & T;
};
declare type B3<T = {}> = {
    attribute(attribute: string): BFluent & T;
};
declare type B4<T = {}> = {
    primary(): BFluent & T;
};
declare type B34 = B4 & B3<B4>;
declare type B234 = B34 & B2<B34>;
declare type B1234 = B234 & B1<B234>;
export declare const Bindable: {
    name: string;
    keyFrom(name: string): string;
    from(...bindableLists: readonly (readonly string[] | BindableDefinition | Record<string, PartialBindableDefinition> | undefined)[]): Record<string, BindableDefinition>;
    for(Type: Constructable<{}>): BFluent;
    getAll(Type: Constructable<{}>): readonly BindableDefinition[];
};
export declare class BindableDefinition {
    readonly attribute: string;
    readonly callback: string;
    readonly mode: BindingMode;
    readonly primary: boolean;
    readonly property: string;
    private constructor();
    static create(prop: string, def?: PartialBindableDefinition): BindableDefinition;
}
export {};
//# sourceMappingURL=bindable.d.ts.map