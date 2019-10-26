(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/kernel", "@aurelia/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    /* eslint-disable no-await-in-loop */
    const kernel_1 = require("@aurelia/kernel");
    const runtime_1 = require("@aurelia/runtime");
    function createNextTickFlushRequestor(flush) {
        return (function ($flush) {
            const callFlush = function () {
                $flush();
                // eslint-disable-next-line no-extra-bind
            }.bind(void 0);
            return function () {
                process.nextTick(callFlush);
                // eslint-disable-next-line no-extra-bind
            }.bind(void 0);
        })(flush);
    }
    function createPromiseFlushRequestor(flush) {
        return (function ($flush) {
            const callFlush = function () {
                $flush();
                // eslint-disable-next-line no-extra-bind
            }.bind(void 0);
            // eslint-disable-next-line compat/compat
            const p = Promise.resolve();
            return function () {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                p.then(callFlush);
                // eslint-disable-next-line no-extra-bind
            }.bind(void 0);
        })(flush);
    }
    // Create a microtask queue, trying the available options starting with the most performant
    const createMicrotaskFlushRequestor = (function () {
        // Ensure we only ever create one requestor (at least, per loaded bundle..).
        let called = false;
        return function (wnd, flush) {
            if (called) {
                throw new Error('Cannot have more than one global MicrotaskFlushRequestor');
            }
            called = true;
            if (kernel_1.PLATFORM.isNodeLike && typeof process.nextTick === 'function') {
                return createNextTickFlushRequestor(flush);
            }
            return createPromiseFlushRequestor(flush);
        };
    })();
    const createSetTimeoutFlushRequestor = (function () {
        let called = false;
        return function (window, flush) {
            if (called) {
                throw new Error('Cannot have more than one global SetTimeoutFlushRequestor');
            }
            called = true;
            return (function ($window, $flush) {
                let handle = -1;
                const callFlush = function () {
                    if (handle > -1) {
                        handle = -1;
                        $flush();
                    }
                    // eslint-disable-next-line no-extra-bind
                }.bind(void 0);
                const cancel = function () {
                    if (handle > -1) {
                        $window.clearTimeout(handle);
                        handle = -1;
                    }
                    // eslint-disable-next-line no-extra-bind
                }.bind(void 0);
                const request = function () {
                    if (handle === -1) {
                        handle = $window.setTimeout(callFlush, 0);
                    }
                    // eslint-disable-next-line no-extra-bind
                }.bind(void 0);
                return {
                    cancel,
                    request,
                };
            })(window, flush);
        };
    })();
    const createRequestAnimationFrameFlushRequestor = (function () {
        let called = false;
        return function (window, flush) {
            if (called) {
                throw new Error('Cannot have more than one global RequestAnimationFrameFlushRequestor');
            }
            called = true;
            return (function ($window, $flush) {
                let handle = -1;
                const callFlush = function () {
                    if (handle > -1) {
                        handle = -1;
                        $flush();
                    }
                    // eslint-disable-next-line no-extra-bind
                }.bind(void 0);
                const cancel = function () {
                    if (handle > -1) {
                        $window.cancelAnimationFrame(handle);
                        handle = -1;
                    }
                    // eslint-disable-next-line no-extra-bind
                }.bind(void 0);
                const request = function () {
                    if (handle === -1) {
                        handle = $window.requestAnimationFrame(callFlush);
                    }
                    // eslint-disable-next-line no-extra-bind
                }.bind(void 0);
                return {
                    cancel,
                    request,
                };
            })(window, flush);
        };
    })();
    const createPostRequestAnimationFrameFlushRequestor = (function () {
        let called = false;
        return function (window, flush) {
            if (called) {
                throw new Error('Cannot have more than one global PostRequestAnimationFrameFlushRequestor');
            }
            called = true;
            return (function ($window, $flush) {
                let rafHandle = -1;
                let timeoutHandle = -1;
                const callFlush = function () {
                    if (timeoutHandle > -1) {
                        timeoutHandle = -1;
                        $flush();
                    }
                    // eslint-disable-next-line no-extra-bind
                }.bind(void 0);
                const queueFlush = function () {
                    if (rafHandle > -1) {
                        rafHandle = -1;
                        if (timeoutHandle === -1) {
                            timeoutHandle = $window.setTimeout(callFlush, 0);
                        }
                    }
                    // eslint-disable-next-line no-extra-bind
                }.bind(void 0);
                const cancel = function () {
                    if (rafHandle > -1) {
                        $window.cancelAnimationFrame(rafHandle);
                        rafHandle = -1;
                    }
                    if (timeoutHandle > -1) {
                        $window.clearTimeout(timeoutHandle);
                        timeoutHandle = -1;
                    }
                    // eslint-disable-next-line no-extra-bind
                }.bind(void 0);
                const request = function () {
                    if (rafHandle === -1) {
                        rafHandle = $window.requestAnimationFrame(queueFlush);
                    }
                    // eslint-disable-next-line no-extra-bind
                }.bind(void 0);
                return {
                    cancel,
                    request,
                };
            })(window, flush);
        };
    })();
    const createRequestIdleCallbackFlushRequestor = (function () {
        let called = false;
        return function (window, flush) {
            if (called) {
                throw new Error('Cannot have more than one global RequestIdleCallbackFlushRequestor');
            }
            called = true;
            const hasNative = window.requestIdleCallback !== void 0 && window.requestIdleCallback.toString().includes('[native code]');
            return (function ($window, $flush) {
                let handle = -1;
                const callFlush = function () {
                    if (handle > -1) {
                        handle = -1;
                        $flush();
                    }
                    // eslint-disable-next-line no-extra-bind
                }.bind(void 0);
                const cancel = hasNative
                    ? function () {
                        if (handle > -1) {
                            $window.cancelIdleCallback(handle);
                            handle = -1;
                        }
                        // eslint-disable-next-line no-extra-bind
                    }.bind(void 0)
                    : function () {
                        if (handle > -1) {
                            $window.clearTimeout(handle);
                            handle = -1;
                        }
                        // eslint-disable-next-line no-extra-bind
                    }.bind(void 0);
                const request = hasNative
                    ? function () {
                        if (handle === -1) {
                            handle = $window.requestIdleCallback(callFlush);
                        }
                        // eslint-disable-next-line no-extra-bind
                    }.bind(void 0)
                    : function () {
                        if (handle === -1) {
                            // Instead of trying anything fancy with event handler debouncers (we could do that if there was a request for it),
                            // we just wait 45ms which is approximately the interval in a native idleCallback loop in chrome, to at least make it look
                            // the same from a timing perspective
                            handle = $window.setTimeout(callFlush, 45);
                        }
                        // eslint-disable-next-line no-extra-bind
                    }.bind(void 0);
                return {
                    cancel,
                    request,
                };
            })(window, flush);
        };
    })();
    const defaultQueueTaskOptions = {
        delay: 0,
        preempt: false,
        priority: 1 /* render */,
        reusable: true,
        persistent: false,
    };
    let JSDOMScheduler = class JSDOMScheduler {
        constructor(clock, dom) {
            const microTaskTaskQueue = new runtime_1.TaskQueue({ clock, scheduler: this, priority: 0 /* microTask */ });
            const renderTaskQueue = new runtime_1.TaskQueue({ clock, scheduler: this, priority: 1 /* render */ });
            const macroTaskTaskQueue = new runtime_1.TaskQueue({ clock, scheduler: this, priority: 2 /* macroTask */ });
            const postRenderTaskQueue = new runtime_1.TaskQueue({ clock, scheduler: this, priority: 3 /* postRender */ });
            const idleTaskQueue = new runtime_1.TaskQueue({ clock, scheduler: this, priority: 4 /* idle */ });
            this.taskQueue = [
                microTaskTaskQueue,
                renderTaskQueue,
                macroTaskTaskQueue,
                postRenderTaskQueue,
                idleTaskQueue,
            ];
            const wnd = dom.window;
            this.flush = [
                createMicrotaskFlushRequestor(wnd, microTaskTaskQueue.flush.bind(microTaskTaskQueue)),
                createRequestAnimationFrameFlushRequestor(wnd, renderTaskQueue.flush.bind(renderTaskQueue)),
                createSetTimeoutFlushRequestor(wnd, macroTaskTaskQueue.flush.bind(macroTaskTaskQueue)),
                createPostRequestAnimationFrameFlushRequestor(wnd, postRenderTaskQueue.flush.bind(postRenderTaskQueue)),
                createRequestIdleCallbackFlushRequestor(wnd, idleTaskQueue.flush.bind(idleTaskQueue)),
            ];
        }
        static register(container) {
            container.registerResolver(runtime_1.IScheduler, {
                resolve() {
                    if (runtime_1.DOM.scheduler === void 0) {
                        const clock = container.get(runtime_1.IClock);
                        const dom = container.get(runtime_1.IDOM);
                        const scheduler = new JSDOMScheduler(clock, dom);
                        Reflect.defineProperty(runtime_1.DOM, 'scheduler', {
                            value: scheduler,
                            writable: false,
                            enumerable: false,
                            configurable: false,
                        });
                    }
                    return runtime_1.DOM.scheduler;
                }
            });
        }
        getTaskQueue(priority) {
            return this.taskQueue[priority];
        }
        yield(priority) {
            return this.taskQueue[priority].yield();
        }
        queueTask(callback, opts) {
            const { delay, preempt, priority, persistent, reusable } = { ...defaultQueueTaskOptions, ...opts };
            return this.taskQueue[priority].queueTask(callback, { delay, preempt, persistent, reusable });
        }
        getMicroTaskQueue() {
            return this.taskQueue[0 /* microTask */];
        }
        getRenderTaskQueue() {
            return this.taskQueue[1 /* render */];
        }
        getMacroTaskQueue() {
            return this.taskQueue[2 /* macroTask */];
        }
        getPostRenderTaskQueue() {
            return this.taskQueue[3 /* postRender */];
        }
        getIdleTaskQueue() {
            return this.taskQueue[4 /* idle */];
        }
        yieldMicroTask() {
            return this.taskQueue[0 /* microTask */].yield();
        }
        yieldRenderTask() {
            return this.taskQueue[1 /* render */].yield();
        }
        yieldMacroTask() {
            return this.taskQueue[2 /* macroTask */].yield();
        }
        yieldPostRenderTask() {
            return this.taskQueue[3 /* postRender */].yield();
        }
        yieldIdleTask() {
            return this.taskQueue[4 /* idle */].yield();
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
            return this.taskQueue[0 /* microTask */].queueTask(callback, opts);
        }
        queueRenderTask(callback, opts) {
            return this.taskQueue[1 /* render */].queueTask(callback, opts);
        }
        queueMacroTask(callback, opts) {
            return this.taskQueue[2 /* macroTask */].queueTask(callback, opts);
        }
        queuePostRenderTask(callback, opts) {
            return this.taskQueue[3 /* postRender */].queueTask(callback, opts);
        }
        queueIdleTask(callback, opts) {
            return this.taskQueue[4 /* idle */].queueTask(callback, opts);
        }
        requestFlush(taskQueue) {
            switch (taskQueue.priority) {
                case 0 /* microTask */:
                    return this.flush[taskQueue.priority]();
                case 1 /* render */:
                case 2 /* macroTask */:
                case 3 /* postRender */:
                case 4 /* idle */:
                    return this.flush[taskQueue.priority].request();
            }
        }
        cancelFlush(taskQueue) {
            switch (taskQueue.priority) {
                case 0 /* microTask */:
                    return;
                case 1 /* render */:
                case 2 /* macroTask */:
                case 3 /* postRender */:
                case 4 /* idle */:
                    return this.flush[taskQueue.priority].cancel();
            }
        }
    };
    tslib_1.__decorate([
        kernel_1.bound
    ], JSDOMScheduler.prototype, "yieldMicroTask", null);
    tslib_1.__decorate([
        kernel_1.bound
    ], JSDOMScheduler.prototype, "yieldRenderTask", null);
    tslib_1.__decorate([
        kernel_1.bound
    ], JSDOMScheduler.prototype, "yieldMacroTask", null);
    tslib_1.__decorate([
        kernel_1.bound
    ], JSDOMScheduler.prototype, "yieldPostRenderTask", null);
    tslib_1.__decorate([
        kernel_1.bound
    ], JSDOMScheduler.prototype, "yieldIdleTask", null);
    tslib_1.__decorate([
        kernel_1.bound
    ], JSDOMScheduler.prototype, "yieldAll", null);
    JSDOMScheduler = tslib_1.__decorate([
        tslib_1.__param(0, runtime_1.IClock), tslib_1.__param(1, runtime_1.IDOM)
    ], JSDOMScheduler);
    exports.JSDOMScheduler = JSDOMScheduler;
});
//# sourceMappingURL=jsdom-scheduler.js.map