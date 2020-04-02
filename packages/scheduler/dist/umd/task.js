(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./types"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const types_1 = require("./types");
    class TaskAbortError extends Error {
        constructor(task) {
            super('Task was canceled.');
            this.task = task;
        }
    }
    exports.TaskAbortError = TaskAbortError;
    let id = 0;
    class Task {
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
            this.priority = taskQueue.priority;
        }
        get result() {
            const result = this._result;
            if (result === void 0) {
                switch (this._status) {
                    case 'pending': {
                        const promise = this._result = types_1.createExposedPromise();
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
            }
        }
        cancel() {
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
            }
            else if (this._status === 'running' && this.persistent) {
                this.persistent = false;
                return true;
            }
            return false;
        }
        reset(time) {
            const delay = this.queueTime - this.createdTime;
            this.createdTime = time;
            this.queueTime = time + delay;
            this._status = 'pending';
            this.resolve = void 0;
            this.reject = void 0;
            this._result = void 0;
        }
        reuse(time, delay, preempt, persistent, callback) {
            this.createdTime = time;
            this.queueTime = time + delay;
            this.preempt = preempt;
            this.persistent = persistent;
            this.callback = callback;
            this._status = 'pending';
        }
        dispose() {
            this.prev = void 0;
            this.next = void 0;
            this.callback = (void 0);
            this.resolve = void 0;
            this.reject = void 0;
            this._result = void 0;
        }
    }
    exports.Task = Task;
});
//# sourceMappingURL=task.js.map