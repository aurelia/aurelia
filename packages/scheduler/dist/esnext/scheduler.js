import { DI } from '@aurelia/kernel';
import { defaultQueueTaskOptions, } from './types';
import { TaskQueue, } from './task-queue';
const store = new WeakMap();
export const IScheduler = DI.createInterface('IScheduler').noDefault();
export class Scheduler {
    constructor(now, microtaskFactory, renderFactory, macroTaskFactory, postRenderFactory, idleFactory) {
        this.taskQueues = [
            this.microtask = (new TaskQueue(now, 0 /* microTask */, this, microtaskFactory)),
            this.render = (new TaskQueue(now, 1 /* render */, this, renderFactory)),
            this.macroTask = (new TaskQueue(now, 2 /* macroTask */, this, macroTaskFactory)),
            this.postRender = (new TaskQueue(now, 3 /* postRender */, this, postRenderFactory)),
            this.idle = (new TaskQueue(now, 4 /* idle */, this, idleFactory)),
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
        const { delay, preempt, priority, persistent, reusable } = { ...defaultQueueTaskOptions, ...opts };
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
//# sourceMappingURL=scheduler.js.map