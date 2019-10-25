import { IContainer, IDisposable, IIndexable, IResolver, IServiceLocator } from '@aurelia/kernel';
import { HooksDefinition, ITargetedInstruction, PartialCustomElementDefinitionParts } from './definitions';
import { INode, INodeSequence, IRenderLocation } from './dom';
import { LifecycleFlags, State } from './flags';
import { ILifecycleTask, MaybePromiseOrTask } from './lifecycle-task';
import { IBatchable, IBindingTargetAccessor, IScope } from './observation';
import { IElementProjector, CustomElementDefinition } from './resources/custom-element';
export interface IBinding {
    readonly locator: IServiceLocator;
    readonly $scope?: IScope;
    readonly part?: string;
    readonly $state: State;
    $bind(flags: LifecycleFlags, scope: IScope, part?: string): void;
    $unbind(flags: LifecycleFlags): void;
}
export declare const enum ViewModelKind {
    customElement = 0,
    customAttribute = 1,
    synthetic = 2
}
export interface IController<T extends INode = INode, C extends IViewModel<T> = IViewModel<T>> {
    readonly id: number;
    nextBound?: IController<T, C>;
    nextUnbound?: IController<T, C>;
    prevBound?: IController<T, C>;
    prevUnbound?: IController<T, C>;
    nextAttached?: IController<T, C>;
    nextDetached?: IController<T, C>;
    prevAttached?: IController<T, C>;
    prevDetached?: IController<T, C>;
    nextMount?: IController<T, C>;
    nextUnmount?: IController<T, C>;
    prevMount?: IController<T, C>;
    prevUnmount?: IController<T, C>;
    readonly flags: LifecycleFlags;
    readonly viewCache?: IViewCache<T>;
    parent?: IController<T>;
    bindings?: IBinding[];
    controllers?: IController<T>[];
    state: State;
    readonly lifecycle: ILifecycle;
    readonly hooks: HooksDefinition;
    readonly viewModel?: C;
    readonly bindingContext?: C & IIndexable;
    readonly host?: T;
    readonly vmKind: ViewModelKind;
    readonly scopeParts?: readonly string[];
    readonly isStrictBinding?: boolean;
    scope?: IScope;
    part?: string;
    projector?: IElementProjector;
    nodes?: INodeSequence<T>;
    context?: IContainer | IRenderContext<T>;
    location?: IRenderLocation<T>;
    lockScope(scope: IScope): void;
    hold(location: IRenderLocation<T>, mountStrategy: MountStrategy): void;
    release(flags: LifecycleFlags): boolean;
    bind(flags: LifecycleFlags, scope?: IScope, partName?: string): ILifecycleTask;
    unbind(flags: LifecycleFlags): ILifecycleTask;
    bound(flags: LifecycleFlags): void;
    unbound(flags: LifecycleFlags): void;
    attach(flags: LifecycleFlags): void;
    detach(flags: LifecycleFlags): void;
    attached(flags: LifecycleFlags): void;
    detached(flags: LifecycleFlags): void;
    mount(flags: LifecycleFlags): void;
    unmount(flags: LifecycleFlags): void;
    cache(flags: LifecycleFlags): void;
    getTargetAccessor(propertyName: string): IBindingTargetAccessor | undefined;
}
export declare const IController: import("@aurelia/kernel").InterfaceSymbol<IController<INode, IViewModel<INode>>>;
/**
 * Describing characteristics of a mounting operation a controller will perform
 */
export declare const enum MountStrategy {
    insertBefore = 1,
    append = 2
}
export interface IRenderContext<T extends INode = INode> extends IContainer {
    readonly parentId: number;
    render(flags: LifecycleFlags, renderable: IController<T>, targets: ArrayLike<object>, templateDefinition: CustomElementDefinition, host?: T, parts?: PartialCustomElementDefinitionParts): void;
    beginComponentOperation(renderable: IController<T>, target: object, instruction: ITargetedInstruction, factory?: IViewFactory<T> | null, parts?: PartialCustomElementDefinitionParts, location?: IRenderLocation<T>, locationIsContainer?: boolean): IDisposable;
}
export interface IViewCache<T extends INode = INode> {
    readonly isCaching: boolean;
    setCacheSize(size: number | '*', doNotOverrideIfAlreadySet: boolean): void;
    canReturnToCache(view: IController<T>): boolean;
    tryReturnToCache(view: IController<T>): boolean;
}
export interface IViewFactory<T extends INode = INode> extends IViewCache<T> {
    readonly parentContextId: number;
    readonly name: string;
    readonly parts: PartialCustomElementDefinitionParts;
    create(flags?: LifecycleFlags): IController<T>;
    addParts(parts: PartialCustomElementDefinitionParts): void;
}
export declare const IViewFactory: import("@aurelia/kernel").InterfaceSymbol<IViewFactory<INode>>;
/**
 * Defines optional lifecycle hooks that will be called only when they are implemented.
 */
export interface IViewModel<T extends INode = INode> {
    readonly $controller?: IController<T, this>;
    created?(flags: LifecycleFlags): void;
    binding?(flags: LifecycleFlags): MaybePromiseOrTask;
    bound?(flags: LifecycleFlags): void;
    unbinding?(flags: LifecycleFlags): MaybePromiseOrTask;
    unbound?(flags: LifecycleFlags): void;
    attaching?(flags: LifecycleFlags): void;
    attached?(flags: LifecycleFlags): void;
    detaching?(flags: LifecycleFlags): void;
    detached?(flags: LifecycleFlags): void;
    caching?(flags: LifecycleFlags): void;
}
export interface IHydratedViewModel<T extends INode = INode> extends IViewModel<T> {
    readonly $controller: IController<T, this>;
}
export interface ILifecycle {
    readonly batch: IAutoProcessingQueue<IBatchable>;
    readonly mount: IProcessingQueue<IController>;
    readonly unmount: IProcessingQueue<IController>;
    readonly bound: IAutoProcessingQueue<IController>;
    readonly unbound: IAutoProcessingQueue<IController>;
    readonly attached: IAutoProcessingQueue<IController>;
    readonly detached: IAutoProcessingQueue<IController>;
}
export declare const ILifecycle: import("@aurelia/kernel").InterfaceSymbol<ILifecycle>;
export interface IProcessingQueue<T> {
    add(requestor: T): void;
    remove(requestor: T): void;
    process(flags: LifecycleFlags): void;
}
export interface IAutoProcessingQueue<T> extends IProcessingQueue<T> {
    readonly depth: number;
    begin(): void;
    end(flags?: LifecycleFlags): void;
    inline(fn: () => void, flags?: LifecycleFlags): void;
}
export declare class BoundQueue implements IAutoProcessingQueue<IController> {
    readonly lifecycle: ILifecycle;
    depth: number;
    head?: IController;
    tail?: IController;
    constructor(lifecycle: ILifecycle);
    begin(): void;
    end(flags?: LifecycleFlags): void;
    inline(fn: () => void, flags?: LifecycleFlags): void;
    add(controller: IController): void;
    remove(controller: IController): void;
    process(flags: LifecycleFlags): void;
}
export declare class UnboundQueue implements IAutoProcessingQueue<IController> {
    readonly lifecycle: ILifecycle;
    depth: number;
    head?: IController;
    tail?: IController;
    constructor(lifecycle: ILifecycle);
    begin(): void;
    end(flags?: LifecycleFlags): void;
    inline(fn: () => void, flags?: LifecycleFlags): void;
    add(controller: IController): void;
    remove(controller: IController): void;
    process(flags: LifecycleFlags): void;
}
export declare class AttachedQueue implements IAutoProcessingQueue<IController> {
    readonly lifecycle: ILifecycle;
    depth: number;
    head?: IController;
    tail?: IController;
    constructor(lifecycle: ILifecycle);
    begin(): void;
    end(flags?: LifecycleFlags): void;
    inline(fn: () => void, flags?: LifecycleFlags): void;
    add(controller: IController): void;
    remove(controller: IController): void;
    process(flags: LifecycleFlags): void;
}
export declare class DetachedQueue implements IAutoProcessingQueue<IController> {
    readonly lifecycle: ILifecycle;
    depth: number;
    head?: IController;
    tail?: IController;
    constructor(lifecycle: ILifecycle);
    begin(): void;
    end(flags?: LifecycleFlags): void;
    inline(fn: () => void, flags?: LifecycleFlags): void;
    add(controller: IController): void;
    remove(controller: IController): void;
    process(flags: LifecycleFlags): void;
}
export declare class MountQueue implements IProcessingQueue<IController> {
    readonly lifecycle: ILifecycle;
    head?: IController;
    tail?: IController;
    constructor(lifecycle: ILifecycle);
    add(controller: IController): void;
    remove(controller: IController): void;
    process(flags: LifecycleFlags): void;
}
export declare class UnmountQueue implements IProcessingQueue<IController> {
    readonly lifecycle: ILifecycle;
    head?: IController;
    tail?: IController;
    constructor(lifecycle: ILifecycle);
    add(controller: IController): void;
    remove(controller: IController): void;
    process(flags: LifecycleFlags): void;
}
export declare class BatchQueue implements IAutoProcessingQueue<IBatchable> {
    readonly lifecycle: ILifecycle;
    queue: IBatchable[];
    depth: number;
    constructor(lifecycle: ILifecycle);
    begin(): void;
    end(flags?: LifecycleFlags): void;
    inline(fn: () => void, flags?: LifecycleFlags): void;
    add(requestor: IBatchable): void;
    remove(requestor: IBatchable): void;
    process(flags: LifecycleFlags): void;
}
export declare class Lifecycle implements ILifecycle {
    readonly batch: IAutoProcessingQueue<IBatchable>;
    readonly mount: IProcessingQueue<IController>;
    readonly unmount: IProcessingQueue<IController>;
    readonly bound: IAutoProcessingQueue<IController>;
    readonly unbound: IAutoProcessingQueue<IController>;
    readonly attached: IAutoProcessingQueue<IController>;
    readonly detached: IAutoProcessingQueue<IController>;
    constructor();
    static register(container: IContainer): IResolver<ILifecycle>;
}
//# sourceMappingURL=lifecycle.d.ts.map