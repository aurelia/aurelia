import {
  IFlushRequestor,
  IFlushRequestorFactory,
  ITaskQueue,
  IScheduler,
  Scheduler,
  Now,
} from '@aurelia/scheduler';
import {
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

function createSetTimeoutFlushRequestorFactory(g: NodeJS.Global): IFlushRequestorFactory {
  return {
    create(taskQueue: ITaskQueue): IFlushRequestor {
      let handle: NodeJS.Timer | null = null;

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

function createRequestAnimationFrameFlushRequestor(g: NodeJS.Global): IFlushRequestorFactory {
  return {
    create(taskQueue: ITaskQueue): IFlushRequestor {
      let handle: NodeJS.Timer | null = null;

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

function createPostRequestAnimationFrameFlushRequestor(g: NodeJS.Global): IFlushRequestorFactory {
  return {
    create(taskQueue: ITaskQueue): IFlushRequestor {
      let rafHandle: NodeJS.Timer | null = null;
      let timeoutHandle: NodeJS.Timer | null = null;

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

function createRequestIdleCallbackFlushRequestor(g: NodeJS.Global): IFlushRequestorFactory {
  return {
    create(taskQueue: ITaskQueue): IFlushRequestor {
      let handle: NodeJS.Timer | null = null;

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

export function createNodeScheduler(container: IContainer, g: NodeJS.Global): IScheduler {
  let scheduler = Scheduler.get(PLATFORM.global);
  if (scheduler === void 0) {
    Scheduler.set(PLATFORM.global, scheduler = new Scheduler(
      container.get(Now),
      createMicroTaskFlushRequestorFactory(),
      createRequestAnimationFrameFlushRequestor(g),
      createSetTimeoutFlushRequestorFactory(g),
      createPostRequestAnimationFrameFlushRequestor(g),
      createRequestIdleCallbackFlushRequestor(g),
    ));
  }
  return scheduler;
}
