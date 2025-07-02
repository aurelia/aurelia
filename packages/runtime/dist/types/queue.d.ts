declare const tsPending = "pending";
declare const tsRunning = "running";
declare const tsCompleted = "completed";
declare const tsCanceled = "canceled";
export type TaskStatus = typeof tsPending | typeof tsRunning | typeof tsCompleted | typeof tsCanceled;
export type TaskCallback<T = any> = () => T;
/**
 * **Immediately drain** Aurelia's internal task queue.
 *
 * Normally the scheduler calls this automatically on the next micro-task
 * whenever you enqueue work with {@link queueTask} or {@link queueAsyncTask}.
 * Calling it yourself is only useful in **low-level tests, debugging sessions,
 * or custom instrumentation** where you need a _synchronous_ flush.
 *
 * ### What it does
 * 1. Removes each item from the queue (FIFO) and runs it.
 * 2. If an item queues more work, the loop continues until the queue is empty,
 *    up to **10 000 extra tasks** – after that a "Potential deadlock" error is
 *    thrown and the queue is cleared.
 * 3. Collects every uncaught exception.
 *    * When you invoke the function manually those errors are re-thrown —
 *      either the single error or an `AggregateError` if several tasks failed.*
 *    * During the scheduler's automatic run they are _suppressed_ and will only
 *      surface through `tasksSettled()` or the runtime console, so the app
 *      keeps running.
 * 4. Signals the internal "settled promise" so `await tasksSettled()` continues
 *    once _all_ **synchronous** callbacks have finished (async promises may
 *    still be pending).
 *
 * > **Tip:** In most cases you should prefer `await tasksSettled()`; it waits
 * > for both the synchronous drain **and** any asynchronous work started by
 * > the tasks. `runTasks()` is only needed when you must stay purely
 * > synchronous (e.g. inside a non-async test).
 *
 * @throws Error            If a task throws and you called the function
 *                          directly.
 * @throws AggregateError   If multiple tasks throw.
 * @throws Error            "Potential deadlock detected" when > 10 000 extra
 *                          tasks are re-queued in one drain.
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
 * window.runTasks(); // force the scheduler to drain now
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
export declare const runTasks: () => void;
/**
 * Return a promise that resolves once **all queued work has finished** and the
 * Aurelia scheduler is completely idle.
 *
 * Conceptually similar to a browser's "micro-task drain" (the classic
 * `await Promise.resolve()` trick) but extended to cover:
 *
 * * synchronous micro-tasks queued via {@link queueTask}
 * * asynchronous or delayed tasks queued via {@link queueAsyncTask}
 * * any promises those callbacks return
 *
 * Perfect for unit / component / e2e tests where you must wait for bindings,
 * observers, `requestAnimationFrame` chains and timers to flush **without
 * guessing a timeout**.
 *
 * #### Behaviour
 * | Situation                                                | Result                             |
 * |----------------------------------------------------------|------------------------------------|
 * | At least one task ran before the queue became empty      | **resolves `true`**                |
 * | Nothing was pending when you called the function         | **resolves `false`**               |
 * | One task throws                                          | **rejects** with that error        |
 * | Multiple tasks throw                                     | **rejects** with an `AggregateError` |
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
 * await tasksSettled(); // wait for DOM & animations
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
 * await waitForIdle(page); // no arbitrary sleeps
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
 *   if (e instanceof AggregateError) {
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
 *     // Failing here highlights orphaned micro-tasks or timers left by the test
 *     throw new Error('Test left pending work on the Aurelia scheduler');
 *   }
 * });
 * ```
 */
export declare const tasksSettled: () => Promise<boolean>;
/**
 * Queue a **synchronous** callback onto Aurelia's internal task queue.
 *
 * The callback is executed in the same micro-task drain as bindings,
 * computed observers, and other framework internals, immediately after the
 * current call-stack has unwound.
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
 *                   surfaced collectively via `tasksSettled()` or `runTasks()`.
 */
export declare const queueTask: (callback: TaskCallback) => void;
/**
 * Queue a callback to run **asynchronously** on Aurelia's central scheduler
 * and get back a {@link Task} object you can:
 *
 * * `await` – via `task.result`
 * * cancel – via `task.cancel()`
 * * inspect – via `task.status`
 *
 * Any callbacks scheduled this way are automatically tracked by the framework,
 * so `await tasksSettled()` waits until the all tasks (and any promises they return)
 * have finished.
 *
 * @template R The value returned by `callback`, or the value the promise it
 *             returns resolves to.
 *
 * @param callback  - A function to execute. It may be synchronous or asynchronous;
 *                    if it returns a promise, the scheduler treats the task as
 *                    *running* until that promise settles.
 *
 * @param options.delay  - Optional delay **in milliseconds** before the callback
 *                         is queued. While waiting, the task can still be
 *                         cancelled.
 *
 * @returns The {@link Task} representing the scheduled work.
 *
 * @throws {TaskAbortError} The task's `result` promise rejects with this error
 *                          if the task is cancelled before it starts.
 * @throws {*}              The task's `result` promise propagates any error
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
 *   return current.result; // awaitable by callers
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
export declare const queueAsyncTask: <R = any>(callback: TaskCallback<R>, options?: {
    delay?: number;
}) => Task<R>;
export declare class TaskAbortError<T = any> extends Error {
    task: Task<T>;
    constructor(task: Task<T>);
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
 * | `"running"`   | `callback` is executing. | When the scheduler dequeues the task. |
 * | `"completed"` | Callback (and any returned promise) settled. | After `callback` finishes / promise resolves. |
 * | `"canceled"`  | Task was aborted **or** callback/promise rejected. | When `cancel()` succeeds, or on error. |
 *
 * @template R Type of the value produced by the callback.
 */
export declare class Task<R = any> {
    callback: TaskCallback<R>;
    delay?: number | undefined;
    /**
     * Unique, incrementing identifier – handy for logging / debugging.
     */
    readonly id: number;
    /**
     * A promise that:
     * * **fulfils** with the callback's return value, or
     * * **rejects** with:
     *   * whatever error the callback throws,
     *   * whatever rejection the callback's promise yields, or
     *   * a {@link TaskAbortError} if the task is canceled before it starts.
     *
     * Consumers typically `await` this to know when *their* task is done without
     * caring about unrelated work still queued.
     *
     * @example
     * ```ts
     * const toastTask = queueAsyncTask(showToast, { delay: 5000 });
     * await toastTask.result; // waits 5 s then resolves
     * ```
     */
    get result(): Promise<Awaited<R>>;
    /**
     * Current immutable status of the task.
     *
     * @example
     * ```ts
     * const task = queueAsyncTask(() => 123);
     * console.log(task.status); // "pending"
     * await task.result;
     * console.log(task.status); // "completed"
     * ```
     */
    get status(): TaskStatus;
    constructor(callback: TaskCallback<R>, delay?: number | undefined);
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
    cancel(): boolean;
}
export {};
//# sourceMappingURL=queue.d.ts.map