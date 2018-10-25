import { IContainer, IDisposable, Immutable, ImmutableArray, IServiceLocator } from '@aurelia/kernel';
import { IEventManager } from '../binding/event-manager';
import { IExpressionParser } from '../binding/expression-parser';
import { IObserverLocator } from '../binding/observer-locator';
import { IHydrateElementInstruction, ITargetedInstruction, ITemplateDefinition, TemplateDefinition, TemplatePartDefinitions } from '../definitions';
import { INode, INodeSequence, IRenderLocation } from '../dom';
import { IAttach, IBindScope, ILifecycleState } from '../lifecycle';
import { IChangeSet, IScope } from '../observation';
import { ICustomAttribute, ICustomAttributeType } from './custom-attribute';
import { ICustomElement, ICustomElementType } from './custom-element';
import { IRenderer } from './renderer';
import { ITemplateCompiler } from './template-compiler';
import { IViewFactory } from './view';
export interface IElementTemplateProvider {
    getElementTemplate(renderingEngine: IRenderingEngine, customElementType: ICustomElementType): ITemplate;
}
export interface IRenderingEngine {
    getElementTemplate(definition: TemplateDefinition, componentType?: ICustomElementType): ITemplate;
    getViewFactory(source: Immutable<ITemplateDefinition>, parentContext?: IRenderContext): IViewFactory;
    applyRuntimeBehavior(Type: ICustomAttributeType, instance: ICustomAttribute): void;
    applyRuntimeBehavior(Type: ICustomElementType, instance: ICustomElement): void;
    createRenderer(context: IRenderContext): IRenderer;
}
export declare const IRenderingEngine: import("@aurelia/kernel/dist/di").InterfaceSymbol<IRenderingEngine>;
export interface ILifecycleRender {
    /**
     * Only applies to `@customElement`. This hook is not invoked for `@customAttribute`s
     *
     * Called during `$hydrate`, after `this.$scope` and `this.$projector` are set.
     *
     * If this hook is implemented, it will be used instead of `renderingEngine.getElementTemplate`.
     * This allows you to completely override the default rendering behavior.
     *
     * It is the responsibility of the implementer to:
     * - Populate `this.$bindables` with any Bindings, child Views, custom elements and custom attributes
     * - Populate `this.$attachables` with any child Views, custom elements and custom attributes
     * - Populate `this.$nodes` with the nodes that need to be appended to the host
     * - Populate `this.$context` with the RenderContext / Container scoped to this instance
     *
     * @param host The DOM node that declares this custom element
     * @param parts Replaceable parts, if any
     *
     * @returns Either an implementation of `IElementTemplateProvider`, or void
     *
     * @description
     * This is the first "hydrate" lifecycle hook. It happens only once per instance (contrary to bind/attach
     * which can happen many times per instance), though it can happen many times per type (once for each instance)
     */
    render?(host: INode, parts: Immutable<Pick<IHydrateElementInstruction, 'parts'>>): IElementTemplateProvider | void;
}
export declare class RenderingEngine implements IRenderingEngine {
    private container;
    private changeSet;
    private observerLocator;
    private eventManager;
    private parser;
    private templateLookup;
    private factoryLookup;
    private behaviorLookup;
    private compilers;
    constructor(container: IContainer, changeSet: IChangeSet, observerLocator: IObserverLocator, eventManager: IEventManager, parser: IExpressionParser, templateCompilers: ITemplateCompiler[]);
    getElementTemplate(definition: TemplateDefinition, componentType?: ICustomElementType): ITemplate;
    getViewFactory(definition: Immutable<ITemplateDefinition>, parentContext?: IRenderContext): IViewFactory;
    applyRuntimeBehavior(Type: ICustomAttributeType | ICustomElementType, instance: ICustomAttribute | ICustomElement): void;
    createRenderer(context: IRenderContext): IRenderer;
    private templateFromSource;
}
export interface ITemplate {
    readonly renderContext: IRenderContext;
    render(renderable: IRenderable, host?: INode, parts?: TemplatePartDefinitions): void;
}
export interface IRenderContext extends IServiceLocator {
    createChild(): IRenderContext;
    render(renderable: IRenderable, targets: ArrayLike<INode>, templateDefinition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void;
    beginComponentOperation(renderable: IRenderable, target: INode, instruction: Immutable<ITargetedInstruction>, factory?: IViewFactory, parts?: TemplatePartDefinitions, location?: IRenderLocation, locationIsContainer?: boolean): IDisposable;
}
export declare function createRenderContext(renderingEngine: IRenderingEngine, parentRenderContext: IRenderContext, dependencies: ImmutableArray<any>): IRenderContext;
export declare const IRenderable: import("@aurelia/kernel/dist/di").InterfaceSymbol<IRenderable>;
export interface IBindables {
    /**
     * The Bindings, Views, CustomElements, CustomAttributes and other bindable components that belong to this instance.
     */
    $bindableHead?: IBindScope;
    $bindableTail?: IBindScope;
}
export interface IAttachables {
    /**
     * The Views, CustomElements, CustomAttributes and other attachable components that belong to this instance.
     */
    $attachableHead?: IAttach;
    $attachableTail?: IAttach;
}
/**
 * An object containing the necessary information to render something for display.
 */
export interface IRenderable extends IBindables, IAttachables, ILifecycleState {
    /**
     * The (dependency) context of this instance.
     *
     * Contains any dependencies required by this instance or its children.
     */
    readonly $context: IRenderContext;
    /**
     * The nodes that represent the visible aspect of this instance.
     *
     * Typically this will be a sequence of `DOM` nodes contained in a `DocumentFragment`
     */
    readonly $nodes: INodeSequence;
    /**
     * The binding scope that the `$bindables` of this instance will be bound to.
     *
     * This includes the `BindingContext` which can be either a user-defined view model instance, or a synthetic view model instantiated by a `templateController`
     */
    readonly $scope: IScope;
}
export declare function addBindable(renderable: IBindables, bindable: IBindScope): void;
export declare function addAttachable(renderable: IAttachables, attachable: IAttach): void;
//# sourceMappingURL=rendering-engine.d.ts.map