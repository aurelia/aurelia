import { DI, PLATFORM, Registration, } from '@aurelia/kernel';
const slice = Array.prototype.slice;
export var ViewModelKind;
(function (ViewModelKind) {
    ViewModelKind[ViewModelKind["customElement"] = 0] = "customElement";
    ViewModelKind[ViewModelKind["customAttribute"] = 1] = "customAttribute";
    ViewModelKind[ViewModelKind["synthetic"] = 2] = "synthetic";
})(ViewModelKind || (ViewModelKind = {}));
export const IController = DI.createInterface('IController').noDefault();
/**
 * Describing characteristics of a mounting operation a controller will perform
 */
export var MountStrategy;
(function (MountStrategy) {
    MountStrategy[MountStrategy["insertBefore"] = 1] = "insertBefore";
    MountStrategy[MountStrategy["append"] = 2] = "append";
})(MountStrategy || (MountStrategy = {}));
export const IViewFactory = DI.createInterface('IViewFactory').noDefault();
class LinkedCallback {
    constructor(cb, context = void 0, priority = 16384 /* normal */, once = false) {
        this.cb = cb;
        this.context = context;
        this.priority = priority;
        this.once = once;
        this.next = void 0;
        this.prev = void 0;
        this.unlinked = false;
    }
    get first() {
        let cur = this;
        while (cur.prev !== void 0 && cur.prev.priority === this.priority) {
            cur = cur.prev;
        }
        return cur;
    }
    get last() {
        let cur = this;
        while (cur.next !== void 0 && cur.next.priority === this.priority) {
            cur = cur.next;
        }
        return cur;
    }
    equals(fn, context) {
        return this.cb === fn && this.context === context;
    }
    call(flags) {
        if (this.cb !== void 0) {
            if (this.context !== void 0) {
                this.cb.call(this.context, flags);
            }
            else {
                this.cb(flags);
            }
        }
        if (this.once) {
            return this.unlink(true);
        }
        else if (this.unlinked) {
            const next = this.next;
            this.next = void 0;
            return next;
        }
        else {
            return this.next;
        }
    }
    rotate() {
        if (this.prev === void 0 || this.prev.priority > this.priority) {
            return;
        }
        const { first, last } = this;
        const firstPrev = first.prev;
        const lastNext = last.next;
        const thisPrev = this.prev;
        this.prev = firstPrev;
        if (firstPrev !== void 0) {
            firstPrev.next = this;
        }
        last.next = first;
        first.prev = last;
        thisPrev.next = lastNext;
        if (lastNext !== void 0) {
            lastNext.prev = thisPrev;
        }
    }
    link(prev) {
        this.prev = prev;
        if (prev.next !== void 0) {
            prev.next.prev = this;
        }
        this.next = prev.next;
        prev.next = this;
    }
    unlink(removeNext = false) {
        this.unlinked = true;
        this.cb = void 0;
        this.context = void 0;
        if (this.prev !== void 0) {
            this.prev.next = this.next;
        }
        if (this.next !== void 0) {
            this.next.prev = this.prev;
        }
        this.prev = void 0;
        if (removeNext) {
            const { next } = this;
            this.next = void 0;
            return next;
        }
        return this.next;
    }
}
export var Priority;
(function (Priority) {
    Priority[Priority["preempt"] = 32768] = "preempt";
    Priority[Priority["high"] = 28672] = "high";
    Priority[Priority["bind"] = 24576] = "bind";
    Priority[Priority["attach"] = 20480] = "attach";
    Priority[Priority["normal"] = 16384] = "normal";
    Priority[Priority["propagate"] = 12288] = "propagate";
    Priority[Priority["connect"] = 8192] = "connect";
    Priority[Priority["low"] = 4096] = "low";
})(Priority || (Priority = {}));
export const ILifecycle = DI.createInterface('ILifecycle').withDefault(x => x.singleton(Lifecycle));
const { min, max } = Math;
export class BoundQueue {
    constructor(lifecycle) {
        this.lifecycle = lifecycle;
        this.depth = 0;
        this.head = void 0;
        this.tail = void 0;
    }
    begin() {
        ++this.depth;
    }
    end(flags) {
        if (flags === void 0) {
            flags = 0 /* none */;
        }
        if (--this.depth === 0) {
            this.process(flags);
        }
    }
    inline(fn, flags) {
        this.begin();
        fn();
        this.end(flags);
    }
    add(controller) {
        if (this.head === void 0) {
            this.head = controller;
        }
        else {
            controller.prevBound = this.tail;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.tail.nextBound = controller; // implied by boundHead not being undefined
        }
        this.tail = controller;
        controller.state |= 65536 /* inBoundQueue */;
    }
    remove(controller) {
        if (controller.prevBound !== void 0) {
            controller.prevBound.nextBound = controller.nextBound;
        }
        if (controller.nextBound !== void 0) {
            controller.nextBound.prevBound = controller.prevBound;
        }
        controller.prevBound = void 0;
        controller.nextBound = void 0;
        if (this.tail === controller) {
            this.tail = controller.prevBound;
        }
        if (this.head === controller) {
            this.head = controller.nextBound;
        }
        controller.state = (controller.state | 65536 /* inBoundQueue */) ^ 65536 /* inBoundQueue */;
    }
    process(flags) {
        while (this.head !== void 0) {
            let cur = this.head;
            this.head = this.tail = void 0;
            let next;
            do {
                cur.state = (cur.state | 65536 /* inBoundQueue */) ^ 65536 /* inBoundQueue */;
                cur.bound(flags);
                next = cur.nextBound;
                cur.nextBound = void 0;
                cur.prevBound = void 0;
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                cur = next; // we're checking it for undefined the next line
            } while (cur !== void 0);
        }
    }
}
export class UnboundQueue {
    constructor(lifecycle) {
        this.lifecycle = lifecycle;
        this.depth = 0;
        this.head = void 0;
        this.tail = void 0;
    }
    begin() {
        ++this.depth;
    }
    end(flags) {
        if (flags === void 0) {
            flags = 0 /* none */;
        }
        if (--this.depth === 0) {
            this.process(flags);
        }
    }
    inline(fn, flags) {
        this.begin();
        fn();
        this.end(flags);
    }
    add(controller) {
        if (this.head === void 0) {
            this.head = controller;
        }
        else {
            controller.prevUnbound = this.tail;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.tail.nextUnbound = controller; // implied by unboundHead not being undefined
        }
        this.tail = controller;
        controller.state |= 131072 /* inUnboundQueue */;
    }
    remove(controller) {
        if (controller.prevUnbound !== void 0) {
            controller.prevUnbound.nextUnbound = controller.nextUnbound;
        }
        if (controller.nextUnbound !== void 0) {
            controller.nextUnbound.prevUnbound = controller.prevUnbound;
        }
        controller.prevUnbound = void 0;
        controller.nextUnbound = void 0;
        if (this.tail === controller) {
            this.tail = controller.prevUnbound;
        }
        if (this.head === controller) {
            this.head = controller.nextUnbound;
        }
        controller.state = (controller.state | 131072 /* inUnboundQueue */) ^ 131072 /* inUnboundQueue */;
    }
    process(flags) {
        while (this.head !== void 0) {
            let cur = this.head;
            this.head = this.tail = void 0;
            let next;
            do {
                cur.state = (cur.state | 131072 /* inUnboundQueue */) ^ 131072 /* inUnboundQueue */;
                cur.unbound(flags);
                next = cur.nextUnbound;
                cur.nextUnbound = void 0;
                cur.prevUnbound = void 0;
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                cur = next; // we're checking it for undefined the next line
            } while (cur !== void 0);
        }
    }
}
export class AttachedQueue {
    constructor(lifecycle) {
        this.lifecycle = lifecycle;
        this.depth = 0;
        this.head = void 0;
        this.tail = void 0;
    }
    begin() {
        ++this.depth;
    }
    end(flags) {
        if (flags === void 0) {
            flags = 0 /* none */;
        }
        if (--this.depth === 0) {
            // temporary, until everything else works and we're ready for integrating mount/unmount in the RAF queue
            this.lifecycle.mount.process(flags);
            this.process(flags);
        }
    }
    inline(fn, flags) {
        this.begin();
        fn();
        this.end(flags);
    }
    add(controller) {
        if (this.head === void 0) {
            this.head = controller;
        }
        else {
            controller.prevAttached = this.tail;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.tail.nextAttached = controller; // implied by attachedHead not being undefined
        }
        this.tail = controller;
        controller.state |= 262144 /* inAttachedQueue */;
    }
    remove(controller) {
        if (controller.prevAttached !== void 0) {
            controller.prevAttached.nextAttached = controller.nextAttached;
        }
        if (controller.nextAttached !== void 0) {
            controller.nextAttached.prevAttached = controller.prevAttached;
        }
        controller.prevAttached = void 0;
        controller.nextAttached = void 0;
        if (this.tail === controller) {
            this.tail = controller.prevAttached;
        }
        if (this.head === controller) {
            this.head = controller.nextAttached;
        }
        controller.state = (controller.state | 262144 /* inAttachedQueue */) ^ 262144 /* inAttachedQueue */;
    }
    process(flags) {
        while (this.head !== void 0) {
            let cur = this.head;
            this.head = this.tail = void 0;
            let next;
            do {
                cur.state = (cur.state | 262144 /* inAttachedQueue */) ^ 262144 /* inAttachedQueue */;
                cur.attached(flags);
                next = cur.nextAttached;
                cur.nextAttached = void 0;
                cur.prevAttached = void 0;
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                cur = next; // we're checking it for undefined the next line
            } while (cur !== void 0);
        }
    }
}
export class DetachedQueue {
    constructor(lifecycle) {
        this.lifecycle = lifecycle;
        this.depth = 0;
        this.head = void 0;
        this.tail = void 0;
    }
    begin() {
        ++this.depth;
    }
    end(flags) {
        if (flags === void 0) {
            flags = 0 /* none */;
        }
        if (--this.depth === 0) {
            // temporary, until everything else works and we're ready for integrating mount/unmount in the RAF queue
            this.lifecycle.unmount.process(flags);
            this.process(flags);
        }
    }
    inline(fn, flags) {
        this.begin();
        fn();
        this.end(flags);
    }
    add(controller) {
        if (this.head === void 0) {
            this.head = controller;
        }
        else {
            controller.prevDetached = this.tail;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.tail.nextDetached = controller; // implied by detachedHead not being undefined
        }
        this.tail = controller;
        controller.state |= 524288 /* inDetachedQueue */;
    }
    remove(controller) {
        if (controller.prevDetached !== void 0) {
            controller.prevDetached.nextDetached = controller.nextDetached;
        }
        if (controller.nextDetached !== void 0) {
            controller.nextDetached.prevDetached = controller.prevDetached;
        }
        controller.prevDetached = void 0;
        controller.nextDetached = void 0;
        if (this.tail === controller) {
            this.tail = controller.prevDetached;
        }
        if (this.head === controller) {
            this.head = controller.nextDetached;
        }
        controller.state = (controller.state | 524288 /* inDetachedQueue */) ^ 524288 /* inDetachedQueue */;
    }
    process(flags) {
        while (this.head !== void 0) {
            let cur = this.head;
            this.head = this.tail = void 0;
            let next;
            do {
                cur.state = (cur.state | 524288 /* inDetachedQueue */) ^ 524288 /* inDetachedQueue */;
                cur.detached(flags);
                next = cur.nextDetached;
                cur.nextDetached = void 0;
                cur.prevDetached = void 0;
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                cur = next; // we're checking it for undefined the next line
            } while (cur !== void 0);
        }
    }
}
export class MountQueue {
    constructor(lifecycle) {
        this.lifecycle = lifecycle;
        this.head = void 0;
        this.tail = void 0;
    }
    add(controller) {
        if ((controller.state & 2097152 /* inUnmountQueue */) > 0) {
            this.lifecycle.unmount.remove(controller);
            console.log(`in unmount queue during mountQueue.add, so removing`, this);
            return;
        }
        if (this.head === void 0) {
            this.head = controller;
        }
        else {
            controller.prevMount = this.tail;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.tail.nextMount = controller; // implied by mountHead not being undefined
        }
        this.tail = controller;
        controller.state |= 1048576 /* inMountQueue */;
    }
    remove(controller) {
        if (controller.prevMount !== void 0) {
            controller.prevMount.nextMount = controller.nextMount;
        }
        if (controller.nextMount !== void 0) {
            controller.nextMount.prevMount = controller.prevMount;
        }
        controller.prevMount = void 0;
        controller.nextMount = void 0;
        if (this.tail === controller) {
            this.tail = controller.prevMount;
        }
        if (this.head === controller) {
            this.head = controller.nextMount;
        }
        controller.state = (controller.state | 1048576 /* inMountQueue */) ^ 1048576 /* inMountQueue */;
    }
    process(flags) {
        let i = 0;
        while (this.head !== void 0) {
            let cur = this.head;
            this.head = this.tail = void 0;
            let next;
            do {
                cur.state = (cur.state | 1048576 /* inMountQueue */) ^ 1048576 /* inMountQueue */;
                ++i;
                cur.mount(flags);
                next = cur.nextMount;
                cur.nextMount = void 0;
                cur.prevMount = void 0;
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                cur = next; // we're checking it for undefined the next line
            } while (cur !== void 0);
        }
    }
}
export class UnmountQueue {
    constructor(lifecycle) {
        this.lifecycle = lifecycle;
        this.head = void 0;
        this.tail = void 0;
    }
    add(controller) {
        if ((controller.state & 1048576 /* inMountQueue */) > 0) {
            this.lifecycle.mount.remove(controller);
            return;
        }
        if (this.head === void 0) {
            this.head = controller;
        }
        else {
            controller.prevUnmount = this.tail;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            this.tail.nextUnmount = controller; // implied by unmountHead not being undefined
        }
        this.tail = controller;
        controller.state |= 2097152 /* inUnmountQueue */;
    }
    remove(controller) {
        if (controller.prevUnmount !== void 0) {
            controller.prevUnmount.nextUnmount = controller.nextUnmount;
        }
        if (controller.nextUnmount !== void 0) {
            controller.nextUnmount.prevUnmount = controller.prevUnmount;
        }
        controller.prevUnmount = void 0;
        controller.nextUnmount = void 0;
        if (this.tail === controller) {
            this.tail = controller.prevUnmount;
        }
        if (this.head === controller) {
            this.head = controller.nextUnmount;
        }
        controller.state = (controller.state | 2097152 /* inUnmountQueue */) ^ 2097152 /* inUnmountQueue */;
    }
    process(flags) {
        let i = 0;
        while (this.head !== void 0) {
            let cur = this.head;
            this.head = this.tail = void 0;
            let next;
            do {
                cur.state = (cur.state | 2097152 /* inUnmountQueue */) ^ 2097152 /* inUnmountQueue */;
                ++i;
                cur.unmount(flags);
                next = cur.nextUnmount;
                cur.nextUnmount = void 0;
                cur.prevUnmount = void 0;
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                cur = next; // we're checking it for undefined the next line
            } while (cur !== void 0);
        }
    }
}
export class BatchQueue {
    constructor(lifecycle) {
        this.lifecycle = lifecycle;
        this.queue = [];
        this.depth = 0;
    }
    begin() {
        ++this.depth;
    }
    end(flags) {
        if (flags === void 0) {
            flags = 0 /* none */;
        }
        if (--this.depth === 0) {
            this.process(flags);
        }
    }
    inline(fn, flags) {
        this.begin();
        fn();
        this.end(flags);
    }
    add(requestor) {
        this.queue.push(requestor);
    }
    remove(requestor) {
        const index = this.queue.indexOf(requestor);
        if (index > -1) {
            this.queue.splice(index, 1);
        }
    }
    process(flags) {
        flags |= 512 /* fromBatch */;
        while (this.queue.length > 0) {
            const batch = this.queue.slice();
            this.queue = [];
            const { length } = batch;
            for (let i = 0; i < length; ++i) {
                batch[i].flushBatch(flags);
            }
        }
    }
}
export class Lifecycle {
    constructor() {
        this.rafHead = new LinkedCallback(void 0, void 0, Infinity);
        this.rafTail = (void 0);
        this.currentTick = 0;
        this.isFlushingRAF = false;
        this.rafRequestId = -1;
        this.rafStartTime = -1;
        this.isTicking = false;
        this.batch = new BatchQueue(this);
        this.mount = new MountQueue(this);
        this.unmount = new UnmountQueue(this);
        this.bound = new BoundQueue(this);
        this.unbound = new UnboundQueue(this);
        this.attached = new AttachedQueue(this);
        this.detached = new DetachedQueue(this);
        this.minFrameDuration = 0;
        this.maxFrameDuration = 1000 / 30;
        this.prevFrameDuration = 0;
        this.nextFrame = new Promise(resolve => {
            this.resolveNextFrame = resolve;
        });
        this.tick = (timestamp) => {
            this.rafRequestId = -1;
            if (this.isTicking) {
                this.processRAFQueue(960 /* fromFlush */, timestamp);
                if (this.isTicking && this.rafRequestId === -1 && this.rafHead.next !== void 0) {
                    this.rafRequestId = PLATFORM.requestAnimationFrame(this.tick);
                }
                if (++this.currentTick > 1) {
                    this.resolveNextFrame(timestamp);
                    this.nextFrame = new Promise(resolve => {
                        this.resolveNextFrame = resolve;
                    });
                }
            }
        };
        this.pendingChanges = 0;
        this.timeslicingEnabled = false;
        this.adaptiveTimeslicing = false;
        this.frameDurationFactor = 1;
    }
    get FPS() {
        return 1000 / this.prevFrameDuration;
    }
    get minFPS() {
        return 1000 / this.maxFrameDuration;
    }
    set minFPS(fps) {
        this.maxFrameDuration = 1000 / min(max(0, min(this.maxFPS, fps)), 60);
    }
    get maxFPS() {
        if (this.minFrameDuration > 0) {
            return 1000 / this.minFrameDuration;
        }
        return 60;
    }
    set maxFPS(fps) {
        if (fps >= 60) {
            this.minFrameDuration = 0;
        }
        else {
            this.minFrameDuration = 1000 / min(max(1, max(this.minFPS, fps)), 60);
        }
    }
    static register(container) {
        return Registration.singleton(ILifecycle, this).register(container);
    }
    startTicking() {
        if (!this.isTicking) {
            this.isTicking = true;
            if (this.rafRequestId === -1 && this.rafHead.next !== void 0) {
                this.rafStartTime = PLATFORM.now();
                this.rafRequestId = PLATFORM.requestAnimationFrame(this.tick);
            }
        }
        else if (this.rafRequestId === -1 && this.rafHead.next !== void 0) {
            this.rafStartTime = PLATFORM.now();
            this.rafRequestId = PLATFORM.requestAnimationFrame(this.tick);
        }
    }
    stopTicking() {
        // todo: API for stopping without processing the RAF queue
        // todo: tests for flushing when stopping
        this.processRAFQueue(0 /* none */);
        if (this.isTicking) {
            this.isTicking = false;
            if (this.rafRequestId !== -1) {
                PLATFORM.cancelAnimationFrame(this.rafRequestId);
                this.rafRequestId = -1;
            }
        }
        else if (this.rafRequestId !== -1) {
            PLATFORM.cancelAnimationFrame(this.rafRequestId);
            this.rafRequestId = -1;
        }
    }
    enqueueRAF(cb, context = void 0, priority = 16384 /* normal */, once = false) {
        const node = new LinkedCallback(cb, context, priority, once);
        let prev = this.rafHead;
        let current = prev.next;
        if (current === void 0) {
            node.link(prev);
        }
        else {
            do {
                if (priority > current.priority || (priority === current.priority && once && !current.once)) {
                    node.link(prev);
                    break;
                }
                prev = current;
                current = current.next;
            } while (current !== void 0);
            if (node.prev === void 0) {
                node.link(prev);
            }
        }
        if (node.next === void 0) {
            this.rafTail = node;
        }
        this.startTicking();
    }
    dequeueRAF(cb, context = void 0) {
        let current = this.rafHead.next;
        while (current !== void 0) {
            if (current.equals(cb, context)) {
                current = current.unlink();
            }
            else {
                current = current.next;
            }
        }
    }
    processRAFQueue(flags, timestamp = PLATFORM.now()) {
        if (this.isFlushingRAF) {
            return;
        }
        this.isFlushingRAF = true;
        if (timestamp >= this.rafStartTime) {
            const prevFrameDuration = this.prevFrameDuration = timestamp - this.rafStartTime;
            if (prevFrameDuration + 1 < this.minFrameDuration) {
                return;
            }
            let i = 0;
            if (this.adaptiveTimeslicing && this.maxFrameDuration > 0) {
                // Clamp the factor between 10 and 0.1 to prevent hanging or unjustified skipping during sudden shifts in workload
                this.frameDurationFactor = min(max(this.frameDurationFactor * (this.maxFrameDuration / prevFrameDuration), 0.1), 10);
            }
            else {
                this.frameDurationFactor = 1;
            }
            const deadlineLow = timestamp + max(this.maxFrameDuration * this.frameDurationFactor, 1);
            const deadlineNormal = timestamp + max(this.maxFrameDuration * this.frameDurationFactor * 5, 5);
            const deadlineHigh = timestamp + max(this.maxFrameDuration * this.frameDurationFactor * 15, 15);
            flags |= 256 /* fromTick */;
            do {
                this.pendingChanges = 0;
                let current = this.rafHead.next;
                while (current !== void 0) {
                    // only call performance.now() every 10 calls to reduce the overhead (is this low enough though?)
                    if (++i === 10) {
                        i = 0;
                        if (this.timeslicingEnabled) {
                            const { priority } = current;
                            const now = PLATFORM.now();
                            if (priority <= 4096 /* low */) {
                                if (now >= deadlineLow) {
                                    current.rotate();
                                    if (current.last != void 0 && current.last.next != void 0) {
                                        current = current.last.next;
                                    }
                                    else {
                                        break;
                                    }
                                }
                            }
                            else if (priority < 28672 /* high */) {
                                if (now >= deadlineNormal) {
                                    current.rotate();
                                    if (current.last != void 0 && current.last.next != void 0) {
                                        current = current.last.next;
                                    }
                                    else {
                                        break;
                                    }
                                }
                            }
                            else {
                                if (now >= deadlineHigh) {
                                    current.rotate();
                                    if (current.last != void 0 && current.last.next != void 0) {
                                        current = current.last.next;
                                    }
                                    else {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    current = current.call(flags);
                }
            } while (this.pendingChanges > 0);
            if (this.rafHead.next === void 0) {
                this.stopTicking();
            }
        }
        this.rafStartTime = timestamp;
        this.isFlushingRAF = false;
    }
    enableTimeslicing(adaptive = true) {
        this.timeslicingEnabled = true;
        this.adaptiveTimeslicing = adaptive === true;
    }
    disableTimeslicing() {
        this.timeslicingEnabled = false;
    }
}
//# sourceMappingURL=lifecycle.js.map