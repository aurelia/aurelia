import { ILifecycle, Priority } from '@aurelia/runtime';

export interface QueueItem<T> {
  resolve?: ((value: void | PromiseLike<void>) => void);
  reject?: ((value: void | PromiseLike<void>) => void);
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
export class Queue<T> {
  public isActive: boolean = false;
  public readonly pending: QueueItem<T>[] = [];
  public processing: QueueItem<T> | null = null;
  public allowedExecutionCostWithinTick: number | null = null;
  public currentExecutionCostInCurrentTick: number = 0;
  private lifecycle: ILifecycle | null = null;

  constructor(
    private readonly callback: (item: QueueItem<T>) => void
  ) { }

  public get length(): number {
    return this.pending.length;
  }

  public activate(options: IQueueOptions): void {
    if (this.isActive) {
      throw new Error('Queue has already been activated');
    }
    this.isActive = true;
    this.lifecycle = options.lifecycle;
    this.allowedExecutionCostWithinTick = options.allowedExecutionCostWithinTick;
    this.lifecycle.enqueueRAF(this.dequeue, this, Priority.preempt);
  }
  public deactivate(): void {
    if (!this.isActive) {
      throw new Error('Queue has not been activated');
    }
    this.lifecycle!.dequeueRAF(this.dequeue, this);
    this.allowedExecutionCostWithinTick = null;
    this.clear();
    this.isActive = false;
  }

  public enqueue(item: T, cost?: number): Promise<void>;
  public enqueue(items: T[], cost?: number): Promise<void>[];
  public enqueue(items: T[], costs?: number[]): Promise<void>[];
  public enqueue(itemOrItems: T | T[], costOrCosts?: number | number[]): Promise<void> | Promise<void>[] {
    const list = Array.isArray(itemOrItems);
    const items: T[] = list ? itemOrItems as T[] : [itemOrItems as T];
    const costs: number[] = items
      .map((value, index) => !Array.isArray(costOrCosts) ? costOrCosts : costOrCosts[index])
      .map(value => value !== undefined ? value : 1);
    const promises: Promise<void>[] = [];
    for (const item of items) {
      const qItem: QueueItem<T> = { ...item };
      qItem.cost = costs.shift();
      promises.push(new Promise((resolve, reject) => {
        qItem.resolve = () => {
          resolve();
          this.processing = null;
          this.dequeue();
        };
        qItem.reject = (reason: unknown) => {
          reject(reason);
          this.processing = null;
          this.dequeue();
        };
      }));
      this.pending.push(qItem);
    }
    this.dequeue();
    return list ? promises : promises[0];
  }

  public dequeue(delta?: number): void {
    if (this.processing !== null) {
      return;
    }
    if (delta !== undefined) {
      this.currentExecutionCostInCurrentTick = 0;
    }
    if (!this.pending.length) {
      return;
    }
    if (this.allowedExecutionCostWithinTick !== null && delta === undefined && this.currentExecutionCostInCurrentTick + (this.pending[0].cost || 0) > this.allowedExecutionCostWithinTick) {
      return;
    }
    this.processing = this.pending.shift() || null;
    if (this.processing) {
      this.currentExecutionCostInCurrentTick += this.processing.cost || 0;
      this.callback(this.processing);
    }
  }

  public clear(): void {
    this.pending.splice(0, this.pending.length);
  }
}
