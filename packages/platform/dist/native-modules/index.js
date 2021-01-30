const lookup = new Map();
function notImplemented(name) {
    return function notImplemented() {
        throw new Error(`The PLATFORM did not receive a valid reference to the global function '${name}'.`); // TODO: link to docs describing how to fix this issue
    };
}
export class Platform {
    constructor(g, overrides = {}) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        this.macroTaskRequested = false;
        this.macroTaskHandle = -1;
        this.globalThis = g;
        this.decodeURI = 'decodeURI' in overrides ? overrides.decodeURI : g.decodeURI;
        this.decodeURIComponent = 'decodeURIComponent' in overrides ? overrides.decodeURIComponent : g.decodeURIComponent;
        this.encodeURI = 'encodeURI' in overrides ? overrides.encodeURI : g.encodeURI;
        this.encodeURIComponent = 'encodeURIComponent' in overrides ? overrides.encodeURIComponent : g.encodeURIComponent;
        this.Date = 'Date' in overrides ? overrides.Date : g.Date;
        this.Reflect = 'Reflect' in overrides ? overrides.Reflect : g.Reflect;
        this.clearInterval = 'clearInterval' in overrides ? overrides.clearInterval : (_b = (_a = g.clearInterval) === null || _a === void 0 ? void 0 : _a.bind(g)) !== null && _b !== void 0 ? _b : notImplemented('clearInterval');
        this.clearTimeout = 'clearTimeout' in overrides ? overrides.clearTimeout : (_d = (_c = g.clearTimeout) === null || _c === void 0 ? void 0 : _c.bind(g)) !== null && _d !== void 0 ? _d : notImplemented('clearTimeout');
        this.queueMicrotask = 'queueMicrotask' in overrides ? overrides.queueMicrotask : (_f = (_e = g.queueMicrotask) === null || _e === void 0 ? void 0 : _e.bind(g)) !== null && _f !== void 0 ? _f : notImplemented('queueMicrotask');
        this.setInterval = 'setInterval' in overrides ? overrides.setInterval : (_h = (_g = g.setInterval) === null || _g === void 0 ? void 0 : _g.bind(g)) !== null && _h !== void 0 ? _h : notImplemented('setInterval');
        this.setTimeout = 'setTimeout' in overrides ? overrides.setTimeout : (_k = (_j = g.setTimeout) === null || _j === void 0 ? void 0 : _j.bind(g)) !== null && _k !== void 0 ? _k : notImplemented('setTimeout');
        this.console = 'console' in overrides ? overrides.console : g.console;
        this.performanceNow = 'performanceNow' in overrides ? overrides.performanceNow : (_o = (_m = (_l = g.performance) === null || _l === void 0 ? void 0 : _l.now) === null || _m === void 0 ? void 0 : _m.bind(g.performance)) !== null && _o !== void 0 ? _o : notImplemented('performance.now');
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
function isPersistent(task) {
    return task.persistent;
}
export class TaskQueue {
    constructor(platform, $request, $cancel) {
        this.platform = platform;
        this.$request = $request;
        this.$cancel = $cancel;
        this.processing = [];
        this.suspenderTask = void 0;
        this.pendingAsyncCount = 0;
        this.pending = [];
        this.delayed = [];
        this.flushRequested = false;
        this.yieldPromise = void 0;
        this.taskPool = [];
        this.taskPoolSize = 0;
        this.lastRequest = 0;
        this.lastFlush = 0;
        this.requestFlush = () => {
            if (this.tracer.enabled) {
                this.tracer.enter(this, 'requestFlush');
            }
            if (!this.flushRequested) {
                this.flushRequested = true;
                this.lastRequest = this.platform.performanceNow();
                this.$request();
            }
            if (this.tracer.enabled) {
                this.tracer.leave(this, 'requestFlush');
            }
        };
        this.tracer = new Tracer(platform.console);
    }
    get isEmpty() {
        return (this.pendingAsyncCount === 0 &&
            this.processing.length === 0 &&
            this.pending.length === 0 &&
            this.delayed.length === 0);
    }
    /**
     * Persistent tasks will re-queue themselves indefinitely until they are explicitly canceled,
     * so we consider them 'infinite work' whereas non-persistent (one-off) tasks are 'finite work'.
     *
     * This `hasNoMoreFiniteWork` getters returns true if either all remaining tasks are persistent, or if there are no more tasks.
     *
     * If that is the case, we can resolve the promise that was created when `yield()` is called.
     */
    get hasNoMoreFiniteWork() {
        return (this.pendingAsyncCount === 0 &&
            this.processing.every(isPersistent) &&
            this.pending.every(isPersistent) &&
            this.delayed.every(isPersistent));
    }
    flush(time = this.platform.performanceNow()) {
        if (this.tracer.enabled) {
            this.tracer.enter(this, 'flush');
        }
        this.flushRequested = false;
        this.lastFlush = time;
        // Only process normally if we are *not* currently waiting for an async task to finish
        if (this.suspenderTask === void 0) {
            if (this.pending.length > 0) {
                this.processing.push(...this.pending);
                this.pending.length = 0;
            }
            if (this.delayed.length > 0) {
                let i = -1;
                while (++i < this.delayed.length && this.delayed[i].queueTime <= time) { /* do nothing */ }
                this.processing.push(...this.delayed.splice(0, i));
            }
            let cur;
            while (this.processing.length > 0) {
                (cur = this.processing.shift()).run();
                // If it's still running, it can only be an async task
                if (cur.status === 1 /* running */) {
                    if (cur.suspend === true) {
                        this.suspenderTask = cur;
                        this.requestFlush();
                        if (this.tracer.enabled) {
                            this.tracer.leave(this, 'flush early async');
                        }
                        return;
                    }
                    else {
                        ++this.pendingAsyncCount;
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
            if (this.processing.length > 0 || this.delayed.length > 0 || this.pendingAsyncCount > 0) {
                this.requestFlush();
            }
            if (this.yieldPromise !== void 0 &&
                this.hasNoMoreFiniteWork) {
                const p = this.yieldPromise;
                this.yieldPromise = void 0;
                p.resolve();
            }
        }
        else {
            // If we are still waiting for an async task to finish, just schedule the next flush and do nothing else.
            // Should the task finish before the next flush is invoked,
            // the callback to `completeAsyncTask` will have reset `this.suspenderTask` back to undefined so processing can return back to normal next flush.
            this.requestFlush();
        }
        if (this.tracer.enabled) {
            this.tracer.leave(this, 'flush full');
        }
    }
    /**
     * Cancel the next flush cycle (and/or the macrotask that schedules the next flush cycle, in case this is a microtask queue), if it was requested.
     *
     * This operation is idempotent and will do nothing if no flush is scheduled.
     */
    cancel() {
        if (this.tracer.enabled) {
            this.tracer.enter(this, 'cancel');
        }
        if (this.flushRequested) {
            this.$cancel();
            this.flushRequested = false;
        }
        if (this.tracer.enabled) {
            this.tracer.leave(this, 'cancel');
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
        if (this.tracer.enabled) {
            this.tracer.enter(this, 'yield');
        }
        if (this.isEmpty) {
            if (this.tracer.enabled) {
                this.tracer.leave(this, 'yield empty');
            }
        }
        else {
            if (this.yieldPromise === void 0) {
                if (this.tracer.enabled) {
                    this.tracer.trace(this, 'yield - creating promise');
                }
                this.yieldPromise = createExposedPromise();
            }
            await this.yieldPromise;
            if (this.tracer.enabled) {
                this.tracer.leave(this, 'yield task');
            }
        }
    }
    queueTask(callback, opts) {
        if (this.tracer.enabled) {
            this.tracer.enter(this, 'queueTask');
        }
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
            this.requestFlush();
        }
        const time = this.platform.performanceNow();
        let task;
        if (reusable) {
            const taskPool = this.taskPool;
            const index = this.taskPoolSize - 1;
            if (index >= 0) {
                task = taskPool[index];
                taskPool[index] = (void 0);
                this.taskPoolSize = index;
                task.reuse(time, delay, preempt, persistent, suspend, callback);
            }
            else {
                task = new Task(this.tracer, this, time, time + delay, preempt, persistent, suspend, reusable, callback);
            }
        }
        else {
            task = new Task(this.tracer, this, time, time + delay, preempt, persistent, suspend, reusable, callback);
        }
        if (preempt) {
            this.processing[this.processing.length] = task;
        }
        else if (delay === 0) {
            this.pending[this.pending.length] = task;
        }
        else {
            this.delayed[this.delayed.length] = task;
        }
        if (this.tracer.enabled) {
            this.tracer.leave(this, 'queueTask');
        }
        return task;
    }
    /**
     * Remove the task from this queue.
     */
    remove(task) {
        if (this.tracer.enabled) {
            this.tracer.enter(this, 'remove');
        }
        let idx = this.processing.indexOf(task);
        if (idx > -1) {
            this.processing.splice(idx, 1);
            if (this.tracer.enabled) {
                this.tracer.leave(this, 'remove processing');
            }
            return;
        }
        idx = this.pending.indexOf(task);
        if (idx > -1) {
            this.pending.splice(idx, 1);
            if (this.tracer.enabled) {
                this.tracer.leave(this, 'remove pending');
            }
            return;
        }
        idx = this.delayed.indexOf(task);
        if (idx > -1) {
            this.delayed.splice(idx, 1);
            if (this.tracer.enabled) {
                this.tracer.leave(this, 'remove delayed');
            }
            return;
        }
        if (this.tracer.enabled) {
            this.tracer.leave(this, 'remove error');
        }
        throw new Error(`Task #${task.id} could not be found`);
    }
    /**
     * Return a reusable task to the shared task pool.
     * The next queued callback will reuse this task object instead of creating a new one, to save overhead of creating additional objects.
     */
    returnToPool(task) {
        if (this.tracer.enabled) {
            this.tracer.trace(this, 'returnToPool');
        }
        this.taskPool[this.taskPoolSize++] = task;
    }
    /**
     * Reset the persistent task back to its pending state, preparing it for being invoked again on the next flush.
     */
    resetPersistentTask(task) {
        if (this.tracer.enabled) {
            this.tracer.enter(this, 'resetPersistentTask');
        }
        task.reset(this.platform.performanceNow());
        if (task.createdTime === task.queueTime) {
            this.pending[this.pending.length] = task;
        }
        else {
            this.delayed[this.delayed.length] = task;
        }
        if (this.tracer.enabled) {
            this.tracer.leave(this, 'resetPersistentTask');
        }
    }
    /**
     * Notify the queue that this async task has had its promise resolved, so that the queue can proceed with consecutive tasks on the next flush.
     */
    completeAsyncTask(task) {
        var _a;
        if (this.tracer.enabled) {
            this.tracer.enter(this, 'completeAsyncTask');
        }
        if (task.suspend === true) {
            if (this.suspenderTask !== task) {
                if (this.tracer.enabled) {
                    this.tracer.leave(this, 'completeAsyncTask error');
                }
                throw new Error(`Async task completion mismatch: suspenderTask=${(_a = this.suspenderTask) === null || _a === void 0 ? void 0 : _a.id}, task=${task.id}`);
            }
            this.suspenderTask = void 0;
        }
        else {
            --this.pendingAsyncCount;
        }
        if (this.yieldPromise !== void 0 &&
            this.hasNoMoreFiniteWork) {
            const p = this.yieldPromise;
            this.yieldPromise = void 0;
            p.resolve();
        }
        if (this.isEmpty) {
            this.cancel();
        }
        if (this.tracer.enabled) {
            this.tracer.leave(this, 'completeAsyncTask');
        }
    }
}
export class TaskAbortError extends Error {
    constructor(task) {
        super('Task was canceled.');
        this.task = task;
    }
}
let id = 0;
export var TaskStatus;
(function (TaskStatus) {
    TaskStatus[TaskStatus["pending"] = 0] = "pending";
    TaskStatus[TaskStatus["running"] = 1] = "running";
    TaskStatus[TaskStatus["completed"] = 2] = "completed";
    TaskStatus[TaskStatus["canceled"] = 3] = "canceled";
})(TaskStatus || (TaskStatus = {}));
export class Task {
    constructor(tracer, taskQueue, createdTime, queueTime, preempt, persistent, suspend, reusable, callback) {
        this.tracer = tracer;
        this.taskQueue = taskQueue;
        this.createdTime = createdTime;
        this.queueTime = queueTime;
        this.preempt = preempt;
        this.persistent = persistent;
        this.suspend = suspend;
        this.reusable = reusable;
        this.callback = callback;
        this.id = ++id;
        this.resolve = void 0;
        this.reject = void 0;
        this._result = void 0;
        this._status = 0 /* pending */;
    }
    get result() {
        const result = this._result;
        if (result === void 0) {
            switch (this._status) {
                case 0 /* pending */: {
                    const promise = this._result = createExposedPromise();
                    this.resolve = promise.resolve;
                    this.reject = promise.reject;
                    return promise;
                }
                case 1 /* running */:
                    throw new Error('Trying to await task from within task will cause a deadlock.');
                case 2 /* completed */:
                    return this._result = Promise.resolve();
                case 3 /* canceled */:
                    return this._result = Promise.reject(new TaskAbortError(this));
            }
        }
        return result;
    }
    get status() {
        return this._status;
    }
    run(time = this.taskQueue.platform.performanceNow()) {
        if (this.tracer.enabled) {
            this.tracer.enter(this, 'run');
        }
        if (this._status !== 0 /* pending */) {
            if (this.tracer.enabled) {
                this.tracer.leave(this, 'run error');
            }
            throw new Error(`Cannot run task in ${this._status} state`);
        }
        // this.persistent could be changed while the task is running (this can only be done by the task itself if canceled, and is a valid way of stopping a loop)
        // so we deliberately reference this.persistent instead of the local variable, but we keep it around to know whether the task *was* persistent before running it,
        // so we can set the correct cancelation state.
        const { persistent, reusable, taskQueue, callback, resolve, reject, createdTime, } = this;
        this._status = 1 /* running */;
        try {
            const ret = callback(time - createdTime);
            if (ret instanceof Promise) {
                ret.then($ret => {
                    if (this.persistent) {
                        taskQueue['resetPersistentTask'](this);
                    }
                    else {
                        if (persistent) {
                            // Persistent tasks never reach completed status. They're either pending, running, or canceled.
                            this._status = 3 /* canceled */;
                        }
                        else {
                            this._status = 2 /* completed */;
                        }
                        this.dispose();
                    }
                    taskQueue['completeAsyncTask'](this);
                    if (this.tracer.enabled) {
                        this.tracer.leave(this, 'run async then');
                    }
                    if (resolve !== void 0) {
                        resolve($ret);
                    }
                    if (!this.persistent && reusable) {
                        taskQueue['returnToPool'](this);
                    }
                })
                    .catch(err => {
                    if (!this.persistent) {
                        this.dispose();
                    }
                    taskQueue['completeAsyncTask'](this);
                    if (this.tracer.enabled) {
                        this.tracer.leave(this, 'run async catch');
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
                    taskQueue['resetPersistentTask'](this);
                }
                else {
                    if (persistent) {
                        // Persistent tasks never reach completed status. They're either pending, running, or canceled.
                        this._status = 3 /* canceled */;
                    }
                    else {
                        this._status = 2 /* completed */;
                    }
                    this.dispose();
                }
                if (this.tracer.enabled) {
                    this.tracer.leave(this, 'run sync success');
                }
                if (resolve !== void 0) {
                    resolve(ret);
                }
                if (!this.persistent && reusable) {
                    taskQueue['returnToPool'](this);
                }
            }
        }
        catch (err) {
            if (!this.persistent) {
                this.dispose();
            }
            if (this.tracer.enabled) {
                this.tracer.leave(this, 'run sync error');
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
        if (this.tracer.enabled) {
            this.tracer.enter(this, 'cancel');
        }
        if (this._status === 0 /* pending */) {
            const taskQueue = this.taskQueue;
            const reusable = this.reusable;
            const reject = this.reject;
            taskQueue.remove(this);
            if (taskQueue.isEmpty) {
                taskQueue.cancel();
            }
            this._status = 3 /* canceled */;
            this.dispose();
            if (reusable) {
                taskQueue['returnToPool'](this);
            }
            if (reject !== void 0) {
                reject(new TaskAbortError(this));
            }
            if (this.tracer.enabled) {
                this.tracer.leave(this, 'cancel true =pending');
            }
            return true;
        }
        else if (this._status === 1 /* running */ && this.persistent) {
            this.persistent = false;
            if (this.tracer.enabled) {
                this.tracer.leave(this, 'cancel true =running+persistent');
            }
            return true;
        }
        if (this.tracer.enabled) {
            this.tracer.leave(this, 'cancel false');
        }
        return false;
    }
    reset(time) {
        if (this.tracer.enabled) {
            this.tracer.enter(this, 'reset');
        }
        const delay = this.queueTime - this.createdTime;
        this.createdTime = time;
        this.queueTime = time + delay;
        this._status = 0 /* pending */;
        this.resolve = void 0;
        this.reject = void 0;
        this._result = void 0;
        if (this.tracer.enabled) {
            this.tracer.leave(this, 'reset');
        }
    }
    reuse(time, delay, preempt, persistent, suspend, callback) {
        if (this.tracer.enabled) {
            this.tracer.enter(this, 'reuse');
        }
        this.createdTime = time;
        this.queueTime = time + delay;
        this.preempt = preempt;
        this.persistent = persistent;
        this.suspend = suspend;
        this.callback = callback;
        this._status = 0 /* pending */;
        if (this.tracer.enabled) {
            this.tracer.leave(this, 'reuse');
        }
    }
    dispose() {
        if (this.tracer.enabled) {
            this.tracer.trace(this, 'dispose');
        }
        this.callback = (void 0);
        this.resolve = void 0;
        this.reject = void 0;
        this._result = void 0;
    }
}
function taskStatus(status) {
    switch (status) {
        case 0 /* pending */: return 'pending';
        case 1 /* running */: return 'running';
        case 3 /* canceled */: return 'canceled';
        case 2 /* completed */: return 'completed';
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
            const processing = obj['processing'].length;
            const pending = obj['pending'].length;
            const delayed = obj['delayed'].length;
            const flushReq = obj['flushRequested'];
            const susTask = !!obj['suspenderTask'];
            const info = `processing=${processing} pending=${pending} delayed=${delayed} flushReq=${flushReq} susTask=${susTask}`;
            this.console.log(`${prefix}[Q.${method}] ${info}`);
        }
        else {
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
export var TaskQueuePriority;
(function (TaskQueuePriority) {
    TaskQueuePriority[TaskQueuePriority["render"] = 0] = "render";
    TaskQueuePriority[TaskQueuePriority["macroTask"] = 1] = "macroTask";
    TaskQueuePriority[TaskQueuePriority["postRender"] = 2] = "postRender";
})(TaskQueuePriority || (TaskQueuePriority = {}));
const defaultQueueTaskOptions = {
    delay: 0,
    preempt: false,
    persistent: false,
    reusable: true,
    suspend: false,
};
let $resolve;
let $reject;
function executor(resolve, reject) {
    $resolve = resolve;
    $reject = reject;
}
/**
 * Efficiently create a promise where the `resolve` and `reject` functions are stored as properties on the prommise itself.
 */
function createExposedPromise() {
    const p = new Promise(executor);
    p.resolve = $resolve;
    p.reject = $reject;
    return p;
}
//# sourceMappingURL=index.js.map