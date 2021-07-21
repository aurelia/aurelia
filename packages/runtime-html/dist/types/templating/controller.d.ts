import { Scope, LifecycleFlags } from '@aurelia/runtime';
import { CustomElementDefinition } from '../resources/custom-element.js';
import { CustomAttributeDefinition } from '../resources/custom-attribute.js';
import type { IContainer, Writable, IDisposable } from '@aurelia/kernel';
import type { IBinding } from '@aurelia/runtime';
import type { IProjections } from '../resources/slot-injectables.js';
import type { LifecycleHooksLookup } from './lifecycle-hooks.js';
import type { INode, INodeSequence, IRenderLocation } from '../dom.js';
import type { IViewFactory } from './view.js';
import type { Instruction } from '../renderer.js';
import type { PartialCustomElementDefinition } from '../resources/custom-element.js';
declare type BindingContext<C extends IViewModel> = Required<ICompileHooks> & Required<IActivationHooks<IHydratedController | null>> & C;
export declare const enum MountTarget {
    none = 0,
    host = 1,
    shadowRoot = 2,
    location = 3
}
export declare class Controller<C extends IViewModel = IViewModel> implements IController<C> {
    container: IContainer;
    readonly vmKind: ViewModelKind;
    flags: LifecycleFlags;
    readonly definition: CustomElementDefinition | CustomAttributeDefinition | null;
    /**
     * The viewFactory. Only present for synthetic views.
     */
    viewFactory: IViewFactory | null;
    /**
     * The backing viewModel. Only present for custom attributes and elements.
     */
    viewModel: BindingContext<C> | null;
    /**
     * The physical host dom node.
     *
     * For containerless elements, this node will be removed from the DOM and replaced by a comment, which is assigned to the `location` property.
     *
     * For ShadowDOM elements, this will be the original declaring element, NOT the shadow root (the shadow root is stored on the `shadowRoot` property)
     */
    host: HTMLElement | null;
    readonly id: number;
    head: IHydratedController | null;
    tail: IHydratedController | null;
    next: IHydratedController | null;
    parent: IHydratedController | null;
    bindings: IBinding[] | null;
    children: Controller[] | null;
    hasLockedScope: boolean;
    isStrictBinding: boolean;
    scope: Scope | null;
    isBound: boolean;
    hostController: Controller | null;
    mountTarget: MountTarget;
    shadowRoot: ShadowRoot | null;
    nodes: INodeSequence | null;
    location: IRenderLocation | null;
    lifecycleHooks: LifecycleHooksLookup | null;
    state: State;
    get isActive(): boolean;
    get name(): string;
    private _compiledDef;
    private logger;
    private debug;
    private _fullyNamed;
    private _childrenObs;
    readonly hooks: HooksDefinition;
    constructor(container: IContainer, vmKind: ViewModelKind, flags: LifecycleFlags, definition: CustomElementDefinition | CustomAttributeDefinition | null, 
    /**
     * The viewFactory. Only present for synthetic views.
     */
    viewFactory: IViewFactory | null, 
    /**
     * The backing viewModel. Only present for custom attributes and elements.
     */
    viewModel: BindingContext<C> | null, 
    /**
     * The physical host dom node.
     *
     * For containerless elements, this node will be removed from the DOM and replaced by a comment, which is assigned to the `location` property.
     *
     * For ShadowDOM elements, this will be the original declaring element, NOT the shadow root (the shadow root is stored on the `shadowRoot` property)
     */
    host: HTMLElement | null);
    static getCached<C extends ICustomElementViewModel = ICustomElementViewModel>(viewModel: C): ICustomElementController<C> | undefined;
    static getCachedOrThrow<C extends ICustomElementViewModel = ICustomElementViewModel>(viewModel: C): ICustomElementController<C>;
    static forCustomElement<C extends ICustomElementViewModel = ICustomElementViewModel>(ctn: IContainer, viewModel: C, host: HTMLElement, hydrationInst: IControllerElementHydrationInstruction | null, flags?: LifecycleFlags, definition?: CustomElementDefinition | undefined): ICustomElementController<C>;
    static forCustomAttribute<C extends ICustomAttributeViewModel = ICustomAttributeViewModel>(ctn: IContainer, viewModel: C, host: HTMLElement, flags?: LifecycleFlags, 
    /**
     * The definition that will be used to hydrate the custom attribute view model
     *
     * If not given, will be the one associated with the constructor of the attribute view model given.
     */
    definition?: CustomAttributeDefinition): ICustomAttributeController<C>;
    static forSyntheticView(viewFactory: IViewFactory, flags?: LifecycleFlags, parentController?: ISyntheticView | ICustomElementController | ICustomAttributeController | undefined): ISyntheticView;
    private _hydrateCustomAttribute;
    private _hydrateSynthetic;
    private $initiator;
    private $flags;
    activate(initiator: IHydratedController, parent: IHydratedController | null, flags: LifecycleFlags, scope?: Scope | null): void | Promise<void>;
    private bind;
    private append;
    private attach;
    deactivate(initiator: IHydratedController, parent: IHydratedController | null, flags: LifecycleFlags): void | Promise<void>;
    private removeNodes;
    private unbind;
    private $resolve;
    private $reject;
    private $promise;
    private _ensurePromise;
    private _resolve;
    private _reject;
    private _activatingStack;
    private _enterActivating;
    private _leaveActivating;
    private _detachingStack;
    private _enterDetaching;
    private _leaveDetaching;
    private _unbindingStack;
    private _enterUnbinding;
    private _leaveUnbinding;
    addBinding(binding: IBinding): void;
    addChild(controller: Controller): void;
    is(name: string): boolean;
    lockScope(scope: Writable<Scope>): void;
    setHost(host: HTMLElement): this;
    setShadowRoot(shadowRoot: ShadowRoot): this;
    setLocation(location: IRenderLocation): this;
    release(): void;
    dispose(): void;
    accept(visitor: ControllerVisitor): void | true;
}
export declare function isCustomElementController<C extends ICustomElementViewModel = ICustomElementViewModel>(value: unknown): value is ICustomElementController<C>;
export declare function isCustomElementViewModel(value: unknown): value is ICustomElementViewModel;
export declare class HooksDefinition {
    static readonly none: Readonly<HooksDefinition>;
    readonly hasDefine: boolean;
    readonly hasHydrating: boolean;
    readonly hasHydrated: boolean;
    readonly hasCreated: boolean;
    readonly hasBinding: boolean;
    readonly hasBound: boolean;
    readonly hasAttaching: boolean;
    readonly hasAttached: boolean;
    readonly hasDetaching: boolean;
    readonly hasUnbinding: boolean;
    readonly hasDispose: boolean;
    readonly hasAccept: boolean;
    constructor(target: object);
}
export declare const enum ViewModelKind {
    customElement = 0,
    customAttribute = 1,
    synthetic = 2
}
/**
 * A controller that is ready for activation. It can be `ISyntheticView`, `ICustomElementController` or `ICustomAttributeController`.
 *
 * In terms of specificity this is identical to `IController`. The only difference is that this
 * type is further initialized and thus has more properties and APIs available.
 */
export declare type IHydratedController = ISyntheticView | ICustomElementController | ICustomAttributeController;
/**
 * A controller that is ready for activation. It can be `ICustomElementController` or `ICustomAttributeController`.
 *
 * This type of controller is backed by a real component (hence the name) and therefore has ViewModel and may have lifecycle hooks.
 *
 * In contrast, `ISyntheticView` has neither a view model nor lifecycle hooks (but its child controllers, if any, may).
 */
export declare type IHydratedComponentController = ICustomElementController | ICustomAttributeController;
/**
 * A controller that is ready for activation. It can be `ISyntheticView` or `ICustomElementController`.
 *
 * This type of controller may have child controllers (hence the name) and bindings directly placed on it during hydration.
 *
 * In contrast, `ICustomAttributeController` has neither child controllers nor bindings directly placed on it (but the backing component may).
 *
 * Note: the parent of a `ISyntheticView` is always a `IHydratedComponentController` because views cannot directly own other views. Views may own components, and components may own views or components.
 */
export declare type IHydratedParentController = ISyntheticView | ICustomElementController;
/**
 * A callback that is invoked on each controller in the component tree.
 *
 * Return `true` to stop traversal.
 */
export declare type ControllerVisitor = (controller: IHydratedController) => void | true;
/**
 * The base type for all controller types.
 *
 * Every controller, regardless of their type and state, will have at least the properties/methods in this interface.
 */
export interface IController<C extends IViewModel = IViewModel> extends IDisposable {
    /**
     * The container associated with this controller.
     * By default, CE should have their own container while custom attribute & synthetic view
     * will use the parent container one, since they do not need to manage one
     */
    readonly name: string;
    readonly container: IContainer;
    readonly flags: LifecycleFlags;
    readonly vmKind: ViewModelKind;
    readonly definition: CustomElementDefinition | CustomAttributeDefinition | null;
    readonly host: HTMLElement | null;
    readonly state: State;
    readonly isActive: boolean;
    readonly parent: IHydratedController | null;
    readonly isBound: boolean;
    /**
     * Return `true` to stop traversal.
     */
    accept(visitor: ControllerVisitor): void | true;
}
/**
 * The base type for `ICustomAttributeController` and `ICustomElementController`.
 *
 * Both of those types have the `viewModel` property which represent the user instance containing the bound properties and hooks for this component.
 */
export interface IComponentController<C extends IViewModel = IViewModel> extends IController<C> {
    readonly vmKind: ViewModelKind.customAttribute | ViewModelKind.customElement;
    readonly definition: CustomElementDefinition | CustomAttributeDefinition;
    /**
     * The user instance containing the bound properties. This is always an instance of a class, which may either be user-defined, or generated by a view locator.
     */
    readonly viewModel: C;
}
/**
 * The base type for `ISyntheticView` and `ICustomElementController`.
 *
 * Both of those types can:
 * - Have `bindings` and `children` which are populated during hydration (hence, 'Hydratable').
 * - Have physical DOM nodes that can be mounted.
 */
export interface IHydratableController<C extends IViewModel = IViewModel> extends IController<C> {
    readonly vmKind: ViewModelKind.customElement | ViewModelKind.synthetic;
    readonly mountTarget: MountTarget;
    readonly definition: CustomElementDefinition | null;
    readonly bindings: readonly IBinding[] | null;
    readonly children: readonly IHydratedController[] | null;
    addBinding(binding: IBinding): void;
    addChild(controller: IController): void;
}
export declare const enum State {
    none = 0,
    activating = 1,
    activated = 2,
    deactivating = 4,
    deactivated = 8,
    released = 16,
    disposed = 32
}
export declare function stringifyState(state: State): string;
/**
 * The controller for a synthetic view, that is, a controller created by an `IViewFactory`.
 *
 * A synthetic view, typically created when composing a template controller (`if`, `repeat`, etc), is a hydratable component with mountable DOM nodes that has no user view model.
 *
 * It has either its own synthetic binding context or is locked to some externally sourced scope (in the case of `au-compose`)
 */
export interface ISyntheticView extends IHydratableController {
    readonly vmKind: ViewModelKind.synthetic;
    readonly definition: null;
    readonly viewModel: null;
    readonly isStrictBinding: boolean;
    /**
     * The physical DOM nodes that will be appended during the attach operation.
     */
    readonly nodes: INodeSequence;
    activate(initiator: IHydratedController, parent: IHydratedController, flags: LifecycleFlags, scope: Scope): void | Promise<void>;
    deactivate(initiator: IHydratedController, parent: IHydratedController, flags: LifecycleFlags): void | Promise<void>;
    /**
     * Lock this view's scope to the provided `Scope`. The scope, which is normally set during `activate()`, will then not change anymore.
     *
     * This is used by `au-render` to set the binding context of a view to a particular component instance.
     *
     * @param scope - The scope to lock this view to.
     */
    lockScope(scope: Scope): void;
    /**
     * The scope that belongs to this view. This property will always be defined when the `state` property of this view indicates that the view is currently bound.
     *
     * The `scope` may be set during `activate()` and unset during `deactivate()`, or it may be statically set during composing with `lockScope()`.
     */
    readonly scope: Scope;
    /**
     * Set the render location that this view will be inserted before.
     */
    setLocation(location: IRenderLocation): this;
    /**
     * The DOM node that this view will be inserted before (if set).
     */
    readonly location: IRenderLocation | null;
    /**
     * Set the host that this view will be appended to.
     */
    setHost(host: Node & ParentNode): this;
    /**
     * The DOM node that this view will be appended to (if set).
     */
    readonly host: HTMLElement | null;
    /**
     * Set the `ShadowRoot` that this view will be appended to.
     */
    setShadowRoot(shadowRoot: ShadowRoot): this;
    /**
     * The ShadowRoot that this view will be appended to (if set).
     */
    readonly shadowRoot: ShadowRoot | null;
    /**
     * Mark this view as not-in-use, so that it can either be disposed or returned to cache after finishing the deactivate lifecycle.
     *
     * If this view is cached and later retrieved from the cache, it will be marked as in-use again before starting the activate lifecycle, so this method must be called each time.
     *
     * If this method is *not* called before `deactivate()`, this view will neither be cached nor disposed.
     */
    release(): void;
}
export interface ICustomAttributeController<C extends ICustomAttributeViewModel = ICustomAttributeViewModel> extends IComponentController<C> {
    readonly vmKind: ViewModelKind.customAttribute;
    readonly definition: CustomAttributeDefinition;
    /**
     * @inheritdoc
     */
    readonly viewModel: C;
    readonly lifecycleHooks: LifecycleHooksLookup;
    /**
     * The scope that belongs to this custom attribute. This property will always be defined when the `state` property of this view indicates that the view is currently bound.
     *
     * The `scope` will be set during `activate()` and unset during `deactivate()`.
     *
     * The scope's `bindingContext` will be the same instance as this controller's `viewModel` property.
     */
    readonly scope: Scope;
    readonly children: null;
    readonly bindings: null;
    activate(initiator: IHydratedController, parent: IHydratedController, flags: LifecycleFlags, scope: Scope): void | Promise<void>;
    deactivate(initiator: IHydratedController, parent: IHydratedController, flags: LifecycleFlags): void | Promise<void>;
}
/**
 * A representation of `IController` specific to a custom element whose `create` hook is about to be invoked (if present).
 *
 * It is not yet hydrated (hence 'dry') with any render-specific information.
 */
export interface IDryCustomElementController<C extends IViewModel = IViewModel> extends IComponentController<C>, IHydratableController<C> {
    readonly vmKind: ViewModelKind.customElement;
    readonly definition: CustomElementDefinition;
    /**
     * The scope that belongs to this custom element. This property is set immediately after the controller is created and is always guaranteed to be available.
     *
     * It may be overwritten by end user during the `create()` hook.
     *
     * By default, the scope's `bindingContext` will be the same instance as this controller's `viewModel` property.
     */
    scope: Scope;
    /**
     * The original host dom node.
     *
     * For containerless elements, this node will be removed from the DOM and replaced by a comment, which is assigned to the `location` property.
     *
     * For ShadowDOM elements, this will be the original declaring element, NOT the shadow root (the shadow root is stored on the `shadowRoot` property)
     */
    readonly host: HTMLElement;
}
/**
 * A representation of `IController` specific to a custom element whose `hydrating` hook is about to be invoked (if present).
 *
 * It has the same properties as `IDryCustomElementController`, as well as a render context (hence 'contextual').
 */
export interface IContextualCustomElementController<C extends IViewModel = IViewModel> extends IDryCustomElementController<C> {
}
/**
 * A representation of `IController` specific to a custom element whose `hydrated` hook is about to be invoked (if present).
 *
 * It has the same properties as `IContextualCustomElementController`, except the context is now compiled (hence 'compiled'), as well as the nodes, and projector.
 */
export interface ICompiledCustomElementController<C extends IViewModel = IViewModel> extends IContextualCustomElementController<C> {
    readonly isStrictBinding: boolean;
    /**
     * The ShadowRoot, if this custom element uses ShadowDOM.
     */
    readonly shadowRoot: ShadowRoot | null;
    /**
     * The renderLocation, if this is a `containerless` custom element.
     */
    readonly location: IRenderLocation | null;
    /**
     * The physical DOM nodes that will be appended during the `mount()` operation.
     */
    readonly nodes: INodeSequence;
}
/**
 * A fully hydrated custom element controller.
 */
export interface ICustomElementController<C extends ICustomElementViewModel = ICustomElementViewModel> extends ICompiledCustomElementController<C> {
    /**
     * @inheritdoc
     */
    readonly viewModel: C;
    readonly lifecycleHooks: LifecycleHooksLookup;
    activate(initiator: IHydratedController, parent: IHydratedController | null, flags: LifecycleFlags, scope?: Scope): void | Promise<void>;
    deactivate(initiator: IHydratedController, parent: IHydratedController | null, flags: LifecycleFlags): void | Promise<void>;
}
export declare const IController: import("@aurelia/kernel").InterfaceSymbol<IController<IViewModel>>;
export declare const IHydrationContext: import("@aurelia/kernel").InterfaceSymbol<IHydrationContext<unknown>>;
export interface IHydrationContext<T = unknown> extends HydrationContext<T> {
}
declare class HydrationContext<T extends ICustomElementViewModel> {
    readonly instruction: IControllerElementHydrationInstruction | null;
    readonly parent: IHydrationContext | undefined;
    readonly controller: ICustomElementController<T>;
    constructor(controller: Controller, instruction: IControllerElementHydrationInstruction | null, parent: IHydrationContext | undefined);
}
export interface IActivationHooks<TParent> {
    binding?(initiator: IHydratedController, parent: TParent, flags: LifecycleFlags): void | Promise<void>;
    bound?(initiator: IHydratedController, parent: TParent, flags: LifecycleFlags): void | Promise<void>;
    attaching?(initiator: IHydratedController, parent: TParent, flags: LifecycleFlags): void | Promise<void>;
    attached?(initiator: IHydratedController, flags: LifecycleFlags): void | Promise<void>;
    detaching?(initiator: IHydratedController, parent: TParent, flags: LifecycleFlags): void | Promise<void>;
    unbinding?(initiator: IHydratedController, parent: TParent, flags: LifecycleFlags): void | Promise<void>;
    dispose?(): void;
    /**
     * If this component controls the instantiation and lifecycles of one or more controllers,
     * implement this hook to enable component tree traversal for plugins that use it (such as the router).
     *
     * Return `true` to stop traversal.
     */
    accept?(visitor: ControllerVisitor): void | true;
}
export interface ICompileHooks {
    define?(controller: IDryCustomElementController<this>, 
    /**
     * The context where this element is hydrated.
     *
     * This is created by the controller associated with the CE creating this this controller
     */
    hydrationContext: IHydrationContext | null, definition: CustomElementDefinition): PartialCustomElementDefinition | void;
    hydrating?(controller: IContextualCustomElementController<this>): void;
    hydrated?(controller: ICompiledCustomElementController<this>): void;
    created?(controller: ICustomElementController<this> | ICustomAttributeController<this>): void;
}
/**
 * Defines optional lifecycle hooks that will be called only when they are implemented.
 */
export interface IViewModel {
    constructor: Function;
    readonly $controller?: IController<this>;
}
export interface ICustomElementViewModel extends IViewModel, IActivationHooks<IHydratedController | null>, ICompileHooks {
    readonly $controller?: ICustomElementController<this>;
    created?(controller: ICustomElementController<this>): void;
}
export interface ICustomAttributeViewModel extends IViewModel, IActivationHooks<IHydratedController> {
    readonly $controller?: ICustomAttributeController<this>;
    link?(flags: LifecycleFlags, controller: IHydratableController, childController: ICustomAttributeController, target: INode, instruction: Instruction): void;
    created?(controller: ICustomAttributeController<this>): void;
}
export interface IHydratedCustomElementViewModel extends ICustomElementViewModel {
    readonly $controller: ICustomElementController<this>;
}
export interface IHydratedCustomAttributeViewModel extends ICustomAttributeViewModel {
    readonly $controller: ICustomAttributeController<this>;
}
export interface IControllerElementHydrationInstruction {
    readonly projections: IProjections | null;
}
export {};
//# sourceMappingURL=controller.d.ts.map