import { Class, IContainer, Immutable, ImmutableArray, IRegistry } from '@aurelia/kernel';
import { IHydrateElementInstruction, ITargetedInstruction, ITemplateDefinition, TemplateDefinition, TemplatePartDefinitions } from '../definitions';
import { INode, INodeSequence, IRenderLocation } from '../dom';
import { ILifecycle, IRenderable, IRenderContext, IViewFactory } from '../lifecycle';
import { IAccessor, ISubscribable, ISubscriberCollection, MutationKind } from '../observation';
import { IResourceDescriptions } from '../resource';
import { ICustomAttribute, ICustomAttributeType } from './custom-attribute';
import { ICustomElement, ICustomElementType } from './custom-element';
export interface ITemplateCompiler {
    readonly name: string;
    compile(definition: ITemplateDefinition, resources: IResourceDescriptions, viewCompileFlags?: ViewCompileFlags): TemplateDefinition;
}
export declare const ITemplateCompiler: import("@aurelia/kernel/dist/di").InterfaceSymbol<ITemplateCompiler>;
export declare enum ViewCompileFlags {
    none = 1,
    surrogate = 2,
    shadowDOM = 4
}
export declare type IElementHydrationOptions = Immutable<Pick<IHydrateElementInstruction, 'parts'>>;
export interface ICustomElementHost extends IRenderLocation {
    $customElement?: ICustomElement;
}
export declare type ElementDefinition = Immutable<Required<ITemplateDefinition>> | null;
export interface IElementProjector {
    readonly host: ICustomElementHost;
    readonly children: ArrayLike<ICustomElementHost>;
    provideEncapsulationSource(parentEncapsulationSource: ICustomElementHost): ICustomElementHost;
    project(nodes: INodeSequence): void;
    take(nodes: INodeSequence): void;
    subscribeToChildrenChange(callback: () => void): void;
}
export interface IElementTemplateProvider {
    getElementTemplate(renderingEngine: IRenderingEngine, customElementType: ICustomElementType): ITemplate;
}
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
export interface IRenderingEngine {
    getElementTemplate(definition: TemplateDefinition, componentType?: ICustomElementType): ITemplate;
    getViewFactory(source: Immutable<ITemplateDefinition>, parentContext?: IRenderContext): IViewFactory;
    applyRuntimeBehavior(Type: ICustomAttributeType, instance: ICustomAttribute): void;
    applyRuntimeBehavior(Type: ICustomElementType, instance: ICustomElement): void;
}
export declare const IRenderingEngine: import("@aurelia/kernel/dist/di").InterfaceSymbol<IRenderingEngine>;
export declare class RenderingEngine implements IRenderingEngine {
    private container;
    private lifecycle;
    private templateLookup;
    private factoryLookup;
    private behaviorLookup;
    private compilers;
    constructor(container: IContainer, lifecycle: ILifecycle, templateCompilers: ITemplateCompiler[]);
    getElementTemplate(definition: TemplateDefinition, componentType?: ICustomElementType): ITemplate;
    getViewFactory(definition: Immutable<ITemplateDefinition>, parentContext?: IRenderContext): IViewFactory;
    applyRuntimeBehavior(Type: ICustomAttributeType | ICustomElementType, instance: ICustomAttribute | ICustomElement): void;
    private templateFromSource;
}
export interface IChildrenObserver extends IAccessor, ISubscribable<MutationKind.instance>, ISubscriberCollection<MutationKind.instance> {
}
export interface ITemplate {
    readonly renderContext: IRenderContext;
    render(renderable: IRenderable, host?: INode, parts?: TemplatePartDefinitions): void;
}
export declare function createRenderContext(renderingEngine: IRenderingEngine, parentRenderContext: IRenderContext, dependencies: ImmutableArray<IRegistry>): IRenderContext;
export interface IRenderer {
    instructionRenderers: Record<string, IInstructionRenderer>;
    render(context: IRenderContext, renderable: IRenderable, targets: ArrayLike<INode>, templateDefinition: TemplateDefinition, host?: INode, parts?: TemplatePartDefinitions): void;
}
export declare const IRenderer: import("@aurelia/kernel/dist/di").InterfaceSymbol<IRenderer>;
export interface IInstructionTypeClassifier<TType extends string = string> {
    instructionType: TType;
}
export interface IInstructionRenderer<TType extends string = string> extends Partial<IInstructionTypeClassifier<TType>> {
    render(context: IRenderContext, renderable: IRenderable, target: unknown, instruction: ITargetedInstruction, ...rest: unknown[]): void;
}
export declare const IInstructionRenderer: import("@aurelia/kernel/dist/di").InterfaceSymbol<IInstructionRenderer<string>>;
declare type DecoratableInstructionRenderer<TType extends string, TProto, TClass> = Class<TProto & Partial<IInstructionTypeClassifier<TType> & Pick<IInstructionRenderer, 'render'>>, TClass> & Partial<IRegistry>;
declare type DecoratedInstructionRenderer<TType extends string, TProto, TClass> = Class<TProto & IInstructionTypeClassifier<TType> & Pick<IInstructionRenderer, 'render'>, TClass> & IRegistry;
declare type InstructionRendererDecorator<TType extends string> = <TProto, TClass>(target: DecoratableInstructionRenderer<TType, TProto, TClass>) => DecoratedInstructionRenderer<TType, TProto, TClass>;
export declare function instructionRenderer<TType extends string>(instructionType: TType): InstructionRendererDecorator<TType>;
export {};
//# sourceMappingURL=lifecycle-render.d.ts.map