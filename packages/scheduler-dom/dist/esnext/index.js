import { Scheduler, Now, } from '@aurelia/scheduler';
import { PLATFORM, } from '@aurelia/kernel';
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
export function createDOMScheduler(container, w) {
    let scheduler = Scheduler.get(PLATFORM.global);
    if (scheduler === void 0) {
        Scheduler.set(PLATFORM.global, scheduler = new Scheduler(container.get(Now), createMicroTaskFlushRequestorFactory(), createRequestAnimationFrameFlushRequestor(w), createSetTimeoutFlushRequestorFactory(w), createPostRequestAnimationFrameFlushRequestor(w)));
    }
    return scheduler;
}
//# sourceMappingURL=index.js.map