import {
  createExposedPromise,
  defaultQueueTaskOptions,
  ExposedPromise,
  QueueTaskOptions,
  TaskQueuePriority,
} from './types';
import {
  Now,
} from './now';
import {
  Task,
  ITask,
} from './task';
import {
  IScheduler,
} from './scheduler';
import {
  enter,
  trace,
  leave,
} from './log';

export interface IFlushRequestorFactory {
  create(taskQueue: ITaskQueue): IFlushRequestor;
}

export interface IFlushRequestor {
  request(): void;
  cancel(): void;
}

export type TaskCallback<T = any> = (delta: number) => T;

export interface ITaskQueue {
  readonly priority: TaskQueuePriority;
  flush(): void;
  cancel(): void;
  yield(): Promise<void>;
  queueTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
  take(task: ITask): void;
  remove(task: ITask): void;
}

export class TaskQueue {
  private processingSize: number = 0;
  private processingHead: Task | undefined = void 0;
  private processingTail: Task | undefined = void 0;

  private processingAsync: Task | undefined = void 0;

  private pendingSize: number = 0;
  private pendingHead: Task | undefined = void 0;
  private pendingTail: Task | undefined = void 0;

  private delayedSize: number = 0;
  private delayedHead: Task | undefined = void 0;
  private delayedTail: Task | undefined = void 0;

  private flushRequested: boolean = false;
  private yieldPromise: ExposedPromise | undefined = void 0;

  private readonly taskPool: Task[] = [];
  private taskPoolSize: number = 0;
  private lastRequest: number = 0;
  private microTaskRequestFlushTask: ITask | null = null;
  private readonly flushRequestor: IFlushRequestor;

  public get isEmpty(): boolean {
    return this.processingSize === 0 && this.pendingSize === 0 && this.delayedSize === 0;
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
    let cur = this.processingHead;
    while (cur !== void 0) {
      if (!cur.persistent) {
        return false;
      }
      cur = cur.next;
    }

    cur = this.pendingHead;
    while (cur !== void 0) {
      if (!cur.persistent) {
        return false;
      }
      cur = cur.next;
    }

    cur = this.delayedHead;
    while (cur !== void 0) {
      if (!cur.persistent) {
        return false;
      }
      cur = cur.next;
    }

    return true;
  }

  public constructor(
    public readonly now: Now,
    public readonly priority: TaskQueuePriority,
    private readonly scheduler: IScheduler,
    flushRequestorFactory: IFlushRequestorFactory,
  ) {
    this.flushRequestor = flushRequestorFactory.create(this);
    this.requestFlush = this.requestFlush.bind(this);
  }

  public flush(): void {
    enter(this, 'flush');

    if (this.microTaskRequestFlushTask !== null) {
      // This may only exist if this is a microtask queue, in which case the macrotask queue is used to poll
      // async task readiness state and/or re-queue persistent microtasks.
      this.microTaskRequestFlushTask.cancel();
      this.microTaskRequestFlushTask = null;
    }

    this.flushRequested = false;

    // Only process normally if we are *not* currently waiting for an async task to finish
    if (this.processingAsync === void 0) {
      if (this.pendingSize > 0) {
        this.movePendingToProcessing();
      }
      if (this.delayedSize > 0) {
        this.moveDelayedToProcessing();
      }

      let cur: Task;
      while (this.processingSize > 0) {
        cur = this.processingHead!;
        cur.run();
        // If it's still running, it can only be an async task
        if (cur.status === 'running') {
          this.processingAsync = cur;
          this.requestFlushClamped();

          leave(this, 'flush early async');

          return;
        }
      }

      if (this.pendingSize > 0) {
        this.movePendingToProcessing();
      }
      if (this.delayedSize > 0) {
        this.moveDelayedToProcessing();
      }

      if (this.processingSize > 0) {
        this.requestFlush();
      } else if (this.delayedSize > 0) {
        this.requestFlushClamped();
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
      // the callback to `completeAsyncTask` will have reset `this.processingAsync` back to undefined so processing can return back to normal next flush.
      this.requestFlushClamped();
    }

    leave(this, 'flush full');
  }

  /**
   * Cancel the next flush cycle (and/or the macrotask that schedules the next flush cycle, in case this is a microtask queue), if it was requested.
   *
   * This operation is idempotent and will do nothing if no flush is scheduled.
   */
  public cancel(): void {
    enter(this, 'cancel');

    if (this.microTaskRequestFlushTask !== null) {
      this.microTaskRequestFlushTask.cancel();
      this.microTaskRequestFlushTask = null;
    }

    if (this.flushRequested) {
      this.flushRequestor.cancel();
      this.flushRequested = false;
    }

    leave(this, 'cancel');
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
    enter(this, 'yield');

    if (this.isEmpty) {
      leave(this, 'yield empty');
    } else {
      if (this.yieldPromise === void 0) {
        trace(this, 'yield - creating promise');
        this.yieldPromise = createExposedPromise();
      }

      await this.yieldPromise;

      leave(this, 'yield task');
    }
  }

  public queueTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): Task<T> {
    enter(this, 'queueTask');

    const { delay, preempt, persistent, reusable, async } = { ...defaultQueueTaskOptions, ...opts };

    if (preempt) {
      if (delay > 0) {
        throw new Error(`Invalid arguments: preempt cannot be combined with a greater-than-zero delay`);
      }
      if (persistent) {
        throw new Error(`Invalid arguments: preempt cannot be combined with persistent`);
      }
    }
    if (persistent && this.priority === TaskQueuePriority.microTask) {
      throw new Error(`Invalid arguments: cannot queue persistent tasks on the micro task queue`);
    }

    if (this.processingSize === 0) {
      this.requestFlush();
    }

    const time = this.now();

    let task: Task<T>;
    if (reusable) {
      const taskPool = this.taskPool;
      const index = this.taskPoolSize - 1;
      if (index >= 0) {
        task = taskPool[index];
        taskPool[index] = (void 0)!;
        this.taskPoolSize = index;

        task.reuse(time, delay, preempt, persistent, async, callback);
      } else {
        task = new Task(this, time, time + delay, preempt, persistent, async, reusable, callback);
      }
    } else {
      task = new Task(this, time, time + delay, preempt, persistent, async, reusable, callback);
    }

    if (preempt) {
      if (this.processingSize++ === 0) {
        this.processingHead = this.processingTail = task;
      } else {
        this.processingTail = (task.prev = this.processingTail!).next = task;
      }
    } else if (delay === 0) {
      if (this.pendingSize++ === 0) {
        this.pendingHead = this.pendingTail = task;
      } else {
        this.pendingTail = (task.prev = this.pendingTail!).next = task;
      }
    } else {
      if (this.delayedSize++ === 0) {
        this.delayedHead = this.delayedTail = task;
      } else {
        this.delayedTail = (task.prev = this.delayedTail!).next = task;
      }
    }

    leave(this, 'queueTask');

    return task;
  }

  /**
   * Take this task from the taskQueue it's currently queued to, and add it to this queue.
   */
  public take(task: Task): void {
    enter(this, 'take');

    if (task.status !== 'pending') {
      leave(this, 'take error');

      throw new Error('Can only take pending tasks.');
    }

    if (this.processingSize === 0) {
      this.requestFlush();
    }

    task.taskQueue.remove(task);

    if (task.preempt) {
      this.addToProcessing(task);
    } else if (task.queueTime <= this.now()) {
      this.addToPending(task);
    } else {
      this.addToDelayed(task);
    }

    leave(this, 'take');
  }

  /**
   * Remove the task from this queue.
   */
  public remove<T = any>(task: Task<T>): void {
    enter(this, 'remove');

    if (task.preempt) {
      // Fast path - preempt task can only ever end up in the processing queue
      this.removeFromProcessing(task);

      leave(this, 'remove processing fast');

      return;
    }

    if (task.queueTime > this.now()) {
      // Fast path - task with queueTime in the future can only ever be in the delayed queue
      this.removeFromDelayed(task);

      leave(this, 'remove delayed fast');

      return;
    }

    // Scan everything (we can make this faster by using the queueTime property, but this is good enough for now)
    let cur = this.processingHead;
    while (cur !== void 0) {
      if (cur === task) {
        this.removeFromProcessing(task);

        leave(this, 'remove processing slow');

        return;
      }
      cur = cur.next;
    }

    cur = this.pendingHead;
    while (cur !== void 0) {
      if (cur === task) {
        this.removeFromPending(task);

        leave(this, 'remove pending slow');

        return;
      }
      cur = cur.next;
    }

    cur = this.delayedHead;
    while (cur !== void 0) {
      if (cur === task) {
        this.removeFromDelayed(task);

        leave(this, 'remove delayed slow');

        return;
      }
      cur = cur.next;
    }

    leave(this, 'remove error');

    throw new Error(`Task #${task.id} could not be found`);
  }

  /**
   * Return a reusable task to the shared task pool.
   * The next queued callback will reuse this task object instead of creating a new one, to save overhead of creating additional objects.
   */
  public returnToPool(task: Task): void {
    trace(this, 'returnToPool');

    this.taskPool[this.taskPoolSize++] = task;
  }

  /**
   * Reset the persistent task back to its pending state, preparing it for being invoked again on the next flush.
   */
  public resetPersistentTask(task: Task): void {
    enter(this, 'resetPersistentTask');

    task.reset(this.now());

    if (task.createdTime === task.queueTime) {
      if (this.pendingSize++ === 0) {
        this.pendingHead = this.pendingTail = task;
        task.prev = task.next = void 0;
      } else {
        this.pendingTail = (task.prev = this.pendingTail!).next = task;
        task.next = void 0;
      }
    } else {
      if (this.delayedSize++ === 0) {
        this.delayedHead = this.delayedTail = task;
        task.prev = task.next = void 0;
      } else {
        this.delayedTail = (task.prev = this.delayedTail!).next = task;
        task.next = void 0;
      }
    }

    leave(this, 'resetPersistentTask');
  }

  /**
   * Notify the queue that this async task has had its promise resolved, so that the queue can proceed with consecutive tasks on the next flush.
   */
  public completeAsyncTask(task: Task): void {
    enter(this, 'completeAsyncTask');

    if (this.processingAsync !== task) {
      leave(this, 'completeAsyncTask error');

      throw new Error(`Async task completion mismatch: processingAsync=${this.processingAsync?.id}, task=${task.id}`);
    }

    this.processingAsync = void 0;
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

    leave(this, 'completeAsyncTask');
  }

  private finish(task: Task): void {
    enter(this, 'finish');

    if (task.next !== void 0) {
      task.next.prev = task.prev;
    }
    if (task.prev !== void 0) {
      task.prev.next = task.next;
    }

    leave(this, 'finish');
  }

  private removeFromProcessing(task: Task): void {
    enter(this, 'removeFromProcessing');

    if (this.processingHead === task) {
      this.processingHead = task.next;
    }
    if (this.processingTail === task) {
      this.processingTail = task.prev;
    }

    --this.processingSize;

    this.finish(task);

    leave(this, 'removeFromProcessing');
  }

  private removeFromPending(task: Task): void {
    enter(this, 'removeFromPending');

    if (this.pendingHead === task) {
      this.pendingHead = task.next;
    }
    if (this.pendingTail === task) {
      this.pendingTail = task.prev;
    }

    --this.pendingSize;

    this.finish(task);

    leave(this, 'removeFromPending');
  }

  private removeFromDelayed(task: Task): void {
    enter(this, 'removeFromDelayed');

    if (this.delayedHead === task) {
      this.delayedHead = task.next;
    }
    if (this.delayedTail === task) {
      this.delayedTail = task.prev;
    }

    --this.delayedSize;

    this.finish(task);

    leave(this, 'removeFromDelayed');
  }

  private addToProcessing(task: Task): void {
    enter(this, 'addToProcessing');

    if (this.processingSize++ === 0) {
      this.processingHead = this.processingTail = task;
    } else {
      this.processingTail = (task.prev = this.processingTail!).next = task;
    }

    leave(this, 'addToProcessing');
  }

  private addToPending(task: Task): void {
    enter(this, 'addToPending');

    if (this.pendingSize++ === 0) {
      this.pendingHead = this.pendingTail = task;
    } else {
      this.pendingTail = (task.prev = this.pendingTail!).next = task;
    }

    leave(this, 'addToPending');
  }

  private addToDelayed(task: Task): void {
    enter(this, 'addToDelayed');

    if (this.delayedSize++ === 0) {
      this.delayedHead = this.delayedTail = task;
    } else {
      this.delayedTail = (task.prev = this.delayedTail!).next = task;
    }

    leave(this, 'addToDelayed');
  }

  private movePendingToProcessing(): void {
    enter(this, 'movePendingToProcessing');

    // Add the previously pending tasks to the currently processing tasks
    if (this.processingSize === 0) {
      this.processingHead = this.pendingHead;
      this.processingTail = this.pendingTail;
      this.processingSize = this.pendingSize;
    } else {
      this.processingTail!.next = this.pendingHead;
      this.processingTail = this.pendingTail;
      this.processingSize += this.pendingSize;
    }

    this.pendingHead = void 0;
    this.pendingTail = void 0;
    this.pendingSize = 0;

    leave(this, 'movePendingToProcessing');
  }

  private moveDelayedToProcessing(): void {
    enter(this, 'moveDelayedToProcessing');

    const time = this.now();

    // Add any delayed tasks whose delay have expired to the currently processing tasks
    const delayedHead = this.delayedHead!;
    if (delayedHead.queueTime <= time) {
      let delayedTail = delayedHead;
      let next = delayedTail.next;
      let count = 1;
      while (next !== void 0 && next.queueTime <= time) {
        delayedTail = next;
        next = delayedTail.next;
        ++count;
      }

      if (this.processingSize === 0) {
        this.processingHead = delayedHead;
        this.processingTail = delayedTail;
        this.processingSize = count;
      } else {
        this.processingTail!.next = delayedHead;
        this.processingTail = delayedTail;
        this.processingSize += count;
      }

      this.delayedHead = next;
      this.delayedSize -= count;
      if (this.delayedSize === 0) {
        this.delayedTail = void 0;
      }
    }

    leave(this, 'moveDelayedToProcessing');
  }

  private requestFlush(): void {
    enter(this, 'requestFlush');

    if (this.microTaskRequestFlushTask !== null) {
      this.microTaskRequestFlushTask.cancel();
      this.microTaskRequestFlushTask = null;
    }

    if (!this.flushRequested) {
      this.flushRequested = true;
      this.lastRequest = this.now();
      this.flushRequestor.request();
    }

    leave(this, 'requestFlush');
  }

  private requestFlushClamped(): void {
    enter(this, 'requestFlushClamped');

    if (this.priority <= TaskQueuePriority.microTask) {
      // MicroTasks are not clamped so we have to clamp them with setTimeout or they'll block forever
      this.microTaskRequestFlushTask = this.scheduler.queueMacroTask(this.requestFlush, microTaskRequestFlushTaskOptions);
    } else {
      // Otherwise just let this queue handle itself
      this.requestFlush();
    }

    leave(this, 'requestFlushClamped');
  }
}

const microTaskRequestFlushTaskOptions: QueueTaskOptions = {
  delay: 0,
  preempt: true,
  persistent: false,
  reusable: true,
  async: false,
};
