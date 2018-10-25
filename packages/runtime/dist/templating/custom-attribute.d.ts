import { Constructable, Decoratable, Decorated, Immutable, Omit } from '@aurelia/kernel';
import { IAttributeDefinition } from '../definitions';
import { IAttach, IBindScope, ILifecycleHooks, ILifecycleState } from '../lifecycle';
import { IResourceKind, IResourceType } from '../resource';
import { IRenderable, IRenderingEngine } from './rendering-engine';
export interface ICustomAttributeType extends IResourceType<IAttributeDefinition, ICustomAttribute>, Immutable<Pick<Partial<IAttributeDefinition>, 'bindables'>> {
}
declare type OptionalLifecycleHooks = ILifecycleHooks & Omit<IRenderable, Exclude<keyof IRenderable, '$mount' | '$unmount'>>;
declare type RequiredLifecycleProperties = Readonly<Pick<IRenderable, '$scope'>> & ILifecycleState;
export interface ICustomAttribute extends IBindScope, IAttach, OptionalLifecycleHooks, RequiredLifecycleProperties {
    $hydrate(renderingEngine: IRenderingEngine): void;
}
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