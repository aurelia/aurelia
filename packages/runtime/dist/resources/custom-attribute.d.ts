import { Class, Constructable, IResourceKind, IResourceType, Omit } from '@aurelia/kernel';
import { customAttributeKey, IAttributeDefinition } from '../definitions';
import { IViewModel } from '../lifecycle';
declare type CustomAttributeStaticProperties = Pick<Required<IAttributeDefinition>, 'bindables'>;
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
declare function isType<T>(this: ICustomAttributeResource, Type: T & Partial<ICustomAttributeType>): Type is T & ICustomAttributeType;
declare function define<T extends Constructable = Constructable>(this: ICustomAttributeResource, definition: IAttributeDefinition, ctor: T): T & ICustomAttributeType<T>;
declare function define<T extends Constructable = Constructable>(this: ICustomAttributeResource, name: string, ctor: T): T & ICustomAttributeType<T>;
declare function define<T extends Constructable = Constructable>(this: ICustomAttributeResource, nameOrDefinition: string | IAttributeDefinition, ctor: T): T & ICustomAttributeType<T>;
export declare const CustomAttributeResource: {
    name: string;
    keyFrom: typeof customAttributeKey;
    isType: typeof isType;
    define: typeof define;
};
export declare type CustomAttributeDecorator = <T extends Constructable>(target: T) => T & ICustomAttributeType<T>;
export {};
//# sourceMappingURL=custom-attribute.d.ts.map