(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel", "./types", "./task-queue"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    const types_1 = require("./types");
    const task_queue_1 = require("./task-queue");
    const store = new WeakMap();
    exports.IScheduler = kernel_1.DI.createInterface('IScheduler').noDefault();
    class Scheduler {
        constructor(now, microtaskFactory, renderFactory, macroTaskFactory, postRenderFactory, idleFactory) {
            this.taskQueues = [
                this.microtask = (new task_queue_1.TaskQueue(now, 0 /* microTask */, this, microtaskFactory)),
                this.render = (new task_queue_1.TaskQueue(now, 1 /* render */, this, renderFactory)),
                this.macroTask = (new task_queue_1.TaskQueue(now, 2 /* macroTask */, this, macroTaskFactory)),
                this.postRender = (new task_queue_1.TaskQueue(now, 3 /* postRender */, this, postRenderFactory)),
                this.idle = (new task_queue_1.TaskQueue(now, 4 /* idle */, this, idleFactory)),
            ];
            this.yieldMicroTask = this.yieldMicroTask.bind(this);
            this.yieldRenderTask = this.yieldRenderTask.bind(this);
            this.yieldMacroTask = this.yieldMacroTask.bind(this);
            this.yieldPostRenderTask = this.yieldPostRenderTask.bind(this);
            this.yieldIdleTask = this.yieldIdleTask.bind(this);
            this.yieldAll = this.yieldAll.bind(this);
        }
        static get(key) {
            return store.get(key);
        }
        static set(key, instance) {
            store.set(key, instance);
        }
        getTaskQueue(priority) {
            return this.taskQueues[priority];
        }
        yield(priority) {
            return this.taskQueues[priority].yield();
        }
        queueTask(callback, opts) {
            const { delay, preempt, priority, persistent, reusable } = { ...types_1.defaultQueueTaskOptions, ...opts };
            return this.taskQueues[priority].queueTask(callback, { delay, preempt, persistent, reusable });
        }
        getMicroTaskQueue() {
            return this.microtask;
        }
        getRenderTaskQueue() {
            return this.render;
        }
        getMacroTaskQueue() {
            return this.macroTask;
        }
        getPostRenderTaskQueue() {
            return this.postRender;
        }
        getIdleTaskQueue() {
            return this.idle;
        }
        yieldMicroTask() {
            return this.microtask.yield();
        }
        yieldRenderTask() {
            return this.render.yield();
        }
        yieldMacroTask() {
            return this.macroTask.yield();
        }
        yieldPostRenderTask() {
            return this.postRender.yield();
        }
        yieldIdleTask() {
            return this.idle.yield();
        }
        async yieldAll(repeat = 1) {
            while (repeat-- > 0) {
                await this.yieldIdleTask();
                await this.yieldPostRenderTask();
                await this.yieldMacroTask();
                await this.yieldRenderTask();
                await this.yieldMicroTask();
            }
        }
        queueMicroTask(callback, opts) {
            return this.microtask.queueTask(callback, opts);
        }
        queueRenderTask(callback, opts) {
            return this.render.queueTask(callback, opts);
        }
        queueMacroTask(callback, opts) {
            return this.macroTask.queueTask(callback, opts);
        }
        queuePostRenderTask(callback, opts) {
            return this.postRender.queueTask(callback, opts);
        }
        queueIdleTask(callback, opts) {
            return this.idle.queueTask(callback, opts);
        }
    }
    exports.Scheduler = Scheduler;
});
//# sourceMappingURL=scheduler.js.map