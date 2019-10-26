import { IContainer } from '@aurelia/kernel';
import { IScheduler, TaskQueuePriority, TaskQueue, IClock, TaskCallback, QueueTaskOptions, Task, ITaskQueue, ITask, QueueTaskTargetOptions } from '@aurelia/runtime';
import { HTMLDOM } from '@aurelia/runtime-html';
export declare class BrowserScheduler implements IScheduler {
    private readonly taskQueue;
    private readonly flush;
    constructor(clock: IClock, dom: HTMLDOM);
    static register(container: IContainer): void;
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
    requestFlush(taskQueue: TaskQueue): void;
    cancelFlush(taskQueue: TaskQueue): void;
}
//# sourceMappingURL=browser-scheduler.d.ts.map