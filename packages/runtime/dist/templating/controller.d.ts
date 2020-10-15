import { IContainer, IIndexable, Writable } from '@aurelia/kernel';
import { HooksDefinition } from '../definitions';
import { INode, INodeSequence, IRenderLocation } from '../dom';
import { LifecycleFlags } from '../flags';
import { IBinding, IController, ILifecycle, IViewModel, ViewModelKind, MountStrategy, IViewFactory, ISyntheticView, ICustomAttributeController, ICustomElementController, ICustomElementViewModel, ICustomAttributeViewModel, IActivationHooks, ICompileHooks, IHydratedParentController, State, ControllerVisitor } from '../lifecycle';
import { IBindingTargetAccessor } from '../observation';
import { Scope } from '../observation/binding-context';
import { IElementProjector, CustomElementDefinition } from '../resources/custom-element';
import { CustomAttributeDefinition } from '../resources/custom-attribute';
import { IRenderContext, RenderContext } from './render-context';
import { RegisteredProjections } from '../resources/custom-elements/au-slot';
import { ICompositionRoot } from '../aurelia';
declare type BindingContext<T extends INode, C extends IViewModel<T>> = IIndexable<C & Required<ICompileHooks<T>> & Required<IActivationHooks<IHydratedParentController<T> | null, T>>>;
export declare class Controller<T extends INode = INode, C extends IViewModel<T> = IViewModel<T>> implements IController<T, C> {
    root: ICompositionRoot<T> | null;
    container: IContainer;
    readonly vmKind: ViewModelKind;
    flags: LifecycleFlags;
    readonly lifecycle: ILifecycle;
    readonly definition: CustomElementDefinition | CustomAttributeDefinition | undefined;
    hooks: HooksDefinition;
    /**
     * The viewFactory. Only present for synthetic views.
     */
    viewFactory: IViewFactory<T> | undefined;
    /**
     * The backing viewModel. This is never a proxy. Only present for custom attributes and elements.
     */
    viewModel: C | undefined;
    /**
     * The binding context. This may be a proxy. If it is not, then it is the same instance as the viewModel. Only present for custom attributes and elements.
     */
    bindingContext: BindingContext<T, C> | undefined;
    /**
     * The physical host dom node. Only present for custom elements.
     */
    host: T | undefined;
    readonly id: number;
    head: Controller<T, C> | null;
    tail: Controller<T, C> | null;
    next: Controller<T, C> | null;
    parent: Controller<T> | null;
    bindings: IBinding[] | undefined;
    children: Controller<T>[] | undefined;
    hasLockedScope: boolean;
    isStrictBinding: boolean;
    scope: Scope | undefined;
    hostScope: Scope | null;
    projector: IElementProjector<T> | undefined;
    nodes: INodeSequence<T> | undefined;
    context: RenderContext<T> | undefined;
    location: IRenderLocation<T> | undefined;
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
    constructor(root: ICompositionRoot<T> | null, container: IContainer, vmKind: ViewModelKind, flags: LifecycleFlags, lifecycle: ILifecycle, definition: CustomElementDefinition | CustomAttributeDefinition | undefined, hooks: HooksDefinition, 
    /**
     * The viewFactory. Only present for synthetic views.
     */
    viewFactory: IViewFactory<T> | undefined, 
    /**
     * The backing viewModel. This is never a proxy. Only present for custom attributes and elements.
     */
    viewModel: C | undefined, 
    /**
     * The binding context. This may be a proxy. If it is not, then it is the same instance as the viewModel. Only present for custom attributes and elements.
     */
    bindingContext: BindingContext<T, C> | undefined, 
    /**
     * The physical host dom node. Only present for custom elements.
     */
    host: T | undefined);
    static getCached<T extends INode = INode, C extends ICustomElementViewModel<T> = ICustomElementViewModel<T>>(viewModel: C): ICustomElementController<T, C> | undefined;
    static getCachedOrThrow<T extends INode = INode, C extends ICustomElementViewModel<T> = ICustomElementViewModel<T>>(viewModel: C): ICustomElementController<T, C>;
    static forCustomElement<T extends INode = INode, C extends ICustomElementViewModel<T> = ICustomElementViewModel<T>>(root: ICompositionRoot<T> | null, container: IContainer, viewModel: C, lifecycle: ILifecycle, host: T, targetedProjections: RegisteredProjections | null, flags?: LifecycleFlags, hydrate?: boolean, definition?: CustomElementDefinition | undefined): ICustomElementController<T, C>;
    static forCustomAttribute<T extends INode = INode, C extends ICustomAttributeViewModel<T> = ICustomAttributeViewModel<T>>(root: ICompositionRoot<T> | null, container: IContainer, viewModel: C, lifecycle: ILifecycle, host: T, flags?: LifecycleFlags): ICustomAttributeController<T, C>;
    static forSyntheticView<T extends INode = INode>(root: ICompositionRoot<T> | null, context: IRenderContext<T>, viewFactory: IViewFactory<T>, lifecycle: ILifecycle, flags?: LifecycleFlags, parentController?: ISyntheticView<T> | ICustomElementController<T> | ICustomAttributeController<T> | undefined): ISyntheticView<T>;
    private hydrateCustomAttribute;
    private hydrateSynthetic;
    private canceling;
    cancel(initiator: Controller<T>, parent: Controller<T> | null, flags: LifecycleFlags): void;
    activate(initiator: Controller<T>, parent: Controller<T> | null, flags: LifecycleFlags, scope?: Scope, hostScope?: Scope | null): void | Promise<void>;
    private beforeBind;
    private bind;
    private afterBind;
    private attach;
    private afterAttach;
    private activateChildren;
    private $activateChildren;
    private endActivate;
    private afterAttachChildren;
    deactivate(initiator: Controller<T>, parent: Controller<T> | null, flags: LifecycleFlags): void | Promise<void>;
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
    addController(controller: Controller<T>): void;
    is(name: string): boolean;
    lockScope(scope: Writable<Scope>): void;
    setLocation(location: IRenderLocation<T>, mountStrategy: MountStrategy): void;
    release(): void;
    dispose(): void;
    accept(visitor: ControllerVisitor<T>): void | true;
    getTargetAccessor(propertyName: string): IBindingTargetAccessor | undefined;
    private resolvePromise;
}
export declare function isCustomElementController<T extends INode = INode, C extends ICustomElementViewModel<T> = ICustomElementViewModel<T>>(value: unknown): value is ICustomElementController<T, C>;
export declare function isCustomElementViewModel<T extends INode = INode>(value: unknown): value is ICustomElementViewModel<T>;
export {};
//# sourceMappingURL=controller.d.ts.map