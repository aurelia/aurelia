import { IContainer, IResolver, IServiceLocator, Key, Resolved } from '@aurelia/kernel';
export declare type PromiseOrTask = Promise<unknown> | ILifecycleTask;
export declare type MaybePromiseOrTask = void | PromiseOrTask;
export declare const LifecycleTask: {
    done: {
        done: boolean;
        canCancel(): boolean;
        cancel(): void;
        wait(): Promise<unknown>;
    };
};
export declare const enum TaskSlot {
    beforeCreate = 0,
    beforeRender = 1,
    beforeBind = 2,
    beforeAttach = 3
}
export declare const IStartTask: import("@aurelia/kernel").InterfaceSymbol<IStartTask>;
export interface IStartTask {
    readonly slot: TaskSlot;
    resolveTask(): ILifecycleTask;
    register(container: IContainer): IContainer;
}
export interface ISlotChooser {
    beforeCreate(): IStartTask;
    beforeRender(): IStartTask;
    beforeBind(): IStartTask;
    beforeAttach(): IStartTask;
    at(slot: TaskSlot): IStartTask;
}
export interface ICallbackSlotChooser<K extends Key> {
    beforeCreate(): ICallbackChooser<K>;
    beforeRender(): ICallbackChooser<K>;
    beforeBind(): ICallbackChooser<K>;
    beforeAttach(): ICallbackChooser<K>;
    at(slot: TaskSlot): ICallbackChooser<K>;
}
export interface ICallbackChooser<K extends Key> {
    call<K1 extends Key = K>(fn: (instance: Resolved<K1>) => MaybePromiseOrTask): IStartTask;
}
export declare const StartTask: {
    with<K extends Key>(key: K): ICallbackSlotChooser<K>;
    from(task: ILifecycleTask<unknown>): ISlotChooser;
    from(promise: Promise<unknown>): ISlotChooser;
    from(promiseOrTask: PromiseOrTask): ISlotChooser;
};
export declare const IStartTaskManager: import("@aurelia/kernel").InterfaceSymbol<IStartTaskManager>;
export interface IStartTaskManager {
    runBeforeCreate(container?: IContainer): ILifecycleTask;
    runBeforeRender(container?: IContainer): ILifecycleTask;
    runBeforeBind(container?: IContainer): ILifecycleTask;
    runBeforeAttach(container?: IContainer): ILifecycleTask;
    run(slot: TaskSlot, container?: IContainer): ILifecycleTask;
}
export declare class StartTaskManager implements IStartTaskManager {
    private readonly locator;
    static readonly inject: readonly Key[];
    constructor(locator: IServiceLocator);
    static register(container: IContainer): IResolver<IStartTaskManager>;
    runBeforeCreate(locator?: IServiceLocator): ILifecycleTask;
    runBeforeRender(locator?: IServiceLocator): ILifecycleTask;
    runBeforeBind(locator?: IServiceLocator): ILifecycleTask;
    runBeforeAttach(locator?: IServiceLocator): ILifecycleTask;
    run(slot: TaskSlot, locator?: IServiceLocator): ILifecycleTask;
}
export interface ILifecycleTask<T = unknown> {
    readonly done: boolean;
    canCancel(): boolean;
    cancel(): void;
    wait(): Promise<T>;
}
export declare class PromiseTask<TArgs extends unknown[], T = void> implements ILifecycleTask {
    done: boolean;
    private hasStarted;
    private isCancelled;
    private readonly promise;
    constructor(promise: Promise<T>, next: ((result?: T, ...args: TArgs) => MaybePromiseOrTask) | null, context: unknown, ...args: TArgs);
    canCancel(): boolean;
    cancel(): void;
    wait(): Promise<unknown>;
}
export declare class ProviderTask implements ILifecycleTask {
    private container;
    private key;
    private callback;
    done: boolean;
    private promise?;
    constructor(container: IContainer, key: Key, callback: (instance: unknown) => PromiseOrTask);
    canCancel(): boolean;
    cancel(): void;
    wait(): Promise<unknown>;
}
export declare class ContinuationTask<TArgs extends unknown[]> implements ILifecycleTask {
    done: boolean;
    private hasStarted;
    private isCancelled;
    private readonly promise;
    constructor(antecedent: Promise<unknown> | ILifecycleTask, next: (...args: TArgs) => MaybePromiseOrTask, context: unknown, ...args: TArgs);
    canCancel(): boolean;
    cancel(): void;
    wait(): Promise<unknown>;
}
export declare class TerminalTask implements ILifecycleTask {
    done: boolean;
    private readonly promise;
    constructor(antecedent: Promise<unknown> | ILifecycleTask);
    canCancel(): boolean;
    cancel(): void;
    wait(): Promise<unknown>;
}
export declare class AggregateContinuationTask<TArgs extends unknown[]> implements ILifecycleTask {
    done: boolean;
    private hasStarted;
    private isCancelled;
    private readonly promise;
    constructor(antecedents: ILifecycleTask[], next: (...args: TArgs) => void | ILifecycleTask, context: unknown, ...args: TArgs);
    canCancel(): boolean;
    cancel(): void;
    wait(): Promise<unknown>;
}
export declare class AggregateTerminalTask implements ILifecycleTask {
    done: boolean;
    private readonly promise;
    constructor(antecedents: ILifecycleTask[]);
    canCancel(): boolean;
    cancel(): void;
    wait(): Promise<unknown>;
}
export declare function hasAsyncWork(value: MaybePromiseOrTask): value is PromiseOrTask;
//# sourceMappingURL=lifecycle-task.d.ts.map