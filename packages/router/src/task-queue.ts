import { IScheduler, ITask, ILifecycleTask } from '@aurelia/runtime';
import { bound } from '@aurelia/kernel';

export interface IQueueableItem<T> {
  execute: ((task: QueueTask<IQueueableItem<T>>) => void | Promise<void>);
}
export type QueueableFunction = ((task: QueueTask<void>) => void | Promise<void>);

export class QueueTask<T> implements ILifecycleTask {
  public done: boolean = false;
  private readonly promise: Promise<void>;

  public resolve!: ((value: void | PromiseLike<void>) => void);
  public reject!: ((value: unknown | PromiseLike<unknown>) => void);

  public constructor(
    private readonly taskQueue: TaskQueue<T>,
    public item: IQueueableItem<T> | QueueableFunction,
    public cost: number = 0,
  ) {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = () => {
        this.taskQueue.resolve(this, resolve);
      };
      this.reject = (reason: unknown) => {
        this.taskQueue.reject(this, reject, reason);
      };
    });
  }

  public async execute(): Promise<void> {
    if ('execute' in this.item) {
      await this.item.execute(this);
    } else {
      await this.item(this);
    }
  }
  public wait(): Promise<void> {
    return this.promise;
  }
  public canCancel(): boolean {
    return false;
  }
  public cancel(): void { return; }
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
export class TaskQueue<T> {
  public get isActive(): boolean {
    return this.task !== null;
  }
  public readonly pending: QueueTask<T>[] = [];
  public processing: QueueTask<T> | null = null;
  public allowedExecutionCostWithinTick: number | null = null;
  public currentExecutionCostInCurrentTick: number = 0;
  private scheduler: IScheduler | null = null;
  private task: ITask | null = null;

  public constructor(
    private readonly callback?: (task: QueueTask<T>) => void
  ) { }

  public get length(): number {
    return this.pending.length;
  }

  public activate(options: ITaskQueueOptions): void {
    if (this.isActive) {
      throw new Error('TaskQueue has already been activated');
    }
    this.scheduler = options.scheduler;
    this.allowedExecutionCostWithinTick = options.allowedExecutionCostWithinTick;
    this.task = this.scheduler.queueRenderTask(this.dequeue, { persistent: true });
  }
  public deactivate(): void {
    if (!this.isActive) {
      throw new Error('TaskQueue has not been activated');
    }
    this.task!.cancel();
    this.task = null;
    this.allowedExecutionCostWithinTick = null;
    this.clear();
  }

  public enqueue(item: IQueueableItem<T> | QueueableFunction, cost?: number): QueueTask<T>;
  public enqueue(items: (IQueueableItem<T> | QueueableFunction)[], cost?: number): QueueTask<T>[];
  public enqueue(items: (IQueueableItem<T> | QueueableFunction)[], costs?: number[]): QueueTask<T>[];
  public enqueue(task: QueueTask<T>): QueueTask<T>;
  public enqueue(tasks: QueueTask<T>[]): QueueTask<T>[];
  public enqueue(itemOrItems: IQueueableItem<T> | QueueableFunction | (IQueueableItem<T> | QueueableFunction)[] | QueueTask<T> | QueueTask<T>[], costOrCosts?: number | number[]): QueueTask<T> | QueueTask<T>[] {
    const list: boolean = Array.isArray(itemOrItems);
    const items: (IQueueableItem<T> | QueueTask<T>)[] = (list ? itemOrItems : [itemOrItems]) as (IQueueableItem<T> | QueueTask<T>)[];
    const costs: number[] = items
      .map((value: IQueueableItem<T> | QueueTask<T>, index: number): number | undefined => !Array.isArray(costOrCosts) ? costOrCosts : costOrCosts[index])
      .map((value: number | undefined): number => value !== undefined ? value : 1);
    const tasks: QueueTask<T>[] = [];
    for (const item of items) {
      tasks.push(item instanceof QueueTask
        ? item
        : this.createQueueTask(item, costs.shift())); // TODO: Get cancellable in as well
    }
    this.pending.push(...tasks);
    this.dequeue();
    return list ? tasks : tasks[0];
  }

  public createQueueTask(item: IQueueableItem<T> | QueueableFunction, cost?: number): QueueTask<T> {
    return new QueueTask(this, item, cost);
  }

  @bound
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
      if (this.callback !== void 0) {
        this.callback(this.processing);
      } else {
        // Don't need to await this since next task won't be dequeued until
        // executed function is resolved
        this.processing.execute().catch(error => { throw error; });
      }
    }
  }

  public clear(): void {
    this.pending.splice(0, this.pending.length);
  }

  public resolve(task: QueueTask<T>, resolve: ((value: void | PromiseLike<void>) => void)): void {
    resolve();
    this.processing = null;
    this.dequeue();
  }
  public reject(task: QueueTask<T>, reject: ((value: unknown | PromiseLike<unknown>) => void), reason: unknown): void {
    reject(reason);
    this.processing = null;
    this.dequeue();
  }
}
