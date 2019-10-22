import { PLATFORM, DI, bound, IContainer, IResolver, Registration } from '@aurelia/kernel';

export interface IClockSettings {
  forceUpdateInterval?: number;
  now?(): number;
}

const defaultClockSettings: Required<IClockSettings> = {
  forceUpdateInterval: 10,
  now: PLATFORM.now,
};

export const IClock = DI.createInterface<IClock>('IClock').noDefault();
export interface IClock {
  now(highRes?: boolean): number;
}

export class Clock implements IClock {
  public readonly now: () => number;

  public constructor(opts?: IClockSettings) {
    const { now, forceUpdateInterval } = { ...defaultClockSettings, ...opts };

    this.now = function (highRes: boolean = false): number {
      // if (++requests === forceUpdateInterval || highRes) {
      //   requests = 0;
      //   timestamp = now();
      // }
      // return timestamp;
      return now();
    };
  }

  public static register(container: IContainer): IResolver<IClock> {
    return Registration.singleton(IClock, this).register(container);
  }
}

export const globalClock = new Clock();

export const enum TaskQueuePriority {
  microTask  = 0,
  render     = 1,
  macroTask  = 2,
  postRender = 3,
  idle       = 4,
}

export type TaskStatus = 'pending' | 'running' | 'completed' | 'canceled';

export type TaskCallback<T = any> = () => T;

export const IScheduler = DI.createInterface<IScheduler>('IScheduler').noDefault();
export interface IScheduler {
  getTaskQueue(priority: TaskQueuePriority): ITaskQueue;
  yield(priority: TaskQueuePriority): Promise<void>;
  queueTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskTargetOptions): ITask<T>;

  getMicroTaskQueue(): ITaskQueue;
  getRenderTaskQueue(): ITaskQueue;
  getMacroTaskQueue(): ITaskQueue;
  getPostRenderTaskQueue(): ITaskQueue;
  getIdleTaskQueue(): ITaskQueue;

  yieldMicroTask(): Promise<void>;
  yieldRenderTask(): Promise<void>;
  yieldMacroTask(): Promise<void>;
  yieldPostRenderTask(): Promise<void>;
  yieldIdleTask(): Promise<void>;

  queueMicroTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
  queueRenderTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
  queueMacroTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
  queuePostRenderTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
  queueIdleTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;

  /* @internal */cancelFlush(taskQueue: ITaskQueue): void;
  /* @internal */requestFlush(taskQueue: ITaskQueue): void;
}

type ExposedPromise<T = void> = Promise<T> & {
  resolve: (value?: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
};

const createPromise = (function () {
  let $resolve: ((value?: any | PromiseLike<any>) => void) | undefined = void 0;
  let $reject: ((reason?: any) => void) | undefined = void 0;

  function executor(
    resolve: (value?: any | PromiseLike<any>) => void,
    reject: (reason?: any) => void,
  ): void {
    $resolve = resolve;
    $reject = reject;
  }

  return function <T>(): ExposedPromise<T> {
    const p = new Promise(executor) as ExposedPromise<T>;
    p.resolve = $resolve!;
    p.reject = $reject!;
    $resolve = void 0;
    $reject = void 0;
    return p;
  };
})();

type TaskQueueOptions = {
  clock: IClock;
  priority: TaskQueuePriority;
  scheduler: IScheduler;
};

export type QueueTaskOptions = {
  /**
   * The number of milliseconds to wait before queueing the task.
   *
   * NOTE: just like `setTimeout`, there is no guarantee that the task will actually run
   * after the specified delay. It is merely a *minimum* delay.
   */
  delay?: number;
  /**
   * If `true`, the task will be run synchronously if it is the same priority as the
   * `TaskQueue` that is currently flushing. Otherwise, it will be run on the next tick.
   */
  preempt?: boolean;
};

export type QueueTaskTargetOptions = QueueTaskOptions & {
  priority?: TaskQueuePriority;
};

const defaultQueueTaskOptions: Required<QueueTaskTargetOptions> = {
  delay: 0,
  preempt: false,
  priority: TaskQueuePriority.render,
};

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
  public readonly priority: TaskQueuePriority;

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

  private readonly scheduler: IScheduler;
  private readonly clock: IClock;

  public get isEmpty(): boolean {
    return this.processingSize === 0 && this.pendingSize === 0 && this.delayedSize === 0;
  }

  public constructor({ clock, priority, scheduler }: TaskQueueOptions) {
    this.priority = priority;
    this.scheduler = scheduler;
    this.clock = clock;
  }

  public flush(): void {
    this.clock.now(true);
    this.flushRequested = false;

    if (this.pendingSize > 0) {
      this.movePendingToProcessing();
    }
    if (this.delayedSize > 0) {
      this.moveDelayedToProcessing();
    }

    while (this.processingSize > 0) {
      const task = this.processingHead!;

      if (this.processingSize-- === 1) {
        this.processingHead = this.processingTail = void 0;
      } else {
        (this.processingHead = this.processingHead!.next!).prev = void 0;
      }

      task.run();
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
        this.scheduler.getTaskQueue(TaskQueuePriority.macroTask).queueTask(this.requestFlush);
      } else {
        // Otherwise just let this queue handle itself
        this.requestFlush();
      }
    } else if (this.yieldPromise !== void 0) {
      const p = this.yieldPromise;
      this.yieldPromise = void 0;
      p.resolve();
    }
  }

  public cancel(): void {
    this.scheduler.cancelFlush(this);
  }

  public yield(): Promise<void> {
    if (this.processingSize === 0 && this.pendingSize === 0 && this.delayedSize === 0) {
      return Promise.resolve();
    }
    if (this.yieldPromise === void 0) {
      this.yieldPromise = createPromise();
    }
    return this.yieldPromise;
  }

  public queueTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): Task<T> {
    const { delay, preempt } = { ...defaultQueueTaskOptions, ...opts };

    if (preempt && delay > 0) {
      throw new Error(`Invalid arguments: preempt cannot be combined with a greater-than-zero delay`);
    }

    if (this.processingSize === 0) {
      this.requestFlush();
    }

    const time = this.clock.now();
    const task = new Task(this, time, time + delay, preempt, callback) as Task;

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

    return task as Task<T>;
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
    } else if (task.queueTime <= this.clock.now()) {
      this.addToPending(task);
    } else {
      this.addToDelayed(task);
    }
  }

  public remove<T = any>(task: Task<T>): void {
    if (task.next !== void 0) {
      task.next.prev = task.prev;
    }
    if (task.prev !== void 0) {
      task.prev.next = task.next;
    }

    if (task.preempt) {
      // Fast path - preempt task can only ever end up in the processing queue
      this.removeFromProcessing(task);
      return;
    }

    if (task.queueTime > this.clock.now()) {
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
  }

  private removeFromProcessing(task: Task): void {
    if (this.processingHead === task) {
      this.processingHead = task.next;
    }
    if (this.processingTail === task) {
      this.processingTail = task.prev;
    }
  }

  private removeFromPending(task: Task): void {
    if (this.pendingHead === task) {
      this.pendingHead = task.next;
    }
    if (this.pendingTail === task) {
      this.pendingTail = task.prev;
    }

    --this.pendingSize;
  }

  private removeFromDelayed(task: Task): void {
    if (this.delayedHead === task) {
      this.delayedHead = task.next;
    }
    if (this.delayedTail === task) {
      this.delayedTail = task.prev;
    }

    --this.delayedSize;
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
    const time = this.clock.now(true);

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

  @bound
  private requestFlush(): void {
    if (!this.flushRequested) {
      this.flushRequested = true;
      this.scheduler.requestFlush(this);
    }
  }
}

export class TaskAbortError<T = any> extends Error {
  public constructor(public task: Task<T>) {
    super('Task was canceled.');
  }
}

export interface ITask<T = any> {
  readonly result: Promise<T>;
  readonly status: TaskStatus;
  readonly priority: TaskQueuePriority;
  run(): void;
  cancel(): void;
}

let id: number = 0;

export class Task<T = any> implements ITask {
  public readonly id: number = ++id;
  public next: Task<T> | undefined = void 0;
  public prev: Task<T> | undefined = void 0;

  private resolve: ((value?: T) => void) | undefined = void 0;
  private reject: ((reason: TaskAbortError<T>) => void) | undefined = void 0;

  private _result: Promise<T> | undefined = void 0;
  public get result(): Promise<T> {
    const result = this._result;
    if (result === void 0) {
      switch (this._status) {
        case 'pending': {
          const promise = this._result = createPromise();
          this.resolve = promise.resolve;
          this.reject = promise.reject;
          return promise;
        }
        case 'running':
          throw new Error('Trying to await task from within task will cause a deadlock.');
        case 'completed':
          return this._result = Promise.resolve() as unknown as Promise<T>;
        case 'canceled':
          return this._result = Promise.reject(new TaskAbortError(this));
      }
    }
    return result!;
  }

  private _status: TaskStatus;
  public get status(): TaskStatus {
    return this._status;
  }

  public cancel: () => void;
  public run: () => void;

  public readonly priority: TaskQueuePriority;

  public constructor(
    public readonly taskQueue: TaskQueue,
    public readonly createdTime: number,
    public readonly queueTime: number,
    public readonly preempt: boolean,
    callback: TaskCallback<T>
  ) {
    this.priority = taskQueue.priority;
    this._status = 'pending';

    this.cancel = () => {
      if (this._status !== 'pending') {
        throw new Error(`Cannot cancel task in ${this._status} state`);
      }

      taskQueue.remove(this);

      if (taskQueue.isEmpty) {
        taskQueue.cancel();
      }

      this._status = 'canceled';

      if (this.reject !== void 0) {
        this.reject(new TaskAbortError(this));
      }
    };

    this.run = () => {
      if (this._status !== 'pending') {
        throw new Error(`Cannot run task in ${this._status} state`);
      }

      taskQueue.remove(this);

      this._status = 'running';

      try {
        const ret = callback();

        this._status = 'completed';

        if (this.resolve !== void 0) {
          this.resolve(ret);
        }
      } catch (err) {
        if (this.reject !== void 0) {
          this.reject(err);
        } else {
          throw err;
        }
      }
    };
  }
}
