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
    private suspenderTask;
    private pendingAsyncCount;
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
    /**
     * Persistent tasks will re-queue themselves indefinitely until they are explicitly canceled,
     * so we consider them 'infinite work' whereas non-persistent (one-off) tasks are 'finite work'.
     *
     * This `hasNoMoreFiniteWork` getters returns true if either all remaining tasks are persistent, or if there are no more tasks.
     *
     * If that is the case, we can resolve the promise that was created when `yield()` is called.
     */
    private get hasNoMoreFiniteWork();
    constructor(now: Now, priority: TaskQueuePriority, scheduler: IScheduler, flushRequestorFactory: IFlushRequestorFactory);
    flush(): void;
    /**
     * Cancel the next flush cycle (and/or the macrotask that schedules the next flush cycle, in case this is a microtask queue), if it was requested.
     *
     * This operation is idempotent and will do nothing if no flush is scheduled.
     */
    cancel(): void;
    /**
     * Returns a promise that, when awaited, resolves when:
     * - all *non*-persistent (including async) tasks have finished;
     * - the last-added persistent task has run exactly once;
     *
     * This operation is idempotent: the same promise will be returned until it resolves.
     *
     * If `yield()` is called multiple times in a row when there are one or more persistent tasks in the queue, each call will await exactly one cycle of those tasks.
     */
    yield(): Promise<void>;
    queueTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): Task<T>;
    /**
     * Take this task from the taskQueue it's currently queued to, and add it to this queue.
     */
    take(task: Task): void;
    /**
     * Remove the task from this queue.
     */
    remove<T = any>(task: Task<T>): void;
    /**
     * Return a reusable task to the shared task pool.
     * The next queued callback will reuse this task object instead of creating a new one, to save overhead of creating additional objects.
     */
    returnToPool(task: Task): void;
    /**
     * Reset the persistent task back to its pending state, preparing it for being invoked again on the next flush.
     */
    resetPersistentTask(task: Task): void;
    /**
     * Notify the queue that this async task has had its promise resolved, so that the queue can proceed with consecutive tasks on the next flush.
     */
    completeAsyncTask(task: Task): void;
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
    private requestFlushClamped;
}
//# sourceMappingURL=task-queue.d.ts.map