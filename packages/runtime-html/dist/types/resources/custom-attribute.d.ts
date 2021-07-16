import { BindingMode } from '@aurelia/runtime';
import type { Constructable, IContainer, IResourceKind, ResourceDefinition, PartialResourceDefinition, ResourceType } from '@aurelia/kernel';
import type { BindableDefinition, PartialBindableDefinition } from '../bindable.js';
import type { ICustomAttributeViewModel, ICustomAttributeController } from '../templating/controller.js';
import type { IWatchDefinition } from '../watch.js';
declare module '@aurelia/kernel' {
    interface IContainer {
        find<T extends ICustomAttributeViewModel>(kind: typeof CustomAttribute, name: string): CustomAttributeDefinition<Constructable<T>> | null;
    }
}
export declare type PartialCustomAttributeDefinition = PartialResourceDefinition<{
    readonly defaultBindingMode?: BindingMode;
    readonly isTemplateController?: boolean;
    readonly bindables?: Record<string, PartialBindableDefinition> | readonly string[];
    /**
     * A config that can be used by template compliler to change attr value parsing mode
     * `true` to always parse as a single value, mostly will be string in URL scenario
     * Example:
     * ```html
     * <div goto="http://bla.bla.com">
     * ```
     * With `noMultiBinding: true`, user does not need to escape the `:` with `\`
     * or use binding command to escape it.
     *
     * With `noMultiBinding: false (default)`, the above will be parsed as it's binding
     * to a property name `http`, with value equal to literal string `//bla.bla.com`
     */
    readonly noMultiBindings?: boolean;
    readonly watches?: IWatchDefinition[];
}>;
export declare type CustomAttributeType<T extends Constructable = Constructable> = ResourceType<T, ICustomAttributeViewModel, PartialCustomAttributeDefinition>;
export declare type CustomAttributeKind = IResourceKind<CustomAttributeType, CustomAttributeDefinition> & {
    for<C extends ICustomAttributeViewModel = ICustomAttributeViewModel>(node: Node, name: string): ICustomAttributeController<C> | undefined;
    isType<T>(value: T): value is (T extends Constructable ? CustomAttributeType<T> : never);
    define<T extends Constructable>(name: string, Type: T): CustomAttributeType<T>;
    define<T extends Constructable>(def: PartialCustomAttributeDefinition, Type: T): CustomAttributeType<T>;
    define<T extends Constructable>(nameOrDef: string | PartialCustomAttributeDefinition, Type: T): CustomAttributeType<T>;
    getDefinition<T extends Constructable>(Type: T): CustomAttributeDefinition<T>;
    getDefinition<T extends Constructable>(Type: Function): CustomAttributeDefinition<T>;
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
export declare class CustomAttributeDefinition<T extends Constructable = Constructable> implements ResourceDefinition<T, ICustomAttributeViewModel, PartialCustomAttributeDefinition> {
    readonly Type: CustomAttributeType<T>;
    readonly name: string;
    readonly aliases: readonly string[];
    readonly key: string;
    readonly defaultBindingMode: BindingMode;
    readonly isTemplateController: boolean;
    readonly bindables: Record<string, BindableDefinition>;
    readonly noMultiBindings: boolean;
    readonly watches: IWatchDefinition[];
    private constructor();
    static create<T extends Constructable = Constructable>(nameOrDef: string | PartialCustomAttributeDefinition, Type: CustomAttributeType<T>): CustomAttributeDefinition<T>;
    register(container: IContainer): void;
}
export declare const CustomAttribute: CustomAttributeKind;
//# sourceMappingURL=custom-attribute.d.ts.map