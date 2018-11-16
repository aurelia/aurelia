import { Constructable, Decoratable, Decorated, Immutable, Omit } from '@aurelia/kernel';
import { AttributeDefinition, IAttributeDefinition } from '../definitions';
import { IAttach, IBindScope, ILifecycleHooks, ILifecycleUnbindAfterDetach, IRenderable, IState } from '../lifecycle';
import { IChangeTracker } from '../observation';
import { IResourceKind, IResourceType } from '../resource';
import { IRenderingEngine } from './lifecycle-render';
declare type OptionalHooks = ILifecycleHooks & Omit<IRenderable, Exclude<keyof IRenderable, '$mount' | '$unmount'>>;
declare type RequiredLifecycleProperties = Readonly<Pick<IRenderable, '$scope'>> & IState;
declare type CustomAttributeStaticProperties = Pick<AttributeDefinition, 'bindables'>;
export declare type CustomAttributeConstructor = Constructable & CustomAttributeStaticProperties;
export interface ICustomAttribute extends Partial<IChangeTracker>, IBindScope, ILifecycleUnbindAfterDetach, IAttach, OptionalHooks, RequiredLifecycleProperties {
    $hydrate(renderingEngine: IRenderingEngine): void;
}
export interface ICustomAttributeType extends IResourceType<IAttributeDefinition, ICustomAttribute>, Immutable<Pick<Partial<IAttributeDefinition>, 'bindables'>> {
}
declare type CustomAttributeDecorator = <T extends Constructable>(target: Decoratable<ICustomAttribute, T>) => Decorated<ICustomAttribute, T> & ICustomAttributeType;
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
export declare const CustomAttributeResource: IResourceKind<IAttributeDefinition, ICustomAttributeType>;
export {};
//# sourceMappingURL=custom-attribute.d.ts.map