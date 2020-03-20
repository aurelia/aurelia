import { IContainer, IIndexable } from '@aurelia/kernel';
import { HooksDefinition, PartialCustomElementDefinitionParts } from '../definitions';
import { INode, INodeSequence, IRenderLocation } from '../dom';
import { LifecycleFlags, State } from '../flags';
import { IBinding, IController, ILifecycle, IViewModel, ViewModelKind, MountStrategy, IViewFactory, ISyntheticView, ICustomAttributeController, ICustomElementController, ICustomElementViewModel, ICustomAttributeViewModel } from '../lifecycle';
import { ILifecycleTask, MaybePromiseOrTask } from '../lifecycle-task';
import { IBindingTargetAccessor, IScope } from '../observation';
import { IElementProjector, CustomElementDefinition, PartialCustomElementDefinition } from '../resources/custom-element';
import { IRenderContext } from './render-context';
declare type BindingContext<T extends INode, C extends IViewModel<T>> = IIndexable<C & {
    create(controller: IController, definition: CustomElementDefinition, parentContainer: IContainer, parts: PartialCustomElementDefinitionParts | undefined, flags: LifecycleFlags): PartialCustomElementDefinition | void;
    beforeCompile(controller: IController, definition: CustomElementDefinition, container: IContainer, parts: PartialCustomElementDefinitionParts | undefined, flags: LifecycleFlags): void;
    afterCompile(controller: IController, compiledDefinition: CustomElementDefinition, projector: IElementProjector, nodes: INodeSequence | null, flags: LifecycleFlags): void;
    afterCompileChildren(children: readonly IController[] | undefined, flags: LifecycleFlags): void;
    beforeBind(flags: LifecycleFlags): MaybePromiseOrTask;
    afterBind(flags: LifecycleFlags): void;
    beforeUnbind(flags: LifecycleFlags): MaybePromiseOrTask;
    afterUnbind(flags: LifecycleFlags): void;
    beforeAttach(flags: LifecycleFlags): void;
    afterAttach(flags: LifecycleFlags): void;
    beforeDetach(flags: LifecycleFlags): void;
    afterDetach(flags: LifecycleFlags): void;
    caching(flags: LifecycleFlags): void;
}>;
export declare class Controller<T extends INode = INode, C extends IViewModel<T> = IViewModel<T>> implements IController<T, C> {
    readonly vmKind: ViewModelKind;
    flags: LifecycleFlags;
    readonly lifecycle: ILifecycle;
    hooks: HooksDefinition;
    /**
     * The viewFactory. Only present for synthetic views.
     */
    readonly viewFactory: IViewFactory<T> | undefined;
    /**
     * The backing viewModel. This is never a proxy. Only present for custom attributes and elements.
     */
    readonly viewModel: C | undefined;
    /**
     * The binding context. This may be a proxy. If it is not, then it is the same instance as the viewModel. Only present for custom attributes and elements.
     */
    readonly bindingContext: BindingContext<T, C> | undefined;
    /**
     * The physical host dom node. Only present for custom elements.
     */
    readonly host: T | undefined;
    readonly id: number;
    nextBound: IController<T, C> | undefined;
    nextUnbound: IController<T, C> | undefined;
    prevBound: IController<T, C> | undefined;
    prevUnbound: IController<T, C> | undefined;
    nextAttached: IController<T, C> | undefined;
    nextDetached: IController<T, C> | undefined;
    prevAttached: IController<T, C> | undefined;
    prevDetached: IController<T, C> | undefined;
    nextMount: IController<T, C> | undefined;
    nextUnmount: IController<T, C> | undefined;
    prevMount: IController<T, C> | undefined;
    prevUnmount: IController<T, C> | undefined;
    parent: ISyntheticView<T> | ICustomElementController<T> | ICustomAttributeController<T> | undefined;
    bindings: IBinding[] | undefined;
    controllers: IController<T>[] | undefined;
    state: State;
    scopeParts: string[] | undefined;
    isStrictBinding: boolean;
    scope: IScope | undefined;
    part: string | undefined;
    projector: IElementProjector | undefined;
    nodes: INodeSequence<T> | undefined;
    context: IRenderContext<T> | undefined;
    location: IRenderLocation<T> | undefined;
    mountStrategy: MountStrategy;
    constructor(vmKind: ViewModelKind, flags: LifecycleFlags, lifecycle: ILifecycle, hooks: HooksDefinition, 
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
    static forCustomElement<T extends INode = INode, C extends ICustomElementViewModel<T> = ICustomElementViewModel<T>>(viewModel: C, lifecycle: ILifecycle, host: T, parentContainer: IContainer, parts: PartialCustomElementDefinitionParts | undefined, flags?: LifecycleFlags): ICustomElementController<T, C>;
    static forCustomAttribute<T extends INode = INode, C extends ICustomAttributeViewModel<T> = ICustomAttributeViewModel<T>>(viewModel: C, lifecycle: ILifecycle, host: T, flags?: LifecycleFlags): ICustomAttributeController<T, C>;
    static forSyntheticView<T extends INode = INode>(viewFactory: IViewFactory<T>, lifecycle: ILifecycle, context: IRenderContext<T>, flags?: LifecycleFlags): ISyntheticView<T>;
    private hydrateCustomElement;
    private hydrateCustomAttribute;
    private hydrateSynthetic;
    addBinding(binding: IBinding): void;
    addController(controller: IController<T>): void;
    is(name: string): boolean;
    lockScope(scope: IScope): void;
    hold(location: IRenderLocation<T>, mountStrategy: MountStrategy): void;
    release(flags: LifecycleFlags): boolean;
    bind(flags: LifecycleFlags, scope?: IScope, part?: string): ILifecycleTask;
    unbind(flags: LifecycleFlags): ILifecycleTask;
    afterBind(flags: LifecycleFlags): void;
    afterUnbind(flags: LifecycleFlags): void;
    attach(flags: LifecycleFlags): void;
    detach(flags: LifecycleFlags): void;
    afterAttach(flags: LifecycleFlags): void;
    afterDetach(flags: LifecycleFlags): void;
    mount(flags: LifecycleFlags): void;
    unmount(flags: LifecycleFlags): void;
    cache(flags: LifecycleFlags): void;
    getTargetAccessor(propertyName: string): IBindingTargetAccessor | undefined;
    private bindCustomElement;
    private bindCustomAttribute;
    private bindSynthetic;
    private bindBindings;
    private bindControllers;
    private endBind;
    private unbindCustomElement;
    private unbindCustomAttribute;
    private unbindSynthetic;
    private unbindBindings;
    private unbindControllers;
    private endUnbind;
    private attachCustomElement;
    private attachCustomAttribute;
    private attachSynthetic;
    private detachCustomElement;
    private detachCustomAttribute;
    private detachSynthetic;
    private attachControllers;
    private detachControllers;
    private mountCustomElement;
    private mountSynthetic;
    private unmountCustomElement;
    private unmountSynthetic;
    private cacheCustomElement;
    private cacheCustomAttribute;
    private cacheSynthetic;
}
export {};
//# sourceMappingURL=controller.d.ts.map