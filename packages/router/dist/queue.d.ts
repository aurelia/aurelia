import { IScheduler } from '@aurelia/runtime';
export interface QueueItem<T> {
    resolve?: ((value: void | PromiseLike<void>) => void);
    reject?: ((value: void | PromiseLike<void>) => void);
    cost?: number;
}
export interface IQueueOptions {
    scheduler: IScheduler;
    allowedExecutionCostWithinTick: number;
}
/**
 * A first-in-first-out queue that only processes the next queued item
 * when the current one has been resolved or rejected. Sends queued items
 * one at a time to a specified callback function. The callback function
 * should resolve or reject the queued item when processing is done.
 * Enqueued items can be awaited. Enqueued items can specify an (arbitrary)
 * execution cost and the queue can be set up (activated) to only process
 * a specific amount of execution cost per RAF/tick.
 */
export declare class Queue<T> {
    private readonly callback;
    readonly isActive: boolean;
    readonly pending: QueueItem<T>[];
    processing: QueueItem<T> | null;
    allowedExecutionCostWithinTick: number | null;
    currentExecutionCostInCurrentTick: number;
    private scheduler;
    private task;
    constructor(callback: (item: QueueItem<T>) => void);
    readonly length: number;
    activate(options: IQueueOptions): void;
    deactivate(): void;
    enqueue(item: T, cost?: number): Promise<void>;
    enqueue(items: T[], cost?: number): Promise<void>[];
    enqueue(items: T[], costs?: number[]): Promise<void>[];
    dequeue(delta?: number): void;
    clear(): void;
}
//# sourceMappingURL=queue.d.ts.map