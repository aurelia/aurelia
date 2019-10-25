(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/kernel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const kernel_1 = require("@aurelia/kernel");
    var ViewModelKind;
    (function (ViewModelKind) {
        ViewModelKind[ViewModelKind["customElement"] = 0] = "customElement";
        ViewModelKind[ViewModelKind["customAttribute"] = 1] = "customAttribute";
        ViewModelKind[ViewModelKind["synthetic"] = 2] = "synthetic";
    })(ViewModelKind = exports.ViewModelKind || (exports.ViewModelKind = {}));
    exports.IController = kernel_1.DI.createInterface('IController').noDefault();
    /**
     * Describing characteristics of a mounting operation a controller will perform
     */
    var MountStrategy;
    (function (MountStrategy) {
        MountStrategy[MountStrategy["insertBefore"] = 1] = "insertBefore";
        MountStrategy[MountStrategy["append"] = 2] = "append";
    })(MountStrategy = exports.MountStrategy || (exports.MountStrategy = {}));
    exports.IViewFactory = kernel_1.DI.createInterface('IViewFactory').noDefault();
    exports.ILifecycle = kernel_1.DI.createInterface('ILifecycle').withDefault(x => x.singleton(Lifecycle));
    class BoundQueue {
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
    exports.BoundQueue = BoundQueue;
    class UnboundQueue {
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
    exports.UnboundQueue = UnboundQueue;
    class AttachedQueue {
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
    exports.AttachedQueue = AttachedQueue;
    class DetachedQueue {
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
    exports.DetachedQueue = DetachedQueue;
    class MountQueue {
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
    exports.MountQueue = MountQueue;
    class UnmountQueue {
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
    exports.UnmountQueue = UnmountQueue;
    class BatchQueue {
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
    exports.BatchQueue = BatchQueue;
    class Lifecycle {
        constructor() {
            this.batch = new BatchQueue(this);
            this.mount = new MountQueue(this);
            this.unmount = new UnmountQueue(this);
            this.bound = new BoundQueue(this);
            this.unbound = new UnboundQueue(this);
            this.attached = new AttachedQueue(this);
            this.detached = new DetachedQueue(this);
        }
        static register(container) {
            return kernel_1.Registration.singleton(exports.ILifecycle, this).register(container);
        }
    }
    exports.Lifecycle = Lifecycle;
});
//# sourceMappingURL=lifecycle.js.map