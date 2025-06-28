const tsPending = 'pending';
const tsRunning = 'running';
const tsCompleted = 'completed';
const tsCanceled = 'canceled';
/* eslint-disable @typescript-eslint/no-explicit-any */
const lookup = new Map();
const notImplemented = (name) => {
    return () => {
        throw createError(`AUR1005: The PLATFORM did not receive a valid reference to the global function '${name}'.`) // TODO: link to docs describing how to fix this issue
            ;
    };
};
class Platform {
    constructor(g, overrides = {}) {
        this.macroTaskRequested = false;
        this.macroTaskHandle = -1;
        this.globalThis = g;
        'decodeURI decodeURIComponent encodeURI encodeURIComponent Date Reflect console'.split(' ').forEach(prop => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            this[prop] = prop in overrides ? overrides[prop] : g[prop];
        });
        'clearInterval clearTimeout queueMicrotask setInterval setTimeout'.split(' ').forEach(method => {
            // eslint-disable-next-line
            this[method] = method in overrides ? overrides[method] : g[method]?.bind(g) ?? notImplemented(method);
        });
        this.performanceNow = 'performanceNow' in overrides ? overrides.performanceNow : g.performance?.now?.bind(g.performance) ?? notImplemented('performance.now');
        this.flushMacroTask = this.flushMacroTask.bind(this);
        this.taskQueue = new TaskQueue(this, this.requestMacroTask.bind(this), this.cancelMacroTask.bind(this));
    }
    static getOrCreate(g, overrides = {}) {
        let platform = lookup.get(g);
        if (platform === void 0) {
            lookup.set(g, platform = new Platform(g, overrides));
        }
        return platform;
    }
    static set(g, platform) {
        lookup.set(g, platform);
    }
    requestMacroTask() {
        this.macroTaskRequested = true;
        if (this.macroTaskHandle === -1) {
            this.macroTaskHandle = this.setTimeout(this.flushMacroTask, 0);
        }
    }
    cancelMacroTask() {
        this.macroTaskRequested = false;
        if (this.macroTaskHandle > -1) {
            this.clearTimeout(this.macroTaskHandle);
            this.macroTaskHandle = -1;
        }
    }
    flushMacroTask() {
        this.macroTaskHandle = -1;
        if (this.macroTaskRequested === true) {
            this.macroTaskRequested = false;
            this.taskQueue.flush();
        }
    }
}
class TaskQueue {
    get isEmpty() {
        return (this._pendingAsyncCount === 0 &&
            this._processing.length === 0 &&
            this._pending.length === 0 &&
            this._delayed.length === 0);
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
    get _hasNoMoreFiniteWork() {
        return (this._pendingAsyncCount === 0 &&
            this._processing.every(isPersistent) &&
            this._pending.every(isPersistent) &&
            this._delayed.every(isPersistent));
    }
    constructor(platform, $request, $cancel) {
        this.platform = platform;
        this.$request = $request;
        this.$cancel = $cancel;
        /** @internal */ this._suspenderTask = void 0;
        /** @internal */ this._pendingAsyncCount = 0;
        /** @internal */
        this._processing = [];
        /** @internal */
        this._pending = [];
        /** @internal */
        this._delayed = [];
        /** @internal */
        this._flushRequested = false;
        /** @internal */
        this._yieldPromise = void 0;
        /** @internal */
        this._lastRequest = 0;
        /** @internal */
        this._lastFlush = 0;
        /** @internal */
        this._requestFlush = () => {
            if (this._tracer.enabled) {
                this._tracer.enter(this, 'requestFlush');
            }
            if (!this._flushRequested) {
                this._flushRequested = true;
                this._lastRequest = this._now();
                this.$request();
            }
            if (this._tracer.enabled) {
                this._tracer.leave(this, 'requestFlush');
            }
        };
        this._now = platform.performanceNow;
        this._tracer = new Tracer(platform.console);
    }
    flush(now = this._now()) {
        if (this._tracer.enabled) {
            this._tracer.enter(this, 'flush');
        }
        this._flushRequested = false;
        this._lastFlush = now;
        // Only process normally if we are *not* currently waiting for an async task to finish
        if (this._suspenderTask === void 0) {
            let curr;
            if (this._pending.length > 0) {
                this._processing.push(...this._pending);
                this._pending.length = 0;
            }
            if (this._delayed.length > 0) {
                for (let i = 0; i < this._delayed.length; ++i) {
                    curr = this._delayed[i];
                    if (curr.queueTime <= now) {
                        this._processing.push(curr);
                        this._delayed.splice(i--, 1);
                    }
                }
            }
            let cur;
            while (this._processing.length > 0) {
                (cur = this._processing.shift()).run();
                // If it's still running, it can only be an async task
                if (cur.status === tsRunning) {
                    if (cur.suspend === true) {
                        this._suspenderTask = cur;
                        this._requestFlush();
                        if (this._tracer.enabled) {
                            this._tracer.leave(this, 'flush early async');
                        }
                        return;
                    }
                    else {
                        ++this._pendingAsyncCount;
                    }
                }
            }
            if (this._pending.length > 0) {
                this._processing.push(...this._pending);
                this._pending.length = 0;
            }
            if (this._delayed.length > 0) {
                for (let i = 0; i < this._delayed.length; ++i) {
                    curr = this._delayed[i];
                    if (curr.queueTime <= now) {
                        this._processing.push(curr);
                        this._delayed.splice(i--, 1);
                    }
                }
            }
            if (this._processing.length > 0 || this._delayed.length > 0 || this._pendingAsyncCount > 0) {
                this._requestFlush();
            }
            if (this._yieldPromise !== void 0 &&
                this._hasNoMoreFiniteWork) {
                const p = this._yieldPromise;
                this._yieldPromise = void 0;
                p.resolve();
            }
        }
        else {
            // If we are still waiting for an async task to finish, just schedule the next flush and do nothing else.
            // Should the task finish before the next flush is invoked,
            // the callback to `completeAsyncTask` will have reset `this.suspenderTask` back to undefined so processing can return back to normal next flush.
            this._requestFlush();
        }
        if (this._tracer.enabled) {
            this._tracer.leave(this, 'flush full');
        }
    }
    /**
     * Cancel the next flush cycle (and/or the macrotask that schedules the next flush cycle, in case this is a microtask queue), if it was requested.
     *
     * This operation is idempotent and will do nothing if no flush is scheduled.
     */
    cancel() {
        if (this._tracer.enabled) {
            this._tracer.enter(this, 'cancel');
        }
        if (this._flushRequested) {
            this.$cancel();
            this._flushRequested = false;
        }
        if (this._tracer.enabled) {
            this._tracer.leave(this, 'cancel');
        }
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
    async yield() {
        if (this._tracer.enabled) {
            this._tracer.enter(this, 'yield');
        }
        if (this.isEmpty) {
            if (this._tracer.enabled) {
                this._tracer.leave(this, 'yield empty');
            }
        }
        else {
            if (this._yieldPromise === void 0) {
                if (this._tracer.enabled) {
                    this._tracer.trace(this, 'yield - creating promise');
                }
                this._yieldPromise = createExposedPromise();
            }
            await this._yieldPromise;
            if (this._tracer.enabled) {
                this._tracer.leave(this, 'yield task');
            }
        }
    }
    queueTask(callback, opts) {
        if (this._tracer.enabled) {
            this._tracer.enter(this, 'queueTask');
        }
        const { delay, preempt, persistent, suspend } = { ...defaultQueueTaskOptions, ...opts };
        if (preempt) {
            if (delay > 0) {
                throw preemptDelayComboError();
            }
            if (persistent) {
                throw preemptyPersistentComboError();
            }
        }
        if (this._processing.length === 0) {
            this._requestFlush();
        }
        const time = this._now();
        const task = new Task(this._tracer, this, time, time + delay, preempt, persistent, suspend, callback);
        if (preempt) {
            this._processing[this._processing.length] = task;
        }
        else if (delay === 0) {
            this._pending[this._pending.length] = task;
        }
        else {
            this._delayed[this._delayed.length] = task;
        }
        if (this._tracer.enabled) {
            this._tracer.leave(this, 'queueTask');
        }
        return task;
    }
    /**
     * Remove the task from this queue.
     */
    remove(task) {
        if (this._tracer.enabled) {
            this._tracer.enter(this, 'remove');
        }
        let idx = this._processing.indexOf(task);
        if (idx > -1) {
            this._processing.splice(idx, 1);
            if (this._tracer.enabled) {
                this._tracer.leave(this, 'remove processing');
            }
            return;
        }
        idx = this._pending.indexOf(task);
        if (idx > -1) {
            this._pending.splice(idx, 1);
            if (this._tracer.enabled) {
                this._tracer.leave(this, 'remove pending');
            }
            return;
        }
        idx = this._delayed.indexOf(task);
        if (idx > -1) {
            this._delayed.splice(idx, 1);
            if (this._tracer.enabled) {
                this._tracer.leave(this, 'remove delayed');
            }
            return;
        }
        if (this._tracer.enabled) {
            this._tracer.leave(this, 'remove error');
        }
        throw createError(`Task #${task.id} could not be found`);
    }
    /**
     * Reset the persistent task back to its pending state, preparing it for being invoked again on the next flush.
     *
     * @internal
     */
    _resetPersistentTask(task) {
        if (this._tracer.enabled) {
            this._tracer.enter(this, 'resetPersistentTask');
        }
        task.reset(this._now());
        if (task.createdTime === task.queueTime) {
            this._pending[this._pending.length] = task;
        }
        else {
            this._delayed[this._delayed.length] = task;
        }
        if (this._tracer.enabled) {
            this._tracer.leave(this, 'resetPersistentTask');
        }
    }
    /**
     * Notify the queue that this async task has had its promise resolved, so that the queue can proceed with consecutive tasks on the next flush.
     *
     * @internal
     */
    _completeAsyncTask(task) {
        if (this._tracer.enabled) {
            this._tracer.enter(this, 'completeAsyncTask');
        }
        if (task.suspend === true) {
            if (this._suspenderTask !== task) {
                if (this._tracer.enabled) {
                    this._tracer.leave(this, 'completeAsyncTask error');
                }
                throw createError(`Async task completion mismatch: suspenderTask=${this._suspenderTask?.id}, task=${task.id}`);
            }
            this._suspenderTask = void 0;
        }
        else {
            --this._pendingAsyncCount;
        }
        if (this._yieldPromise !== void 0 &&
            this._hasNoMoreFiniteWork) {
            const p = this._yieldPromise;
            this._yieldPromise = void 0;
            p.resolve();
        }
        if (this.isEmpty) {
            this.cancel();
        }
        if (this._tracer.enabled) {
            this._tracer.leave(this, 'completeAsyncTask');
        }
    }
}
class TaskAbortError extends Error {
    constructor(task) {
        super('Task was canceled.');
        this.task = task;
    }
}
let id = 0;
class Task {
    get result() {
        const result = this._result;
        if (result === void 0) {
            switch (this._status) {
                case tsPending: {
                    const promise = this._result = createExposedPromise();
                    this._resolve = promise.resolve;
                    this._reject = promise.reject;
                    return promise;
                }
                /* istanbul ignore next */
                case tsRunning:
                    throw createError('Trying to await task from within task will cause a deadlock.');
                case tsCompleted:
                    return this._result = Promise.resolve();
                case tsCanceled:
                    return this._result = Promise.reject(new TaskAbortError(this));
            }
        }
        return result;
    }
    get status() {
        return this._status;
    }
    constructor(tracer, taskQueue, createdTime, queueTime, preempt, persistent, suspend, callback) {
        this.taskQueue = taskQueue;
        this.createdTime = createdTime;
        this.queueTime = queueTime;
        this.preempt = preempt;
        this.persistent = persistent;
        this.suspend = suspend;
        this.callback = callback;
        this.id = ++id;
        /** @internal */ this._resolve = void 0;
        /** @internal */ this._reject = void 0;
        /** @internal */
        this._result = void 0;
        /** @internal */
        this._status = tsPending;
        this._tracer = tracer;
    }
    run(time = this.taskQueue.platform.performanceNow()) {
        if (this._tracer.enabled) {
            this._tracer.enter(this, 'run');
        }
        if (this._status !== tsPending) {
            if (this._tracer.enabled) {
                this._tracer.leave(this, 'run error');
            }
            throw createError(`Cannot run task in ${this._status} state`);
        }
        // this.persistent could be changed while the task is running (this can only be done by the task itself if canceled, and is a valid way of stopping a loop)
        // so we deliberately reference this.persistent instead of the local variable, but we keep it around to know whether the task *was* persistent before running it,
        // so we can set the correct cancelation state.
        const { persistent, taskQueue, callback, _resolve: resolve, _reject: reject, createdTime, } = this;
        let ret;
        this._status = tsRunning;
        try {
            ret = callback(time - createdTime);
            if (ret instanceof Promise) {
                ret.then($ret => {
                    if (this.persistent) {
                        taskQueue._resetPersistentTask(this);
                    }
                    else {
                        if (persistent) {
                            // Persistent tasks never reach completed status. They're either pending, running, or canceled.
                            this._status = tsCanceled;
                        }
                        else {
                            this._status = tsCompleted;
                        }
                        this.dispose();
                    }
                    taskQueue._completeAsyncTask(this);
                    if (true && this._tracer.enabled) {
                        this._tracer.leave(this, 'run async then');
                    }
                    if (resolve !== void 0) {
                        resolve($ret);
                    }
                })
                    .catch((err) => {
                    if (!this.persistent) {
                        this.dispose();
                    }
                    taskQueue._completeAsyncTask(this);
                    if (true && this._tracer.enabled) {
                        this._tracer.leave(this, 'run async catch');
                    }
                    if (reject !== void 0) {
                        reject(err);
                    }
                    else {
                        throw err;
                    }
                });
            }
            else {
                if (this.persistent) {
                    taskQueue._resetPersistentTask(this);
                }
                else {
                    if (persistent) {
                        // Persistent tasks never reach completed status. They're either pending, running, or canceled.
                        this._status = tsCanceled;
                    }
                    else {
                        this._status = tsCompleted;
                    }
                    this.dispose();
                }
                if (true && this._tracer.enabled) {
                    this._tracer.leave(this, 'run sync success');
                }
                if (resolve !== void 0) {
                    resolve(ret);
                }
            }
        }
        catch (err) {
            if (!this.persistent) {
                this.dispose();
            }
            if (this._tracer.enabled) {
                this._tracer.leave(this, 'run sync error');
            }
            if (reject !== void 0) {
                reject(err);
            }
            else {
                throw err;
            }
        }
    }
    cancel() {
        if (this._tracer.enabled) {
            this._tracer.enter(this, 'cancel');
        }
        if (this._status === tsPending) {
            const taskQueue = this.taskQueue;
            const reject = this._reject;
            taskQueue.remove(this);
            if (taskQueue.isEmpty) {
                taskQueue.cancel();
            }
            this._status = tsCanceled;
            this.dispose();
            if (reject !== void 0) {
                reject(new TaskAbortError(this));
            }
            if (this._tracer.enabled) {
                this._tracer.leave(this, 'cancel true =pending');
            }
            return true;
        }
        else if (this._status === tsRunning && this.persistent) {
            this.persistent = false;
            if (this._tracer.enabled) {
                this._tracer.leave(this, 'cancel true =running+persistent');
            }
            return true;
        }
        if (this._tracer.enabled) {
            this._tracer.leave(this, 'cancel false');
        }
        return false;
    }
    reset(time) {
        if (this._tracer.enabled) {
            this._tracer.enter(this, 'reset');
        }
        const delay = this.queueTime - this.createdTime;
        this.createdTime = time;
        this.queueTime = time + delay;
        this._status = tsPending;
        this._resolve = void 0;
        this._reject = void 0;
        this._result = void 0;
        if (this._tracer.enabled) {
            this._tracer.leave(this, 'reset');
        }
    }
    dispose() {
        if (this._tracer.enabled) {
            this._tracer.trace(this, 'dispose');
        }
        this.callback = (void 0);
        this._resolve = void 0;
        this._reject = void 0;
        this._result = void 0;
    }
}
class Tracer {
    constructor(console) {
        this.console = console;
        this.enabled = false;
        this.depth = 0;
    }
    enter(obj, method) {
        this.log(`${'  '.repeat(this.depth++)}> `, obj, method);
    }
    leave(obj, method) {
        this.log(`${'  '.repeat(--this.depth)}< `, obj, method);
    }
    trace(obj, method) {
        this.log(`${'  '.repeat(this.depth)}- `, obj, method);
    }
    log(prefix, obj, method) {
        if (obj instanceof TaskQueue) {
            const processing = obj._processing.length;
            const pending = obj._pending.length;
            const delayed = obj._delayed.length;
            const flushReq = obj._flushRequested;
            const susTask = !!obj._suspenderTask;
            const info = `processing=${processing} pending=${pending} delayed=${delayed} flushReq=${flushReq} susTask=${susTask}`;
            this.console.log(`${prefix}[Q.${method}] ${info}`);
        }
        else {
            const id = obj['id'];
            const created = Math.round(obj['createdTime'] * 10) / 10;
            const queue = Math.round(obj['queueTime'] * 10) / 10;
            const preempt = obj['preempt'];
            const persistent = obj['persistent'];
            const suspend = obj['suspend'];
            const status = obj['_status'];
            const info = `id=${id} created=${created} queue=${queue} preempt=${preempt} persistent=${persistent} status=${status} suspend=${suspend}`;
            this.console.log(`${prefix}[T.${method}] ${info}`);
        }
    }
}
const defaultQueueTaskOptions = {
    delay: 0,
    preempt: false,
    persistent: false,
    suspend: false,
};
let $resolve;
let $reject;
const executor = (resolve, reject) => {
    $resolve = resolve;
    $reject = reject;
};
/**
 * Efficiently create a promise where the `resolve` and `reject` functions are stored as properties on the prommise itself.
 */
const createExposedPromise = () => {
    const p = new Promise(executor);
    p.resolve = $resolve;
    p.reject = $reject;
    return p;
};
const isPersistent = (task) => task.persistent;
const preemptDelayComboError = () => createError(`AUR1006: Invalid arguments: preempt cannot be combined with a greater-than-zero delay`)
    ;
const preemptyPersistentComboError = () => createError(`AUR1007: Invalid arguments: preempt cannot be combined with persistent`)
    ;
const createError = (msg) => new Error(msg);
/**
 * Retrieve internal tasks information of a TaskQueue
 */
const reportTaskQueue = (taskQueue) => {
    const processing = taskQueue._processing;
    const pending = taskQueue._pending;
    const delayed = taskQueue._delayed;
    const flushReq = taskQueue._flushRequested;
    return { processing, pending, delayed, flushRequested: flushReq };
};
/**
 * Flush a taskqueue and cancel all the tasks that are queued by the flush
 * Mainly for debugging purposes
 */
const ensureEmpty = (taskQueue) => {
    taskQueue.flush();
    taskQueue._pending.forEach((x) => x.cancel());
};

export { Platform, Task, TaskAbortError, TaskQueue, ensureEmpty, reportTaskQueue };
//# sourceMappingURL=index.dev.mjs.map
