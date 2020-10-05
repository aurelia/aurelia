import { IContainer, IResolver, IServiceLocator, Key, Resolved } from '@aurelia/kernel';
export declare type PromiseOrTask = Promise<unknown> | ILifecycleTask;
export declare type MaybePromiseOrTask = void | PromiseOrTask;
export declare const LifecycleTask: {
    done: {
        done: boolean;
        wait(): Promise<unknown>;
    };
};
export declare const enum TaskSlot {
    beforeCreate = 0,
    beforeCompile = 1,
    beforeCompileChildren = 2,
    beforeActivate = 3,
    afterActivate = 4,
    beforeDeactivate = 5,
    afterDeactivate = 6
}
export declare const IStartTask: import("@aurelia/kernel").InterfaceSymbol<IStartTask>;
export interface IStartTask {
    readonly slot: TaskSlot;
    resolveTask(): ILifecycleTask;
    register(container: IContainer): IContainer;
}
export interface ISlotChooser {
    beforeCreate(): IStartTask;
    beforeCompile(): IStartTask;
    beforeCompileChildren(): IStartTask;
    beforeActivate(): IStartTask;
    afterActivate(): IStartTask;
    beforeDeactivate(): IStartTask;
    afterDeactivate(): IStartTask;
    at(slot: TaskSlot): IStartTask;
}
export interface ICallbackSlotChooser<K extends Key> {
    beforeCreate(): ICallbackChooser<K>;
    beforeCompile(): ICallbackChooser<K>;
    beforeCompileChildren(): ICallbackChooser<K>;
    beforeActivate(): ICallbackChooser<K>;
    afterActivate(): ICallbackChooser<K>;
    beforeDeactivate(): ICallbackChooser<K>;
    afterDeactivate(): ICallbackChooser<K>;
    at(slot: TaskSlot): ICallbackChooser<K>;
}
export interface ICallbackChooser<K extends Key> {
    call<K1 extends Key = K>(fn: (instance: Resolved<K1>) => MaybePromiseOrTask): IStartTask;
}
export declare const AppTask: {
    with<K extends Key>(key: K): ICallbackSlotChooser<K>;
    from(task: ILifecycleTask): ISlotChooser;
    from(promise: Promise<unknown>): ISlotChooser;
    from(promiseOrTask: PromiseOrTask): ISlotChooser;
};
export declare const IStartTaskManager: import("@aurelia/kernel").InterfaceSymbol<IStartTaskManager>;
export interface IStartTaskManager {
    /**
     * This is internal API and will be moved to an inaccessible place in the near future.
     */
    enqueueBeforeCompileChildren(): void;
    runBeforeCreate(container?: IContainer): ILifecycleTask;
    runBeforeCompile(container?: IContainer): ILifecycleTask;
    runBeforeCompileChildren(container?: IContainer): ILifecycleTask;
    runBeforeActivate(container?: IContainer): ILifecycleTask;
    runAfterActivate(container?: IContainer): ILifecycleTask;
    runBeforeDeactivate(container?: IContainer): ILifecycleTask;
    runAfterDeactivate(container?: IContainer): ILifecycleTask;
    run(slot: TaskSlot, container?: IContainer): ILifecycleTask;
}
export declare class StartTaskManager implements IStartTaskManager {
    private readonly locator;
    private beforeCompileChildrenQueued;
    constructor(locator: IServiceLocator);
    static register(container: IContainer): IResolver<IStartTaskManager>;
    enqueueBeforeCompileChildren(): void;
    runBeforeCreate(locator?: IServiceLocator): ILifecycleTask;
    runBeforeCompile(locator?: IServiceLocator): ILifecycleTask;
    runBeforeCompileChildren(locator?: IServiceLocator): ILifecycleTask;
    runBeforeActivate(locator?: IServiceLocator): ILifecycleTask;
    runAfterActivate(locator?: IServiceLocator): ILifecycleTask;
    runBeforeDeactivate(locator?: IServiceLocator): ILifecycleTask;
    runAfterDeactivate(locator?: IServiceLocator): ILifecycleTask;
    run(slot: TaskSlot, locator?: IServiceLocator): ILifecycleTask;
}
export interface ILifecycleTask<T = unknown> {
    readonly done: boolean;
    wait(): Promise<T>;
}
export declare class PromiseTask<TArgs extends unknown[], T = void> implements ILifecycleTask {
    done: boolean;
    private readonly promise;
    constructor(promise: Promise<T>, next: ((result?: T, ...args: TArgs) => MaybePromiseOrTask) | null, context: unknown, ...args: TArgs);
    wait(): Promise<unknown>;
}
export declare class ProviderTask implements ILifecycleTask {
    private container;
    private key;
    private callback;
    done: boolean;
    private promise?;
    constructor(container: IContainer, key: Key, callback: (instance: unknown) => PromiseOrTask);
    wait(): Promise<unknown>;
}
export declare class ContinuationTask<TArgs extends unknown[]> implements ILifecycleTask {
    done: boolean;
    private readonly promise;
    constructor(antecedent: Promise<unknown> | ILifecycleTask, next: (...args: TArgs) => MaybePromiseOrTask, context: unknown, ...args: TArgs);
    wait(): Promise<unknown>;
}
export declare class TerminalTask implements ILifecycleTask {
    done: boolean;
    private readonly promise;
    constructor(antecedent: Promise<unknown> | ILifecycleTask);
    wait(): Promise<unknown>;
}
export declare class AggregateContinuationTask<TArgs extends unknown[]> implements ILifecycleTask {
    done: boolean;
    private readonly promise;
    constructor(antecedents: ILifecycleTask[], next: (...args: TArgs) => void | ILifecycleTask, context: unknown, ...args: TArgs);
    wait(): Promise<unknown>;
}
export declare class AggregateTerminalTask implements ILifecycleTask {
    done: boolean;
    private readonly promise;
    constructor(antecedents: ILifecycleTask[]);
    wait(): Promise<unknown>;
}
export declare function hasAsyncWork(value: MaybePromiseOrTask): value is PromiseOrTask;
//# sourceMappingURL=lifecycle-task.d.ts.map