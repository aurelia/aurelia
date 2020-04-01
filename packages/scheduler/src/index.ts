import { DI } from '@aurelia/kernel';

const defaultNow = Date.now.bind(Date);

export const Now = DI.createInterface<Now>('Now').withDefault(x => x.instance(defaultNow));
export type Now = () => number;

export const enum TaskQueuePriority {
  microTask  = 0,
  render     = 1,
  macroTask  = 2,
  postRender = 3,
  idle       = 4,
}

export type TaskStatus = 'pending' | 'running' | 'completed' | 'canceled';

export type TaskCallback<T = any> = (delta: number) => T;

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
  yieldAll(repeat?: number): Promise<void>;

  queueMicroTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
  queueRenderTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
  queueMacroTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
  queuePostRenderTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;
  queueIdleTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T>;

  /* @internal */cancelFlush(taskQueue: ITaskQueue): void;
  /* @internal */requestFlush(taskQueue: ITaskQueue): void;
}

type PResolve<T> = (value?: T | PromiseLike<T>) => void;
type PReject<T = any> = (reason?: T) => void;
let $resolve: PResolve<any>;
let $reject: PReject;
function executor<T>(resolve: PResolve<T>, reject: PReject): void {
  $resolve = resolve;
  $reject = reject;
}

class ExposedPromise<T = void> extends Promise<T> {
  public readonly resolve: PResolve<T>;
  public readonly reject: PReject;

  public constructor() {
    super(executor);
    this.resolve = $resolve;
    this.reject = $reject;
  }
}

type TaskQueueOptions = {
  now: Now;
  priority: TaskQueuePriority;
  scheduler: IScheduler;
};

export type QueueTaskOptions = {
  /**
   * The number of milliseconds to wait before queueing the task.
   *
   * NOTE: just like `setTimeout`, there is no guarantee that the task will actually run
   * after the specified delay. It is merely a *minimum* delay.
   *
   * Defaults to `0`
   */
  delay?: number;
  /**
   * If `true`, the task will be run synchronously if it is the same priority as the
   * `TaskQueue` that is currently flushing. Otherwise, it will be run on the next tick.
   *
   * Defaults to `false`
   */
  preempt?: boolean;
  /**
   * If `true`, the task will be added back onto the queue after it finished running, indefinitely, until manually canceled.
   *
   * Defaults to `false`
   */
  persistent?: boolean;
  /**
   * If `true`, the task will be kept in-memory after finishing, so that it can be reused for future tasks for efficiency.
   *
   * Defaults to `true`
   */
  reusable?: boolean;
};

export type QueueTaskTargetOptions = QueueTaskOptions & {
  priority?: TaskQueuePriority;
};

const defaultQueueTaskOptions: Required<QueueTaskTargetOptions> = {
  delay: 0,
  preempt: false,
  priority: TaskQueuePriority.render,
  persistent: false,
  reusable: true,
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
  public readonly now: Now;
  private readonly taskPool: Task[] = [];
  private taskPoolSize: number = 0;
  private lastRequest: number = 0;
  private microTaskRequestFlushTask: ITask | null = null;

  public get isEmpty(): boolean {
    return this.processingSize === 0 && this.pendingSize === 0 && this.delayedSize === 0;
  }

  public constructor({ now, priority, scheduler }: TaskQueueOptions) {
    this.priority = priority;
    this.scheduler = scheduler;
    this.now = now;
    this.requestFlush = this.requestFlush.bind(this);
  }

  public flush(): void {
    if (this.microTaskRequestFlushTask !== null) {
      this.microTaskRequestFlushTask.cancel();
      this.microTaskRequestFlushTask = null;
    }

    this.now();
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

    this.scheduler.cancelFlush(this);
    this.flushRequested = false;
  }

  public async yield(): Promise<void> {
    if (this.processingSize > 0 || this.pendingSize > 0 || this.delayedSize > 0) {
      if (this.yieldPromise === void 0) {
        this.yieldPromise = new ExposedPromise();
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
  cancel(): boolean;
}

let id: number = 0;

export class Task<T = any> implements ITask {
  public readonly id: number = ++id;
  public next: Task<T> | undefined = void 0;
  public prev: Task<T> | undefined = void 0;

  private resolve: PResolve<T> | undefined = void 0;
  private reject: PReject<TaskAbortError<T>> | undefined = void 0;

  private _result: Promise<T> | undefined = void 0;
  public get result(): Promise<T> {
    const result = this._result;
    if (result === void 0) {
      switch (this._status) {
        case 'pending': {
          const promise = this._result = new ExposedPromise();
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

  private _status: TaskStatus = 'pending';
  public get status(): TaskStatus {
    return this._status;
  }

  public readonly priority: TaskQueuePriority;

  public constructor(
    public readonly taskQueue: TaskQueue,
    public createdTime: number,
    public queueTime: number,
    public preempt: boolean,
    public persistent: boolean,
    public readonly reusable: boolean,
    public callback: TaskCallback<T>
  ) {
    this.priority = taskQueue.priority;
  }

  public run(): void {
    if (this._status !== 'pending') {
      throw new Error(`Cannot run task in ${this._status} state`);
    }

    // this.persistent could be changed while the task is running (this can only be done by the task itself if canceled, and is a valid way of stopping a loop)
    // so we deliberately reference this.persistent instead of the local variable, but we keep it around to know whether the task *was* persistent before running it,
    // so we can set the correct cancelation state.
    const persistent = this.persistent;
    const reusable = this.reusable;
    const taskQueue = this.taskQueue;
    const callback = this.callback;
    const resolve = this.resolve;
    const reject = this.reject;
    const createdTime = this.createdTime;

    taskQueue.remove(this);

    this._status = 'running';

    try {
      const ret = callback(taskQueue.now() - createdTime);

      if (this.persistent) {
        taskQueue.resetPersistentTask(this);
      } else if (persistent) {
        // Persistent tasks never reach completed status. They're either pending, running, or canceled.
        this._status = 'canceled';
      } else {
        this._status = 'completed';
      }

      if (resolve !== void 0) {
        resolve(ret);
      }
    } catch (err) {
      if (reject !== void 0) {
        reject(err);
      } else {
        throw err;
      }
    } finally {
      if (!this.persistent) {
        this.dispose();

        if (reusable) {
          taskQueue.returnToPool(this);
        }
      }
    }
  }

  public cancel(): boolean {
    if (this._status === 'pending') {

      const taskQueue = this.taskQueue;
      const reusable = this.reusable;
      const reject = this.reject;

      taskQueue.remove(this);

      if (taskQueue.isEmpty) {
        taskQueue.cancel();
      }

      this._status = 'canceled';

      if (reject !== void 0) {
        reject(new TaskAbortError(this));
      }

      this.dispose();

      if (reusable) {
        taskQueue.returnToPool(this);
      }

      return true;
    } else if (this._status === 'running' && this.persistent) {
      this.persistent = false;

      return true;
    }

    return false;
  }

  public reset(time: number): void {
    const delay = this.queueTime - this.createdTime;
    this.createdTime = time;
    this.queueTime = time + delay;
    this._status = 'pending';

    this.resolve = void 0;
    this.reject = void 0;
    this._result = void 0;
  }

  public reuse(
    time: number,
    delay: number,
    preempt: boolean,
    persistent: boolean,
    callback: TaskCallback<T>,
  ): void {
    this.createdTime = time;
    this.queueTime = time + delay;
    this.preempt = preempt;
    this.persistent = persistent;
    this.callback = callback;
    this._status = 'pending';
  }

  public dispose(): void {
    this.prev = void 0;
    this.next = void 0;

    this.callback = (void 0)!;
    this.resolve = void 0;
    this.reject = void 0;
    this._result = void 0;
  }
}
