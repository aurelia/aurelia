import { IScheduler, ILifecycleTask } from '@aurelia/runtime';
export interface IQueueableItem<T> {
    execute: ((task: QueueTask<IQueueableItem<T>>) => void | Promise<void>);
}
export declare type QueueableFunction = ((task: QueueTask<void>) => void | Promise<void>);
export declare class QueueTask<T> implements ILifecycleTask {
    private readonly taskQueue;
    item: IQueueableItem<T> | QueueableFunction;
    cost: number;
    done: boolean;
    private readonly promise;
    resolve: ((value: void | PromiseLike<void>) => void);
    reject: ((value: unknown | PromiseLike<unknown>) => void);
    constructor(taskQueue: TaskQueue<T>, item: IQueueableItem<T> | QueueableFunction, cost?: number);
    execute(): Promise<void>;
    wait(): Promise<void>;
    canCancel(): boolean;
    cancel(): void;
}
export interface ITaskQueueOptions {
    scheduler: IScheduler;
    allowedExecutionCostWithinTick: number;
}
/**
 * A first-in-first-out task queue that only processes the next queued item
 * when the current one has been resolved or rejected. If a callback function
 * is specified, it receives the queued items as tasks one at a time. If no
 * callback is specified, the tasks themselves are either executed (if a
 * function) or the execute method in them are run. The executed function
 * should resolve or reject the task when processing is done.
 * Enqueued items' tasks can be awaited. Enqueued items can specify an
 * (arbitrary) execution cost and the queue can be set up (activated) to
 * only process a specific amount of execution cost per RAF/tick.
 */
export declare class TaskQueue<T> {
    private readonly callback?;
    get isActive(): boolean;
    readonly pending: QueueTask<T>[];
    processing: QueueTask<T> | null;
    allowedExecutionCostWithinTick: number | null;
    currentExecutionCostInCurrentTick: number;
    private scheduler;
    private task;
    constructor(callback?: ((task: QueueTask<T>) => void) | undefined);
    get length(): number;
    activate(options: ITaskQueueOptions): void;
    deactivate(): void;
    enqueue(item: IQueueableItem<T> | QueueableFunction, cost?: number): QueueTask<T>;
    enqueue(items: (IQueueableItem<T> | QueueableFunction)[], cost?: number): QueueTask<T>[];
    enqueue(items: (IQueueableItem<T> | QueueableFunction)[], costs?: number[]): QueueTask<T>[];
    enqueue(task: QueueTask<T>): QueueTask<T>;
    enqueue(tasks: QueueTask<T>[]): QueueTask<T>[];
    createQueueTask(item: IQueueableItem<T> | QueueableFunction, cost?: number): QueueTask<T>;
    dequeue(delta?: number): void;
    clear(): void;
    resolve(task: QueueTask<T>, resolve: ((value: void | PromiseLike<void>) => void)): void;
    reject(task: QueueTask<T>, reject: ((value: unknown | PromiseLike<unknown>) => void), reason: unknown): void;
}
//# sourceMappingURL=task-queue.d.ts.map