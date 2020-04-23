import { Constructable, IContainer, IDisposable, IFactory, IResolver, Key, Resolved, Transformer } from '@aurelia/kernel';
import { IHydrateInstruction, ITargetedInstruction, PartialCustomElementDefinitionParts } from '../definitions';
import { IDOM, INode, INodeSequence, IRenderLocation } from '../dom';
import { LifecycleFlags } from '../flags';
import { IController, ICustomAttributeViewModel, ICustomElementViewModel, IRenderableController, IViewFactory } from '../lifecycle';
import { IRenderer } from '../renderer';
import { CustomElementDefinition, PartialCustomElementDefinition } from '../resources/custom-element';
export declare function isRenderContext<T extends INode = INode>(value: unknown): value is IRenderContext<T>;
/**
 * A render context that wraps an `IContainer` and must be compiled before it can be used for rendering.
 */
export interface IRenderContext<T extends INode = INode> extends IContainer {
    readonly dom: IDOM<T>;
    readonly parts: PartialCustomElementDefinitionParts | undefined;
    /**
     * The `CustomElementDefinition` that this `IRenderContext` was created with.
     *
     * If a `PartialCustomElementDefinition` was used to create this context, then this property will be the return value of `CustomElementDefinition.getOrCreate`.
     */
    readonly definition: CustomElementDefinition;
    /**
     * The `IContainer` (which may be, but is not guaranteed to be, an `IRenderContext`) that this `IRenderContext` was created with.
     */
    readonly parentContainer: IContainer;
    /**
     * Prepare this factory for creating child controllers. Only applicable for custom elements.
     *
     * @param instance - The component instance to make available to child components if this context's definition has `injectable` set to `true`.
     */
    beginChildComponentOperation(instance: ICustomElementViewModel): IRenderContext<T>;
    /**
     * Compiles the backing `CustomElementDefinition` (if needed) and returns the compiled `IRenderContext` that exposes the compiled `CustomElementDefinition` as well as rendering operations.
     *
     * This operation is idempotent.
     *
     * @returns The compiled `IRenderContext`.
     */
    compile(): ICompiledRenderContext<T>;
    /**
     * Creates an (or returns the cached) `IViewFactory` that can be used to create synthetic view controllers.
     *
     * @param name - Optional. The `name` that will be used by `replaceable` part lookups or the `| view` value converter. Defaults to the `name` property of the passed-in `CustomElementDefinition`.
     *
     * @returns Either a new `IViewFactory` (if this is the first call), or a cached one.
     */
    getViewFactory(name?: string): IViewFactory<T>;
}
/**
 * A compiled `IRenderContext` that can create instances of `INodeSequence` (based on the template of the compiled definition)
 * and begin a component operation to create new component instances.
 */
export interface ICompiledRenderContext<T extends INode = INode> extends IRenderContext<T> {
    /**
     * The compiled `CustomElementDefinition`.
     *
     * If the passed-in `PartialCustomElementDefinition` had a non-null `template` and `needsCompile` set to `true`, this will be a new definition created by the `ITemplateCompiler`.
     */
    readonly compiledDefinition: CustomElementDefinition;
    /**
     * Returns a new `INodeSequence` based on the document fragment from the compiled `CustomElementDefinition`.
     *
     * A new instance will be created from a clone of the fragment on each call.
     *
     * @returns An new instance of `INodeSequence` if there is a template, otherwise a shared empty instance.
     */
    createNodes(): INodeSequence<T>;
    /**
     * Prepare this render context for creating a new component instance.
     *
     * All parameters are optional injectable dependencies, that is: only those that are actually needed by the to-be-created component, need to be provided in order for that component to work.
     *
     * To avoid possible memory leaks, don't forget to call `dispose()` on the returned `IComponentFactory` after creating a component.
     *
     * @param parentController - The `IController` of the immediate parent of the to-be-created component. Not used by any built-in components.
     * @param host - The DOM node that declared the component, or the node that the component will be mounted to (in case of containerless). Used by some built-in custom attributes.
     * @param instruction - The hydrate instruction that resulted in the creation of this render context. Only used by `au-compose`.
     * @param viewFactory - The `IViewFactory` that was created from the template that the template controller was placed on. Only applicable for template controllers. Used by all built-in template controllers.
     * @param location - The DOM node that the nodes created by the `IViewFactory` should be mounted to. Only applicable for template controllers. Used by all built-in template controllers.
     */
    getComponentFactory(parentController?: IController, host?: INode, instruction?: IHydrateInstruction, viewFactory?: IViewFactory, location?: IRenderLocation): IComponentFactory<T>;
    render(flags: LifecycleFlags, controller: IController, targets: ArrayLike<INode>, templateDefinition: CustomElementDefinition, host: INode | null | undefined, parts: PartialCustomElementDefinitionParts | undefined): void;
    renderInstructions(flags: LifecycleFlags, instructions: readonly ITargetedInstruction[], controller: IController, target: unknown, parts: PartialCustomElementDefinitionParts | undefined): void;
}
/**
 * A compiled `IRenderContext` that is ready to be used for creating component instances, and rendering them.
 */
export interface IComponentFactory<T extends INode = INode> extends ICompiledRenderContext<T>, IDisposable {
    /**
     * Creates a new component instance based on the provided `resourceKey`.
     *
     * It is only safe to override the generic type argument if you know / own the component type associated with the name.
     *
     * @param resourceKey - The (full) resource key as returned from the `keyFrom` helper.
     *
     * @returns A new instance of the requested component. Will throw an error if the registration does not exist.
     *
     * @example
     *
     * ```ts
     * // Create a new instance of the 'au-compose' custom element
     * const elementInstance = factory.createComponent<Compose>(CustomElement.keyFrom('au-compose'));
     *
     * // Create a new instance of the 'if' template controller
     * const attributeInstance = factory.createComponent<If>(CustomAttribute.keyFrom('if'));
     *
     * // Dynamically create a new instance of a custom element
     * const attributeInstance = factory.createComponent(CustomElement.keyFrom(name));
     * ```
     */
    createComponent<TViewModel = ICustomAttributeViewModel<T> | ICustomElementViewModel<T>>(resourceKey: string): TViewModel;
    /**
     * Release any resources that were stored by `getComponentFactory()`.
     */
    dispose(): void;
}
export declare function getRenderContext<T extends INode = INode>(partialDefinition: PartialCustomElementDefinition, parentContainer: IContainer, parts: PartialCustomElementDefinitionParts | undefined): IRenderContext<T>;
export declare class RenderContext<T extends INode = INode> implements IComponentFactory<T> {
    readonly definition: CustomElementDefinition;
    readonly parentContainer: IContainer;
    readonly parts: PartialCustomElementDefinitionParts | undefined;
    private readonly container;
    private readonly parentControllerProvider;
    private readonly elementProvider;
    private readonly instructionProvider;
    private readonly factoryProvider;
    private readonly renderLocationProvider;
    private viewModelProvider;
    private fragment;
    private factory;
    private isCompiled;
    readonly renderer: IRenderer;
    readonly dom: IDOM<T>;
    compiledDefinition: CustomElementDefinition;
    constructor(definition: CustomElementDefinition, parentContainer: IContainer, parts: PartialCustomElementDefinitionParts | undefined);
    has<K extends Key>(key: K | Key, searchAncestors: boolean): boolean;
    get<K extends Key>(key: K | Key): Resolved<K>;
    getAll<K extends Key>(key: K | Key): readonly Resolved<K>[];
    register(...params: unknown[]): IContainer;
    registerResolver<K extends Key, T = K>(key: K, resolver: IResolver<T>): IResolver<T>;
    registerTransformer<K extends Key, T = K>(key: K, transformer: Transformer<T>): boolean;
    getResolver<K extends Key, T = K>(key: K | Key, autoRegister?: boolean): IResolver<T> | null;
    getFactory<T extends Constructable>(key: T): IFactory<T> | null;
    createChild(): IContainer;
    disposeResolvers(): void;
    compile(): ICompiledRenderContext<T>;
    getViewFactory(name?: string): IViewFactory<T>;
    beginChildComponentOperation(instance: ICustomElementViewModel): IRenderContext<T>;
    createNodes(): INodeSequence<T>;
    getComponentFactory(parentController?: IController, host?: INode, instruction?: IHydrateInstruction, viewFactory?: IViewFactory, location?: IRenderLocation): IComponentFactory<T>;
    createComponent<TViewModel = ICustomElementViewModel<T>>(resourceKey: string): TViewModel;
    render(flags: LifecycleFlags, controller: IRenderableController, targets: ArrayLike<INode>, templateDefinition: CustomElementDefinition, host: INode | null | undefined, parts: PartialCustomElementDefinitionParts | undefined): void;
    renderInstructions(flags: LifecycleFlags, instructions: readonly ITargetedInstruction[], controller: IRenderableController, target: unknown, parts: PartialCustomElementDefinitionParts | undefined): void;
    dispose(): void;
}
//# sourceMappingURL=render-context.d.ts.map