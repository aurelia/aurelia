/* eslint-disable no-await-in-loop */
import { IContainer, bound } from '@aurelia/kernel';
import { IDOM, IScheduler, TaskQueuePriority, TaskQueue, IClock, TaskCallback, QueueTaskOptions, Task, DOM, ITaskQueue, ITask, QueueTaskTargetOptions } from '@aurelia/runtime';
import { HTMLDOM } from '@aurelia/runtime-html';

// Note on the flush requestors: we're probably overdoing it here with the binds and all the wrapping.
// Just want to start off with something as robust as possible, add many tests first so that we're sure it all works, etc.
// Once all the proper tests are in place, we can then start simplifying and rely on those tests to tell us precisely which things are necessary and which aren't.
// Besides looking at test results, we also need to look at benchmark results, memory usage, memory leaks, etc.

function createQueueMicrotaskFlushRequestor(window: Window, flush: () => void) {
  return (function ($window: Window, $flush: () => void) {
    const callFlush = function () {
      $flush();
      // eslint-disable-next-line no-extra-bind
    }.bind(void 0);

    return function () {
      $window.queueMicrotask(callFlush);
      // eslint-disable-next-line no-extra-bind
    }.bind(void 0);
  })(window, flush);
}

function createPromiseFlushRequestor(flush: () => void) {
  return (function ($flush: () => void) {
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

function createMutationObserverFlushRequestor(window: Window, flush: () => void) {
  return (function ($window: Window, $flush: () => void) {
    const callFlush = function () {
      $flush();
      // eslint-disable-next-line no-extra-bind
    }.bind(void 0);

    const observer = new ($window as unknown as { MutationObserver: typeof MutationObserver }).MutationObserver(callFlush);
    const node = $window.document.createTextNode('a');
    // eslint-disable-next-line compat/compat
    const flip = Object.assign(Object.create(null), { a: 'b', b: 'a' });

    let val = 'a';
    observer.observe(node, { characterData: true });

    return function () {
      node.data = val = flip[val];
      // eslint-disable-next-line no-extra-bind
    }.bind(void 0);
  })(window, flush);
}

// Create a microtask queue, trying the available options starting with the most performant
const createMicrotaskFlushRequestor = (function () {
  // Ensure we only ever create one requestor (at least, per loaded bundle..).
  let called = false;

  return function (wnd: Window, flush: () => void) {
    if (called) {
      throw new Error('Cannot have more than one global MicrotaskFlushRequestor');
    }
    called = true;

    if (wnd.queueMicrotask !== void 0 && wnd.queueMicrotask.toString().includes('[native code]')) {
      return createQueueMicrotaskFlushRequestor(wnd, flush);
    } else if (Promise.toString().includes('[native code]')) {
      return createPromiseFlushRequestor(flush);
    } else {
      return createMutationObserverFlushRequestor(wnd, flush);
    }
  };
})();

const createPostMessageFlushRequestor = (function () {
  let called = false;

  return function (window: Window, flush: () => void) {
    if (called) {
      throw new Error('Cannot have more than one global PostMessageFlushRequestor');
    }
    called = true;

    return (function ($window: Window, $flush: () => void) {
      const handleMessage = function (event: MessageEvent) {
        if (event.data === 'au-message' && event.source === $window) {
          $flush();
        }
        // eslint-disable-next-line no-extra-bind
      }.bind(void 0);

      $window.addEventListener('message', handleMessage);

      return function () {
        $window.postMessage('au-message', $window.origin);
        // eslint-disable-next-line no-extra-bind
      }.bind(void 0);
    })(window, flush);
  };
})();

const createSetTimeoutFlushRequestor = (function () {
  let called = false;

  return function (window: Window, flush: () => void) {
    if (called) {
      throw new Error('Cannot have more than one global SetTimeoutFlushRequestor');
    }
    called = true;

    return (function ($window: Window, $flush: () => void) {
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

  return function (window: Window, flush: () => void) {
    if (called) {
      throw new Error('Cannot have more than one global RequestAnimationFrameFlushRequestor');
    }
    called = true;

    return (function ($window: Window, $flush: () => void) {
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

  return function (window: Window, flush: () => void) {
    if (called) {
      throw new Error('Cannot have more than one global PostRequestAnimationFrameFlushRequestor');
    }
    called = true;

    return (function ($window: Window, $flush: () => void) {
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

type WindowWithIdleCallback = Window & {
  requestIdleCallback?(cb: () => void, options?: { timeout: number }): number;
  cancelIdleCallback?(handle: number): void;
};

const createRequestIdleCallbackFlushRequestor = (function () {
  let called = false;

  return function (window: WindowWithIdleCallback, flush: () => void) {
    if (called) {
      throw new Error('Cannot have more than one global RequestIdleCallbackFlushRequestor');
    }
    called = true;

    const hasNative = window.requestIdleCallback !== void 0 && window.requestIdleCallback.toString().includes('[native code]');

    return (function ($window: WindowWithIdleCallback, $flush: () => void) {
      let handle = -1;

      const options = { timeout: 1000 }; // TODO: make this configurable

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
            $window.cancelIdleCallback!(handle);
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
            handle = $window.requestIdleCallback!(callFlush, options);
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

const defaultQueueTaskOptions: Required<QueueTaskTargetOptions> = {
  delay: 0,
  preempt: false,
  priority: TaskQueuePriority.render,
  reusable: true,
  persistent: false,
};

export class BrowserScheduler implements IScheduler {
  private readonly taskQueue: {
    [TaskQueuePriority.microTask]: TaskQueue;
    [TaskQueuePriority.render]: TaskQueue;
    [TaskQueuePriority.macroTask]: TaskQueue;
    [TaskQueuePriority.postRender]: TaskQueue;
    [TaskQueuePriority.idle]: TaskQueue;
  };

  private readonly flush: {
    [TaskQueuePriority.microTask]: () => void;
    [TaskQueuePriority.render]: {
      request: () => void;
      cancel: () => void;
    };
    [TaskQueuePriority.macroTask]: {
      request: () => void;
      cancel: () => void;
    };
    [TaskQueuePriority.postRender]: {
      request: () => void;
      cancel: () => void;
    };
    [TaskQueuePriority.idle]: {
      request: () => void;
      cancel: () => void;
    };
  };

  public constructor(@IClock clock: IClock, @IDOM dom: HTMLDOM) {
    const microTaskTaskQueue = new TaskQueue({ clock, scheduler: this, priority: TaskQueuePriority.microTask });
    const renderTaskQueue = new TaskQueue({ clock, scheduler: this, priority: TaskQueuePriority.render });
    const macroTaskTaskQueue = new TaskQueue({ clock, scheduler: this, priority: TaskQueuePriority.macroTask });
    const postRenderTaskQueue = new TaskQueue({ clock, scheduler: this, priority: TaskQueuePriority.postRender });
    const idleTaskQueue = new TaskQueue({ clock, scheduler: this, priority: TaskQueuePriority.idle });

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

  public static register(container: IContainer): void {
    container.registerResolver(IScheduler, {
      resolve(): IScheduler {
        if (DOM.scheduler === void 0) {
          const clock = container.get(IClock);
          const dom = container.get(IDOM) as HTMLDOM;
          const scheduler = new BrowserScheduler(clock, dom);
          Reflect.defineProperty(DOM, 'scheduler', {
            value: scheduler,
            writable: false,
            enumerable: false,
            configurable: false,
          });
        }
        return DOM.scheduler;
      }
    });
  }

  public getTaskQueue(priority: TaskQueuePriority): TaskQueue {
    return this.taskQueue[priority];
  }

  public yield(priority: TaskQueuePriority): Promise<void> {
    return this.taskQueue[priority].yield();
  }

  public queueTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskTargetOptions): Task<T> {
    const { delay, preempt, priority, persistent, reusable } = { ...defaultQueueTaskOptions, ...opts };
    return this.taskQueue[priority].queueTask(callback, { delay, preempt, persistent, reusable });
  }

  public getMicroTaskQueue(): ITaskQueue {
    return this.taskQueue[TaskQueuePriority.microTask];
  }
  public getRenderTaskQueue(): ITaskQueue {
    return this.taskQueue[TaskQueuePriority.render];
  }
  public getMacroTaskQueue(): ITaskQueue {
    return this.taskQueue[TaskQueuePriority.macroTask];
  }
  public getPostRenderTaskQueue(): ITaskQueue {
    return this.taskQueue[TaskQueuePriority.postRender];
  }
  public getIdleTaskQueue(): ITaskQueue {
    return this.taskQueue[TaskQueuePriority.idle];
  }

  @bound
  public yieldMicroTask(): Promise<void> {
    return this.taskQueue[TaskQueuePriority.microTask].yield();
  }
  @bound
  public yieldRenderTask(): Promise<void> {
    return this.taskQueue[TaskQueuePriority.render].yield();
  }
  @bound
  public yieldMacroTask(): Promise<void> {
    return this.taskQueue[TaskQueuePriority.macroTask].yield();
  }
  @bound
  public yieldPostRenderTask(): Promise<void> {
    return this.taskQueue[TaskQueuePriority.postRender].yield();
  }
  @bound
  public yieldIdleTask(): Promise<void> {
    return this.taskQueue[TaskQueuePriority.idle].yield();
  }
  @bound
  public async yieldAll(repeat: number = 1): Promise<void> {
    // Yield sequentially from "large" to "small" so that any smaller tasks initiated by larger tasks are also still awaited,
    // as well as guaranteeing a single round of persistent tasks from each queue.
    // Don't change the order or into parallel, without thoroughly testing the ramifications on persistent and recursively queued tasks.
    // These aspects are currently relatively poorly tested.
    while (repeat-- > 0) {
      await this.yieldIdleTask();
      await this.yieldPostRenderTask();
      await this.yieldMacroTask();
      await this.yieldRenderTask();
      await this.yieldMicroTask();
    }
  }

  public queueMicroTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T> {
    return this.taskQueue[TaskQueuePriority.microTask].queueTask(callback, opts);
  }
  public queueRenderTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T> {
    return this.taskQueue[TaskQueuePriority.render].queueTask(callback, opts);
  }
  public queueMacroTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T> {
    return this.taskQueue[TaskQueuePriority.macroTask].queueTask(callback, opts);
  }
  public queuePostRenderTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T> {
    return this.taskQueue[TaskQueuePriority.postRender].queueTask(callback, opts);
  }
  public queueIdleTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): ITask<T> {
    return this.taskQueue[TaskQueuePriority.idle].queueTask(callback, opts);
  }

  public requestFlush(taskQueue: TaskQueue): void {
    switch (taskQueue.priority) {
      case TaskQueuePriority.microTask:
        return this.flush[taskQueue.priority]();
      case TaskQueuePriority.render:
      case TaskQueuePriority.macroTask:
      case TaskQueuePriority.postRender:
      case TaskQueuePriority.idle:
        return this.flush[taskQueue.priority].request();
    }
  }

  public cancelFlush(taskQueue: TaskQueue): void {
    switch (taskQueue.priority) {
      case TaskQueuePriority.microTask:
        return;
      case TaskQueuePriority.render:
      case TaskQueuePriority.macroTask:
      case TaskQueuePriority.postRender:
      case TaskQueuePriority.idle:
        return this.flush[taskQueue.priority].cancel();
    }
  }
}
