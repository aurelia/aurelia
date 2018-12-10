import { Class, Constructable, Immutable } from '@aurelia/kernel';
import { IAttributeDefinition } from '../definitions';
import { IAttach, IBindScope, ILifecycleHooks, ILifecycleUnbindAfterDetach, IRenderable } from '../lifecycle';
import { IChangeTracker } from '../observation';
import { IResourceKind, IResourceType } from '../resource';
import { IRenderingEngine } from './lifecycle-render';
declare type CustomAttributeStaticProperties = Pick<Immutable<Required<IAttributeDefinition>>, 'bindables'>;
export declare type CustomAttributeConstructor = Constructable & CustomAttributeStaticProperties;
export interface ICustomAttributeType extends IResourceType<IAttributeDefinition, ICustomAttribute>, CustomAttributeStaticProperties {
}
declare type PartialCustomAttributeType<T> = T & Partial<IResourceType<IAttributeDefinition, unknown, Constructable>>;
export interface ICustomAttribute extends Partial<IChangeTracker>, ILifecycleHooks, IBindScope, ILifecycleUnbindAfterDetach, IAttach, IRenderable {
    $hydrate(renderingEngine: IRenderingEngine): void;
}
export interface ICustomAttributeResource extends IResourceKind<IAttributeDefinition, ICustomAttribute, Class<ICustomAttribute> & CustomAttributeStaticProperties> {
}
declare type CustomAttributeDecorator = <T>(target: PartialCustomAttributeType<T>) => T & ICustomAttributeType;
/**
 * Decorator: Indicates that the decorated class is a custom attribute.
 */
export declare function customAttribute(name: string): CustomAttributeDecorator;
export declare function customAttribute(definition: IAttributeDefinition): CustomAttributeDecorator;
/**
 * Decorator: Applied to custom attributes. Indicates that whatever element the
 * attribute is placed on should be converted into a template and that this
 * attribute controls the instantiation of the template.
 */
export declare function templateController(name: string): CustomAttributeDecorator;
export declare function templateController(definition: IAttributeDefinition): CustomAttributeDecorator;
export declare const CustomAttributeResource: ICustomAttributeResource;
export {};
//# sourceMappingURL=custom-attribute.d.ts.map