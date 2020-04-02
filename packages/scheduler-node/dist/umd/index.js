(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/scheduler", "@aurelia/kernel"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const scheduler_1 = require("@aurelia/scheduler");
    const kernel_1 = require("@aurelia/kernel");
    function createMicroTaskFlushRequestorFactory() {
        return {
            create(taskQueue) {
                let requested = false;
                let canceled = false;
                const p = Promise.resolve();
                function flush() {
                    if (canceled) {
                        canceled = false;
                    }
                    else {
                        requested = false;
                        taskQueue.flush();
                    }
                }
                return {
                    request() {
                        if (!requested) {
                            canceled = false;
                            requested = true;
                            // eslint-disable-next-line @typescript-eslint/no-floating-promises
                            p.then(flush);
                        }
                    },
                    cancel() {
                        canceled = true;
                        requested = false;
                    },
                };
            },
        };
    }
    function createSetTimeoutFlushRequestorFactory(g) {
        return {
            create(taskQueue) {
                let handle = null;
                function flush() {
                    if (handle !== null) {
                        handle = null;
                        taskQueue.flush();
                    }
                }
                return {
                    cancel() {
                        if (handle !== null) {
                            g.clearTimeout(handle);
                            handle = null;
                        }
                    },
                    request() {
                        if (handle === null) {
                            handle = g.setTimeout(flush, 0);
                        }
                    },
                };
            },
        };
    }
    function createRequestAnimationFrameFlushRequestor(g) {
        return {
            create(taskQueue) {
                let handle = null;
                function flush() {
                    if (handle !== null) {
                        handle = null;
                        taskQueue.flush();
                    }
                }
                return {
                    cancel() {
                        if (handle !== null) {
                            g.clearTimeout(handle);
                            handle = null;
                        }
                    },
                    request() {
                        if (handle === null) {
                            handle = g.setTimeout(flush, 1000 / 60);
                        }
                    },
                };
            },
        };
    }
    function createPostRequestAnimationFrameFlushRequestor(g) {
        return {
            create(taskQueue) {
                let rafHandle = null;
                let timeoutHandle = null;
                function flush() {
                    if (timeoutHandle !== null) {
                        timeoutHandle = null;
                        taskQueue.flush();
                    }
                }
                function queueFlush() {
                    if (rafHandle !== null) {
                        rafHandle = null;
                        if (timeoutHandle === null) {
                            timeoutHandle = g.setTimeout(flush, 0);
                        }
                    }
                }
                return {
                    cancel() {
                        if (rafHandle !== null) {
                            g.clearTimeout(rafHandle);
                            rafHandle = null;
                        }
                        if (timeoutHandle !== null) {
                            g.clearTimeout(timeoutHandle);
                            timeoutHandle = null;
                        }
                    },
                    request() {
                        if (rafHandle === null) {
                            rafHandle = g.setTimeout(queueFlush, 1000 / 16);
                        }
                    },
                };
            },
        };
    }
    function createRequestIdleCallbackFlushRequestor(g) {
        return {
            create(taskQueue) {
                let handle = null;
                function flush() {
                    if (handle !== null) {
                        handle = null;
                        taskQueue.flush();
                    }
                }
                return {
                    cancel() {
                        if (handle !== null) {
                            g.clearTimeout(handle);
                            handle = null;
                        }
                    },
                    request() {
                        if (handle === null) {
                            handle = g.setTimeout(flush, 45);
                        }
                    },
                };
            },
        };
    }
    function createNodeScheduler(container, g) {
        let scheduler = scheduler_1.Scheduler.get(kernel_1.PLATFORM.global);
        if (scheduler === void 0) {
            scheduler_1.Scheduler.set(kernel_1.PLATFORM.global, scheduler = new scheduler_1.Scheduler(container.get(scheduler_1.Now), createMicroTaskFlushRequestorFactory(), createRequestAnimationFrameFlushRequestor(g), createSetTimeoutFlushRequestorFactory(g), createPostRequestAnimationFrameFlushRequestor(g), createRequestIdleCallbackFlushRequestor(g)));
        }
        return scheduler;
    }
    exports.createNodeScheduler = createNodeScheduler;
});
//# sourceMappingURL=index.js.map