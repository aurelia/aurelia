import { Constructable, IContainer, IDisposable, IFactory, IResolver, IResourceKind, Key, Resolved, ResourceDefinition, ResourceType, Transformer } from '@aurelia/kernel';
import { Scope, LifecycleFlags } from '@aurelia/runtime';
import { INode, INodeSequence, IRenderLocation } from '../dom.js';
import { IInstruction, Instruction } from '../renderer.js';
import { CustomElementDefinition, PartialCustomElementDefinition } from '../resources/custom-element.js';
import { IViewFactory } from './view.js';
import { AuSlotContentType, IAuSlotsInfo, IProjectionProvider, RegisteredProjections } from '../resources/custom-elements/au-slot.js';
import { IPlatform } from '../platform.js';
import { IController } from './controller.js';
import type { ICustomAttributeViewModel, ICustomElementViewModel, IHydratableController } from './controller.js';
export declare function isRenderContext(value: unknown): value is IRenderContext;
/**
 * A render context that wraps an `IContainer` and must be compiled before it can be used for composing.
 */
export interface IRenderContext extends IContainer {
    readonly platform: IPlatform;
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
    beginChildComponentOperation(instance: ICustomElementViewModel): IRenderContext;
    /**
     * Compiles the backing `CustomElementDefinition` (if needed) and returns the compiled `IRenderContext` that exposes the compiled `CustomElementDefinition` as well as composing operations.
     *
     * This operation is idempotent.
     *
     * @returns The compiled `IRenderContext`.
     */
    compile(targetedProjections: RegisteredProjections | null): ICompiledRenderContext;
    /**
     * Creates an (or returns the cached) `IViewFactory` that can be used to create synthetic view controllers.
     *
     * @returns Either a new `IViewFactory` (if this is the first call), or a cached one.
     */
    getViewFactory(name?: string, contentType?: AuSlotContentType, projectionScope?: Scope | null): IViewFactory;
}
/**
 * A compiled `IRenderContext` that can create instances of `INodeSequence` (based on the template of the compiled definition)
 * and begin a component operation to create new component instances.
 */
export interface ICompiledRenderContext extends IRenderContext, IProjectionProvider {
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
    createNodes(): INodeSequence;
    /**
     * Prepare this context context for creating a new component instance.
     *
     * All parameters are optional injectable dependencies, that is: only those that are actually needed by the to-be-created component, need to be provided in order for that component to work.
     *
     * To avoid possible memory leaks, don't forget to call `dispose()` on the returned `IComponentFactory` after creating a component.
     *
     * @param parentController - The `IController` of the immediate parent of the to-be-created component. Not used by any built-in components.
     * @param host - The DOM node that declared the component, or the node that the component will be mounted to (in case of containerless). Used by some built-in custom attributes.
     * @param instruction - The hydrate instruction that resulted in the creation of this context context. Only used by `au-compose`.
     * @param viewFactory - The `IViewFactory` that was created from the template that the template controller was placed on. Only applicable for template controllers. Used by all built-in template controllers.
     * @param location - The DOM node that the nodes created by the `IViewFactory` should be mounted to. Only applicable for template controllers. Used by all built-in template controllers.
     */
    getComponentFactory(parentController?: IController, host?: INode, instruction?: IInstruction, viewFactory?: IViewFactory, location?: IRenderLocation, auSlotsInfo?: IAuSlotsInfo): IComponentFactory;
    render(flags: LifecycleFlags, controller: IController, targets: ArrayLike<INode>, templateDefinition: CustomElementDefinition, host: INode | null | undefined): void;
    renderChildren(flags: LifecycleFlags, instructions: readonly IInstruction[], controller: IController, target: unknown): void;
}
/**
 * A compiled `IRenderContext` that is ready to be used for creating component instances, and composing them.
 */
export interface IComponentFactory extends ICompiledRenderContext, IDisposable {
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
    createComponent<TViewModel = ICustomAttributeViewModel | ICustomElementViewModel>(resourceKey: string): TViewModel;
    /**
     * Release any resources that were stored by `getComponentFactory()`.
     */
    dispose(): void;
}
export declare function getRenderContext(partialDefinition: PartialCustomElementDefinition, parentContainer: IContainer, projections?: Record<string, CustomElementDefinition> | null): IRenderContext;
export declare class RenderContext implements IComponentFactory {
    readonly definition: CustomElementDefinition;
    readonly parentContainer: IContainer;
    private readonly container;
    private readonly parentControllerProvider;
    private readonly elementProvider;
    private readonly instructionProvider;
    private readonly factoryProvider;
    private readonly renderLocationProvider;
    private readonly auSlotsInfoProvider;
    private viewModelProvider;
    private fragment;
    private factory;
    private isCompiled;
    private readonly projectionProvider;
    readonly platform: IPlatform;
    private readonly renderers;
    compiledDefinition: CustomElementDefinition;
    constructor(definition: CustomElementDefinition, parentContainer: IContainer);
    has<K extends Key>(key: K | Key, searchAncestors: boolean): boolean;
    get<K extends Key>(key: K | Key): Resolved<K>;
    getAll<K extends Key>(key: K | Key): readonly Resolved<K>[];
    register(...params: unknown[]): IContainer;
    registerResolver<K extends Key, T = K>(key: K, resolver: IResolver<T>): IResolver<T>;
    registerTransformer<K extends Key, T = K>(key: K, transformer: Transformer<T>): boolean;
    getResolver<K extends Key, T = K>(key: K | Key, autoRegister?: boolean): IResolver<T> | null;
    getFactory<T extends Constructable>(key: T): IFactory<T>;
    registerFactory<K extends Constructable>(key: K, factory: IFactory<K>): void;
    createChild(): IContainer;
    find<TType extends ResourceType, TDef extends ResourceDefinition>(kind: IResourceKind<TType, TDef>, name: string): TDef | null;
    create<TType extends ResourceType, TDef extends ResourceDefinition>(kind: IResourceKind<TType, TDef>, name: string): InstanceType<TType> | null;
    disposeResolvers(): void;
    compile(targetedProjections: RegisteredProjections | null): ICompiledRenderContext;
    getViewFactory(name?: string, contentType?: AuSlotContentType, projectionScope?: Scope | null): IViewFactory;
    beginChildComponentOperation(instance: ICustomElementViewModel): IRenderContext;
    createNodes(): INodeSequence;
    getComponentFactory(parentController?: IController, host?: HTMLElement, instruction?: Instruction, viewFactory?: IViewFactory, location?: IRenderLocation, auSlotsInfo?: IAuSlotsInfo): IComponentFactory;
    createComponent<TViewModel = ICustomElementViewModel>(resourceKey: string): TViewModel;
    render(flags: LifecycleFlags, controller: IHydratableController, targets: ArrayLike<INode>, definition: CustomElementDefinition, host: INode | null | undefined): void;
    renderChildren(flags: LifecycleFlags, instructions: readonly IInstruction[], controller: IHydratableController, target: unknown): void;
    dispose(): void;
    registerProjections(projections: Map<Instruction, Record<string, CustomElementDefinition>>, scope: Scope): void;
    getProjectionFor(instruction: Instruction): RegisteredProjections | null;
}
//# sourceMappingURL=render-context.d.ts.map