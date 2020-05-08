var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
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
    let BoundQueue = class BoundQueue {
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
        }
        process(flags) {
            while (this.head !== void 0) {
                let cur = this.head;
                this.head = this.tail = void 0;
                let next;
                do {
                    cur.afterBind(flags);
                    next = cur.nextBound;
                    cur.nextBound = void 0;
                    cur.prevBound = void 0;
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    cur = next; // we're checking it for undefined the next line
                } while (cur !== void 0);
            }
        }
    };
    BoundQueue = __decorate([
        __param(0, exports.ILifecycle),
        __metadata("design:paramtypes", [Object])
    ], BoundQueue);
    exports.BoundQueue = BoundQueue;
    let UnboundQueue = class UnboundQueue {
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
        }
        process(flags) {
            while (this.head !== void 0) {
                let cur = this.head;
                this.head = this.tail = void 0;
                let next;
                do {
                    cur.afterUnbind(flags);
                    next = cur.nextUnbound;
                    cur.nextUnbound = void 0;
                    cur.prevUnbound = void 0;
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    cur = next; // we're checking it for undefined the next line
                } while (cur !== void 0);
            }
        }
    };
    UnboundQueue = __decorate([
        __param(0, exports.ILifecycle),
        __metadata("design:paramtypes", [Object])
    ], UnboundQueue);
    exports.UnboundQueue = UnboundQueue;
    let AttachedQueue = class AttachedQueue {
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
        }
        process(flags) {
            while (this.head !== void 0) {
                let cur = this.head;
                this.head = this.tail = void 0;
                let next;
                do {
                    cur.afterAttach(flags);
                    next = cur.nextAttached;
                    cur.nextAttached = void 0;
                    cur.prevAttached = void 0;
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    cur = next; // we're checking it for undefined the next line
                } while (cur !== void 0);
            }
        }
    };
    AttachedQueue = __decorate([
        __param(0, exports.ILifecycle),
        __metadata("design:paramtypes", [Object])
    ], AttachedQueue);
    exports.AttachedQueue = AttachedQueue;
    let DetachedQueue = class DetachedQueue {
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
        }
        process(flags) {
            while (this.head !== void 0) {
                let cur = this.head;
                this.head = this.tail = void 0;
                let next;
                do {
                    cur.afterDetach(flags);
                    next = cur.nextDetached;
                    cur.nextDetached = void 0;
                    cur.prevDetached = void 0;
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    cur = next; // we're checking it for undefined the next line
                } while (cur !== void 0);
            }
        }
    };
    DetachedQueue = __decorate([
        __param(0, exports.ILifecycle),
        __metadata("design:paramtypes", [Object])
    ], DetachedQueue);
    exports.DetachedQueue = DetachedQueue;
    let MountQueue = class MountQueue {
        constructor(lifecycle) {
            this.lifecycle = lifecycle;
            this.depth = 0;
            this.head = void 0;
            this.tail = void 0;
        }
        add(controller) {
            if (this.head === void 0) {
                this.head = controller;
            }
            else {
                controller.prevMount = this.tail;
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.tail.nextMount = controller; // implied by mountHead not being undefined
            }
            this.tail = controller;
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
        }
        process(flags) {
            let i = 0;
            while (this.head !== void 0) {
                let cur = this.head;
                this.head = this.tail = void 0;
                let next;
                do {
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
    };
    MountQueue = __decorate([
        __param(0, exports.ILifecycle),
        __metadata("design:paramtypes", [Object])
    ], MountQueue);
    exports.MountQueue = MountQueue;
    let UnmountQueue = class UnmountQueue {
        constructor(lifecycle) {
            this.lifecycle = lifecycle;
            this.head = void 0;
            this.tail = void 0;
        }
        add(controller) {
            if (this.head === void 0) {
                this.head = controller;
            }
            else {
                controller.prevUnmount = this.tail;
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                this.tail.nextUnmount = controller; // implied by unmountHead not being undefined
            }
            this.tail = controller;
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
        }
        process(flags) {
            let i = 0;
            while (this.head !== void 0) {
                let cur = this.head;
                this.head = this.tail = void 0;
                let next;
                do {
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
    };
    UnmountQueue = __decorate([
        __param(0, exports.ILifecycle),
        __metadata("design:paramtypes", [Object])
    ], UnmountQueue);
    exports.UnmountQueue = UnmountQueue;
    let BatchQueue = class BatchQueue {
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
    };
    BatchQueue = __decorate([
        __param(0, exports.ILifecycle),
        __metadata("design:paramtypes", [Object])
    ], BatchQueue);
    exports.BatchQueue = BatchQueue;
    class Lifecycle {
        constructor() {
            this.batch = new BatchQueue(this);
            this.mount = new MountQueue(this);
            this.unmount = new UnmountQueue(this);
            this.afterBind = new BoundQueue(this);
            this.afterUnbind = new UnboundQueue(this);
            this.afterAttach = new AttachedQueue(this);
            this.afterDetach = new DetachedQueue(this);
        }
        static register(container) {
            return kernel_1.Registration.singleton(exports.ILifecycle, this).register(container);
        }
    }
    exports.Lifecycle = Lifecycle;
});
//# sourceMappingURL=lifecycle.js.map