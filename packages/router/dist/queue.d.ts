import { ILifecycle } from '@aurelia/runtime';
export interface QueueItem<T> {
    resolve?: ((value?: void | PromiseLike<void>) => void);
    reject?: ((value?: void | PromiseLike<void>) => void);
    cost?: number;
}
export interface IQueueOptions {
    lifecycle: ILifecycle;
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
    isActive: boolean;
    readonly pending: QueueItem<T>[];
    processing: QueueItem<T>;
    allowedExecutionCostWithinTick: number;
    currentExecutionCostInCurrentTick: number;
    private readonly callback;
    private lifecycle;
    constructor(callback: (item?: QueueItem<T>) => void);
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