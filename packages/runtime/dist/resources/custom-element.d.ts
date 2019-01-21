import { Class, Constructable, IResourceKind, IResourceType, IServiceLocator } from '@aurelia/kernel';
import { IElementHydrationOptions, ITemplateDefinition, TemplateDefinition } from '../definitions';
import { IDOM, INode, INodeSequence, IRenderLocation } from '../dom';
import { LifecycleFlags } from '../flags';
import { ILifecycleHooks, IMountableComponent, IRenderable } from '../lifecycle';
import { IChangeTracker } from '../observation';
import { ILifecycleRender } from '../templating/lifecycle-render';
export interface ICustomElementType<T extends INode = INode> extends IResourceType<ITemplateDefinition, ICustomElement<T>>, ICustomElementStaticProperties {
    description: TemplateDefinition;
}
export declare type CustomElementHost<T extends INode = INode> = IRenderLocation<T> & T & {
    $customElement?: ICustomElement<T>;
};
export interface IElementProjector<T extends INode = INode> {
    readonly host: CustomElementHost<T>;
    readonly children: ArrayLike<CustomElementHost<T>>;
    provideEncapsulationSource(): T;
    project(nodes: INodeSequence<T>): void;
    take(nodes: INodeSequence<T>): void;
    subscribeToChildrenChange(callback: () => void): void;
}
export declare const IProjectorLocator: import("@aurelia/kernel").InterfaceSymbol<IProjectorLocator<INode>>;
export interface IProjectorLocator<T extends INode = INode> {
    getElementProjector(dom: IDOM<T>, $component: ICustomElement<T>, host: CustomElementHost<T>, def: TemplateDefinition): IElementProjector<T>;
}
export interface ICustomElementStaticProperties {
    containerless?: TemplateDefinition['containerless'];
    shadowOptions?: TemplateDefinition['shadowOptions'];
    bindables?: TemplateDefinition['bindables'];
    useProxies?: TemplateDefinition['useProxies'];
}
export interface ICustomElement<T extends INode = INode> extends Partial<IChangeTracker>, ILifecycleHooks, ILifecycleRender, IMountableComponent, IRenderable<T> {
    readonly $projector: IElementProjector;
    readonly $host: CustomElementHost;
    $hydrate(flags: LifecycleFlags, parentContext: IServiceLocator, host: INode, options?: IElementHydrationOptions): void;
}
export interface ICustomElementResource<T extends INode = INode> extends IResourceKind<ITemplateDefinition, ICustomElement<T>, Class<ICustomElement<T>> & ICustomElementStaticProperties> {
    behaviorFor(node: T): ICustomElement<T> | null;
}
/**
 * Decorator: Indicates that the decorated class is a custom element.
 */
export declare function customElement(name: string): ICustomElementDecorator;
export declare function customElement(definition: ITemplateDefinition): ICustomElementDecorator;
export declare function customElement(nameOrDefinition: string | ITemplateDefinition): ICustomElementDecorator;
export declare const CustomElementResource: ICustomElementResource;
export interface ICustomElementDecorator {
    <T extends Constructable>(target: T): T & ICustomElementType;
}
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
export {};
//# sourceMappingURL=custom-element.d.ts.map