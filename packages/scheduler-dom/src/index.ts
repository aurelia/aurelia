import {
  IFlushRequestor,
  IFlushRequestorFactory,
  ITaskQueue,
  IScheduler,
  Scheduler,
  Now,
} from '@aurelia/scheduler';
import {
  isNativeFunction,
  IContainer,
  PLATFORM,
} from '@aurelia/kernel';

function createMicroTaskFlushRequestorFactory(): IFlushRequestorFactory {
  return {
    create(taskQueue: ITaskQueue): IFlushRequestor {
      let requested: boolean = false;
      let canceled: boolean = false;
      const p: Promise<void> = Promise.resolve();

      function flush(): void {
        if (canceled) {
          canceled = false;
        } else {
          requested = false;
          taskQueue.flush();
        }
      }

      return {
        request(): void {
          if (!requested) {
            canceled = false;
            requested = true;
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            p.then(flush);
          }
        },
        cancel(): void {
          canceled = true;
          requested = false;
        },
      };
    },
  };
}

function createSetTimeoutFlushRequestorFactory(w: Window): IFlushRequestorFactory {
  return {
    create(taskQueue: ITaskQueue): IFlushRequestor {
      let handle = -1;

      function flush(): void {
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

function createRequestAnimationFrameFlushRequestor(w: Window): IFlushRequestorFactory {
  return {
    create(taskQueue: ITaskQueue): IFlushRequestor {
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

function createPostRequestAnimationFrameFlushRequestor(w: Window): IFlushRequestorFactory {
  return {
    create(taskQueue: ITaskQueue): IFlushRequestor {
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

type WindowWithIdleCallback = Window & {
  requestIdleCallback?(cb: () => void, options?: { timeout: number }): number;
  cancelIdleCallback?(handle: number): void;
};

function createRequestIdleCallbackFlushRequestor(w: WindowWithIdleCallback): IFlushRequestorFactory {
  return {
    create(taskQueue: ITaskQueue): IFlushRequestor {
      let handle = -1;

      function flush() {
        if (handle > -1) {
          handle = -1;
          taskQueue.flush();
        }
      }

      if (
        typeof w.requestIdleCallback === 'function' &&
        isNativeFunction(w.requestIdleCallback)
      ) {
        return {
          cancel() {
            if (handle > -1) {
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
              w.cancelIdleCallback!(handle);
              handle = -1;
            }
          },
          request() {
            if (handle === -1) {
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
              handle = w.requestIdleCallback!(flush);
            }
          },
        };
      } else {
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

export function createDOMScheduler(container: IContainer, w: Window): IScheduler {
  let scheduler = Scheduler.get(PLATFORM.global);
  if (scheduler === void 0) {
    Scheduler.set(PLATFORM.global, scheduler = new Scheduler(
      container.get(Now),
      createMicroTaskFlushRequestorFactory(),
      createRequestAnimationFrameFlushRequestor(w),
      createSetTimeoutFlushRequestorFactory(w),
      createPostRequestAnimationFrameFlushRequestor(w),
      createRequestIdleCallbackFlushRequestor(w),
    ));
  }
  return scheduler;
}
