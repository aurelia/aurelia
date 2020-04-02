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
    if (this.microTaskRequestFlushTask !== null) {
      this.microTaskRequestFlushTask.cancel();
      this.microTaskRequestFlushTask = null;
    }

    this.flushRequested = false;

    if (this.pendingSize > 0) {
      this.movePendingToProcessing();
    }
    if (this.delayedSize > 0) {
      this.moveDelayedToProcessing();
    }

    while (this.processingSize > 0) {
      this.processingHead!.run();
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
      if (this.priority <= TaskQueuePriority.microTask) {
        // MicroTasks are not clamped so we have to clamp them with setTimeout or they'll block forever
        this.microTaskRequestFlushTask = this.scheduler.getTaskQueue(TaskQueuePriority.macroTask).queueTask(this.requestFlush);
      } else {
        // Otherwise just let this queue handle itself
        this.requestFlush();
      }
    }

    if (this.yieldPromise !== void 0) {
      let noMoreFiniteWork = true;
      let cur = this.processingHead;
      while (cur !== void 0) {
        if (!cur.persistent) {
          noMoreFiniteWork = false;
          break;
        }
        cur = cur.next;
      }
      if (noMoreFiniteWork) {
        cur = this.pendingHead;
        while (cur !== void 0) {
          if (!cur.persistent) {
            noMoreFiniteWork = false;
            break;
          }
          cur = cur.next;
        }
      }
      if (noMoreFiniteWork) {
        cur = this.delayedHead;
        while (cur !== void 0) {
          if (!cur.persistent) {
            noMoreFiniteWork = false;
            break;
          }
          cur = cur.next;
        }
      }

      if (noMoreFiniteWork) {
        const p = this.yieldPromise;
        this.yieldPromise = void 0;
        p.resolve();
      }
    }
  }

  public cancel(): void {
    if (this.microTaskRequestFlushTask !== null) {
      this.microTaskRequestFlushTask.cancel();
      this.microTaskRequestFlushTask = null;
    }

    this.flushRequestor.cancel();
    this.flushRequested = false;
  }

  public async yield(): Promise<void> {
    if (this.processingSize > 0 || this.pendingSize > 0 || this.delayedSize > 0) {
      if (this.yieldPromise === void 0) {
        this.yieldPromise = createExposedPromise();
      }

      await this.yieldPromise;
    }
  }

  public queueTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): Task<T> {
    const { delay, preempt, persistent, reusable } = { ...defaultQueueTaskOptions, ...opts };

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

        task.reuse(time, delay, preempt, persistent, callback);
      } else {
        task = new Task(this, time, time + delay, preempt, persistent, reusable, callback);
      }
    } else {
      task = new Task(this, time, time + delay, preempt, persistent, reusable, callback);
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

    return task;
  }

  public take(task: Task): void {
    if (task.status !== 'pending') {
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
  }

  public remove<T = any>(task: Task<T>): void {
    if (task.preempt) {
      // Fast path - preempt task can only ever end up in the processing queue
      this.removeFromProcessing(task);

      return;
    }

    if (task.queueTime > this.now()) {
      // Fast path - task with queueTime in the future can only ever be in the delayed queue
      this.removeFromDelayed(task);

      return;
    }

    // Scan everything (we can make this faster by using the queueTime property, but this is good enough for now)
    let cur = this.processingHead;
    while (cur !== void 0) {
      if (cur === task) {
        this.removeFromProcessing(task);

        return;
      }
      cur = cur.next;
    }

    cur = this.pendingHead;
    while (cur !== void 0) {
      if (cur === task) {
        this.removeFromPending(task);

        return;
      }
      cur = cur.next;
    }

    cur = this.delayedHead;
    while (cur !== void 0) {
      if (cur === task) {
        this.removeFromDelayed(task);

        return;
      }
      cur = cur.next;
    }

    throw new Error(`Task #${task.id} could not be found`);
  }

  public returnToPool(task: Task): void {
    this.taskPool[this.taskPoolSize++] = task;
  }

  public resetPersistentTask(task: Task): void {
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
  }

  private finish(task: Task): void {
    if (task.next !== void 0) {
      task.next.prev = task.prev;
    }
    if (task.prev !== void 0) {
      task.prev.next = task.next;
    }
  }

  private removeFromProcessing(task: Task): void {
    if (this.processingHead === task) {
      this.processingHead = task.next;
    }
    if (this.processingTail === task) {
      this.processingTail = task.prev;
    }

    --this.processingSize;

    this.finish(task);
  }

  private removeFromPending(task: Task): void {
    if (this.pendingHead === task) {
      this.pendingHead = task.next;
    }
    if (this.pendingTail === task) {
      this.pendingTail = task.prev;
    }

    --this.pendingSize;

    this.finish(task);
  }

  private removeFromDelayed(task: Task): void {
    if (this.delayedHead === task) {
      this.delayedHead = task.next;
    }
    if (this.delayedTail === task) {
      this.delayedTail = task.prev;
    }

    --this.delayedSize;

    this.finish(task);
  }

  private addToProcessing(task: Task): void {
    if (this.processingSize++ === 0) {
      this.processingHead = this.processingTail = task;
    } else {
      this.processingTail = (task.prev = this.processingTail!).next = task;
    }
  }

  private addToPending(task: Task): void {
    if (this.pendingSize++ === 0) {
      this.pendingHead = this.pendingTail = task;
    } else {
      this.pendingTail = (task.prev = this.pendingTail!).next = task;
    }
  }

  private addToDelayed(task: Task): void {
    if (this.delayedSize++ === 0) {
      this.delayedHead = this.delayedTail = task;
    } else {
      this.delayedTail = (task.prev = this.delayedTail!).next = task;
    }
  }

  private movePendingToProcessing(): void {
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
  }

  private moveDelayedToProcessing(): void {
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
  }

  private requestFlush(): void {
    if (this.microTaskRequestFlushTask !== null) {
      this.microTaskRequestFlushTask.cancel();
      this.microTaskRequestFlushTask = null;
    }

    if (!this.flushRequested) {
      this.flushRequested = true;
      this.lastRequest = this.now();
      this.flushRequestor.request();
    }
  }
}
