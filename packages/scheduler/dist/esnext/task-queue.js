import { createExposedPromise, defaultQueueTaskOptions, } from './types';
import { Task, } from './task';
export class TaskQueue {
    constructor(now, priority, scheduler, flushRequestorFactory) {
        this.now = now;
        this.priority = priority;
        this.scheduler = scheduler;
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
        this.flushRequestor = flushRequestorFactory.create(this);
        this.requestFlush = this.requestFlush.bind(this);
    }
    get isEmpty() {
        return this.processingSize === 0 && this.pendingSize === 0 && this.delayedSize === 0;
    }
    flush() {
        if (this.microTaskRequestFlushTask !== null) {
            this.microTaskRequestFlushTask.cancel();
            this.microTaskRequestFlushTask = null;
        }
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
    }
    cancel() {
        if (this.microTaskRequestFlushTask !== null) {
            this.microTaskRequestFlushTask.cancel();
            this.microTaskRequestFlushTask = null;
        }
        this.flushRequestor.cancel();
        this.flushRequested = false;
    }
    async yield() {
        if (this.processingSize > 0 || this.pendingSize > 0 || this.delayedSize > 0) {
            if (this.yieldPromise === void 0) {
                this.yieldPromise = createExposedPromise();
            }
            await this.yieldPromise;
        }
    }
    queueTask(callback, opts) {
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
        const time = this.now();
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
        return task;
    }
    take(task) {
        if (task.status !== 'pending') {
            throw new Error('Can only take pending tasks.');
        }
        if (this.processingSize === 0) {
            this.requestFlush();
        }
        task.taskQueue.remove(task);
        if (task.preempt) {
            this.addToProcessing(task);
        }
        else if (task.queueTime <= this.now()) {
            this.addToPending(task);
        }
        else {
            this.addToDelayed(task);
        }
    }
    remove(task) {
        if (task.preempt) {
            // Fast path - preempt task can only ever end up in the processing queue
            this.removeFromProcessing(task);
            return;
        }
        if (task.queueTime > this.now()) {
            // Fast path - task with queueTime in the future can only ever be in the delayed queue
            this.removeFromDelayed(task);
            return;
        }
        // Scan everything (we can make this faster by using the queueTime property, but this is good enough for now)
        let cur = this.processingHead;
        while (cur !== void 0) {
            if (cur === task) {
                this.removeFromProcessing(task);
                return;
            }
            cur = cur.next;
        }
        cur = this.pendingHead;
        while (cur !== void 0) {
            if (cur === task) {
                this.removeFromPending(task);
                return;
            }
            cur = cur.next;
        }
        cur = this.delayedHead;
        while (cur !== void 0) {
            if (cur === task) {
                this.removeFromDelayed(task);
                return;
            }
            cur = cur.next;
        }
        throw new Error(`Task #${task.id} could not be found`);
    }
    returnToPool(task) {
        this.taskPool[this.taskPoolSize++] = task;
    }
    resetPersistentTask(task) {
        task.reset(this.now());
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
    }
    finish(task) {
        if (task.next !== void 0) {
            task.next.prev = task.prev;
        }
        if (task.prev !== void 0) {
            task.prev.next = task.next;
        }
    }
    removeFromProcessing(task) {
        if (this.processingHead === task) {
            this.processingHead = task.next;
        }
        if (this.processingTail === task) {
            this.processingTail = task.prev;
        }
        --this.processingSize;
        this.finish(task);
    }
    removeFromPending(task) {
        if (this.pendingHead === task) {
            this.pendingHead = task.next;
        }
        if (this.pendingTail === task) {
            this.pendingTail = task.prev;
        }
        --this.pendingSize;
        this.finish(task);
    }
    removeFromDelayed(task) {
        if (this.delayedHead === task) {
            this.delayedHead = task.next;
        }
        if (this.delayedTail === task) {
            this.delayedTail = task.prev;
        }
        --this.delayedSize;
        this.finish(task);
    }
    addToProcessing(task) {
        if (this.processingSize++ === 0) {
            this.processingHead = this.processingTail = task;
        }
        else {
            this.processingTail = (task.prev = this.processingTail).next = task;
        }
    }
    addToPending(task) {
        if (this.pendingSize++ === 0) {
            this.pendingHead = this.pendingTail = task;
        }
        else {
            this.pendingTail = (task.prev = this.pendingTail).next = task;
        }
    }
    addToDelayed(task) {
        if (this.delayedSize++ === 0) {
            this.delayedHead = this.delayedTail = task;
        }
        else {
            this.delayedTail = (task.prev = this.delayedTail).next = task;
        }
    }
    movePendingToProcessing() {
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
    }
    moveDelayedToProcessing() {
        const time = this.now();
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
    }
    requestFlush() {
        if (this.microTaskRequestFlushTask !== null) {
            this.microTaskRequestFlushTask.cancel();
            this.microTaskRequestFlushTask = null;
        }
        if (!this.flushRequested) {
            this.flushRequested = true;
            this.lastRequest = this.now();
            this.flushRequestor.request();
        }
    }
}
//# sourceMappingURL=task-queue.js.map