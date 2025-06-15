/* eslint-disable jsdoc/check-tag-names */
/* eslint-disable @typescript-eslint/no-explicit-any */
const tsPending = 'pending';
const tsRunning = 'running';
const tsCompleted = 'completed';
const tsCanceled = 'canceled';
export type TaskStatus = typeof tsPending | typeof tsRunning | typeof tsCompleted | typeof tsCanceled;
export type TaskCallback<T = any> = () => T;

const resolvedPromise = Promise.resolve();
let runScheduled = false;
let isAutoRun = false;

const queue: (Task | (() => unknown))[] = [];
let pendingAsyncCount = 0;
let settlePromise: Promise<boolean> | null = null;
let taskErrors: unknown[] = [];
let settlePromiseResolve: ((value: boolean) => void) | null = null;
let settlePromiseReject: ((reason?: any) => void) | null = null;

const requestRun = () => {
  if (!runScheduled) {
    runScheduled = true;
    void resolvedPromise.then(() => {
      runScheduled = false;
      isAutoRun = true;
      runTasks();
    });
  }
};

const signalSettled = (hasPerformedWork: boolean) => {
  if (settlePromise && queue.length === 0 && pendingAsyncCount === 0) {
    settlePromise = null;
    if (taskErrors.length > 0) {
      const errors = taskErrors;
      taskErrors = [];
      if (errors.length === 1) {
        settlePromiseReject!(errors[0]);
      } else {
        settlePromiseReject!(new AggregateError(errors, 'One or more tasks failed.'));
      }
    } else {
      settlePromiseResolve!(hasPerformedWork);
    }
  }
};

/**
 * @description Processes all currently pending tasks in the task queue.
 *
 * @remarks
 * This function iterates through the task queue, executing each task:
 * - Synchronous tasks (raw functions) are invoked directly.
 * - Asynchronous tasks (instances of `Task`) have their `run()` method called,
 * which initiates their async operation.
 *
 * `runTasks` is invoked automatically in a microtask after tasks are added via
 * `queueTask` or `queueAsyncTask`. However, it can also be called manually
 * to force immediate processing of the queue.
 *
 * If `runTasks` is called manually, and any tasks throw errors during their execution:
 * - If a single task fails, that task's error is thrown directly by `runTasks`.
 * - If multiple tasks fail, an `AggregateError` containing all encountered errors
 * is thrown by `runTasks`.
 *
 * Regardless of how it's called, `runTasks` ensures that a promise is available,
 * which `tasksSettled()` uses to allow awaiting the completion of all work.
 * Any errors encountered are collected and will cause the promise returned by
 * `tasksSettled()` to reject.
 *
 * @throws {Error|AggregateError} If invoked manually and one or more tasks fail during execution.
 */
export const runTasks = () => {
  const isManualRun = !isAutoRun;
  isAutoRun = false;
  settlePromise ??= new Promise<boolean>((resolve, reject) => {
    settlePromiseResolve = resolve;
    settlePromiseReject = reject;
  });

  const isEmpty = queue.length === 0;
  while (queue.length > 0) {
    const task = queue.shift()!;
    if (task instanceof Task) {
      task.run();
    } else {
      try {
        trackWork(task());
      } catch (err) {
        taskErrors.push(err);
      }
    }
  }
  // Make a copy; this is for testing, signalSettled will clear the array
  const errors = taskErrors.slice();
  signalSettled(!isEmpty);
  if (isManualRun && errors.length > 0) {
    if (errors.length === 1) {
      throw errors[0];
    } else {
      throw new AggregateError(errors, 'One or more tasks failed.');
    }
  }
};

/**
 * @description Returns a promise that resolves when the task queue is empty and all
 * active asynchronous tasks (queued via `queueAsyncTask`) have completed,
 * been canceled, or have otherwise settled.
 *
 * @remarks
 * This is the primary API for awaiting the completion of all work scheduled through
 * the task queue. It's essential for scenarios like testing or coordinating updates
 * after a batch of operations.
 *
 * The promise will reject if any task executed since the last settlement
 * (or the start of the current batch of work) has thrown an error, or if an
 * asynchronous task's underlying promise has rejected.
 * - If a single error occurred, the promise rejects with that error.
 * - If multiple errors occurred, the promise rejects with an `AggregateError`
 * containing all collected errors.
 *
 * @returns {Promise<boolean>} A promise that resolves when all tasks in the queue
 * have settled, or rejects if any task encountered an error.
 * The resolved promise returns `true` if one or more tasks were queued , otherwise returns `false`.
 *
 * @example
 * ```typescript
 * import { queueTask, queueAsyncTask, tasksSettled } from '@aurelia/runtime';
 *
 * queueTask(() => console.log('Sync task done'));
 *
 * queueAsyncTask(async () => {
 *   await new Promise(r => setTimeout(r, 100));
 *   console.log('Async task done');
 * });
 *
 * await tasksSettled();
 * console.log('All tasks have settled successfully');
 * ```
 */
export const tasksSettled = (): Promise<boolean> => {
  // do not convert to async function (it will wrap the internal promise and cause test code to fail)
  if (settlePromise) {
    return settlePromise;
  }
  if (queue.length > 0 || pendingAsyncCount > 0) {
    return settlePromise ??= new Promise<boolean>((resolve, reject) => {
      settlePromiseResolve = resolve;
      settlePromiseReject = reject;
    });
  }
  // Not strictly necessary but without this we need a lot of extra `await Promise.resolve()` in test code
  return resolvedPromise.then(() => {
    if (queue.length > 0 || pendingAsyncCount > 0) {
      return settlePromise ??= new Promise<boolean>((resolve, reject) => {
        settlePromiseResolve = resolve;
        settlePromiseReject = reject;
      });
    }
    return false;
  });
};

/**
 * @description Enqueues a synchronous callback function to be executed on the next tick.
 *
 * @param {TaskCallback} callback - The synchronous function to be added to the queue.
 * This function will be invoked by `runTasks` on the next tick.
 *
 * @remarks
 * If the `callback` throws an error during its execution, this error is caught by the
 * scheduler. It will then contribute to the rejection of the promise returned by
 * `tasksSettled()`.
 *
 * @example
 * ```typescript
 * import { queueTask, tasksSettled } from '@aurelia/runtime';
 *
 * console.log('Before queueing task');
 * queueTask(() => {
 *   console.log('Synchronous task is executing');
 * });
 * console.log('Task queued');
 *
 * tasksSettled().then(() => console.log('Tasks settled'));
 * // Expected output order:
 * // Before queueing task.
 * // Task queued.
 * // Synchronous task is executing.
 * // Tasks settled.
 * ```
 */
export const queueTask = <R = any>(callback: TaskCallback<R>) => {
  requestRun();
  queue.push(callback);
};

/**
 * @description Enqueues a callback function that can perform synchronous or asynchronous work.
 *
 * @template R The underlying value type of the task's `result` property. For instance, if the
 * `callback` returns `Promise<string>`, then `R` will be `string`, and the `result` property
 * of the task will be of type `Promise<string>`.
 *
 * @param {TaskCallback} callback - The function to be enqueued.
 * This function will be invoked by `runTasks` on the next tick.
 * If it returns a `Promise`, the scheduler waits for this promise to settle, which can be
 * awaited via `tasksSettled()`
 *
 * @returns {Task<R>} A {@link Task} object that represents the lifecycle and result of the
 * operation. This object provides:
 * - `result`: A promise that resolves with the task's outcome or rejects if the task fails.
 * - `status`: A string indicating the current state of the task ('pending', 'running', 'completed', 'canceled').
 *
 * @remarks
 * Errors thrown synchronously within the `callback`, or rejections from a `Promise`
 * returned by the `callback`, are caught by the scheduler. These errors will cause
 * the `Task`'s `result` promise to reject and will also contribute to the
 * rejection of the promise returned by `tasksSettled()`.
 *
 * The task can be canceled via its `cancel()` method before it starts running.
 *
 * @example
 * ```typescript
 * // TODO
 * ```
 */
export const queueAsyncTask = <R = any>(callback: TaskCallback<R>, options?: { delay?: number }) => {
  const task = new Task<R>(callback, options?.delay);

  if (task.delay != null && task.delay > 0) {
    ++pendingAsyncCount;
    task._timerId = setTimeout(() => {
      --pendingAsyncCount;
      task._timerId = undefined;

      if (task.status === tsCanceled) {
        signalSettled(true);
        return;
      }

      queue.push(task);
      requestRun();
    }, task.delay);
  } else {
    queue.push(task);
    requestRun();
  }

  return task;
};

export class TaskAbortError<T = any> extends Error {
  public constructor(public task: Task<T>) {
    super(`Task ${task.id} was canceled.`);
  }
}

let id = 0;

export class Task<R = any> {
  public readonly id: number = ++id;

  /** @internal */
  public _timerId?: number;

  /** @internal */
  private _resolve!: (value: Awaited<R>) => void;
  /** @internal */
  private _reject!: (reason?: any) => void;

  /** @internal */
  private readonly _result: Promise<Awaited<R>>;
  public get result(): Promise<Awaited<R>> {
    return this._result;
  }

  /** @internal */
  private _status: TaskStatus = tsPending;
  public get status(): TaskStatus {
    return this._status;
  }

  public constructor(
    public callback: TaskCallback<R>,
    public delay?: number,
  ) {
    this._result = new Promise<Awaited<R>>((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    });
  }

  /** @internal */
  public run(): void {
    if (this._status !== tsPending) {
      throw new Error(`Cannot run task in ${this._status} state`);
    }
    this._status = tsRunning;
    let ret: unknown;
    try {
      ret = this.callback();
    } catch (err) {
      this._status = tsCanceled;
      this._reject(err);
      taskErrors.push(err);
      return;
    }

    if (ret instanceof Promise) {
      ++pendingAsyncCount;
      ret.then(result => {
        this._status = tsCompleted;
        this._resolve(result);
      }).catch(err => {
        this._status = tsCanceled;
        this._reject(err);
        taskErrors.push(err);
      }).finally(() => {
        --pendingAsyncCount;
        signalSettled(true);
      });
    } else {
      this._status = tsCompleted;
      this._resolve(ret as Awaited<R>);
    }
  }

  public cancel(): boolean {
    if (this._timerId !== undefined) {
      clearTimeout(this._timerId);
      --pendingAsyncCount;
      this._timerId = undefined;
      this._status = tsCanceled;
      this._reject(new TaskAbortError(this));
      signalSettled(true);
      return true;
    }

    if (this._status === tsPending) {
      const idx = queue.indexOf(this);
      if (idx > -1) {
        queue.splice(idx, 1);
        this._status = tsCanceled;
        this._reject(new TaskAbortError(this));
        signalSettled(true);
        return true;
      }
    }
    return false;
  }
}

export const trackWork = (promise: unknown): void => {
  if (!(promise instanceof Promise)) return;

  ++pendingAsyncCount;

  settlePromise ??= new Promise<boolean>((resolve, reject) => {
    settlePromiseResolve = resolve;
    settlePromiseReject = reject;
  });

  promise.catch(err => {
    taskErrors.push(err);
  }).finally(() => {
    --pendingAsyncCount;
    signalSettled(true);
  });
};
