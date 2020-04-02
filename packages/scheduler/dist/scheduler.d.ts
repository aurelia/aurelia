import { QueueTaskOptions, QueueTaskTargetOptions, TaskQueuePriority } from './types';
import { IFlushRequestorFactory, ITaskQueue, TaskCallback, TaskQueue } from './task-queue';
import { Now } from './now';
import { Task, ITask } from './task';
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
export declare class Scheduler implements IScheduler {
    private readonly taskQueues;
    private readonly microtask;
    private readonly render;
    private readonly macroTask;
    private readonly postRender;
    private readonly idle;
    constructor(now: Now, microtaskFactory: IFlushRequestorFactory, renderFactory: IFlushRequestorFactory, macroTaskFactory: IFlushRequestorFactory, postRenderFactory: IFlushRequestorFactory, idleFactory: IFlushRequestorFactory);
    static get(key: object): IScheduler | undefined;
    static set(key: object, instance: IScheduler): void;
    getTaskQueue(priority: TaskQueuePriority): TaskQueue;
    yield(priority: TaskQueuePriority): Promise<void>;
    queueTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskTargetOptions): Task<T>;
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
//# sourceMappingURL=scheduler.d.ts.map