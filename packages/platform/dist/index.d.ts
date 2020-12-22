export declare class Platform<TGlobal extends typeof globalThis = typeof globalThis> {
    readonly globalThis: TGlobal;
    readonly decodeURI: TGlobal['decodeURI'];
    readonly decodeURIComponent: TGlobal['decodeURIComponent'];
    readonly encodeURI: TGlobal['encodeURI'];
    readonly encodeURIComponent: TGlobal['encodeURIComponent'];
    readonly Date: TGlobal['Date'];
    readonly Reflect: TGlobal['Reflect'];
    readonly clearInterval: TGlobal['clearInterval'];
    readonly clearTimeout: TGlobal['clearTimeout'];
    readonly queueMicrotask: TGlobal['queueMicrotask'];
    readonly setInterval: TGlobal['setInterval'];
    readonly setTimeout: TGlobal['setTimeout'];
    readonly console: TGlobal['console'];
    readonly performanceNow: () => number;
    readonly macroTaskQueue: TaskQueue;
    constructor(g: TGlobal, overrides?: Partial<Exclude<Platform, 'globalThis'>>);
    static getOrCreate<TGlobal extends typeof globalThis = typeof globalThis>(g: TGlobal, overrides?: Partial<Exclude<Platform, 'globalThis'>>): Platform<TGlobal>;
    static set(g: typeof globalThis, platform: Platform): void;
    protected macroTaskRequested: boolean;
    protected macroTaskHandle: number;
    protected requestMacroTask(): void;
    protected cancelMacroTask(): void;
    protected flushMacroTask(): void;
}
declare type TaskCallback<T = any> = (delta: number) => T;
export declare class TaskQueue {
    readonly platform: Platform;
    private readonly $request;
    private readonly $cancel;
    private processing;
    private suspenderTask;
    private pendingAsyncCount;
    private pending;
    private delayed;
    private flushRequested;
    private yieldPromise;
    private readonly taskPool;
    private taskPoolSize;
    private lastRequest;
    private lastFlush;
    get isEmpty(): boolean;
    /**
     * Persistent tasks will re-queue themselves indefinitely until they are explicitly canceled,
     * so we consider them 'infinite work' whereas non-persistent (one-off) tasks are 'finite work'.
     *
     * This `hasNoMoreFiniteWork` getters returns true if either all remaining tasks are persistent, or if there are no more tasks.
     *
     * If that is the case, we can resolve the promise that was created when `yield()` is called.
     */
    private get hasNoMoreFiniteWork();
    private readonly tracer;
    constructor(platform: Platform, $request: () => void, $cancel: () => void);
    flush(time?: number): void;
    /**
     * Cancel the next flush cycle (and/or the macrotask that schedules the next flush cycle, in case this is a microtask queue), if it was requested.
     *
     * This operation is idempotent and will do nothing if no flush is scheduled.
     */
    cancel(): void;
    /**
     * Returns a promise that, when awaited, resolves when:
     * - all *non*-persistent (including async) tasks have finished;
     * - the last-added persistent task has run exactly once;
     *
     * This operation is idempotent: the same promise will be returned until it resolves.
     *
     * If `yield()` is called multiple times in a row when there are one or more persistent tasks in the queue, each call will await exactly one cycle of those tasks.
     */
    yield(): Promise<void>;
    queueTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): Task<T>;
    /**
     * Remove the task from this queue.
     */
    remove<T = any>(task: Task<T>): void;
    /**
     * Return a reusable task to the shared task pool.
     * The next queued callback will reuse this task object instead of creating a new one, to save overhead of creating additional objects.
     */
    private returnToPool;
    /**
     * Reset the persistent task back to its pending state, preparing it for being invoked again on the next flush.
     */
    private resetPersistentTask;
    /**
     * Notify the queue that this async task has had its promise resolved, so that the queue can proceed with consecutive tasks on the next flush.
     */
    private completeAsyncTask;
    private readonly requestFlush;
}
export declare class TaskAbortError<T = any> extends Error {
    task: Task<T>;
    constructor(task: Task<T>);
}
export declare const enum TaskStatus {
    pending = 0,
    running = 1,
    completed = 2,
    canceled = 3
}
declare type UnwrapPromise<T> = T extends Promise<infer R> ? R : T;
export interface ITask<T = any> {
    readonly result: Promise<UnwrapPromise<T>>;
    readonly status: TaskStatus;
    run(): void;
    cancel(): boolean;
}
export declare class Task<T = any> implements ITask {
    private readonly tracer;
    readonly taskQueue: TaskQueue;
    createdTime: number;
    queueTime: number;
    preempt: boolean;
    persistent: boolean;
    suspend: boolean;
    readonly reusable: boolean;
    callback: TaskCallback<T>;
    readonly id: number;
    private resolve;
    private reject;
    private _result;
    get result(): Promise<UnwrapPromise<T>>;
    private _status;
    get status(): TaskStatus;
    constructor(tracer: Tracer, taskQueue: TaskQueue, createdTime: number, queueTime: number, preempt: boolean, persistent: boolean, suspend: boolean, reusable: boolean, callback: TaskCallback<T>);
    run(time?: number): void;
    cancel(): boolean;
    reset(time: number): void;
    reuse(time: number, delay: number, preempt: boolean, persistent: boolean, suspend: boolean, callback: TaskCallback<T>): void;
    dispose(): void;
}
declare class Tracer {
    private readonly console;
    enabled: boolean;
    private depth;
    constructor(console: Platform['console']);
    enter(obj: TaskQueue | Task, method: string): void;
    leave(obj: TaskQueue | Task, method: string): void;
    trace(obj: TaskQueue | Task, method: string): void;
    private log;
}
export declare const enum TaskQueuePriority {
    render = 0,
    macroTask = 1,
    postRender = 2
}
export declare type QueueTaskOptions = {
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
export {};
//# sourceMappingURL=index.d.ts.map