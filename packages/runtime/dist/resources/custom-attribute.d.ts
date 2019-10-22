import { Constructable, IContainer, IResourceKind, Omit, ResourceDefinition, PartialResourceDefinition, ResourceType } from '@aurelia/kernel';
import { HooksDefinition } from '../definitions';
import { BindingMode, BindingStrategy } from '../flags';
import { IViewModel } from '../lifecycle';
import { BindableDefinition, PartialBindableDefinition } from '../templating/bindable';
export declare type PartialCustomAttributeDefinition = PartialResourceDefinition<{
    readonly defaultBindingMode?: BindingMode;
    readonly isTemplateController?: boolean;
    readonly bindables?: Record<string, PartialBindableDefinition> | readonly string[];
    readonly strategy?: BindingStrategy;
    readonly hooks?: HooksDefinition;
}>;
export declare type CustomAttributeType<T extends Constructable = Constructable> = ResourceType<T, IViewModel, PartialCustomAttributeDefinition>;
export declare type CustomAttributeKind = IResourceKind<CustomAttributeType, CustomAttributeDefinition> & {
    isType<T>(value: T): value is (T extends Constructable ? CustomAttributeType<T> : never);
    define<T extends Constructable>(name: string, Type: T): CustomAttributeType<T>;
    define<T extends Constructable>(def: PartialCustomAttributeDefinition, Type: T): CustomAttributeType<T>;
    define<T extends Constructable>(nameOrDef: string | PartialCustomAttributeDefinition, Type: T): CustomAttributeType<T>;
    getDefinition<T extends Constructable>(Type: T): CustomAttributeDefinition<T>;
    annotate<K extends keyof PartialCustomAttributeDefinition>(Type: Constructable, prop: K, value: PartialCustomAttributeDefinition[K]): void;
    getAnnotation<K extends keyof PartialCustomAttributeDefinition>(Type: Constructable, prop: K): PartialCustomAttributeDefinition[K];
};
export declare type CustomAttributeDecorator = <T extends Constructable>(Type: T) => CustomAttributeType<T>;
/**
 * Decorator: Indicates that the decorated class is a custom attribute.
 */
export declare function customAttribute(definition: PartialCustomAttributeDefinition): CustomAttributeDecorator;
export declare function customAttribute(name: string): CustomAttributeDecorator;
export declare function customAttribute(nameOrDef: string | PartialCustomAttributeDefinition): CustomAttributeDecorator;
/**
 * Decorator: Applied to custom attributes. Indicates that whatever element the
 * attribute is placed on should be converted into a template and that this
 * attribute controls the instantiation of the template.
 */
export declare function templateController(definition: Omit<PartialCustomAttributeDefinition, 'isTemplateController'>): CustomAttributeDecorator;
export declare function templateController(name: string): CustomAttributeDecorator;
export declare function templateController(nameOrDef: string | Omit<PartialCustomAttributeDefinition, 'isTemplateController'>): CustomAttributeDecorator;
export declare class CustomAttributeDefinition<T extends Constructable = Constructable> implements ResourceDefinition<T, IViewModel, PartialCustomAttributeDefinition> {
    readonly Type: CustomAttributeType<T>;
    readonly name: string;
    readonly aliases: readonly string[];
    readonly key: string;
    readonly defaultBindingMode: BindingMode;
    readonly isTemplateController: boolean;
    readonly bindables: Record<string, BindableDefinition>;
    readonly strategy: BindingStrategy;
    readonly hooks: HooksDefinition;
    private constructor();
    static create<T extends Constructable = Constructable>(nameOrDef: string | PartialCustomAttributeDefinition, Type: CustomAttributeType<T>): CustomAttributeDefinition<T>;
    register(container: IContainer): void;
}
export declare const CustomAttribute: CustomAttributeKind;
//# sourceMappingURL=custom-attribute.d.ts.map