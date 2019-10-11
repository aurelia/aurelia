import { DI, IContainer, IRegistry, IResolver, Key, Registration, PLATFORM } from '@aurelia/kernel';
import { IDOM, IDOMInitializer, ISinglePageApp, QueueTaskOptions, TaskQueuePriority, IScheduler, TaskQueue, IClock, TaskCallback, Task, DOM } from '@aurelia/runtime';
import { RuntimeHtmlConfiguration, HTMLDOM } from '@aurelia/runtime-html';
import { JSDOM } from 'jsdom';

declare const process: NodeJS.Process;

function createNextTickFlushRequestor(flush: () => void) {
  return (function ($flush: () => void) {
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

// Create a microtask queue, trying the available options starting with the most performant
const createMicrotaskFlushRequestor = (function () {
  // Ensure we only ever create one requestor (at least, per loaded bundle..).
  let called = false;

  return function (wnd: Window, flush: () => void) {
    if (called) {
      throw new Error('Cannot have more than one global MicrotaskFlushRequestor');
    }
    called = true;

    if (PLATFORM.isNodeLike && typeof process.nextTick === 'function') {
      return createNextTickFlushRequestor(flush);
    }
    return createPromiseFlushRequestor(flush);
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
        if (timeoutHandle === -1) {
          timeoutHandle = $window.setTimeout(callFlush, 0);
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
  requestIdleCallback?(cb: () => void): number;
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

      const callFlush = function () {
        handle = -1;
        $flush();
        // eslint-disable-next-line no-extra-bind
      }.bind(void 0);

      const cancel = hasNative
        ? function () {
          $window.cancelIdleCallback!(handle);
          handle = -1;
          // eslint-disable-next-line no-extra-bind
        }.bind(void 0)
        : function () {
          $window.clearTimeout(handle);
          handle = -1;
          // eslint-disable-next-line no-extra-bind
        }.bind(void 0);

      const request = hasNative
        ? function () {
          if (handle === -1) {
            handle = $window.requestIdleCallback!(callFlush);
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

const defaultQueueTaskOptions: Required<QueueTaskOptions> = {
  delay: 0,
  preempt: true,
  priority: TaskQueuePriority.render,
};

export class JSDOMScheduler implements IScheduler {
  private readonly taskQueue: {
    [TaskQueuePriority.microTask]: TaskQueue;
    [TaskQueuePriority.eventLoop]: TaskQueue;
    [TaskQueuePriority.render]: TaskQueue;
    [TaskQueuePriority.postRender]: TaskQueue;
    [TaskQueuePriority.macroTask]: TaskQueue;
    [TaskQueuePriority.idle]: TaskQueue;
  };

  private readonly flush: {
    [TaskQueuePriority.microTask]: () => void;
    [TaskQueuePriority.eventLoop]: () => void;
    [TaskQueuePriority.render]: {
      request: () => void;
      cancel: () => void;
    };
    [TaskQueuePriority.postRender]: {
      request: () => void;
      cancel: () => void;
    };
    [TaskQueuePriority.macroTask]: {
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
    const eventLoopTaskQueue = new TaskQueue({ clock, scheduler: this, priority: TaskQueuePriority.eventLoop });
    const renderTaskQueue = new TaskQueue({ clock, scheduler: this, priority: TaskQueuePriority.render });
    const postRenderTaskQueue = new TaskQueue({ clock, scheduler: this, priority: TaskQueuePriority.postRender });
    const macroTaskTaskQueue = new TaskQueue({ clock, scheduler: this, priority: TaskQueuePriority.macroTask });
    const idleTaskQueue = new TaskQueue({ clock, scheduler: this, priority: TaskQueuePriority.idle });

    this.taskQueue = [
      microTaskTaskQueue,
      eventLoopTaskQueue,
      renderTaskQueue,
      postRenderTaskQueue,
      macroTaskTaskQueue,
      idleTaskQueue,
    ];

    const wnd = dom.window;
    this.flush = [
      createMicrotaskFlushRequestor(wnd, microTaskTaskQueue.flush.bind(microTaskTaskQueue)),
      createPostMessageFlushRequestor(wnd, eventLoopTaskQueue.flush.bind(eventLoopTaskQueue)),
      createRequestAnimationFrameFlushRequestor(wnd, renderTaskQueue.flush.bind(renderTaskQueue)),
      createPostRequestAnimationFrameFlushRequestor(wnd, postRenderTaskQueue.flush.bind(postRenderTaskQueue)),
      createSetTimeoutFlushRequestor(wnd, macroTaskTaskQueue.flush.bind(macroTaskTaskQueue)),
      createRequestIdleCallbackFlushRequestor(wnd, idleTaskQueue.flush.bind(idleTaskQueue)),
    ];
  }

  public static register(container: IContainer): void {
    container.registerResolver(IScheduler, {
      resolve(): IScheduler {
        if (DOM.scheduler === void 0) {
          const clock = container.get(IClock);
          const dom = container.get(IDOM) as HTMLDOM;
          const scheduler = new JSDOMScheduler(clock, dom);
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

  public queueTask<T = any>(callback: TaskCallback<T>, opts?: QueueTaskOptions): Task<T> {
    const { delay, preempt, priority } = { ...defaultQueueTaskOptions, ...opts };
    return this.taskQueue[priority].queueTask(callback, { delay, preempt });
  }

  public requestFlush(taskQueue: TaskQueue): void {
    switch (taskQueue.priority) {
      case TaskQueuePriority.microTask:
      case TaskQueuePriority.eventLoop:
        return this.flush[taskQueue.priority]();
      case TaskQueuePriority.render:
      case TaskQueuePriority.postRender:
      case TaskQueuePriority.macroTask:
      case TaskQueuePriority.idle:
        return this.flush[taskQueue.priority].request();
    }
  }

  public cancelFlush(taskQueue: TaskQueue): void {
    switch (taskQueue.priority) {
      case TaskQueuePriority.microTask:
      case TaskQueuePriority.eventLoop:
        return;
      case TaskQueuePriority.render:
      case TaskQueuePriority.postRender:
      case TaskQueuePriority.macroTask:
      case TaskQueuePriority.idle:
        return this.flush[taskQueue.priority].cancel();
    }
  }
}

class JSDOMInitializer implements IDOMInitializer {
  public static readonly inject: readonly Key[] = [IContainer];

  private readonly container: IContainer;
  private readonly jsdom: JSDOM;

  public constructor(container: IContainer) {
    this.container = container;
    this.jsdom = new JSDOM('', { pretendToBeVisual: true });
  }

  public static register(container: IContainer): IResolver<IDOMInitializer> {
    return Registration.singleton(IDOMInitializer, this).register(container);
  }

  public initialize(config?: ISinglePageApp<Node>): IDOM {
    if (this.container.has(IDOM, false)) {
      return this.container.get(IDOM);
    }
    let dom: IDOM;
    if (config !== undefined) {
      if (config.dom !== undefined) {
        dom = config.dom;
      } else if (config.host.ownerDocument) {
        dom = new HTMLDOM(
          this.jsdom.window,
          config.host.ownerDocument,
          this.jsdom.window.Node,
          this.jsdom.window.Element,
          this.jsdom.window.HTMLElement,
          this.jsdom.window.CustomEvent,
          this.jsdom.window.CSSStyleSheet,
          (this.jsdom.window as unknown as { ShadowRoot: typeof ShadowRoot }).ShadowRoot
        );
      } else {
        if (config.host !== undefined) {
          this.jsdom.window.document.body.appendChild(config.host);
        }
        dom = new HTMLDOM(
          this.jsdom.window,
          this.jsdom.window.document,
          this.jsdom.window.Node,
          this.jsdom.window.Element,
          this.jsdom.window.HTMLElement,
          this.jsdom.window.CustomEvent,
          this.jsdom.window.CSSStyleSheet,
          (this.jsdom.window as unknown as { ShadowRoot: typeof ShadowRoot }).ShadowRoot
        );
      }
    } else {
      dom = new HTMLDOM(
        this.jsdom.window,
        this.jsdom.window.document,
        this.jsdom.window.Node,
        this.jsdom.window.Element,
        this.jsdom.window.HTMLElement,
        this.jsdom.window.CustomEvent,
        this.jsdom.window.CSSStyleSheet,
        (this.jsdom.window as unknown as { ShadowRoot: typeof ShadowRoot }).ShadowRoot
      );
    }
    Registration.instance(IDOM, dom).register(this.container);

    if (DOM.scheduler === void 0) {
      this.container.register(JSDOMScheduler);
      Reflect.defineProperty(DOM, 'scheduler', {
        value: this.container.get(IScheduler),
        writable: false,
        enumerable: false,
        configurable: false,
      });
    } else {
      Registration.instance(IScheduler, DOM.scheduler).register(this.container);
    }

    return dom;
  }
}

export const IDOMInitializerRegistration = JSDOMInitializer as IRegistry;

/**
 * Default HTML-specific, jsdom-specific implementations for the following interfaces:
 * - `IDOMInitializer`
 */
export const DefaultComponents = [
  IDOMInitializerRegistration
];

/**
 * A DI configuration object containing html-specific, jsdom-specific registrations:
 * - `RuntimeHtmlConfiguration` from `@aurelia/runtime-html`
 * - `DefaultComponents`
 */
export const RuntimeHtmlJsdomConfiguration = {
  /**
   * Apply this configuration to the provided container.
   */
  register(container: IContainer): IContainer {
    return RuntimeHtmlConfiguration
      .register(container)
      .register(...DefaultComponents);
  },
  /**
   * Create a new container with this configuration applied to it.
   */
  createContainer(): IContainer {
    return this.register(DI.createContainer());
  }
};
