import { Constructable, Immutable, Omit } from '@aurelia/kernel';
import { IScope } from '../binding/binding-context';
import { BindingMode } from '../binding/binding-mode';
import { IBindScope } from '../binding/observation';
import { IResourceKind, IResourceType } from '../resource';
import { IBindableDescription } from './bindable';
import { IAttach } from './lifecycle';
import { IRenderingEngine } from './rendering-engine';
export interface IAttributeDefinition {
    name: string;
    defaultBindingMode?: BindingMode;
    aliases?: string[];
    isTemplateController?: boolean;
    bindables?: Record<string, IBindableDescription>;
}
export declare type AttributeDefinition = Immutable<Required<IAttributeDefinition>> | null;
export declare type ICustomAttributeType = IResourceType<IAttributeDefinition, ICustomAttribute>;
export interface ICustomAttribute extends IBindScope, IAttach {
    readonly $scope: IScope;
    $hydrate(renderingEngine: IRenderingEngine): void;
}
/**
 * Decorator: Indicates that the decorated class is a custom attribute.
 */
export declare function customAttribute(nameOrSource: string | IAttributeDefinition): <T extends Constructable<{}>>(target: T) => T & IResourceType<IAttributeDefinition, ICustomAttribute>;
/**
 * Decorator: Applied to custom attributes. Indicates that whatever element the
 * attribute is placed on should be converted into a template and that this
 * attribute controls the instantiation of the template.
 */
export declare function templateController(nameOrDef: string | Omit<IAttributeDefinition, 'isTemplateController'>): <T extends Constructable<{}>>(target: T) => T & IResourceType<IAttributeDefinition, ICustomAttribute>;
export declare const CustomAttributeResource: IResourceKind<IAttributeDefinition, ICustomAttributeType>;
//# sourceMappingURL=custom-attribute.d.ts.map