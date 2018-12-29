import { Class, Constructable, Immutable, IResourceKind, IResourceType, Omit } from '@aurelia/kernel';
import { IAttributeDefinition } from '../definitions';
import { INode } from '../dom';
import { IAttach, IBindScope, ILifecycleHooks, ILifecycleUnbindAfterDetach, IRenderable } from '../lifecycle';
import { IChangeTracker } from '../observation';
import { IRenderingEngine } from '../rendering-engine';
declare type CustomAttributeStaticProperties = Pick<Immutable<Required<IAttributeDefinition>>, 'bindables'>;
export declare type CustomAttributeConstructor = Constructable & CustomAttributeStaticProperties;
export interface ICustomAttributeType<T extends INode = INode> extends IResourceType<IAttributeDefinition, ICustomAttribute<T>>, CustomAttributeStaticProperties {
}
export interface ICustomAttribute<T extends INode = INode> extends Partial<IChangeTracker>, ILifecycleHooks, IBindScope, ILifecycleUnbindAfterDetach, IAttach, IRenderable<T> {
    $hydrate(renderingEngine: IRenderingEngine): void;
}
export interface ICustomAttributeResource<T extends INode = INode> extends IResourceKind<IAttributeDefinition, ICustomAttribute<T>, Class<ICustomAttribute<T>> & CustomAttributeStaticProperties> {
}
/**
 * Decorator: Indicates that the decorated class is a custom attribute.
 */
export declare function customAttribute(name: string): CustomAttributeDecorator;
export declare function customAttribute(definition: IAttributeDefinition): CustomAttributeDecorator;
export declare function customAttribute(nameOrDefinition: string | IAttributeDefinition): CustomAttributeDecorator;
/**
 * Decorator: Applied to custom attributes. Indicates that whatever element the
 * attribute is placed on should be converted into a template and that this
 * attribute controls the instantiation of the template.
 */
export declare function templateController(name: string): CustomAttributeDecorator;
export declare function templateController(definition: IAttributeDefinition): CustomAttributeDecorator;
export declare function templateController(nameOrDefinition: string | Omit<IAttributeDefinition, 'isTemplateController'>): CustomAttributeDecorator;
declare type HasDynamicOptions = Pick<IAttributeDefinition, 'hasDynamicOptions'>;
declare function dynamicOptionsDecorator<T extends Constructable>(target: T & HasDynamicOptions): T & Required<HasDynamicOptions>;
/**
 * Decorator: Indicates that the custom attributes has dynamic options.
 */
export declare function dynamicOptions(): typeof dynamicOptionsDecorator;
/**
 * Decorator: Indicates that the custom attributes has dynamic options.
 */
export declare function dynamicOptions<T extends Constructable>(target: T & HasDynamicOptions): T & Required<HasDynamicOptions>;
export declare const CustomAttributeResource: ICustomAttributeResource;
export declare type CustomAttributeDecorator = <T extends Constructable>(target: T) => T & ICustomAttributeType;
export {};
//# sourceMappingURL=custom-attribute.d.ts.map