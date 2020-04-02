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
    function createSetTimeoutFlushRequestorFactory(w) {
        return {
            create(taskQueue) {
                let handle = -1;
                function flush() {
                    if (handle > -1) {
                        handle = -1;
                        taskQueue.flush();
                    }
                }
                return {
                    cancel() {
                        if (handle > -1) {
                            w.clearTimeout(handle);
                            handle = -1;
                        }
                    },
                    request() {
                        if (handle === -1) {
                            handle = w.setTimeout(flush, 0);
                        }
                    },
                };
            },
        };
    }
    function createRequestAnimationFrameFlushRequestor(w) {
        return {
            create(taskQueue) {
                let handle = -1;
                function flush() {
                    if (handle > -1) {
                        handle = -1;
                        taskQueue.flush();
                    }
                }
                return {
                    cancel() {
                        if (handle > -1) {
                            w.cancelAnimationFrame(handle);
                            handle = -1;
                        }
                    },
                    request() {
                        if (handle === -1) {
                            handle = w.requestAnimationFrame(flush);
                        }
                    },
                };
            },
        };
    }
    function createPostRequestAnimationFrameFlushRequestor(w) {
        return {
            create(taskQueue) {
                let rafHandle = -1;
                let timeoutHandle = -1;
                function flush() {
                    if (timeoutHandle > -1) {
                        timeoutHandle = -1;
                        taskQueue.flush();
                    }
                }
                function queueFlush() {
                    if (rafHandle > -1) {
                        rafHandle = -1;
                        if (timeoutHandle === -1) {
                            timeoutHandle = w.setTimeout(flush, 0);
                        }
                    }
                }
                return {
                    cancel() {
                        if (rafHandle > -1) {
                            w.cancelAnimationFrame(rafHandle);
                            rafHandle = -1;
                        }
                        if (timeoutHandle > -1) {
                            w.clearTimeout(timeoutHandle);
                            timeoutHandle = -1;
                        }
                    },
                    request() {
                        if (rafHandle === -1) {
                            rafHandle = w.requestAnimationFrame(queueFlush);
                        }
                    },
                };
            },
        };
    }
    function createRequestIdleCallbackFlushRequestor(w) {
        return {
            create(taskQueue) {
                let handle = -1;
                function flush() {
                    if (handle > -1) {
                        handle = -1;
                        taskQueue.flush();
                    }
                }
                if (typeof w.requestIdleCallback === 'function' &&
                    kernel_1.isNativeFunction(w.requestIdleCallback)) {
                    return {
                        cancel() {
                            if (handle > -1) {
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                                w.cancelIdleCallback(handle);
                                handle = -1;
                            }
                        },
                        request() {
                            if (handle === -1) {
                                // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                                handle = w.requestIdleCallback(flush);
                            }
                        },
                    };
                }
                else {
                    return {
                        cancel() {
                            if (handle > -1) {
                                w.clearTimeout(handle);
                                handle = -1;
                            }
                        },
                        request() {
                            if (handle === -1) {
                                // Instead of trying anything fancy with event handler debouncers (we could do that if there was a request for it),
                                // we just wait 45ms which is approximately the interval in a native idleCallback loop in chrome, to at least make it look
                                // the same from a timing perspective
                                handle = w.setTimeout(flush, 45);
                            }
                        },
                    };
                }
            },
        };
    }
    function createDOMScheduler(container, w) {
        let scheduler = scheduler_1.Scheduler.get(kernel_1.PLATFORM.global);
        if (scheduler === void 0) {
            scheduler_1.Scheduler.set(kernel_1.PLATFORM.global, scheduler = new scheduler_1.Scheduler(container.get(scheduler_1.Now), createMicroTaskFlushRequestorFactory(), createRequestAnimationFrameFlushRequestor(w), createSetTimeoutFlushRequestorFactory(w), createPostRequestAnimationFrameFlushRequestor(w), createRequestIdleCallbackFlushRequestor(w)));
        }
        return scheduler;
    }
    exports.createDOMScheduler = createDOMScheduler;
});
//# sourceMappingURL=index.js.map