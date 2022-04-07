const lookup = new Map<object, Platform>();

function notImplemented(name: string): (...args: any[]) => any {
  return function notImplemented() {
    throw new Error(`The PLATFORM did not receive a valid reference to the global function '${name}'.`); // TODO: link to docs describing how to fix this issue
  };
}

export class Platform<TGlobal extends typeof globalThis = typeof globalThis> {
  // http://www.ecma-international.org/ecma-262/#sec-value-properties-of-the-global-object
  public readonly globalThis: TGlobal;

  // http://www.ecma-international.org/ecma-262/#sec-function-properties-of-the-global-object
  public readonly decodeURI: TGlobal['decodeURI'];
  public readonly decodeURIComponent: TGlobal['decodeURIComponent'];
  public readonly encodeURI: TGlobal['encodeURI'];
  public readonly encodeURIComponent: TGlobal['encodeURIComponent'];

  // http://www.ecma-international.org/ecma-262/#sec-constructor-properties-of-the-global-object
  public readonly Date: TGlobal['Date'];

  // http://www.ecma-international.org/ecma-262/#sec-other-properties-of-the-global-object
  public readonly Reflect: TGlobal['Reflect'];

  // https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope
  // Note: we're essentially assuming that all of these are available, even if we aren't even
  // in a browser environment. They are available in major envs as well (NodeJS, NativeScript, etc),
  // or can otherwise be mocked fairly easily. If not, things probably won't work anyway.
  public readonly clearInterval: TGlobal['clearInterval'];
  public readonly clearTimeout: TGlobal['clearTimeout'];
  public readonly queueMicrotask: TGlobal['queueMicrotask'];
  public readonly setInterval: TGlobal['setInterval'];
  public readonly setTimeout: TGlobal['setTimeout'];
  public readonly console: TGlobal['console'];

  public readonly performanceNow: () => number;

  public readonly taskQueue: TaskQueue;

  public constructor(g: TGlobal, overrides: Partial<Exclude<Platform, 'globalThis'>> = {}) {
    this.globalThis = g;
    this.decodeURI = 'decodeURI' in overrides ? overrides.decodeURI! : g.decodeURI;
    this.decodeURIComponent = 'decodeURIComponent' in overrides ? overrides.decodeURIComponent! : g.decodeURIComponent;
    this.encodeURI = 'encodeURI' in overrides ? overrides.encodeURI! : g.encodeURI;
    this.encodeURIComponent = 'encodeURIComponent' in overrides ? overrides.encodeURIComponent! : g.encodeURIComponent;

    this.Date = 'Date' in overrides ? overrides.Date! : g.Date;

    this.Reflect = 'Reflect' in overrides ? overrides.Reflect! : g.Reflect;

    this.clearInterval = 'clearInterval' in overrides ? overrides.clearInterval! : g.clearInterval?.bind(g) ?? notImplemented('clearInterval');
    this.clearTimeout = 'clearTimeout' in overrides ? overrides.clearTimeout! : g.clearTimeout?.bind(g) ?? notImplemented('clearTimeout');
    this.queueMicrotask = 'queueMicrotask' in overrides ? overrides.queueMicrotask! : g.queueMicrotask?.bind(g) ?? notImplemented('queueMicrotask');
    this.setInterval = 'setInterval' in overrides ? overrides.setInterval! : g.setInterval?.bind(g) ?? notImplemented('setInterval');
    this.setTimeout = 'setTimeout' in overrides ? overrides.setTimeout! : g.setTimeout?.bind(g) ?? notImplemented('setTimeout');
    this.console = 'console' in overrides ? overrides.console! : g.console;

    this.performanceNow = 'performanceNow' in overrides ? overrides.performanceNow! : g.performance?.now?.bind(g.performance) ?? notImplemented('performance.now');

    this.flushMacroTask = this.flushMacroTask.bind(this);
    this.taskQueue = new TaskQueue(this, this.requestMacroTask.bind(this), this.cancelMacroTask.bind(this));
  }

  public static getOrCreate<TGlobal extends typeof globalThis = typeof globalThis>(
    g: TGlobal,
    overrides: Partial<Exclude<Platform, 'globalThis'>> = {},
  ): Platform<TGlobal> {
    let platform = lookup.get(g);
    if (platform === void 0) {
      lookup.set(g, platform = new Platform(g, overrides));
    }
    return platform as Platform<TGlobal>;
  }

  public static set(g: typeof globalThis, platform: Platform): void {
    lookup.set(g, platform);
  }

  protected macroTaskRequested: boolean = false;
  protected macroTaskHandle: number = -1;
  protected requestMacroTask(): void {
    this.macroTaskRequested = true;
    if (this.macroTaskHandle === -1) {
      this.macroTaskHandle = this.setTimeout(this.flushMacroTask, 0);
    }
  }
  protected cancelMacroTask(): void {
    this.macroTaskRequested = false;
    if (this.macroTaskHandle > -1) {
      this.clearTimeout(this.macroTaskHandle);
      this.macroTaskHandle = -1;
    }
  }
  protected flushMacroTask(): void {
    this.macroTaskHandle = -1;
    if (this.macroTaskRequested === true) {
      this.macroTaskRequested = false;
      this.taskQueue.flush();
    }
  }
}

type TaskCallback<T = any> = (delta: number) => T;

function isPersistent(task: Task): boolean {
  return task.persistent;
}
export class TaskQueue {

  /** @internal */ public _suspenderTask: Task | undefined = void 0;
  /** @internal */ public _pendingAsyncCount: number = 0;

  private processing: Task[] = [];
  private pending: Task[] = [];
  private delayed: Task[] = [];

  private flushRequested: boolean = false;
  private _yieldPromise: ExposedPromise | undefined = void 0;

  private readonly taskPool: Task[] = [];
  private _taskPoolSize: number = 0;
  private _lastRequest: number = 0;
  private _lastFlush: number = 0;

  public get isEmpty(): boolean {
    return (
      this._pendingAsyncCount === 0 &&
      this.processing.length === 0 &&
      this.pending.length === 0 &&
      this.delayed.length === 0
    );
  }

  /**
   * Persistent tasks will re-queue themselves indefinitely until they are explicitly canceled,
   * so we consider them 'infinite work' whereas non-persistent (one-off) tasks are 'finite work'.
   *
   * This `hasNoMoreFiniteWork` getters returns true if either all remaining tasks are persistent, or if there are no more tasks.
   *
   * If that is the case, we can resolve the promise that was created when `yield()` is called.
   *
   * @internal
   */
  private get _hasNoMoreFiniteWork(): boolean {
    return (
      this._pendingAsyncCount === 0 &&
      this.processing.every(isPersistent) &&
      this.pending.every(isPersistent) &&
      this.delayed.every(isPersistent)
    );
  }

  /** @internal */ private readonly _tracer: Tracer;
  public constructor(
    public readonly platform: Platform,
    private readonly $request: () => void,
    private readonly $cancel: () => void,
  ) {
    this._tracer = new Tracer(platform.console);
  }

  public flush(time: number = this.platform.performanceNow()): void {
    if (__DEV__ && this._tracer.enabled) { this._tracer.enter(this, 'flush'); }

    this.flushRequested = false;
    this._lastFlush = time;

    // Only process normally if we are *not* currently waiting for an async task to finish
    if (this._suspenderTask === void 0) {
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
            this._suspenderTask = cur;
            this._requestFlush();

            if (__DEV__ && this._tracer.enabled) { this._tracer.leave(this, 'flush early async'); }

            return;
          } else {
            ++this._pendingAsyncCount;
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

      if (this.processing.length > 0 || this.delayed.length > 0 || this._pendingAsyncCount > 0) {
        this._requestFlush();
      }

      if (
        this._yieldPromise !== void 0 &&
        this._hasNoMoreFiniteWork
      ) {
        const p = this._yieldPromise;
        this._yieldPromise = void 0;
        p.resolve();
      }
    } else {
      // If we are still waiting for an async task to finish, just schedule the next flush and do nothing else.
      // Should the task finish before the next flush is invoked,
      // the callback to `completeAsyncTask` will have reset `this.suspenderTask` back to undefined so processing can return back to normal next flush.
      this._requestFlush();
    }

    if (__DEV__ && this._tracer.enabled) { this._tracer.leave(this, 'flush full'); }
  }

  /**
   * Cancel the next flush cycle (and/or the macrotask that schedules the next flush cycle, in case this is a microtask queue), if it was requested.
   *
   * This operation is idempotent and will do nothing if no flush is scheduled.
   */
  public cancel(): void {
    if (__DEV__ && this._tracer.enabled) { this._tracer.enter(this, 'cancel'); }

    if (this.flushRequested) {
      this.$cancel();
      this.flushRequested = false;
    }

    if (__DEV__ && this._tracer.enabled) { this._tracer.leave(this, 'cancel'); }
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
    if (__DEV__ && this._tracer.enabled) { this._tracer.enter(this, 'yield'); }

    if (this.isEmpty) {
      if (__DEV__ && this._tracer.enabled) { this._tracer.leave(this, 'yield empty'); }
    } else {
      if (this._yieldPromise === void 0) {
        if (__DEV__ && this._tracer.enabled) { this._tracer.trace(this, 'yield - creating promise'); }
        this._yieldPromise = createExposedPromise();
      }

      await this._yieldPromise;

      if (__DEV__ && this._tracer.enabled) { this._tracer.leave(this, 'yield task'); }
    }
  }

  public queueTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): Task<T> {
    if (__DEV__ && this._tracer.enabled) { this._tracer.enter(this, 'queueTask'); }

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
      this._requestFlush();
    }

    const time = this.platform.performanceNow();

    let task: Task<T>;
    if (reusable) {
      const taskPool = this.taskPool;
      const index = this._taskPoolSize - 1;
      if (index >= 0) {
        task = taskPool[index] as Task<T>;
        taskPool[index] = (void 0)!;
        this._taskPoolSize = index;

        task.reuse(time, delay, preempt, persistent, suspend, callback);
      } else {
        task = new Task(this._tracer, this, time, time + delay, preempt, persistent, suspend, reusable, callback);
      }
    } else {
      task = new Task(this._tracer, this, time, time + delay, preempt, persistent, suspend, reusable, callback);
    }

    if (preempt) {
      this.processing[this.processing.length] = task;
    } else if (delay === 0) {
      this.pending[this.pending.length] = task;
    } else {
      this.delayed[this.delayed.length] = task;
    }

    if (__DEV__ && this._tracer.enabled) { this._tracer.leave(this, 'queueTask'); }

    return task;
  }

  /**
   * Remove the task from this queue.
   */
  public remove<T = any>(task: Task<T>): void {
    if (__DEV__ && this._tracer.enabled) { this._tracer.enter(this, 'remove'); }

    let idx = this.processing.indexOf(task);
    if (idx > -1) {
      this.processing.splice(idx, 1);
      if (__DEV__ && this._tracer.enabled) { this._tracer.leave(this, 'remove processing'); }
      return;
    }
    idx = this.pending.indexOf(task);
    if (idx > -1) {
      this.pending.splice(idx, 1);
      if (__DEV__ && this._tracer.enabled) { this._tracer.leave(this, 'remove pending'); }
      return;
    }
    idx = this.delayed.indexOf(task);
    if (idx > -1) {
      this.delayed.splice(idx, 1);
      if (__DEV__ && this._tracer.enabled) { this._tracer.leave(this, 'remove delayed'); }
      return;
    }

    if (__DEV__ && this._tracer.enabled) { this._tracer.leave(this, 'remove error'); }

    throw new Error(`Task #${task.id} could not be found`);
  }

  /**
   * Return a reusable task to the shared task pool.
   * The next queued callback will reuse this task object instead of creating a new one, to save overhead of creating additional objects.
   */
  private returnToPool(task: Task): void {
    if (__DEV__ && this._tracer.enabled) { this._tracer.trace(this, 'returnToPool'); }

    this.taskPool[this._taskPoolSize++] = task;
  }

  /**
   * Reset the persistent task back to its pending state, preparing it for being invoked again on the next flush.
   */
  private resetPersistentTask(task: Task): void {
    if (__DEV__ && this._tracer.enabled) { this._tracer.enter(this, 'resetPersistentTask'); }

    task.reset(this.platform.performanceNow());

    if (task.createdTime === task.queueTime) {
      this.pending[this.pending.length] = task;
    } else {
      this.delayed[this.delayed.length] = task;
    }

    if (__DEV__ && this._tracer.enabled) { this._tracer.leave(this, 'resetPersistentTask'); }
  }

  /**
   * Notify the queue that this async task has had its promise resolved, so that the queue can proceed with consecutive tasks on the next flush.
   */
  private completeAsyncTask(task: Task): void {
    if (__DEV__ && this._tracer.enabled) { this._tracer.enter(this, 'completeAsyncTask'); }

    if (task.suspend === true) {
      if (this._suspenderTask !== task) {
        if (__DEV__ && this._tracer.enabled) { this._tracer.leave(this, 'completeAsyncTask error'); }

        throw new Error(`Async task completion mismatch: suspenderTask=${this._suspenderTask?.id}, task=${task.id}`);
      }

      this._suspenderTask = void 0;
    } else {
      --this._pendingAsyncCount;
    }

    if (
      this._yieldPromise !== void 0 &&
      this._hasNoMoreFiniteWork
    ) {
      const p = this._yieldPromise;
      this._yieldPromise = void 0;
      p.resolve();
    }

    if (this.isEmpty) {
      this.cancel();
    }

    if (__DEV__ && this._tracer.enabled) { this._tracer.leave(this, 'completeAsyncTask'); }
  }

  private readonly _requestFlush: () => void = () => {
    if (__DEV__ && this._tracer.enabled) { this._tracer.enter(this, 'requestFlush'); }

    if (!this.flushRequested) {
      this.flushRequested = true;
      this._lastRequest = this.platform.performanceNow();
      this.$request();
    }

    if (__DEV__ && this._tracer.enabled) { this._tracer.leave(this, 'requestFlush'); }
  };
}

export class TaskAbortError<T = any> extends Error {
  public constructor(public task: Task<T>) {
    super('Task was canceled.');
  }
}

let id: number = 0;

export const enum TaskStatus {
  pending = 0,
  running = 1,
  completed = 2,
  canceled = 3,
}

type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;

export interface ITask<T = any> {
  readonly result: Promise<UnwrapPromise<T>>;
  readonly status: TaskStatus;
  run(): void;
  cancel(): boolean;
}

export class Task<T = any> implements ITask {
  public readonly id: number = ++id;

  /** @internal */ private _resolve: PResolve<UnwrapPromise<T>> | undefined = void 0;
  /** @internal */ private _reject: PReject<TaskAbortError<T>> | undefined = void 0;

  /** @internal */
  private _result: Promise<UnwrapPromise<T>> | undefined = void 0;
  public get result(): Promise<UnwrapPromise<T>> {
    const result = this._result;
    if (result === void 0) {
      switch (this._status) {
        case TaskStatus.pending: {
          const promise = this._result = createExposedPromise();
          this._resolve = promise.resolve;
          this._reject = promise.reject;
          return promise;
        }
        case TaskStatus.running:
          throw new Error('Trying to await task from within task will cause a deadlock.');
        case TaskStatus.completed:
          return this._result = Promise.resolve() as unknown as Promise<UnwrapPromise<T>>;
        case TaskStatus.canceled:
          return this._result = Promise.reject(new TaskAbortError(this));
      }
    }
    return result;
  }

  /** @internal */
  private _status: TaskStatus = TaskStatus.pending;
  public get status(): TaskStatus {
    return this._status;
  }

  /** @internal */
  private readonly _tracer: Tracer;

  public constructor(
    tracer: Tracer,
    public readonly taskQueue: TaskQueue,
    public createdTime: number,
    public queueTime: number,
    public preempt: boolean,
    public persistent: boolean,
    public suspend: boolean,
    public readonly reusable: boolean,
    public callback: TaskCallback<T>,
  ) {
    this._tracer = tracer;
  }

  public run(time: number = this.taskQueue.platform.performanceNow()): void {
    if (__DEV__ && this._tracer.enabled) { this._tracer.enter(this, 'run'); }

    if (this._status !== TaskStatus.pending) {
      if (__DEV__ && this._tracer.enabled) { this._tracer.leave(this, 'run error'); }

      throw new Error(`Cannot run task in ${this._status} state`);
    }

    // this.persistent could be changed while the task is running (this can only be done by the task itself if canceled, and is a valid way of stopping a loop)
    // so we deliberately reference this.persistent instead of the local variable, but we keep it around to know whether the task *was* persistent before running it,
    // so we can set the correct cancelation state.
    const {
      persistent,
      reusable,
      taskQueue,
      callback,
      _resolve: resolve,
      _reject: reject,
      createdTime,
    } = this;
    let ret: unknown | Promise<unknown>;

    this._status = TaskStatus.running;

    try {
      ret = callback(time - createdTime);
      if (ret instanceof Promise) {
        ret.then($ret => {
          if (this.persistent) {
            taskQueue['resetPersistentTask'](this);
          } else {
            if (persistent) {
              // Persistent tasks never reach completed status. They're either pending, running, or canceled.
              this._status = TaskStatus.canceled;
            } else {
              this._status = TaskStatus.completed;
            }

            this.dispose();
          }

          taskQueue['completeAsyncTask'](this);

          if (__DEV__ && this._tracer.enabled) { this._tracer.leave(this, 'run async then'); }

          if (resolve !== void 0) {
            resolve($ret as UnwrapPromise<T>);
          }

          if (!this.persistent && reusable) {
            taskQueue['returnToPool'](this);
          }
        })
        .catch((err: TaskAbortError<T>) => {
          if (!this.persistent) {
            this.dispose();
          }

          taskQueue['completeAsyncTask'](this);

          if (__DEV__ && this._tracer.enabled) { this._tracer.leave(this, 'run async catch'); }

          if (reject !== void 0) {
            reject(err);
          } else {
            throw err;
          }
        });
      } else {
        if (this.persistent) {
          taskQueue['resetPersistentTask'](this);
        } else {
          if (persistent) {
            // Persistent tasks never reach completed status. They're either pending, running, or canceled.
            this._status = TaskStatus.canceled;
          } else {
            this._status = TaskStatus.completed;
          }

          this.dispose();
        }

        if (__DEV__ && this._tracer.enabled) { this._tracer.leave(this, 'run sync success'); }

        if (resolve !== void 0) {
          resolve(ret as UnwrapPromise<T>);
        }

        if (!this.persistent && reusable) {
          taskQueue['returnToPool'](this);
        }
      }
    } catch (err) {
      if (!this.persistent) {
        this.dispose();
      }

      if (__DEV__ && this._tracer.enabled) { this._tracer.leave(this, 'run sync error'); }

      if (reject !== void 0) {
        reject(err as TaskAbortError<T>);
      } else {
        throw err;
      }
    }
  }

  public cancel(): boolean {
    if (__DEV__ && this._tracer.enabled) { this._tracer.enter(this, 'cancel'); }

    if (this._status === TaskStatus.pending) {
      const taskQueue = this.taskQueue;
      const reusable = this.reusable;
      const reject = this._reject;

      taskQueue.remove(this);

      if (taskQueue.isEmpty) {
        taskQueue.cancel();
      }

      this._status = TaskStatus.canceled;

      this.dispose();

      if (reusable) {
        taskQueue['returnToPool'](this);
      }

      if (reject !== void 0) {
        reject(new TaskAbortError(this));
      }

      if (__DEV__ && this._tracer.enabled) { this._tracer.leave(this, 'cancel true =pending'); }

      return true;
    } else if (this._status === TaskStatus.running && this.persistent) {
      this.persistent = false;

      if (__DEV__ && this._tracer.enabled) { this._tracer.leave(this, 'cancel true =running+persistent'); }

      return true;
    }

    if (__DEV__ && this._tracer.enabled) { this._tracer.leave(this, 'cancel false'); }

    return false;
  }

  public reset(time: number): void {
    if (__DEV__ && this._tracer.enabled) { this._tracer.enter(this, 'reset'); }

    const delay = this.queueTime - this.createdTime;
    this.createdTime = time;
    this.queueTime = time + delay;
    this._status = TaskStatus.pending;

    this._resolve = void 0;
    this._reject = void 0;
    this._result = void 0;

    if (__DEV__ && this._tracer.enabled) { this._tracer.leave(this, 'reset'); }
  }

  public reuse(
    time: number,
    delay: number,
    preempt: boolean,
    persistent: boolean,
    suspend: boolean,
    callback: TaskCallback<T>,
  ): void {
    if (__DEV__ && this._tracer.enabled) { this._tracer.enter(this, 'reuse'); }

    this.createdTime = time;
    this.queueTime = time + delay;
    this.preempt = preempt;
    this.persistent = persistent;
    this.suspend = suspend;
    this.callback = callback;
    this._status = TaskStatus.pending;

    if (__DEV__ && this._tracer.enabled) { this._tracer.leave(this, 'reuse'); }
  }

  public dispose(): void {
    if (__DEV__ && this._tracer.enabled) { this._tracer.trace(this, 'dispose'); }

    this.callback = (void 0)!;
    this._resolve = void 0;
    this._reject = void 0;
    this._result = void 0;
  }
}

function taskStatus(status: TaskStatus): 'pending' | 'running' | 'canceled' | 'completed' {
  switch (status) {
    case TaskStatus.pending: return 'pending';
    case TaskStatus.running: return 'running';
    case TaskStatus.canceled: return 'canceled';
    case TaskStatus.completed: return 'completed';
  }
}

class Tracer {
  public enabled: boolean = false;
  private depth: number = 0;
  public constructor(private readonly console: Platform['console']) {}

  public enter(obj: TaskQueue | Task, method: string): void {
    this.log(`${'  '.repeat(this.depth++)}> `, obj, method);
  }
  public leave(obj: TaskQueue | Task, method: string): void {
    this.log(`${'  '.repeat(--this.depth)}< `, obj, method);
  }
  public trace(obj: TaskQueue | Task, method: string): void {
    this.log(`${'  '.repeat(this.depth)}- `, obj, method);
  }

  private log(prefix: string, obj: TaskQueue | Task, method: string): void {
    if (obj instanceof TaskQueue) {
      const processing = obj['processing'].length;
      const pending = obj['pending'].length;
      const delayed = obj['delayed'].length;
      const flushReq = obj['flushRequested'];
      const susTask = !!obj._suspenderTask;

      const info = `processing=${processing} pending=${pending} delayed=${delayed} flushReq=${flushReq} susTask=${susTask}`;
      this.console.log(`${prefix}[Q.${method}] ${info}`);
    } else {
      const id = obj['id'];
      const created = Math.round(obj['createdTime'] * 10) / 10;
      const queue = Math.round(obj['queueTime'] * 10) / 10;
      const preempt = obj['preempt'];
      const reusable = obj['reusable'];
      const persistent = obj['persistent'];
      const suspend = obj['suspend'];
      const status = taskStatus(obj['_status']);

      const info = `id=${id} created=${created} queue=${queue} preempt=${preempt} persistent=${persistent} reusable=${reusable} status=${status} suspend=${suspend}`;
      this.console.log(`${prefix}[T.${method}] ${info}`);
    }
  }
}
export const enum TaskQueuePriority {
  render     = 0,
  macroTask  = 1,
  postRender = 2,
}

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
  /**
   * If `true`, and the task callback returns a promise, that promise will be awaited before consecutive tasks are run.
   *
   * Defaults to `false`.
   */
  suspend?: boolean;
};

const defaultQueueTaskOptions: Required<QueueTaskOptions> = {
  delay: 0,
  preempt: false,
  persistent: false,
  reusable: true,
  suspend: false,
};

type PResolve<T> = (value: T | PromiseLike<T>) => void;
type PReject<T = any> = (reason?: T) => void;
let $resolve: PResolve<any>;
let $reject: PReject;
function executor<T>(resolve: PResolve<T>, reject: PReject): void {
  $resolve = resolve;
  $reject = reject;
}

type ExposedPromise<T = void> = Promise<T> & {
  resolve: PResolve<T>;
  reject: PReject;
};

/**
 * Efficiently create a promise where the `resolve` and `reject` functions are stored as properties on the prommise itself.
 */
function createExposedPromise<T>(): ExposedPromise<T> {
  const p = new Promise<T>(executor) as ExposedPromise<T>;
  p.resolve = $resolve;
  p.reject = $reject;
  return p;
}
