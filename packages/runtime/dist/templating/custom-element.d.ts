import { Constructable, Decoratable, Decorated } from '@aurelia/kernel';
import { ITemplateDefinition, TemplateDefinition } from '../definitions';
import { INode } from '../dom';
import { IAttach, IBindSelf, ILifecycleHooks, ILifecycleUnbindAfterDetach, IMountable, IRenderable, IState } from '../lifecycle';
import { IChangeTracker } from '../observation';
import { IResourceType } from '../resource';
import { ICustomElementHost, ICustomElementResource, IElementHydrationOptions, IElementProjector, ILifecycleRender, IRenderingEngine } from './lifecycle-render';
declare type CustomElementStaticProperties = Pick<TemplateDefinition, 'containerless' | 'shadowOptions' | 'bindables'>;
export declare type CustomElementConstructor = Constructable & CustomElementStaticProperties;
export interface ICustomElementType extends IResourceType<ITemplateDefinition, ICustomElement>, CustomElementConstructor {
}
export interface ICustomElement extends Partial<IChangeTracker>, ILifecycleHooks, ILifecycleRender, IBindSelf, ILifecycleUnbindAfterDetach, IAttach, IMountable, IState, IRenderable {
    readonly $projector: IElementProjector;
    readonly $host: ICustomElementHost;
    $hydrate(renderingEngine: IRenderingEngine, host: INode, options?: IElementHydrationOptions): void;
}
declare type CustomElementDecorator = <T extends Constructable>(target: Decoratable<ICustomElement, T>) => Decorated<ICustomElement, T> & ICustomElementType;
/**
 * Decorator: Indicates that the decorated class is a custom element.
 */
export declare function customElement(name: string): CustomElementDecorator;
export declare function customElement(definition: ITemplateDefinition): CustomElementDecorator;
declare type HasShadowOptions = Pick<ITemplateDefinition, 'shadowOptions'>;
/**
 * Decorator: Indicates that the custom element should render its view in ShadowDOM.
 */
export declare function useShadowDOM<T extends Constructable>(options?: HasShadowOptions['shadowOptions']): (target: T & HasShadowOptions) => Decorated<HasShadowOptions, T>;
/**
 * Decorator: Indicates that the custom element should render its view in ShadowDOM.
 */
export declare function useShadowDOM<T extends Constructable>(target: (T & HasShadowOptions)): Decorated<HasShadowOptions, T>;
declare type HasContainerless = Pick<ITemplateDefinition, 'containerless'>;
declare function containerlessDecorator<T extends Constructable>(target: T & HasContainerless): Decorated<HasContainerless, T>;
/**
 * Decorator: Indicates that the custom element should be rendered without its element container.
 */
export declare function containerless(): typeof containerlessDecorator;
/**
 * Decorator: Indicates that the custom element should be rendered without its element container.
 */
export declare function containerless<T extends Constructable>(target: T & HasContainerless): Decorated<HasContainerless, T>;
export declare const CustomElementResource: ICustomElementResource;
export {};
//# sourceMappingURL=custom-element.d.ts.map