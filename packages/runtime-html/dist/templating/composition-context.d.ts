import { Constructable, IContainer, IDisposable, IFactory, IResolver, Key, Resolved, Transformer } from '@aurelia/kernel';
import { Scope, LifecycleFlags } from '@aurelia/runtime';
import { IInstruction } from '../definitions';
import { INode, INodeSequence, IRenderLocation } from '../dom';
import { IController, ICustomAttributeViewModel, ICustomElementViewModel, IComposableController } from '../lifecycle';
import { IComposer } from '../composer';
import { CustomElementDefinition, PartialCustomElementDefinition } from '../resources/custom-element';
import { IViewFactory } from './view';
import { AuSlotContentType, IProjectionProvider, RegisteredProjections } from '../resources/custom-elements/au-slot';
import { IPlatform } from '../platform';
import { Instruction } from '../instructions';
export declare function isCompositionContext(value: unknown): value is ICompositionContext;
/**
 * A composition context that wraps an `IContainer` and must be compiled before it can be used for composing.
 */
export interface ICompositionContext extends IContainer {
    readonly platform: IPlatform;
    /**
     * The `CustomElementDefinition` that this `ICompositionContext` was created with.
     *
     * If a `PartialCustomElementDefinition` was used to create this context, then this property will be the return value of `CustomElementDefinition.getOrCreate`.
     */
    readonly definition: CustomElementDefinition;
    /**
     * The `IContainer` (which may be, but is not guaranteed to be, an `ICompositionContext`) that this `ICompositionContext` was created with.
     */
    readonly parentContainer: IContainer;
    /**
     * Prepare this factory for creating child controllers. Only applicable for custom elements.
     *
     * @param instance - The component instance to make available to child components if this context's definition has `injectable` set to `true`.
     */
    beginChildComponentOperation(instance: ICustomElementViewModel): ICompositionContext;
    /**
     * Compiles the backing `CustomElementDefinition` (if needed) and returns the compiled `ICompositionContext` that exposes the compiled `CustomElementDefinition` as well as composing operations.
     *
     * This operation is idempotent.
     *
     * @returns The compiled `ICompositionContext`.
     */
    compile(targetedProjections: RegisteredProjections | null): ICompiledCompositionContext;
    /**
     * Creates an (or returns the cached) `IViewFactory` that can be used to create synthetic view controllers.
     *
     * @returns Either a new `IViewFactory` (if this is the first call), or a cached one.
     */
    getViewFactory(name?: string, contentType?: AuSlotContentType, projectionScope?: Scope | null): IViewFactory;
}
/**
 * A compiled `ICompositionContext` that can create instances of `INodeSequence` (based on the template of the compiled definition)
 * and begin a component operation to create new component instances.
 */
export interface ICompiledCompositionContext extends ICompositionContext, IProjectionProvider {
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
     * Prepare this composition context for creating a new component instance.
     *
     * All parameters are optional injectable dependencies, that is: only those that are actually needed by the to-be-created component, need to be provided in order for that component to work.
     *
     * To avoid possible memory leaks, don't forget to call `dispose()` on the returned `IComponentFactory` after creating a component.
     *
     * @param parentController - The `IController` of the immediate parent of the to-be-created component. Not used by any built-in components.
     * @param host - The DOM node that declared the component, or the node that the component will be mounted to (in case of containerless). Used by some built-in custom attributes.
     * @param instruction - The hydrate instruction that resulted in the creation of this composition context. Only used by `au-compose`.
     * @param viewFactory - The `IViewFactory` that was created from the template that the template controller was placed on. Only applicable for template controllers. Used by all built-in template controllers.
     * @param location - The DOM node that the nodes created by the `IViewFactory` should be mounted to. Only applicable for template controllers. Used by all built-in template controllers.
     */
    getComponentFactory(parentController?: IController, host?: INode, instruction?: IInstruction, viewFactory?: IViewFactory, location?: IRenderLocation): IComponentFactory;
    compose(flags: LifecycleFlags, controller: IController, targets: ArrayLike<INode>, templateDefinition: CustomElementDefinition, host: INode | null | undefined): void;
    composeChildren(flags: LifecycleFlags, instructions: readonly IInstruction[], controller: IController, target: unknown): void;
}
/**
 * A compiled `ICompositionContext` that is ready to be used for creating component instances, and composing them.
 */
export interface IComponentFactory extends ICompiledCompositionContext, IDisposable {
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
export declare function getCompositionContext(partialDefinition: PartialCustomElementDefinition, parentContainer: IContainer, projections?: Record<string, CustomElementDefinition> | null): ICompositionContext;
export declare class CompositionContext implements IComponentFactory {
    readonly definition: CustomElementDefinition;
    readonly parentContainer: IContainer;
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
    private readonly projectionProvider;
    readonly platform: IPlatform;
    readonly composer: IComposer;
    compiledDefinition: CustomElementDefinition;
    constructor(definition: CustomElementDefinition, parentContainer: IContainer);
    has<K extends Key>(key: K | Key, searchAncestors: boolean): boolean;
    get<K extends Key>(key: K | Key): Resolved<K>;
    getAll<K extends Key>(key: K | Key): readonly Resolved<K>[];
    register(...params: unknown[]): IContainer;
    registerResolver<K extends Key, T = K>(key: K, resolver: IResolver<T>): IResolver<T>;
    registerTransformer<K extends Key, T = K>(key: K, transformer: Transformer<T>): boolean;
    getResolver<K extends Key, T = K>(key: K | Key, autoRegister?: boolean): IResolver<T> | null;
    getFactory<T extends Constructable>(key: T): IFactory<T> | null;
    registerFactory<K extends Constructable>(key: K, factory: IFactory<K>): void;
    createChild(): IContainer;
    disposeResolvers(): void;
    compile(targetedProjections: RegisteredProjections | null): ICompiledCompositionContext;
    getViewFactory(name?: string, contentType?: AuSlotContentType, projectionScope?: Scope | null): IViewFactory;
    beginChildComponentOperation(instance: ICustomElementViewModel): ICompositionContext;
    createNodes(): INodeSequence;
    getComponentFactory(parentController?: IController, host?: HTMLElement, instruction?: IInstruction, viewFactory?: IViewFactory, location?: IRenderLocation): IComponentFactory;
    createComponent<TViewModel = ICustomElementViewModel>(resourceKey: string): TViewModel;
    compose(flags: LifecycleFlags, controller: IComposableController, targets: ArrayLike<INode>, templateDefinition: CustomElementDefinition, host: INode | null | undefined): void;
    composeChildren(flags: LifecycleFlags, instructions: readonly Instruction[], controller: IComposableController, target: unknown): void;
    dispose(): void;
    registerProjections(projections: Map<IInstruction, Record<string, CustomElementDefinition>>, scope: Scope): void;
    getProjectionFor(instruction: IInstruction): RegisteredProjections | null;
}
//# sourceMappingURL=composition-context.d.ts.map