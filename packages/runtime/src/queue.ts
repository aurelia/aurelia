/* eslint-disable jsdoc/require-hyphen-before-param-description */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable jsdoc/check-indentation */
/* eslint-disable jsdoc/no-multi-asterisks */
import { noop } from '@aurelia/kernel';
import { Platform } from '@aurelia/platform';

const tsPending = 'pending';
const tsRunning = 'running';
const tsCompleted = 'completed';
const tsCanceled = 'canceled';
export type TaskStatus = typeof tsPending | typeof tsRunning | typeof tsCompleted | typeof tsCanceled;
export type TaskCallback<T = any> = () => T;

interface TaskQueueErrorRecord {
  error: unknown;
  reportWhenUnobserved: boolean;
}

export interface TaskQueueOptions {
  /**
   * Target maximum milliseconds an automatically scheduled queue drain should
   * run before yielding to a host timer. Lower values give the browser more
   * opportunities to paint and handle input during large flushes; higher
   * values favor throughput. This is a pacing hint, not a frame-rate guarantee.
   */
  flushBudget?: number;
}

/**
 * Fully resolved task queue options.
 */
export type TaskQueueResolvedOptions = Required<TaskQueueOptions>;

const resolvedPromise = Promise.resolve();
const taskQueueYieldDelay = 0;
const taskQueueClockCheckInterval = 256;
const taskQueueManualFlushBudget = 100;
const defaultTaskQueueOptions: TaskQueueResolvedOptions = {
  flushBudget: 8,
};
let taskQueueOptions: TaskQueueResolvedOptions = { ...defaultTaskQueueOptions };
let runScheduled = false;
let isAutoRun = false;
let isFlushing = false;

const queue: (Task | RecurringTask | (() => unknown))[] = [];
let queueIndex = 0;
const recurringTasks: RecurringTask[] = [];
let pendingAsyncCount = 0;
let settlePromise: Promise<boolean> | null = null;
let taskErrors: TaskQueueErrorRecord[] = [];
let settlePromiseResolve: ((value: boolean) => void) | null = null;
let settlePromiseReject: ((reason?: any) => void) | null = null;

const normalizeBudget = (value: number | undefined, fallback: number) => {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : fallback;
};

/**
 * Read the currently active task queue options.
 */
export const getTaskQueueOptions = (): TaskQueueResolvedOptions => {
  return { ...taskQueueOptions };
};

/**
 * Configure how automatic task queue drains pace themselves.
 *
 * The `flushBudget` option lets tests, host environments, and applications
 * adjust roughly how long Aurelia works before yielding to a host timer.
 * This can make large automatic flushes friendlier to browser rendering and
 * input, or to favor raw throughput when the host can tolerate longer turns.
 * It does not add an automatic deadlock timeout; explicit `runTasks()` calls
 * remain synchronous and use an internal guard.
 * The function returns the previous options so callers can restore them after
 * overriding them.
 */
export const configureTaskQueue = (options: TaskQueueOptions): TaskQueueResolvedOptions => {
  const previousOptions = getTaskQueueOptions();
  taskQueueOptions = {
    flushBudget: normalizeBudget(options.flushBudget, previousOptions.flushBudget),
  };
  return previousOptions;
};

const requestRun = () => {
  if (!runScheduled && !isFlushing) {
    runScheduled = true;
    void resolvedPromise.then(() => {
      runScheduled = false;
      isAutoRun = true;
      runTasks();
    });
  }
};

const requestTimerRun = () => {
  if (!runScheduled) {
    runScheduled = true;
    Platform.getOrCreate(globalThis).setTimeout(() => {
      runScheduled = false;
      isAutoRun = true;
      runTasks();
    }, taskQueueYieldDelay);
  }
};

const isQueueDrained = () => queueIndex >= queue.length;

const clearQueue = () => {
  queue.length = 0;
  queueIndex = 0;
};

const compactQueue = () => {
  if (queueIndex > 0) {
    queue.splice(0, queueIndex);
    queueIndex = 0;
  }
};

const recordTaskError = (error: unknown, reportWhenUnobserved: boolean) => {
  taskErrors.push({ error, reportWhenUnobserved });
};

const resetSettlePromise = () => {
  settlePromise = null;
  settlePromiseResolve = null;
  settlePromiseReject = null;
};

const toErrorValues = (errors: TaskQueueErrorRecord[]) => errors.map(x => x.error);

const getErrorSummary = (error: unknown) => {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }
  return String(error);
};

const createAggregateErrorMessage = (errors: readonly unknown[]) => {
  const count = errors.length;
  const preview = errors.slice(0, 3).map((error, index) => `\n  ${index + 1}. ${getErrorSummary(error)}`).join('');
  const extra = count > 3 ? `\n  ...and ${count - 3} more.` : '';
  return `Aurelia task queue failed with ${count} errors.${preview}${extra}\nInspect the AggregateError.errors array for the original errors and stack traces.`;
};

export class TaskQueueAggregateError extends AggregateError {
  public override cause: unknown;

  /**
   * Creates an aggregate error with a task-queue-specific message while keeping
   * every original error available through the standard `errors` property.
   */
  public constructor(errors: readonly unknown[]) {
    super(errors, createAggregateErrorMessage(errors));
    this.name = 'TaskQueueAggregateError';
    this.cause = errors[0];
  }
}

const createTaskQueueAggregateError = (errors: readonly unknown[]) => {
  return new TaskQueueAggregateError(errors);
};

const reportUnobservedTaskErrors = (errors: TaskQueueErrorRecord[]) => {
  const $console = (globalThis as { console?: { error(...args: unknown[]): void } }).console;
  if ($console === undefined) {
    return;
  }
  for (const { error, reportWhenUnobserved } of errors) {
    if (reportWhenUnobserved) {
      $console.error(error);
    }
  }
};

const rejectSettled = (error: unknown) => {
  if (settlePromise !== null) {
    settlePromiseReject!(error);
    resetSettlePromise();
  }
};

const signalSettled = (hasPerformedWork: boolean, reportUnobservedErrors = true) => {
  if (isQueueDrained() && pendingAsyncCount === 0) {
    const errors = taskErrors;
    taskErrors = [];
    if (settlePromise !== null) {
      const resolve = settlePromiseResolve!;
      const reject = settlePromiseReject!;
      resetSettlePromise();
      if (errors.length === 1) {
        reject(errors[0].error);
      } else if (errors.length > 1) {
        reject(createTaskQueueAggregateError(toErrorValues(errors)));
      } else {
        resolve(hasPerformedWork);
      }
    } else if (reportUnobservedErrors && errors.length > 0) {
      reportUnobservedTaskErrors(errors);
    }
  }
};

const failQueue = (error: Error) => {
  clearQueue();
  taskErrors = [];
  rejectSettled(error);
};

/**
 * **Immediately drain** Aurelia's internal task queue.
 *
 * Normally the task queue starts this automatically on the next micro-task
 * whenever you enqueue work with {@link queueTask} or a non-delayed
 * {@link queueAsyncTask}. Delayed async tasks start after their timer expires.
 * Very large automatic drains may yield to a host timer before continuing so
 * the browser has a chance to breathe; use {@link tasksSettled} when you need
 * to wait for the queue to become fully idle.
 * Calling it yourself is only useful in **low-level tests, debugging sessions,
 * or custom instrumentation** where you need a _synchronous_ flush.
 *
 * ### What it does
 * 1. Removes each item from the queue (FIFO) and runs it.
 * 2. If an item queues more work, the loop continues until the queue is empty.
 *    Manual drains remain synchronous and are guarded by a small internal cap.
 *    Automatic drains may continue through timer-backed slices until they
 *    become idle; they do not throw a deadlock error merely because the queue
 *    keeps producing work.
 * 3. Collects every uncaught exception.
 *    * When you invoke the function manually those errors are re-thrown —
 *      either the single error or a {@link TaskQueueAggregateError} if several
 *      tasks failed.*
 *    * During an automatic run they are captured so the app keeps
 *      running. If `tasksSettled()` is observing the current cycle it rejects;
 *      otherwise unobserved synchronous queue errors are reported to the console
 *      and cleared from the cycle.
 * 4. Signals the internal "settled promise" so `await tasksSettled()` continues
 *    once the queue and all tracked async work have finished.
 *
 * > **Tip:** In most cases you should prefer `await tasksSettled()`; it waits
 * > for both the synchronous drain **and** any asynchronous work started by
 * > the tasks. `runTasks()` is only needed when you must stay purely
 * > synchronous (e.g. inside a non-async test).
 *
 * @throws Error            If a task throws and you called the function
 *                          directly.
 * @throws TaskQueueAggregateError If multiple tasks throw.
 * @throws Error            "Potential deadlock detected" when a synchronous
 *                          manual drain does not settle within the internal
 *                          guard budget.
 *
 * @example
 * Synchronous assertion in a non-async test
 * ```ts
 * it('updates the DOM synchronously', () => {
 *   vm.value = 42;
 *   runTasks(); // flush queue synchronously
 *   expect(el.textContent).toBe('42');
 * });
 * ```
 *
 * @example
 * Debugging pending tasks in the browser console
 * ```ts
 * // In the app startup code
 * window.runTasks = runTasks;
 *
 * // After pausing in a breakpoint
 * window.runTasks(); // force the task queue to drain now
 * ```
 *
 * @example
 * Fail fast when a task throws during manual drain
 * ```ts
 * try {
 *   runTasks();
 * } catch (e) {
 *   console.error('A queued operation failed:', e);
 *   throw e; // make the test fail
 * }
 * ```
 */
export const runTasks = () => {
  const isManualRun = !isAutoRun;
  isAutoRun = false;

  const isEmpty = isQueueDrained();
  const platform = Platform.getOrCreate(globalThis);
  const startedAt = platform.performanceNow();
  const flushBudget = isManualRun
    ? taskQueueManualFlushBudget
    : taskQueueOptions.flushBudget;
  let processedCount = 0;
  let nextClockCheck = 1;
  let shouldYield = false;

  isFlushing = true;
  try {
    while (queueIndex < queue.length) {
      const task = queue[queueIndex++]!;
      if (typeof task === 'function') {
        try {
          task();
        } catch (err) {
          recordTaskError(err, true);
        }
      } else {
        task.run();
      }

      if (++processedCount === nextClockCheck && !isQueueDrained()) {
        nextClockCheck += taskQueueClockCheckInterval;
        const elapsed = platform.performanceNow() - startedAt;
        if (elapsed >= flushBudget) {
          if (isManualRun) {
            const error = new Error(`Potential deadlock detected. The task queue did not settle within ${flushBudget}ms during a synchronous flush.`);
            failQueue(error);
            throw error;
          }
          shouldYield = true;
          break;
        }
      }
    }
  } catch (err) {
    isFlushing = false;
    throw err;
  }
  isFlushing = false;

  if (shouldYield) {
    compactQueue();
    requestTimerRun();
    return;
  }

  compactQueue();

  // Make a copy; this is for testing, signalSettled will clear the array
  const errors = toErrorValues(taskErrors);
  signalSettled(!isEmpty, !isManualRun);
  if (isManualRun && errors.length > 0) {
    if (errors.length === 1) {
      throw errors[0];
    } else {
      throw createTaskQueueAggregateError(errors);
    }
  }
};

/**
 * Gets a read-only copy of the list of all active recurring tasks.
 *
 * While the returned array is a copy, the `RecurringTask` objects within it
 * are the actual instances managed by the task queue. This is useful for
 * inspection or for cleaning up all active tasks by iterating over the array
 * and calling `task.cancel()` on each one.
 *
 * @returns A new array containing all currently active {@link RecurringTask} instances.
 *
 * @example
 * Cleaning up after a test
 * ```ts
 * afterEach(() => {
 *   // Ensure no recurring tasks leak between tests
 *   for (const task of getRecurringTasks()) {
 *     task.cancel();
 *   }
 * });
 * ```
 *
 * @example
 * Inspecting active tasks for debugging
 * ```ts
 * function logActiveRecurringTasks() {
 *   const tasks = getRecurringTasks();
 *   if (tasks.length > 0) {
 *     console.log('Active recurring tasks:', tasks.map(t => `ID ${t.id}`));
 *   } else {
 *     console.log('No active recurring tasks.');
 *   }
 * }
 * ```
 */
export const getRecurringTasks = () => {
  return recurringTasks.slice();
};

/**
 * @returns - true if there is pending work in the task queue and false otherwise.
 */
export const isTaskQueueEmpty = () => isQueueDrained() && pendingAsyncCount === 0;

/**
 * Return a promise that resolves once **all queued work has finished** and the
 * Aurelia task queue is completely idle.
 *
 * Conceptually similar to a browser's "micro-task drain" (the classic
 * `await Promise.resolve()` trick) but extended to cover:
 *
 * * synchronous callbacks queued via {@link queueTask}
 * * asynchronous or delayed tasks queued via {@link queueAsyncTask}
 * * any promises those callbacks return
 *
 * Perfect for unit / component / e2e tests where you must wait for Aurelia
 * bindings, observers, and queued async work to flush **without guessing a
 * timeout**.
 *
 * #### Behaviour
 * | Situation                                                | Result                             |
 * |----------------------------------------------------------|------------------------------------|
 * | Work was pending or processed before the queue became idle | **resolves `true`**              |
 * | Nothing was pending when you called the function           | **resolves `false`**             |
 * | The observed cycle contains one task error                 | **rejects** with that error      |
 * | The observed cycle contains multiple task errors           | **rejects** with a `TaskQueueAggregateError` |
 *
 * Re-invocations while work is still pending return the **same** promise; once
 * everything settles, the next call starts a fresh cycle.
 *
 * @returns Promise<boolean> &mdash; `true` if any work was processed,
 *          otherwise `false`.
 *
 * @throws {*} Propagates the error(s) thrown by tasks, see table above.
 *
 * @example
 * <caption>Flush bindings in a component test
 * ```ts
 * vm.todoText = 'Write docs';
 * vm.addTodo();
 * await tasksSettled(); // wait for DOM updates and queued async work
 * expect(list.children.length).toBe(1);
 * ```
 *
 * @example
 * Playwright helper to wait for framework idle
 * ```ts
 * // In the app startup code
 * window.tasksSettled = tasksSettled;
 *
 * // helpers.ts
 * export async function waitForIdle(page: Page) {
 *   await page.evaluate(() => window.tasksSettled());
 * }
 *
 * await page.getByRole('button', { name: 'Save' }).click();
 * await waitForIdle(page); // no arbitrary sleeps for task-queue work
 * ```
 *
 * @example
 * Detect and surface aggregated task errors
 * ```ts
 * queueTask(() => { throw new Error('first'); });
 * queueTask(() => { throw new Error('second'); });
 *
 * try {
 *   await tasksSettled();
 * } catch (e) {
 *   if (e instanceof TaskQueueAggregateError) {
 *     console.log('Multiple failures:', e.errors.length);
 *   }
 * }
 * ```
 *
 * @example
 * Ensure every test exits cleanly using the boolean result
 * ```ts
 * afterEach(async () => {
 *   const didWork = await tasksSettled();
 *   if (didWork) {
 *     // Failing here highlights orphaned task-queue work left by the test
 *     throw new Error('Test left pending work on the Aurelia task queue');
 *   }
 * });
 * ```
 */
export const tasksSettled = (): Promise<boolean> => {
  // do not convert to async function (it will wrap the internal promise and cause test code to fail)
  if (settlePromise) {
    return settlePromise;
  }
  if (!isQueueDrained() || pendingAsyncCount > 0) {
    return settlePromise ??= new Promise<boolean>((resolve, reject) => {
      settlePromiseResolve = resolve;
      settlePromiseReject = reject;
    });
  }
  // Not strictly necessary but without this we need a lot of extra `await Promise.resolve()` in test code
  return resolvedPromise.then(() => {
    if (!isQueueDrained() || pendingAsyncCount > 0) {
      return settlePromise ??= new Promise<boolean>((resolve, reject) => {
        settlePromiseResolve = resolve;
        settlePromiseReject = reject;
      });
    }
    return false;
  });
};

/**
 * Queue a **synchronous** callback onto Aurelia's internal task queue.
 *
 * The task queue starts on the next micro-task after the current call-stack has
 * unwound. Small queues usually finish in that micro-task drain; very large
 * queues may continue through timer-backed slices. Use {@link tasksSettled}
 * when code needs to wait for completion rather than for the first task queue
 * turn.
 * Because these tasks are *fire-and-forget* they:
 *
 * * **cannot be awaited** – if you need an awaitable handle use
 *   {@link queueAsyncTask} instead;
 * * are still included in the bookkeeping for {@link tasksSettled}, so tests
 *   that `await tasksSettled()` will not proceed until every queued callback
 *   has run.
 *
 * **Intended audience**: framework contributors, advanced plug-ins, and custom
 * binding strategies. Typical application code rarely needs this API.
 *
 * @param callback - A *synchronous* function to execute after the current
 *                   JavaScript turn.  Any exception it throws is captured and
 *                   surfaced collectively via `tasksSettled()` or `runTasks()`,
 *                   or reported to the console when an automatic cycle is
 *                   otherwise unobserved.
 */
export const queueTask = (callback: TaskCallback) => {
  requestRun();
  queue.push(callback);
};

/**
 * Queue a callback to run **asynchronously** on Aurelia's task queue
 * and get back a {@link Task} object you can:
 *
 * * `await` – directly on the `Task` object itself
 * * cancel – via `task.cancel()`
 * * inspect – via `task.status`
 *
 * Any callbacks scheduled this way are automatically tracked by the framework,
 * so `await tasksSettled()` waits until all tasks (and any promises they return)
 * have finished.
 *
 * @template R The value returned by `callback`, or the value the promise it
 *             returns resolves to.
 *
 * @param callback  - A function to execute. It may be synchronous or asynchronous;
 *                    if it returns a promise, the task queue treats the task as
 *                    *running* until that promise settles.
 *
 * @param options.delay  - Optional delay **in milliseconds** before the callback
 *                         is queued. While waiting, the task can still be
 *                         cancelled.
 *
 * @returns A thennable {@link Task} object representing the scheduled work.
 *
 * @throws {TaskAbortError} Awaiting the returned `Task` rejects with this error
 *                          if the task is cancelled before it starts.
 * @throws {*}              Awaiting the returned `Task` propagates any error
 *                          thrown by `callback`.
 *
 * ---
 *
 * @example
 * Component integration tests
 * ```ts
 * it('increments the view when the button is clicked', async () => {
 *   const { vm, host } = await createFixture(`<counter></counter>`);
 *   host.querySelector('button')!.click();
 *
 *   // This will resolve after every queued task has finished,
 *   // including rendering.
 *   await tasksSettled();
 *
 *   expect(host.textContent).toContain('1');
 * });
 * ```
 *
 * @example
 * Debounce a network search – cancel if the user keeps typing
 * ```ts
 * let current: Task<SearchResult[]> | null = null;
 *
 * function search(term: string) {
 *   current?.cancel(); // abort the previous call
 *
 *   current = queueAsyncTask(async () => {
 *     const resp = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
 *     return resp.json() as Promise<SearchResult[]>;
 *   }, { delay: 300 }); // classic 300 ms debounce
 *
 *   // The Task is "thennable" and can be awaited directly by callers.
 *   return current;
 * }
 * ```
 *
 * @example
 * Schedule expensive canvas work onto the next animation frame (test-friendly)
 * ```ts
 * export function scheduleRender(frameData: Data) {
 *   queueAsyncTask(
 *     () => new Promise<void>(resolve => requestAnimationFrame(() => {
 *       draw(frameData); // expensive canvas work
 *       resolve();
 *     }))
 *   );
 * }
 * ```
 *
 * @example
 * Auto-dismiss a toast after 5 s (test-friendly)
 * ```ts
 * export function showToast(msg: string) {
 *   const toast = createToast(msg);
 *   document.body.appendChild(toast);
 *
 *   queueAsyncTask(() => toast.remove(), { delay: 5000 });
 * }
 * ```
 */
export const queueAsyncTask = <R = any>(callback: TaskCallback<R>, options?: { delay?: number }) => {
  const task = new Task<R>(callback, options?.delay);

  if (task.delay != null && task.delay > 0) {
    ++pendingAsyncCount;
    task._timerId = Platform.getOrCreate(globalThis).setTimeout(() => {
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

/**
 * A handle returned by {@link queueAsyncTask} that lets you observe and control
 * the life-cycle of a piece of scheduled work.
 *
 * Tasks move through **four immutable states**:
 *
 * | State      | Meaning | When it changes |
 * |------------|---------|-----------------|
 * | `"pending"`   | Waiting in the queue <br>(or in a `setTimeout` delay). | Immediately after creation. |
 * | `"running"`   | `callback` is executing. | When the task queue dequeues the task. |
 * | `"completed"` | Callback (and any returned promise) settled. | After `callback` finishes / promise resolves. |
 * | `"canceled"`  | Task was aborted **or** callback/promise rejected. | When `cancel()` succeeds, or on error. |
 *
 * @template R Type of the value produced by the callback.
 */
export class Task<R = any> {
  /** @internal */
  private static _taskId = 0;
  /**
   * Unique, incrementing identifier – handy for logging / debugging.
   */
  public readonly id: number = ++Task._taskId;

  /** @internal */
  public _timerId?: number;

  /** @internal */
  private _resolve!: (value: Awaited<R>) => void;
  /** @internal */
  private _reject!: (reason?: any) => void;

  /** @internal */
  private readonly _result: Promise<Awaited<R>>;
  /**
   * The underlying promise that represents the task's execution.
   *
   * It:
   * * **fulfils** with the callback's return value, or
   * * **rejects** with any error from the callback or a `TaskAbortError`.
   *
   * It is recommended to `await` the `Task` object directly rather than its
   * `.result` property. This property is provided for advanced use cases, such
   * as interoperating with libraries that require a native `Promise` instance or
   * for use with promise-composition functions like `Promise.all()`.
   *
   * @example
   * // Using .result with Promise.all to await multiple tasks in parallel
   * const task1 = queueAsyncTask(fetchUserData);
   * const task2 = queueAsyncTask(fetchSiteSettings);
   *
   * // We access .result here because Promise.all requires an array of Promises.
   * const [userData, siteSettings] = await Promise.all([task1.result, task2.result]);
   */
  public get result(): Promise<Awaited<R>> {
    return this._result;
  }

  /** @internal */
  private _status: TaskStatus = tsPending;
  /**
   * Current immutable status of the task.
   *
   * @example
   * ```ts
   * const task = queueAsyncTask(() => 123);
   * console.log(task.status); // "pending"
   * await task;
   * console.log(task.status); // "completed"
   * ```
   */
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

  /**
   * **Delegates to the underlying `.result` promise's `.then()` method.**
   *
   * Attaches callbacks for the resolution and/or rejection of the Promise.
   * @param onfulfilled The callback to execute when the Promise is resolved.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of which ever callback is executed.
   */
  public then<TResult1 = Awaited<R>, TResult2 = never>(
    onfulfilled?: ((value: Awaited<R>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.result.then(onfulfilled, onrejected);
  }

  /**
   * **Delegates to the underlying `.result` promise's `.catch()` method.**
   *
   * Attaches a callback for only the rejection of the Promise.
   * @param onrejected The callback to execute when the Promise is rejected.
   * @returns A Promise for the completion of the callback.
   */
  public catch<TResult = never>(
    onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null
  ): Promise<Awaited<R> | TResult> {
    return this.result.catch(onrejected);
  }

  /**
   * **Delegates to the underlying `.result` promise's `.catch()` method.**
   *
   * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
   * resolved value cannot be modified from the callback.
   * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
   * @returns A Promise for the completion of the callback.
   */
  public finally(
    onfinally?: (() => void) | null
  ): Promise<Awaited<R>> {
    return this.result.finally(onfinally);
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
      recordTaskError(err, false);
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
        recordTaskError(err, false);
      }).finally(() => {
        --pendingAsyncCount;
        signalSettled(true);
      });
    } else {
      this._status = tsCompleted;
      this._resolve(ret as Awaited<R>);
    }
  }

  /**
   * Attempt to cancel the task **before it runs**.
   *
   * * If the task is still `"pending"` **and**:
   *   * waiting in a `setTimeout` → the timer is cleared.
   *   * sitting in the queue     → it is removed.
   *   The task transitions to `"canceled"` and `result` rejects with
   *   {@link TaskAbortError}.
   * * If the task is already `"running"` or `"completed"` nothing happens.
   *
   * @returns `true` when the task was successfully canceled,
   *          otherwise `false`.
   *
   * @example
   * ```ts
   * const t = queueAsyncTask(fetchData, { delay: 300 });
   * // user typed again before the debounce expired
   * if (t.cancel()) console.log('Previous fetch aborted');
   * ```
   */
  public cancel(): boolean {
    if (this._timerId !== undefined) {
      Platform.getOrCreate(globalThis).clearTimeout(this._timerId);
      --pendingAsyncCount;
      this._timerId = undefined;
      this._status = tsCanceled;
      const abortErr = new TaskAbortError(this);
      this._reject(abortErr);
      // Attach a noop-catch so the promise is immediately handled and the host never
      // emits an `unhandledRejection` for a *normal* cancel.
      //
      // IMPORTANT ──────────────────────────────────────────────────────────────
      // - `cancel()` MUST ONLY reject with the `TaskAbortError` we just created.
      //   Nothing else is allowed to flow through `_reject()` here.
      // - If you ever change that invariant (e.g. forward another error or add
      //   logging-failures), you **must** either:
      //     1. push the new error into `taskErrors` so the task queue aggregator
      //        surfaces it, or
      //     2. replace this with a *selective* handler that re-throws anything that
      //        isn't a TaskAbortError.
      //   Failing to do so will silently swallow real errors in dev builds.
      void this._result.catch(noop);
      signalSettled(true);
      return true;
    }

    if (this._status === tsPending) {
      const idx = queue.indexOf(this, queueIndex);
      if (idx > -1) {
        queue.splice(idx, 1);
        this._status = tsCanceled;
        const abortErr = new TaskAbortError(this);
        this._reject(abortErr);
        void this._result.catch(noop);
        signalSettled(true);
        return true;
      }
    }
    return false;
  }
}

/**
 * Queue a callback to run **repeatedly** on a given interval, managed by
 * Aurelia's task queue.
 *
 * Unlike a one-off task from {@link queueAsyncTask}, this creates a persistent,
 * timer-based operation that continues until explicitly canceled. Each
 * execution of the callback is pushed onto the normal task queue, ensuring
 * it runs with the same timing and error-handling as other framework tasks.
 *
 * This is useful for polling or any periodic background work that needs to be
 * test-friendly and integrated with Aurelia's life-cycle.
 *
 * @param callback  - The function to execute on each interval. Any exception
 *                    it throws is captured and surfaced collectively via
 *                    `tasksSettled()` or `runTasks()` (after awaiting
 *                    `task.next()`), or reported to the console when an
 *                    automatic cycle is otherwise unobserved.
 * @param opts.interval  - The delay **in milliseconds** between the end of one
 *                         execution and the start of the next. Defaults to `0`.
 * @returns A {@link RecurringTask} handle that lets you `cancel()` the
 *                                  repetition or use `await task.next()` to wait for
 *                                  the next run.
 */
export const queueRecurringTask = (callback: TaskCallback, opts?: { interval?: number }) => {
  const task = new RecurringTask(callback, Math.max(opts?.interval ?? 0, 0));
  recurringTasks.push(task);
  task._start();
  return task;
};

/**
 * A handle returned by {@link queueRecurringTask} that lets you observe and
 * control a periodic, repeating task.
 *
 * Unlike a single-use {@link Task}, a `RecurringTask` does not have a status
 * or a final `result` promise. Instead, it continues to schedule itself on a
 * given interval until it is explicitly stopped.
 */
export class RecurringTask {
  /** @internal */
  private static _nextId = 0;
  public readonly id: number = ++RecurringTask._nextId;

  /** @internal */
  private _timerId?: number;
  /** @internal */
  private _canceled = false;
  /** @internal */
  private readonly _nextResolvers: (() => void)[] = [];

  public constructor(
    private readonly _callback: () => unknown,
    private readonly _interval: number,
  ) {}

  /** @internal */
  public run(): void {
    try {
      // TODO: possibly store return value to connect to resolver
      this._callback();
    } catch (err) {
      recordTaskError(err, true);
      return;
    }
  }

  /** @internal */
  public _start(): void {
    if (this._canceled) {
      return;
    }

    this._timerId = Platform.getOrCreate(globalThis).setTimeout(() => {
      this._tick();
      if (!this._canceled) {
        this._start();
      }
    }, this._interval);
  }

  /** @internal */
  private _tick(): void {
    queue.push(this);
    requestRun();

    const resolvers = this._nextResolvers.splice(0);
    for (const resolver of resolvers) {
      resolver();
    }
  }

  /**
   * Returns a promise that resolves after the next time the task's callback
   * is queued for execution.
   *
   * This is useful for synchronizing other work with the task's interval,
   * especially in tests. If the task has already been canceled, it returns an
   * immediately-resolved promise.
   *
   * @returns A promise that resolves when the next interval occurs.
   *
   * @example
   * Synchronizing with a polling task in a test
   * ```ts
   * it('updates data on a polling interval', async () => {
   *   let count = 0;
   *   const poller = queueRecurringTask(() => count++, { interval: 100 });
   *
   *   await poller.next();
   *   await tasksSettled();
   *   expect(count).toBe(1);
   *
   *   await poller.next();
   *   await tasksSettled();
   *   expect(count).toBe(2);
   *
   *   poller.cancel();
   * });
   * ```
   */
  public next(): Promise<void> {
    if (this._canceled) {
      return Promise.resolve();
    }
    return new Promise(resolve => this._nextResolvers.push(resolve));
  }

  /**
   * Permanently stops the recurring task.
   *
   * This action clears any pending timer, prevents future executions, removes
   * the task from the task queue's list of recurring tasks, and immediately
   * resolves any pending promises created by `next()`.
   *
   * Once canceled, a recurring task cannot be restarted.
   */
  public cancel(): void {
    this._canceled = true;
    if (this._timerId !== undefined) {
      Platform.getOrCreate(globalThis).clearTimeout(this._timerId);
      this._timerId = undefined;
    }

    const idx = recurringTasks.indexOf(this);
    if (idx > -1) {
      recurringTasks.splice(idx, 1);
    }

    const resolvers = this._nextResolvers.splice(0);
    for (const resolve of resolvers) {
      resolve();
    }
  }
}
