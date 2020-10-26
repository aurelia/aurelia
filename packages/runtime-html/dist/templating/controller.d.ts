import { IContainer, IIndexable, Writable } from '@aurelia/kernel';
import { IBinding, Scope, LifecycleFlags, ILifecycle, IBindingTargetAccessor } from '@aurelia/runtime';
import { HooksDefinition } from '../definitions';
import { INodeSequence, IRenderLocation } from '../dom';
import { IController, IViewModel, ViewModelKind, MountStrategy, ISyntheticView, ICustomAttributeController, ICustomElementController, ICustomElementViewModel, ICustomAttributeViewModel, IActivationHooks, ICompileHooks, IHydratedParentController, State, ControllerVisitor } from '../lifecycle';
import { CustomElementDefinition } from '../resources/custom-element';
import { CustomAttributeDefinition } from '../resources/custom-attribute';
import { ICompositionContext, CompositionContext } from './composition-context';
import { RegisteredProjections } from '../resources/custom-elements/au-slot';
import { IAppRoot } from '../app-root';
import { ElementProjector } from '../projectors';
import { IPlatform } from '../platform';
import { IViewFactory } from './view';
declare type BindingContext<C extends IViewModel> = IIndexable<C & Required<ICompileHooks> & Required<IActivationHooks<IHydratedParentController | null>>>;
export declare class Controller<C extends IViewModel = IViewModel> implements IController<C> {
    root: IAppRoot | null;
    container: IContainer;
    readonly vmKind: ViewModelKind;
    flags: LifecycleFlags;
    readonly definition: CustomElementDefinition | CustomAttributeDefinition | undefined;
    hooks: HooksDefinition;
    /**
     * The viewFactory. Only present for synthetic views.
     */
    viewFactory: IViewFactory | undefined;
    /**
     * The backing viewModel. This is never a proxy. Only present for custom attributes and elements.
     */
    viewModel: C | undefined;
    /**
     * The binding context. This may be a proxy. If it is not, then it is the same instance as the viewModel. Only present for custom attributes and elements.
     */
    bindingContext: BindingContext<C> | undefined;
    /**
     * The physical host dom node. Only present for custom elements.
     */
    host: Node | undefined;
    readonly id: number;
    head: Controller<C> | null;
    tail: Controller<C> | null;
    next: Controller<C> | null;
    parent: Controller | null;
    bindings: IBinding[] | undefined;
    children: Controller[] | undefined;
    hasLockedScope: boolean;
    isStrictBinding: boolean;
    scope: Scope | undefined;
    hostScope: Scope | null;
    projector: ElementProjector | undefined;
    nodes: INodeSequence | undefined;
    context: CompositionContext | undefined;
    location: IRenderLocation | undefined;
    mountStrategy: MountStrategy;
    state: State;
    get isActive(): boolean;
    private get name();
    private promise;
    private resolve;
    private reject;
    private logger;
    private debug;
    private fullyNamed;
    readonly platform: IPlatform;
    readonly lifecycle: ILifecycle;
    constructor(root: IAppRoot | null, container: IContainer, vmKind: ViewModelKind, flags: LifecycleFlags, definition: CustomElementDefinition | CustomAttributeDefinition | undefined, hooks: HooksDefinition, 
    /**
     * The viewFactory. Only present for synthetic views.
     */
    viewFactory: IViewFactory | undefined, 
    /**
     * The backing viewModel. This is never a proxy. Only present for custom attributes and elements.
     */
    viewModel: C | undefined, 
    /**
     * The binding context. This may be a proxy. If it is not, then it is the same instance as the viewModel. Only present for custom attributes and elements.
     */
    bindingContext: BindingContext<C> | undefined, 
    /**
     * The physical host dom node. Only present for custom elements.
     */
    host: Node | undefined);
    static getCached<C extends ICustomElementViewModel = ICustomElementViewModel>(viewModel: C): ICustomElementController<C> | undefined;
    static getCachedOrThrow<C extends ICustomElementViewModel = ICustomElementViewModel>(viewModel: C): ICustomElementController<C>;
    static forCustomElement<C extends ICustomElementViewModel = ICustomElementViewModel>(root: IAppRoot | null, container: IContainer, viewModel: C, host: Node, targetedProjections: RegisteredProjections | null, flags?: LifecycleFlags, hydrate?: boolean, definition?: CustomElementDefinition | undefined): ICustomElementController<C>;
    static forCustomAttribute<C extends ICustomAttributeViewModel = ICustomAttributeViewModel>(root: IAppRoot | null, container: IContainer, viewModel: C, host: Node, flags?: LifecycleFlags): ICustomAttributeController<C>;
    static forSyntheticView(root: IAppRoot | null, context: ICompositionContext, viewFactory: IViewFactory, flags?: LifecycleFlags, parentController?: ISyntheticView | ICustomElementController | ICustomAttributeController | undefined): ISyntheticView;
    private hydrateCustomAttribute;
    private hydrateSynthetic;
    private canceling;
    cancel(initiator: Controller, parent: Controller | null, flags: LifecycleFlags): void;
    activate(initiator: Controller, parent: Controller | null, flags: LifecycleFlags, scope?: Scope, hostScope?: Scope | null): void | Promise<void>;
    private beforeBind;
    private bind;
    private afterBind;
    private attach;
    private afterAttach;
    private activateChildren;
    private $activateChildren;
    private endActivate;
    private afterAttachChildren;
    deactivate(initiator: Controller, parent: Controller | null, flags: LifecycleFlags): void | Promise<void>;
    private beforeDetach;
    private detach;
    private beforeUnbind;
    private unbind;
    private afterUnbind;
    private deactivateChildren;
    private $deactivateChildren;
    private endDeactivate;
    private afterUnbindChildren;
    private onResolve;
    addBinding(binding: IBinding): void;
    addController(controller: Controller): void;
    is(name: string): boolean;
    lockScope(scope: Writable<Scope>): void;
    setLocation(location: IRenderLocation, mountStrategy: MountStrategy): void;
    release(): void;
    dispose(): void;
    accept(visitor: ControllerVisitor): void | true;
    getTargetAccessor(propertyName: string): IBindingTargetAccessor | undefined;
    private resolvePromise;
}
export declare function isCustomElementController<C extends ICustomElementViewModel = ICustomElementViewModel>(value: unknown): value is ICustomElementController<C>;
export declare function isCustomElementViewModel(value: unknown): value is ICustomElementViewModel;
export {};
//# sourceMappingURL=controller.d.ts.map