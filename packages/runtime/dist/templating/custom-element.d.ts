import { Constructable, Decoratable, Decorated, Immutable } from '@aurelia/kernel';
import { IHydrateElementInstruction, ITemplateDefinition, TemplateDefinition } from '../definitions';
import { INode, INodeSequence, IRenderLocation } from '../dom';
import { IAttach, IBindSelf, ILifecycleHooks, ILifecycleState, IMountable } from '../lifecycle';
import { IResourceKind, IResourceType } from '../resource';
import { ILifecycleRender, IRenderable, IRenderingEngine } from './rendering-engine';
export interface ICustomElementType extends IResourceType<ITemplateDefinition, ICustomElement>, Immutable<Pick<Partial<ITemplateDefinition>, 'containerless' | 'shadowOptions' | 'bindables'>> {
}
export declare type IElementHydrationOptions = Immutable<Pick<IHydrateElementInstruction, 'parts'>>;
export interface ICustomElement extends ILifecycleHooks, ILifecycleRender, IBindSelf, IAttach, IMountable, ILifecycleState, IRenderable {
    readonly $projector: IElementProjector;
    $hydrate(renderingEngine: IRenderingEngine, host: INode, options?: IElementHydrationOptions): void;
}
export interface ICustomElementHost extends IRenderLocation {
    $customElement?: ICustomElement;
}
export declare type ElementDefinition = Immutable<Required<ITemplateDefinition>> | null;
declare type CustomElementDecorator = <T extends Constructable>(target: Decoratable<ICustomElement, T>) => Decorated<ICustomElement, T> & ICustomElementType;
/**
 * Decorator: Indicates that the decorated class is a custom element.
 */
export declare function customElement(nameOrSource: string | ITemplateDefinition): CustomElementDecorator;
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
export interface ICustomElementResource extends IResourceKind<ITemplateDefinition, ICustomElementType> {
    behaviorFor(node: INode): ICustomElement | null;
}
export declare const CustomElementResource: ICustomElementResource;
export interface IElementProjector {
    readonly host: ICustomElementHost;
    readonly children: ArrayLike<ICustomElementHost>;
    provideEncapsulationSource(parentEncapsulationSource: ICustomElementHost): ICustomElementHost;
    project(nodes: INodeSequence): void;
    take(nodes: INodeSequence): void;
    subscribeToChildrenChange(callback: () => void): void;
}
export declare class ShadowDOMProjector implements IElementProjector {
    host: ICustomElementHost;
    shadowRoot: ICustomElementHost;
    constructor($customElement: ICustomElement, host: ICustomElementHost, definition: TemplateDefinition);
    readonly children: ArrayLike<INode>;
    subscribeToChildrenChange(callback: () => void): void;
    provideEncapsulationSource(parentEncapsulationSource: INode): INode;
    project(nodes: INodeSequence): void;
    take(nodes: INodeSequence): void;
}
export declare class ContainerlessProjector implements IElementProjector {
    private $customElement;
    host: ICustomElementHost;
    private childNodes;
    constructor($customElement: ICustomElement, host: ICustomElementHost);
    readonly children: ArrayLike<INode>;
    subscribeToChildrenChange(callback: () => void): void;
    provideEncapsulationSource(parentEncapsulationSource: INode): INode;
    project(nodes: INodeSequence): void;
    take(nodes: INodeSequence): void;
}
export declare class HostProjector implements IElementProjector {
    host: ICustomElementHost;
    constructor($customElement: ICustomElement, host: ICustomElementHost);
    readonly children: ArrayLike<INode>;
    subscribeToChildrenChange(callback: () => void): void;
    provideEncapsulationSource(parentEncapsulationSource: INode): INode;
    project(nodes: INodeSequence): void;
    take(nodes: INodeSequence): void;
}
export {};
//# sourceMappingURL=custom-element.d.ts.map