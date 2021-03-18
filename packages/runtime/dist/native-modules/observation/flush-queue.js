import { def } from '../utilities-objects.js';
export function withFlushQueue(target) {
    return target == null ? queueableDeco : queueableDeco(target);
}
function queueableDeco(target) {
    const proto = target.prototype;
    def(proto, 'queue', { get: getFlushQueue });
}
export class FlushQueue {
    constructor() {
        this.flushing = false;
        this.items = new Set();
    }
    get count() {
        return this.items.size;
    }
    add(callable) {
        this.items.add(callable);
        if (this.flushing) {
            return;
        }
        this.flushing = true;
        const items = this.items;
        let item;
        try {
            for (item of items) {
                items.delete(item);
                item.flush();
            }
        }
        finally {
            this.flushing = false;
        }
    }
    clear() {
        this.items.clear();
        this.flushing = false;
    }
}
FlushQueue.instance = new FlushQueue();
function getFlushQueue() {
    return FlushQueue.instance;
}
//# sourceMappingURL=flush-queue.js.map