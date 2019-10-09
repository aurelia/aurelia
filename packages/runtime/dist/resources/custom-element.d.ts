import { Class, Constructable, IResourceKind, IResourceType } from '@aurelia/kernel';
import { ITemplateDefinition, TemplateDefinition } from '../definitions';
import { IDOM, INode, INodeSequence, IRenderLocation } from '../dom';
import { IController, IViewModel } from '../lifecycle';
export interface ICustomElementType<C extends Constructable = Constructable> extends IResourceType<ITemplateDefinition, InstanceType<C> & IViewModel>, ICustomElementStaticProperties {
    description: TemplateDefinition;
}
export declare type CustomElementHost<T extends INode = INode> = IRenderLocation<T> & T & {
    $controller?: IController<T>;
};
export interface IElementProjector<T extends INode = INode> {
    readonly host: CustomElementHost<T>;
    readonly children: ArrayLike<CustomElementHost<T>>;
    provideEncapsulationSource(): T;
    project(nodes: INodeSequence<T>): void;
    take(nodes: INodeSequence<T>): void;
    subscribeToChildrenChange(callback: () => void, options?: any): void;
}
export declare const IProjectorLocator: import("@aurelia/kernel").InterfaceSymbol<IProjectorLocator<INode>>;
export interface IProjectorLocator<T extends INode = INode> {
    getElementProjector(dom: IDOM<T>, $component: IController<T>, host: CustomElementHost<T>, def: TemplateDefinition): IElementProjector<T>;
}
export interface ICustomElementStaticProperties {
    containerless?: TemplateDefinition['containerless'];
    isStrictBinding?: TemplateDefinition['isStrictBinding'];
    shadowOptions?: TemplateDefinition['shadowOptions'];
    bindables?: TemplateDefinition['bindables'];
    strategy?: TemplateDefinition['strategy'];
    aliases: TemplateDefinition['aliases'];
}
export interface ICustomElementResource<T extends INode = INode> extends IResourceKind<ITemplateDefinition, IViewModel, Class<IViewModel> & ICustomElementStaticProperties> {
    behaviorFor<N extends INode = T>(node: N): IController<N> | undefined;
}
/**
 * Decorator: Indicates that the decorated class is a custom element.
 */
export declare function customElement(definition: ITemplateDefinition): ICustomElementDecorator;
export declare function customElement(name: string): ICustomElementDecorator;
export declare function customElement(nameOrDefinition: string | ITemplateDefinition): ICustomElementDecorator;
export declare const CustomElement: Readonly<ICustomElementResource>;
export interface ICustomElementDecorator {
    <T extends Constructable>(target: T): T & ICustomElementType<T>;
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
declare type HasStrictBindOption = Required<Pick<ITemplateDefinition, 'isStrictBinding'>>;
declare function strictBindingDecorator<T extends Constructable>(target: T & HasStrictBindOption): T & HasStrictBindOption;
/**
 * Decorator: Indicates that the custom element should be rendered with the strict binding option. undefined/null -> 0 or '' based on type
 */
export declare function strict(): typeof strictBindingDecorator;
/**
 * Decorator: Indicates that the custom element should be rendered with the strict binding option. undefined/null -> 0 or '' based on type
 */
export declare function strict<T extends Constructable>(target: T & HasStrictBindOption): T & HasStrictBindOption;
export {};
//# sourceMappingURL=custom-element.d.ts.map