import { IScheduler, ITask, ILifecycleTask } from '@aurelia/runtime';
import { bound } from '@aurelia/kernel';

export type QueueableFunction = ((task: QueueTask<void>) => void | Promise<void>);

export class QueueTask<T> implements ILifecycleTask {
  public done: boolean = false;
  private readonly promise: Promise<void>;

  public resolve!: ((value: void | PromiseLike<void>) => void);
  public reject!: ((value: unknown | PromiseLike<unknown>) => void);

  public constructor(
    private readonly taskQueue: TaskQueue<T>,
    public item: QueueableFunction,
  ) {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = () => {
        resolve();
        this.taskQueue.processing = null;
        this.taskQueue.dequeue();
      };
      this.reject = (reason: unknown) => {
        reject(reason);
        this.taskQueue.processing = null;
        this.taskQueue.dequeue();
      };
    });
  }

  public async execute(): Promise<void> {
    await this.item(this);
  }
  public wait(): Promise<void> {
    return this.promise;
  }
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

  public enqueue(item: QueueableFunction): QueueTask<T> {
    const task = new QueueTask(this, item);
    this.pending.push(task);
    this.dequeue();
    return task;
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
    if (
      this.allowedExecutionCostWithinTick !== null &&
      delta === undefined &&
      this.currentExecutionCostInCurrentTick + 1 > this.allowedExecutionCostWithinTick
    ) {
      return;
    }
    this.processing = this.pending.shift() || null;
    if (this.processing) {
      ++this.currentExecutionCostInCurrentTick;
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
}
