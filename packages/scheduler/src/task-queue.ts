import { IPlatform } from '@aurelia/kernel';
import {
  createExposedPromise,
  defaultQueueTaskOptions,
  ExposedPromise,
  QueueTaskOptions,
  TaskQueuePriority,
} from './types';
import { Task, TaskStatus } from './task';
import { Tracer } from './tracer';

export interface IFlushRequestorFactory {
  create(taskQueue: TaskQueue): IFlushRequestor;
}

export interface IFlushRequestor {
  request(): void;
  cancel(): void;
}

export type TaskCallback<T = any> = (delta: number) => T;

function isPersistent(task: Task): boolean {
  return task.persistent;
}
export class TaskQueue {
  private processing: Task[] = [];

  private suspenderTask: Task | undefined = void 0;
  private pendingAsyncCount: number = 0;

  private pending: Task[] = [];
  private delayed: Task[] = [];

  private flushRequested: boolean = false;
  private yieldPromise: ExposedPromise | undefined = void 0;

  private readonly taskPool: Task[] = [];
  private taskPoolSize: number = 0;
  private lastRequest: number = 0;
  private lastFlush: number = 0;
  private readonly flushRequestor: IFlushRequestor;

  public get isEmpty(): boolean {
    return this.processing.length === 0 && this.pending.length === 0 && this.delayed.length === 0;
  }

  /**
   * Persistent tasks will re-queue themselves indefinitely until they are explicitly canceled,
   * so we consider them 'infinite work' whereas non-persistent (one-off) tasks are 'finite work'.
   *
   * This `hasNoMoreFiniteWork` getters returns true if either all remaining tasks are persistent, or if there are no more tasks.
   *
   * If that is the case, we can resolve the promise that was created when `yield()` is called.
   */
  private get hasNoMoreFiniteWork(): boolean {
    return (
      this.pendingAsyncCount === 0 &&
      this.processing.every(isPersistent) &&
      this.pending.every(isPersistent) &&
      this.delayed.every(isPersistent)
    );
  }

  private readonly tracer: Tracer;
  public constructor(
    public readonly platform: IPlatform,
    public readonly priority: TaskQueuePriority,
    flushRequestorFactory: IFlushRequestorFactory,
  ) {
    this.flushRequestor = flushRequestorFactory.create(this);
    this.tracer = new Tracer(platform.console);
  }

  public flush(time: number = this.platform.performanceNow()): void {
    if (this.tracer.enabled) { this.tracer.enter(this, 'flush'); }

    this.flushRequested = false;
    this.lastFlush = time;

    // Only process normally if we are *not* currently waiting for an async task to finish
    if (this.suspenderTask === void 0) {
      if (this.pending.length > 0) {
        this.processing.push(...this.pending);
        this.pending.length = 0;
      }
      if (this.delayed.length > 0) {
        let i = -1;
        while (++i < this.delayed.length && this.delayed[i].queueTime <= time) { /* do nothing */ }
        this.processing.push(...this.delayed.splice(0, i));
      }

      let cur: Task;
      while (this.processing.length > 0) {
        (cur = this.processing.shift()!).run();
        // If it's still running, it can only be an async task
        if (cur.status === TaskStatus.running) {
          if (cur.suspend === true) {
            this.suspenderTask = cur;
            this.requestFlush();

            if (this.tracer.enabled) { this.tracer.leave(this, 'flush early async'); }

            return;
          } else {
            ++this.pendingAsyncCount;
          }
        }
      }

      if (this.pending.length > 0) {
        this.processing.push(...this.pending);
        this.pending.length = 0;
      }
      if (this.delayed.length > 0) {
        let i = -1;
        while (++i < this.delayed.length && this.delayed[i].queueTime <= time) { /* do nothing */ }
        this.processing.push(...this.delayed.splice(0, i));
      }

      if (this.processing.length > 0 || this.delayed.length > 0 || this.pendingAsyncCount > 0) {
        this.requestFlush();
      }

      if (
        this.yieldPromise !== void 0 &&
        this.hasNoMoreFiniteWork
      ) {
        const p = this.yieldPromise;
        this.yieldPromise = void 0;
        p.resolve();
      }
    } else {
      // If we are still waiting for an async task to finish, just schedule the next flush and do nothing else.
      // Should the task finish before the next flush is invoked,
      // the callback to `completeAsyncTask` will have reset `this.suspenderTask` back to undefined so processing can return back to normal next flush.
      this.requestFlush();
    }

    if (this.tracer.enabled) { this.tracer.leave(this, 'flush full'); }
  }

  /**
   * Cancel the next flush cycle (and/or the macrotask that schedules the next flush cycle, in case this is a microtask queue), if it was requested.
   *
   * This operation is idempotent and will do nothing if no flush is scheduled.
   */
  public cancel(): void {
    if (this.tracer.enabled) { this.tracer.enter(this, 'cancel'); }

    if (this.flushRequested) {
      this.flushRequestor.cancel();
      this.flushRequested = false;
    }

    if (this.tracer.enabled) { this.tracer.leave(this, 'cancel'); }
  }

  /**
   * Returns a promise that, when awaited, resolves when:
   * - all *non*-persistent (including async) tasks have finished;
   * - the last-added persistent task has run exactly once;
   *
   * This operation is idempotent: the same promise will be returned until it resolves.
   *
   * If `yield()` is called multiple times in a row when there are one or more persistent tasks in the queue, each call will await exactly one cycle of those tasks.
   */
  public async yield(): Promise<void> {
    if (this.tracer.enabled) { this.tracer.enter(this, 'yield'); }

    if (this.isEmpty) {
      if (this.tracer.enabled) { this.tracer.leave(this, 'yield empty'); }
    } else {
      if (this.yieldPromise === void 0) {
        if (this.tracer.enabled) { this.tracer.trace(this, 'yield - creating promise'); }
        this.yieldPromise = createExposedPromise();
      }

      await this.yieldPromise;

      if (this.tracer.enabled) { this.tracer.leave(this, 'yield task'); }
    }
  }

  public queueTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): Task<T> {
    if (this.tracer.enabled) { this.tracer.enter(this, 'queueTask'); }

    const { delay, preempt, persistent, reusable, suspend } = { ...defaultQueueTaskOptions, ...opts };

    if (preempt) {
      if (delay > 0) {
        throw new Error(`Invalid arguments: preempt cannot be combined with a greater-than-zero delay`);
      }
      if (persistent) {
        throw new Error(`Invalid arguments: preempt cannot be combined with persistent`);
      }
    }

    if (this.processing.length === 0) {
      this.requestFlush();
    }

    const time = this.platform.performanceNow();

    let task: Task<T>;
    if (reusable) {
      const taskPool = this.taskPool;
      const index = this.taskPoolSize - 1;
      if (index >= 0) {
        task = taskPool[index];
        taskPool[index] = (void 0)!;
        this.taskPoolSize = index;

        task.reuse(time, delay, preempt, persistent, suspend, callback);
      } else {
        task = new Task(this.tracer, this, time, time + delay, preempt, persistent, suspend, reusable, callback);
      }
    } else {
      task = new Task(this.tracer, this, time, time + delay, preempt, persistent, suspend, reusable, callback);
    }

    if (preempt) {
      this.processing[this.processing.length] = task;
    } else if (delay === 0) {
      this.pending[this.pending.length] = task;
    } else {
      this.delayed[this.delayed.length] = task;
    }

    if (this.tracer.enabled) { this.tracer.leave(this, 'queueTask'); }

    return task;
  }

  /**
   * Remove the task from this queue.
   */
  public remove<T = any>(task: Task<T>): void {
    if (this.tracer.enabled) { this.tracer.enter(this, 'remove'); }

    let idx = this.processing.indexOf(task);
    if (idx > -1) {
      this.processing.splice(idx, 1);
      if (this.tracer.enabled) { this.tracer.leave(this, 'remove processing'); }
      return;
    }
    idx = this.pending.indexOf(task);
    if (idx > -1) {
      this.pending.splice(idx, 1);
      if (this.tracer.enabled) { this.tracer.leave(this, 'remove pending'); }
      return;
    }
    idx = this.delayed.indexOf(task);
    if (idx > -1) {
      this.delayed.splice(idx, 1);
      if (this.tracer.enabled) { this.tracer.leave(this, 'remove delayed'); }
      return;
    }

    if (this.tracer.enabled) { this.tracer.leave(this, 'remove error'); }

    throw new Error(`Task #${task.id} could not be found`);
  }

  /**
   * Return a reusable task to the shared task pool.
   * The next queued callback will reuse this task object instead of creating a new one, to save overhead of creating additional objects.
   */
  public returnToPool(task: Task): void {
    if (this.tracer.enabled) { this.tracer.trace(this, 'returnToPool'); }

    this.taskPool[this.taskPoolSize++] = task;
  }

  /**
   * Reset the persistent task back to its pending state, preparing it for being invoked again on the next flush.
   */
  public resetPersistentTask(task: Task): void {
    if (this.tracer.enabled) { this.tracer.enter(this, 'resetPersistentTask'); }

    task.reset(this.platform.performanceNow());

    if (task.createdTime === task.queueTime) {
      this.pending[this.pending.length] = task;
    } else {
      this.delayed[this.delayed.length] = task;
    }

    if (this.tracer.enabled) { this.tracer.leave(this, 'resetPersistentTask'); }
  }

  /**
   * Notify the queue that this async task has had its promise resolved, so that the queue can proceed with consecutive tasks on the next flush.
   */
  public completeAsyncTask(task: Task): void {
    if (this.tracer.enabled) { this.tracer.enter(this, 'completeAsyncTask'); }

    if (task.suspend === true) {
      if (this.suspenderTask !== task) {
        if (this.tracer.enabled) { this.tracer.leave(this, 'completeAsyncTask error'); }

        throw new Error(`Async task completion mismatch: suspenderTask=${this.suspenderTask?.id}, task=${task.id}`);
      }

      this.suspenderTask = void 0;
    } else {
      --this.pendingAsyncCount;
    }

    if (
      this.yieldPromise !== void 0 &&
      this.hasNoMoreFiniteWork
    ) {
      const p = this.yieldPromise;
      this.yieldPromise = void 0;
      p.resolve();
    }

    if (this.isEmpty) {
      this.cancel();
    }

    if (this.tracer.enabled) { this.tracer.leave(this, 'completeAsyncTask'); }
  }

  private readonly requestFlush: () => void = () => {
    if (this.tracer.enabled) { this.tracer.enter(this, 'requestFlush'); }

    if (!this.flushRequested) {
      this.flushRequested = true;
      this.lastRequest = this.platform.performanceNow();
      this.flushRequestor.request();
    }

    if (this.tracer.enabled) { this.tracer.leave(this, 'requestFlush'); }
  };
}
