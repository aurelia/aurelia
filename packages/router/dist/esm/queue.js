var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { bound } from '@aurelia/kernel';
/**
 * A first-in-first-out queue that only processes the next queued item
 * when the current one has been resolved or rejected. Sends queued items
 * one at a time to a specified callback function. The callback function
 * should resolve or reject the queued item when processing is done.
 * Enqueued items can be awaited. Enqueued items can specify an (arbitrary)
 * execution cost and the queue can be set up (started) to only process
 * a specific amount of execution cost per RAF/tick.
 *
 * @internal - Shouldn't be used directly.
 */
export class Queue {
    constructor(callback) {
        this.callback = callback;
        this.pending = [];
        this.processing = null;
        this.allowedExecutionCostWithinTick = null;
        this.currentExecutionCostInCurrentTick = 0;
        this.platform = null;
        this.task = null;
    }
    get isActive() {
        return this.task !== null;
    }
    get length() {
        return this.pending.length;
    }
    start(options) {
        if (this.isActive) {
            throw new Error('Queue has already been started');
        }
        this.platform = options.platform;
        this.allowedExecutionCostWithinTick = options.allowedExecutionCostWithinTick;
        this.task = this.platform.domWriteQueue.queueTask(this.dequeue, { persistent: true });
    }
    stop() {
        if (!this.isActive) {
            throw new Error('Queue has not been started');
        }
        this.task.cancel();
        this.task = null;
        this.allowedExecutionCostWithinTick = null;
        this.clear();
    }
    enqueue(itemOrItems, costOrCosts) {
        const list = Array.isArray(itemOrItems);
        const items = list ? itemOrItems : [itemOrItems];
        const costs = items
            .map((value, index) => !Array.isArray(costOrCosts) ? costOrCosts : costOrCosts[index])
            .map(value => value !== undefined ? value : 1);
        const promises = [];
        for (const item of items) {
            const qItem = { ...item };
            qItem.cost = costs.shift();
            promises.push(new Promise((resolve, reject) => {
                qItem.resolve = () => {
                    resolve();
                    this.processing = null;
                    this.dequeue();
                };
                qItem.reject = (reason) => {
                    reject(reason);
                    this.processing = null;
                    this.dequeue();
                };
            }));
            this.pending.push(qItem);
        }
        this.dequeue();
        return list ? promises : promises[0];
    }
    dequeue(delta) {
        if (this.processing !== null) {
            return;
        }
        if (delta !== undefined) {
            this.currentExecutionCostInCurrentTick = 0;
        }
        if (!this.pending.length) {
            return;
        }
        if (this.allowedExecutionCostWithinTick !== null && delta === undefined && this.currentExecutionCostInCurrentTick + (this.pending[0].cost || 0) > this.allowedExecutionCostWithinTick) {
            return;
        }
        this.processing = this.pending.shift() || null;
        if (this.processing) {
            this.currentExecutionCostInCurrentTick += this.processing.cost || 0;
            this.callback(this.processing);
        }
    }
    clear() {
        this.pending.splice(0, this.pending.length);
    }
}
__decorate([
    bound
], Queue.prototype, "dequeue", null);
//# sourceMappingURL=queue.js.map