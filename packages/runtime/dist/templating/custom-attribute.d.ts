import { Constructable, Decoratable, Decorated, Omit } from '@aurelia/kernel';
import { IAttributeDefinition } from '../definitions';
import { IResourceKind } from '../resource';
import { ICustomAttribute, ICustomAttributeType } from './lifecycle-render';
declare type CustomAttributeDecorator = <T extends Constructable>(target: Decoratable<ICustomAttribute, T>) => Decorated<ICustomAttribute, T> & ICustomAttributeType;
/**
 * Decorator: Indicates that the decorated class is a custom attribute.
 */
export declare function customAttribute(nameOrDef: string | IAttributeDefinition): CustomAttributeDecorator;
/**
 * Decorator: Applied to custom attributes. Indicates that whatever element the
 * attribute is placed on should be converted into a template and that this
 * attribute controls the instantiation of the template.
 */
export declare function templateController(nameOrDef: string | Omit<IAttributeDefinition, 'isTemplateController'>): CustomAttributeDecorator;
export declare const CustomAttributeResource: IResourceKind<IAttributeDefinition, ICustomAttributeType>;
export {};
//# sourceMappingURL=custom-attribute.d.ts.map