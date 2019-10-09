import { DI, IContainer, IRegistry, IResolver, Key, Registration, PLATFORM } from '@aurelia/kernel';
import { IDOM, IDOMInitializer, ISinglePageApp, INativeSchedulers } from '@aurelia/runtime';
import { RuntimeHtmlConfiguration, HTMLDOM } from '@aurelia/runtime-html';
import { JSDOM } from 'jsdom';

declare const process: NodeJS.Process;

function createNextTickMicrotaskQueue() {
  return function (cb: () => void) {
    process.nextTick(cb);
  };
}

function createPromiseMicrotaskQueue() {
  return (function () {
    const p = Promise.resolve();
    return function (cb: () => void) {
      p.then(cb);
    };
  })();
}

// Create a microtask queue, trying the available options starting with the most performant
const createMicrotaskQueue = (function () {
  // Cache the created queue based on window instance to ensure we have at most one queue per window
  const cache = new WeakMap<Window, (cb: () => void) => void>();

  return function (wnd: Window) {
    let microtaskQueue = cache.get(wnd);
    if (microtaskQueue === void 0) {
      if (PLATFORM.isNodeLike && typeof process.nextTick === 'function') {
        microtaskQueue = createNextTickMicrotaskQueue();
      }
      microtaskQueue = createPromiseMicrotaskQueue();

      cache.set(wnd, microtaskQueue);
    }

    return microtaskQueue;
  };
})();

const createPostMessageQueue = (function () {
  const cache = new WeakMap<Window, (cb: () => void) => void>();

  return function (wnd: Window) {
    let postMessageQueue = cache.get(wnd);
    if (postMessageQueue === void 0) {
      postMessageQueue = (function () {
        const queue: (() => void)[] = [];
        function invokeOne(cb: () => void): void { cb(); }
        function invokeAll(): void { queue.splice(0).forEach(invokeOne); }

        wnd.addEventListener('message', invokeAll);

        return function (cb: () => void) {
          queue.push(cb);
          wnd.postMessage('', '*');
        };
      })();

      cache.set(wnd, postMessageQueue);
    }

    return postMessageQueue;
  };
})();

class JSDOMSchedulers implements INativeSchedulers {
  public readonly queueMicroTask: (cb: () => void) => void;
  public readonly postMessage: (cb: () => void) => void;
  public readonly setTimeout: (cb: () => void, timeout?: number) => number;
  public readonly clearTimeout: (handle: number) => void;
  public readonly setInterval: (cb: () => void, timeout?: number) => number;
  public readonly clearInterval: (handle: number) => void;
  public readonly requestAnimationFrame: (cb: () => void) => number;
  public readonly cancelAnimationFrame: (handle: number) => void;
  public readonly requestIdleCallback: (cb: () => void) => number;
  public readonly cancelIdleCallback: (handle: number) => void;

  public constructor(
    private readonly jsdom: JSDOM,
  ) {
    const wnd = jsdom.window;
    this.queueMicroTask = createMicrotaskQueue(wnd);
    this.postMessage = createPostMessageQueue(wnd);
    this.setTimeout = wnd.setTimeout;
    this.clearTimeout = wnd.clearTimeout;
    this.setInterval = wnd.setInterval;
    this.clearInterval = wnd.clearInterval;
    this.requestAnimationFrame = wnd.requestAnimationFrame;
    this.cancelAnimationFrame = wnd.cancelAnimationFrame;
    if (!('requestIdleCallback' in wnd)) {
      this.requestIdleCallback = wnd.setTimeout;
      this.cancelIdleCallback = wnd.clearTimeout;
    } else {
      this.requestIdleCallback = (wnd as unknown as { requestIdleCallback: INativeSchedulers['requestIdleCallback'] }).requestIdleCallback;
      this.cancelIdleCallback = (wnd as unknown as { cancelIdleCallback: INativeSchedulers['cancelIdleCallback'] }).cancelIdleCallback;
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
