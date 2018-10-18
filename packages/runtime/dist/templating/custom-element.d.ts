import { Immutable, Omit } from '@aurelia/kernel';
import { BindingFlags } from '../binding/binding-flags';
import { ICustomElementHost, INode, INodeSequence, IRenderLocation } from '../dom';
import { IResourceKind, IResourceType } from '../resource';
import { IHydrateElementInstruction, ITemplateDefinition, TemplateDefinition } from './instructions';
import { IAttach, ILifecycleHooks } from './lifecycle';
import { IRenderable } from './renderable';
import { IRenderingEngine } from './rendering-engine';
export interface ICustomElementType extends IResourceType<ITemplateDefinition, ICustomElement>, Immutable<Pick<Partial<ITemplateDefinition>, 'containerless' | 'shadowOptions' | 'bindables'>> {
}
export declare type IElementHydrationOptions = Immutable<Pick<IHydrateElementInstruction, 'parts'>>;
export interface IBindSelf {
    readonly $isBound: boolean;
    $bind(flags: BindingFlags): void;
    $unbind(flags: BindingFlags): void;
}
export interface ICustomElement extends IBindSelf, IAttach, Omit<ILifecycleHooks, Exclude<keyof IRenderable, '$addNodes' | '$removeNodes'>>, Readonly<IRenderable> {
    readonly $projector: IElementProjector;
    $hydrate(renderingEngine: IRenderingEngine, host: INode, options?: IElementHydrationOptions): void;
}
export declare type ElementDefinition = Immutable<Required<ITemplateDefinition>> | null;
/**
 * Decorator: Indicates that the decorated class is a custom element.
 */
export declare function customElement(nameOrSource: string | ITemplateDefinition): any;
/**
 * Decorator: Indicates that the custom element should render its view in Shadow
 * DOM.
 */
export declare function useShadowDOM(targetOrOptions?: any): any;
/**
 * Decorator: Indicates that the custom element should be rendered without its
 * element container.
 */
export declare function containerless(maybeTarget?: any): any;
export interface ICustomElementResource extends IResourceKind<ITemplateDefinition, ICustomElementType> {
    behaviorFor(node: INode): ICustomElement | null;
}
export declare const CustomElementResource: ICustomElementResource;
export interface IElementProjector {
    readonly host: ICustomElementHost;
    readonly children: ArrayLike<ICustomElementHost>;
    provideEncapsulationSource(parentEncapsulationSource: ICustomElementHost): ICustomElementHost;
    project(nodes: INodeSequence): void;
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
    onElementRemoved(): void;
}
export declare class ContainerlessProjector implements IElementProjector {
    private $customElement;
    host: IRenderLocation;
    private childNodes;
    private requiresMount;
    constructor($customElement: ICustomElement, host: ICustomElementHost);
    readonly children: ArrayLike<INode>;
    subscribeToChildrenChange(callback: () => void): void;
    provideEncapsulationSource(parentEncapsulationSource: INode): INode;
    project(nodes: INodeSequence): void;
    onElementRemoved(): void;
}
export declare class HostProjector implements IElementProjector {
    host: ICustomElementHost;
    constructor($customElement: ICustomElement, host: ICustomElementHost);
    readonly children: ArrayLike<INode>;
    subscribeToChildrenChange(callback: () => void): void;
    provideEncapsulationSource(parentEncapsulationSource: INode): INode;
    project(nodes: INodeSequence): void;
    onElementRemoved(): void;
}
//# sourceMappingURL=custom-element.d.ts.map