import { Class, Constructable, IResourceKind, IResourceType, Omit } from '@aurelia/kernel';
import { IAttributeDefinition } from '../definitions';
import { IViewModel } from '../lifecycle';
declare type CustomAttributeStaticProperties = Required<Pick<IAttributeDefinition, 'bindables' | 'aliases'>>;
export declare type CustomAttributeConstructor = Constructable & CustomAttributeStaticProperties;
export interface ICustomAttributeType<C extends Constructable = Constructable> extends IResourceType<IAttributeDefinition, InstanceType<C> & IViewModel>, CustomAttributeStaticProperties {
}
export interface ICustomAttributeResource extends IResourceKind<IAttributeDefinition, IViewModel, Class<IViewModel> & CustomAttributeStaticProperties> {
}
/**
 * Decorator: Indicates that the decorated class is a custom attribute.
 */
export declare function customAttribute(definition: IAttributeDefinition): CustomAttributeDecorator;
export declare function customAttribute(name: string): CustomAttributeDecorator;
export declare function customAttribute(nameOrDefinition: string | IAttributeDefinition): CustomAttributeDecorator;
/**
 * Decorator: Applied to custom attributes. Indicates that whatever element the
 * attribute is placed on should be converted into a template and that this
 * attribute controls the instantiation of the template.
 */
export declare function templateController(definition: IAttributeDefinition): CustomAttributeDecorator;
export declare function templateController(name: string): CustomAttributeDecorator;
export declare function templateController(nameOrDefinition: string | Omit<IAttributeDefinition, 'isTemplateController'>): CustomAttributeDecorator;
export declare const CustomAttribute: Readonly<ICustomAttributeResource>;
export declare type CustomAttributeDecorator = <T extends Constructable>(target: T) => T & ICustomAttributeType<T>;
export {};
//# sourceMappingURL=custom-attribute.d.ts.map