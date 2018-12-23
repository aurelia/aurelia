import { Class, Constructable, IResourceKind, IResourceType } from '@aurelia/kernel';
import { ITemplateDefinition, TemplateDefinition } from '../definitions';
import { INode } from '../dom.interfaces';
import { IAttach, IBind, ILifecycleHooks, ILifecycleUnbindAfterDetach, IMountable, IRenderable } from '../lifecycle';
import { IChangeTracker } from '../observation';
import { ICustomElementHost, IElementHydrationOptions, IElementProjector, ILifecycleRender, IRenderingEngine } from '../templating/lifecycle-render';
declare type CustomElementStaticProperties = Pick<TemplateDefinition, 'containerless' | 'shadowOptions' | 'bindables'>;
export declare type CustomElementConstructor = Constructable & CustomElementStaticProperties;
export interface ICustomElementType extends IResourceType<ITemplateDefinition, ICustomElement>, CustomElementStaticProperties {
    description: TemplateDefinition;
}
export interface ICustomElement extends Partial<IChangeTracker>, ILifecycleHooks, ILifecycleRender, IBind, ILifecycleUnbindAfterDetach, IAttach, IMountable, IRenderable {
    readonly $projector: IElementProjector;
    readonly $host: ICustomElementHost;
    $hydrate(renderingEngine: IRenderingEngine, host: INode, options?: IElementHydrationOptions): void;
}
export interface ICustomElementResource extends IResourceKind<ITemplateDefinition, ICustomElement, Class<ICustomElement> & CustomElementStaticProperties> {
    behaviorFor(node: INode): ICustomElement | null;
}
declare type CustomElementDecorator = <T extends Constructable>(target: T) => T & ICustomElementType;
/**
 * Decorator: Indicates that the decorated class is a custom element.
 */
export declare function customElement(name: string): CustomElementDecorator;
export declare function customElement(definition: ITemplateDefinition): CustomElementDecorator;
declare type HasShadowOptions = Pick<ITemplateDefinition, 'shadowOptions'>;
/**
 * Decorator: Indicates that the custom element should render its view in ShadowDOM.
 */
export declare function useShadowDOM<T extends Constructable>(options?: HasShadowOptions['shadowOptions']): (target: T & HasShadowOptions) => T & Required<HasShadowOptions>;
/**
 * Decorator: Indicates that the custom element should render its view in ShadowDOM.
 */
export declare function useShadowDOM<T extends Constructable>(target: T & HasShadowOptions): T & Required<HasShadowOptions>;
declare type HasContainerless = Pick<ITemplateDefinition, 'containerless'>;
declare function containerlessDecorator<T extends Constructable>(target: T & HasContainerless): T & Required<HasContainerless>;
/**
 * Decorator: Indicates that the custom element should be rendered without its element container.
 */
export declare function containerless(): typeof containerlessDecorator;
/**
 * Decorator: Indicates that the custom element should be rendered without its element container.
 */
export declare function containerless<T extends Constructable>(target: T & HasContainerless): T & Required<HasContainerless>;
export declare const CustomElementResource: ICustomElementResource;
export {};
//# sourceMappingURL=custom-element.d.ts.map