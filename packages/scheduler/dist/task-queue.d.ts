import { QueueTaskOptions, TaskQueuePriority } from './types';
import { Now } from './now';
import { Task, ITask } from './task';
import { IScheduler } from './scheduler';
export interface IFlushRequestorFactory {
    create(taskQueue: ITaskQueue): IFlushRequestor;
}
export interface IFlushRequestor {
    request(): void;
    cancel(): void;
}
export declare type TaskCallback<T = any> = (delta: number) => T;
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
    readonly now: Now;
    readonly priority: TaskQueuePriority;
    private readonly scheduler;
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
    private readonly taskPool;
    private taskPoolSize;
    private lastRequest;
    private microTaskRequestFlushTask;
    private readonly flushRequestor;
    get isEmpty(): boolean;
    constructor(now: Now, priority: TaskQueuePriority, scheduler: IScheduler, flushRequestorFactory: IFlushRequestorFactory);
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
//# sourceMappingURL=task-queue.d.ts.map