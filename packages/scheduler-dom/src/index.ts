import {
  IFlushRequestor,
  IFlushRequestorFactory,
  ITaskQueue,
  IScheduler,
  Scheduler,
} from '@aurelia/scheduler';
import { BrowserPlatform } from '@aurelia/platform-browser';

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

function createSetTimeoutFlushRequestorFactory(g: typeof globalThis): IFlushRequestorFactory {
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
            g.clearTimeout(handle);
            handle = -1;
          }
        },
        request() {
          if (handle === -1) {
            handle = g.setTimeout(flush, 0);
          }
        },
      };
    },
  };
}

function createRequestAnimationFrameFlushRequestor(g: typeof globalThis): IFlushRequestorFactory {
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
            g.cancelAnimationFrame(handle);
            handle = -1;
          }
        },
        request() {
          if (handle === -1) {
            handle = g.requestAnimationFrame(flush);
          }
        },
      };
    },
  };
}

function createPostRequestAnimationFrameFlushRequestor(g: typeof globalThis): IFlushRequestorFactory {
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
            timeoutHandle = g.setTimeout(flush, 0);
          }
        }
      }

      return {
        cancel() {
          if (rafHandle > -1) {
            g.cancelAnimationFrame(rafHandle);
            rafHandle = -1;
          }
          if (timeoutHandle > -1) {
            g.clearTimeout(timeoutHandle);
            timeoutHandle = -1;
          }
        },
        request() {
          if (rafHandle === -1) {
            rafHandle = g.requestAnimationFrame(queueFlush);
          }
        },
      };
    },
  };
}

export function createDOMScheduler(platform: BrowserPlatform): IScheduler {
  const g = platform.globalThis;
  let scheduler = Scheduler.get(g);
  if (scheduler === void 0) {
    Scheduler.set(g, scheduler = new Scheduler(
      platform,
      createRequestAnimationFrameFlushRequestor(g),
      createSetTimeoutFlushRequestorFactory(g),
      createPostRequestAnimationFrameFlushRequestor(g),
    ));
  }
  return scheduler;
}
