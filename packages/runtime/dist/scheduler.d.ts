import { IContainer, IResolver } from '@aurelia/kernel';
export interface IClockSettings {
    forceUpdateInterval?: number;
    now?(): number;
}
export declare const IClock: import("@aurelia/kernel").InterfaceSymbol<IClock>;
export interface IClock {
    now(highRes?: boolean): number;
}
export declare class Clock implements IClock {
    readonly now: () => number;
    constructor(opts?: IClockSettings);
    static register(container: IContainer): IResolver<IClock>;
}
export declare const globalClock: Clock;
export declare const enum TaskQueuePriority {
    microTask = 0,
    render = 1,
    macroTask = 2,
    postRender = 3,
    idle = 4
}
export declare type TaskStatus = 'pending' | 'running' | 'completed' | 'canceled';
export declare type TaskCallback<T = any> = (delta: number) => T;
export declare const IScheduler: import("@aurelia/kernel").InterfaceSymbol<IScheduler>;
export interface IScheduler {
    getTaskQueue(priority: TaskQueuePriority): ITaskQueue;
    yield(priority: TaskQueuePriority): Promise<void>;
    queueTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskTargetOptions): ITask<T>;
    getMicroTaskQueue(): ITaskQueue;
    getRenderTaskQueue(): ITaskQueue;
    getMacroTaskQueue(): ITaskQueue;
    getPostRenderTaskQueue(): ITaskQueue;
    getIdleTaskQueue(): ITaskQueue;
    yieldMicroTask(): Promise<void>;
    yieldRenderTask(): Promise<void>;
    yieldMacroTask(): Promise<void>;
    yieldPostRenderTask(): Promise<void>;
    yieldIdleTask(): Promise<void>;
    yieldAll(repeat?: number): Promise<void>;
    queueMicroTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
    queueRenderTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
    queueMacroTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
    queuePostRenderTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
    queueIdleTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
}
declare type TaskQueueOptions = {
    clock: IClock;
    priority: TaskQueuePriority;
    scheduler: IScheduler;
};
export declare type QueueTaskOptions = {
    /**
     * The number of milliseconds to wait before queueing the task.
     *
     * NOTE: just like `setTimeout`, there is no guarantee that the task will actually run
     * after the specified delay. It is merely a *minimum* delay.
     *
     * Defaults to `0`
     */
    delay?: number;
    /**
     * If `true`, the task will be run synchronously if it is the same priority as the
     * `TaskQueue` that is currently flushing. Otherwise, it will be run on the next tick.
     *
     * Defaults to `false`
     */
    preempt?: boolean;
    /**
     * If `true`, the task will be added back onto the queue after it finished running, indefinitely, until manually canceled.
     *
     * Defaults to `false`
     */
    persistent?: boolean;
    /**
     * If `true`, the task will be kept in-memory after finishing, so that it can be reused for future tasks for efficiency.
     *
     * Defaults to `true`
     */
    reusable?: boolean;
};
export declare type QueueTaskTargetOptions = QueueTaskOptions & {
    priority?: TaskQueuePriority;
};
export interface ITaskQueue {
    readonly priority: TaskQueuePriority;
    flush(): void;
    cancel(): void;
    yield(): Promise<void>;
    queueTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
    take(task: ITask): void;
    remove(task: ITask): void;
}
export declare class TaskQueue {
    readonly priority: TaskQueuePriority;
    private processingSize;
    private processingHead;
    private processingTail;
    private pendingSize;
    private pendingHead;
    private pendingTail;
    private delayedSize;
    private delayedHead;
    private delayedTail;
    private flushRequested;
    private yieldPromise;
    private readonly scheduler;
    private readonly clock;
    private readonly taskPool;
    private taskPoolSize;
    private lastRequest;
    private microTaskRequestFlushTask;
    readonly isEmpty: boolean;
    constructor({ clock, priority, scheduler }: TaskQueueOptions);
    flush(): void;
    cancel(): void;
    yield(): Promise<void>;
    queueTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): Task<T>;
    take(task: Task): void;
    remove<T = any>(task: Task<T>): void;
    returnToPool(task: Task): void;
    resetPersistentTask(task: Task): void;
    private finish;
    private removeFromProcessing;
    private removeFromPending;
    private removeFromDelayed;
    private addToProcessing;
    private addToPending;
    private addToDelayed;
    private movePendingToProcessing;
    private moveDelayedToProcessing;
    private requestFlush;
}
export declare class TaskAbortError<T = any> extends Error {
    task: Task<T>;
    constructor(task: Task<T>);
}
export interface ITask<T = any> {
    readonly result: Promise<T>;
    readonly status: TaskStatus;
    readonly priority: TaskQueuePriority;
    run(): void;
    cancel(): boolean;
}
export declare class Task<T = any> implements ITask {
    readonly taskQueue: TaskQueue;
    createdTime: number;
    queueTime: number;
    preempt: boolean;
    persistent: boolean;
    readonly reusable: boolean;
    callback: TaskCallback<T>;
    readonly id: number;
    next: Task<T> | undefined;
    prev: Task<T> | undefined;
    private resolve;
    private reject;
    private _result;
    readonly result: Promise<T>;
    private _status;
    readonly status: TaskStatus;
    readonly priority: TaskQueuePriority;
    constructor(taskQueue: TaskQueue, createdTime: number, queueTime: number, preempt: boolean, persistent: boolean, reusable: boolean, callback: TaskCallback<T>);
    run(): void;
    cancel(): boolean;
    reset(time: number): void;
    reuse(time: number, delay: number, preempt: boolean, persistent: boolean, callback: TaskCallback<T>): void;
    dispose(): void;
}
export {};
//# sourceMappingURL=scheduler.d.ts.map