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