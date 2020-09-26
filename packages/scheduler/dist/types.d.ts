export declare const enum TaskQueuePriority {
    microTask = 0,
    render = 1,
    macroTask = 2,
    postRender = 3,
    idle = 4
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
     * If `true`, the return value of the callback will be treated as a promise. Consecutive tasks will be run only after the promise resolved.
     *
     * If `'auto'`, the return value of the callback will be treated as a promise only if is an instance of a promise. Use this only for callbacks that can either return `void` or `Promise` and it can't be determined upfront which of the two it is. For dealing with promises, this is less efficient than passing in `true`.
     *
     * Defaults to `false`
     */
    async?: boolean | 'auto';
};
export declare type QueueTaskTargetOptions = QueueTaskOptions & {
    priority?: TaskQueuePriority;
};
export declare const defaultQueueTaskOptions: Required<QueueTaskTargetOptions>;
export declare type PResolve<T> = (value?: T | PromiseLike<T>) => void;
export declare type PReject<T = any> = (reason?: T) => void;
export declare type ExposedPromise<T = void> = Promise<T> & {
    resolve: PResolve<T>;
    reject: PReject;
};
/**
 * Efficiently create a promise where the `resolve` and `reject` functions are stored as properties on the prommise itself.
 */
export declare function createExposedPromise<T>(): ExposedPromise<T>;
//# sourceMappingURL=types.d.ts.map