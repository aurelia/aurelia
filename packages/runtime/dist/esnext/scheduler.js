import { __decorate } from "tslib";
import { PLATFORM, DI, bound, Registration } from '@aurelia/kernel';
const defaultClockSettings = {
    forceUpdateInterval: 10,
    now: PLATFORM.now,
};
const { enter, leave, trace, } = (function () {
    const enabled = false;
    let depth = 0;
    function round(num) {
        return ((num * 10 + .5) | 0) / 10;
    }
    function log(prefix, obj, method) {
        if (obj instanceof TaskQueue) {
            const processing = obj['processingSize'];
            const pending = obj['pendingSize'];
            const delayed = obj['delayedSize'];
            const flushReq = obj['flushRequested'];
            const prio = obj['priority'];
            const info = `processing=${processing} pending=${pending} delayed=${delayed} flushReq=${flushReq} prio=${prio}`;
            console.log(`${prefix}[Q.${method}] ${info}`);
        }
        else {
            const id = obj['id'];
            const created = round(obj['createdTime']);
            const queue = round(obj['queueTime']);
            const preempt = obj['preempt'];
            const reusable = obj['reusable'];
            const persistent = obj['persistent'];
            const status = obj['_status'];
            const info = `id=${id} created=${created} queue=${queue} preempt=${preempt} persistent=${persistent} reusable=${reusable} status=${status}`;
            console.log(`${prefix}[T.${method}] ${info}`);
        }
    }
    function $enter(obj, method) {
        if (enabled) {
            log(`${'  '.repeat(depth++)}> `, obj, method);
        }
    }
    function $leave(obj, method) {
        if (enabled) {
            log(`${'  '.repeat(--depth)}< `, obj, method);
        }
    }
    function $trace(obj, method) {
        if (enabled) {
            log(`${'  '.repeat(depth)}- `, obj, method);
        }
    }
    return {
        enter: $enter,
        leave: $leave,
        trace: $trace,
    };
})();
export const IClock = DI.createInterface('IClock').withDefault(x => x.instance(globalClock));
export class Clock {
    constructor(opts) {
        const { now, forceUpdateInterval } = { ...defaultClockSettings, ...opts };
        this.now = function (highRes = false) {
            // if (++requests === forceUpdateInterval || highRes) {
            //   requests = 0;
            //   timestamp = now();
            // }
            // return timestamp;
            return now();
        };
    }
    static register(container) {
        return Registration.singleton(IClock, this).register(container);
    }
}
export const globalClock = new Clock();
export var TaskQueuePriority;
(function (TaskQueuePriority) {
    TaskQueuePriority[TaskQueuePriority["microTask"] = 0] = "microTask";
    TaskQueuePriority[TaskQueuePriority["render"] = 1] = "render";
    TaskQueuePriority[TaskQueuePriority["macroTask"] = 2] = "macroTask";
    TaskQueuePriority[TaskQueuePriority["postRender"] = 3] = "postRender";
    TaskQueuePriority[TaskQueuePriority["idle"] = 4] = "idle";
})(TaskQueuePriority || (TaskQueuePriority = {}));
export const IScheduler = DI.createInterface('IScheduler').noDefault();
const createPromise = (function () {
    let $resolve = void 0;
    let $reject = void 0;
    function executor(resolve, reject) {
        $resolve = resolve;
        $reject = reject;
    }
    return function () {
        const p = new Promise(executor);
        p.resolve = $resolve;
        p.reject = $reject;
        $resolve = void 0;
        $reject = void 0;
        return p;
    };
})();
const defaultQueueTaskOptions = {
    delay: 0,
    preempt: false,
    priority: 1 /* render */,
    persistent: false,
    reusable: true,
};
export class TaskQueue {
    constructor({ clock, priority, scheduler }) {
        this.processingSize = 0;
        this.processingHead = void 0;
        this.processingTail = void 0;
        this.pendingSize = 0;
        this.pendingHead = void 0;
        this.pendingTail = void 0;
        this.delayedSize = 0;
        this.delayedHead = void 0;
        this.delayedTail = void 0;
        this.flushRequested = false;
        this.yieldPromise = void 0;
        this.taskPool = [];
        this.taskPoolSize = 0;
        this.lastRequest = 0;
        this.microTaskRequestFlushTask = null;
        this.priority = priority;
        this.scheduler = scheduler;
        this.clock = clock;
    }
    get isEmpty() {
        return this.processingSize === 0 && this.pendingSize === 0 && this.delayedSize === 0;
    }
    flush() {
        enter(this, 'flush');
        if (this.microTaskRequestFlushTask !== null) {
            this.microTaskRequestFlushTask.cancel();
            this.microTaskRequestFlushTask = null;
        }
        this.clock.now(true);
        this.flushRequested = false;
        if (this.pendingSize > 0) {
            this.movePendingToProcessing();
        }
        if (this.delayedSize > 0) {
            this.moveDelayedToProcessing();
        }
        while (this.processingSize > 0) {
            this.processingHead.run();
        }
        if (this.pendingSize > 0) {
            this.movePendingToProcessing();
        }
        if (this.delayedSize > 0) {
            this.moveDelayedToProcessing();
        }
        if (this.processingSize > 0) {
            this.requestFlush();
        }
        else if (this.delayedSize > 0) {
            if (this.priority <= 0 /* microTask */) {
                // MicroTasks are not clamped so we have to clamp them with setTimeout or they'll block forever
                this.microTaskRequestFlushTask = this.scheduler.getTaskQueue(2 /* macroTask */).queueTask(this.requestFlush);
            }
            else {
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
        leave(this, 'flush');
    }
    cancel() {
        enter(this, 'cancel');
        if (this.microTaskRequestFlushTask !== null) {
            this.microTaskRequestFlushTask.cancel();
            this.microTaskRequestFlushTask = null;
        }
        this.scheduler.cancelFlush(this);
        this.flushRequested = false;
        leave(this, 'cancel');
    }
    yield() {
        enter(this, 'yield');
        if (this.processingSize === 0 && this.pendingSize === 0 && this.delayedSize === 0) {
            leave(this, 'yield empty');
            return Promise.resolve();
        }
        if (this.yieldPromise === void 0) {
            this.yieldPromise = createPromise();
        }
        leave(this, 'yield task');
        return this.yieldPromise;
    }
    queueTask(callback, opts) {
        enter(this, 'queueTask');
        const { delay, preempt, persistent, reusable } = { ...defaultQueueTaskOptions, ...opts };
        if (preempt) {
            if (delay > 0) {
                throw new Error(`Invalid arguments: preempt cannot be combined with a greater-than-zero delay`);
            }
            if (persistent) {
                throw new Error(`Invalid arguments: preempt cannot be combined with persistent`);
            }
        }
        if (persistent && this.priority === 0 /* microTask */) {
            throw new Error(`Invalid arguments: cannot queue persistent tasks on the micro task queue`);
        }
        if (this.processingSize === 0) {
            this.requestFlush();
        }
        const time = this.clock.now();
        let task;
        if (reusable) {
            const taskPool = this.taskPool;
            const index = this.taskPoolSize - 1;
            if (index >= 0) {
                task = taskPool[index];
                taskPool[index] = (void 0);
                this.taskPoolSize = index;
                task.reuse(time, delay, preempt, persistent, callback);
            }
            else {
                task = new Task(this, time, time + delay, preempt, persistent, reusable, callback);
            }
        }
        else {
            task = new Task(this, time, time + delay, preempt, persistent, reusable, callback);
        }
        if (preempt) {
            if (this.processingSize++ === 0) {
                this.processingHead = this.processingTail = task;
            }
            else {
                this.processingTail = (task.prev = this.processingTail).next = task;
            }
        }
        else if (delay === 0) {
            if (this.pendingSize++ === 0) {
                this.pendingHead = this.pendingTail = task;
            }
            else {
                this.pendingTail = (task.prev = this.pendingTail).next = task;
            }
        }
        else {
            if (this.delayedSize++ === 0) {
                this.delayedHead = this.delayedTail = task;
            }
            else {
                this.delayedTail = (task.prev = this.delayedTail).next = task;
            }
        }
        leave(this, 'queueTask');
        return task;
    }
    take(task) {
        enter(this, 'take');
        if (task.status !== 'pending') {
            leave(this, 'take error');
            throw new Error('Can only take pending tasks.');
        }
        if (this.processingSize === 0) {
            this.requestFlush();
        }
        task.taskQueue.remove(task);
        if (task.preempt) {
            this.addToProcessing(task);
        }
        else if (task.queueTime <= this.clock.now()) {
            this.addToPending(task);
        }
        else {
            this.addToDelayed(task);
        }
        leave(this, 'take');
    }
    remove(task) {
        enter(this, 'remove');
        if (task.preempt) {
            // Fast path - preempt task can only ever end up in the processing queue
            this.removeFromProcessing(task);
            leave(this, 'remove processing fast');
            return;
        }
        if (task.queueTime > this.clock.now()) {
            // Fast path - task with queueTime in the future can only ever be in the delayed queue
            this.removeFromDelayed(task);
            leave(this, 'remove delayed fast');
            return;
        }
        // Scan everything (we can make this faster by using the queueTime property, but this is good enough for now)
        let cur = this.processingHead;
        while (cur !== void 0) {
            if (cur === task) {
                this.removeFromProcessing(task);
                leave(this, 'remove processing slow');
                return;
            }
            cur = cur.next;
        }
        cur = this.pendingHead;
        while (cur !== void 0) {
            if (cur === task) {
                this.removeFromPending(task);
                leave(this, 'remove pending slow');
                return;
            }
            cur = cur.next;
        }
        cur = this.delayedHead;
        while (cur !== void 0) {
            if (cur === task) {
                this.removeFromDelayed(task);
                leave(this, 'remove delayed slow');
                return;
            }
            cur = cur.next;
        }
        leave(this, 'remove error');
        throw new Error(`Task #${task.id} could not be found`);
    }
    returnToPool(task) {
        trace(this, 'returnToPool');
        this.taskPool[this.taskPoolSize++] = task;
    }
    resetPersistentTask(task) {
        enter(this, 'resetPersistentTask');
        task.reset(this.clock.now());
        if (task.createdTime === task.queueTime) {
            if (this.pendingSize++ === 0) {
                this.pendingHead = this.pendingTail = task;
                task.prev = task.next = void 0;
            }
            else {
                this.pendingTail = (task.prev = this.pendingTail).next = task;
                task.next = void 0;
            }
        }
        else {
            if (this.delayedSize++ === 0) {
                this.delayedHead = this.delayedTail = task;
                task.prev = task.next = void 0;
            }
            else {
                this.delayedTail = (task.prev = this.delayedTail).next = task;
                task.next = void 0;
            }
        }
        leave(this, 'resetPersistentTask');
    }
    finish(task) {
        enter(this, 'finish');
        if (task.next !== void 0) {
            task.next.prev = task.prev;
        }
        if (task.prev !== void 0) {
            task.prev.next = task.next;
        }
        leave(this, 'finish');
    }
    removeFromProcessing(task) {
        enter(this, 'removeFromProcessing');
        if (this.processingHead === task) {
            this.processingHead = task.next;
        }
        if (this.processingTail === task) {
            this.processingTail = task.prev;
        }
        --this.processingSize;
        this.finish(task);
        leave(this, 'removeFromProcessing');
    }
    removeFromPending(task) {
        enter(this, 'removeFromPending');
        if (this.pendingHead === task) {
            this.pendingHead = task.next;
        }
        if (this.pendingTail === task) {
            this.pendingTail = task.prev;
        }
        --this.pendingSize;
        this.finish(task);
        leave(this, 'removeFromPending');
    }
    removeFromDelayed(task) {
        enter(this, 'removeFromDelayed');
        if (this.delayedHead === task) {
            this.delayedHead = task.next;
        }
        if (this.delayedTail === task) {
            this.delayedTail = task.prev;
        }
        --this.delayedSize;
        this.finish(task);
        leave(this, 'removeFromDelayed');
    }
    addToProcessing(task) {
        enter(this, 'addToProcessing');
        if (this.processingSize++ === 0) {
            this.processingHead = this.processingTail = task;
        }
        else {
            this.processingTail = (task.prev = this.processingTail).next = task;
        }
        leave(this, 'addToProcessing');
    }
    addToPending(task) {
        enter(this, 'addToPending');
        if (this.pendingSize++ === 0) {
            this.pendingHead = this.pendingTail = task;
        }
        else {
            this.pendingTail = (task.prev = this.pendingTail).next = task;
        }
        leave(this, 'addToPending');
    }
    addToDelayed(task) {
        enter(this, 'addToDelayed');
        if (this.delayedSize++ === 0) {
            this.delayedHead = this.delayedTail = task;
        }
        else {
            this.delayedTail = (task.prev = this.delayedTail).next = task;
        }
        leave(this, 'addToDelayed');
    }
    movePendingToProcessing() {
        enter(this, 'movePendingToProcessing');
        // Add the previously pending tasks to the currently processing tasks
        if (this.processingSize === 0) {
            this.processingHead = this.pendingHead;
            this.processingTail = this.pendingTail;
            this.processingSize = this.pendingSize;
        }
        else {
            this.processingTail.next = this.pendingHead;
            this.processingTail = this.pendingTail;
            this.processingSize += this.pendingSize;
        }
        this.pendingHead = void 0;
        this.pendingTail = void 0;
        this.pendingSize = 0;
        leave(this, 'movePendingToProcessing');
    }
    moveDelayedToProcessing() {
        enter(this, 'moveDelayedToProcessing');
        const time = this.clock.now(true);
        // Add any delayed tasks whose delay have expired to the currently processing tasks
        const delayedHead = this.delayedHead;
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
            }
            else {
                this.processingTail.next = delayedHead;
                this.processingTail = delayedTail;
                this.processingSize += count;
            }
            this.delayedHead = next;
            this.delayedSize -= count;
            if (this.delayedSize === 0) {
                this.delayedTail = void 0;
            }
        }
        leave(this, 'moveDelayedToProcessing');
    }
    requestFlush() {
        enter(this, 'requestFlush');
        if (this.microTaskRequestFlushTask !== null) {
            this.microTaskRequestFlushTask.cancel();
            this.microTaskRequestFlushTask = null;
        }
        if (!this.flushRequested) {
            this.flushRequested = true;
            this.lastRequest = this.clock.now(true);
            this.scheduler.requestFlush(this);
        }
        leave(this, 'requestFlush');
    }
}
__decorate([
    bound
], TaskQueue.prototype, "requestFlush", null);
export class TaskAbortError extends Error {
    constructor(task) {
        super('Task was canceled.');
        this.task = task;
    }
}
let id = 0;
export class Task {
    constructor(taskQueue, createdTime, queueTime, preempt, persistent, reusable, callback) {
        this.taskQueue = taskQueue;
        this.createdTime = createdTime;
        this.queueTime = queueTime;
        this.preempt = preempt;
        this.persistent = persistent;
        this.reusable = reusable;
        this.callback = callback;
        this.id = ++id;
        this.next = void 0;
        this.prev = void 0;
        this.resolve = void 0;
        this.reject = void 0;
        this._result = void 0;
        this._status = 'pending';
        trace(this, 'constructor');
        this.priority = taskQueue.priority;
    }
    get result() {
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
                    return this._result = Promise.resolve();
                case 'canceled':
                    return this._result = Promise.reject(new TaskAbortError(this));
            }
        }
        return result;
    }
    get status() {
        return this._status;
    }
    run() {
        enter(this, 'run');
        if (this._status !== 'pending') {
            leave(this, 'run error');
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
            const ret = callback(globalClock.now() - createdTime);
            if (this.persistent) {
                taskQueue.resetPersistentTask(this);
            }
            else if (persistent) {
                // Persistent tasks never reach completed status. They're either pending, running, or canceled.
                this._status = 'canceled';
            }
            else {
                this._status = 'completed';
            }
            if (resolve !== void 0) {
                resolve(ret);
            }
        }
        catch (err) {
            if (reject !== void 0) {
                reject(err);
            }
            else {
                throw err;
            }
        }
        finally {
            if (!this.persistent) {
                this.dispose();
                if (reusable) {
                    taskQueue.returnToPool(this);
                }
            }
            leave(this, 'run finally');
        }
    }
    cancel() {
        enter(this, 'cancel');
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
            leave(this, 'cancel true =pending');
            return true;
        }
        else if (this._status === 'running' && this.persistent) {
            this.persistent = false;
            leave(this, 'cancel true =running+persistent');
            return true;
        }
        leave(this, 'cancel false');
        return false;
    }
    reset(time) {
        enter(this, 'reset');
        const delay = this.queueTime - this.createdTime;
        this.createdTime = time;
        this.queueTime = time + delay;
        this._status = 'pending';
        this.resolve = void 0;
        this.reject = void 0;
        this._result = void 0;
        leave(this, 'reset');
    }
    reuse(time, delay, preempt, persistent, callback) {
        enter(this, 'reuse');
        this.createdTime = time;
        this.queueTime = time + delay;
        this.preempt = preempt;
        this.persistent = persistent;
        this.callback = callback;
        this._status = 'pending';
        leave(this, 'reuse');
    }
    dispose() {
        trace(this, 'dispose');
        this.prev = void 0;
        this.next = void 0;
        this.callback = (void 0);
        this.resolve = void 0;
        this.reject = void 0;
        this._result = void 0;
    }
}
//# sourceMappingURL=scheduler.js.map