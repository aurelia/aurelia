import { DI, IContainer, IRegistry, IResolver, Key, Registration } from '@aurelia/kernel';
import { IDOM, IDOMInitializer, ISinglePageApp, IScheduler, DOM } from '@aurelia/runtime';
import { RuntimeHtmlConfiguration, HTMLDOM } from '@aurelia/runtime-html';
import { JSDOM } from 'jsdom';
import { JSDOMScheduler } from './jsdom-scheduler';

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
    } else {
      Registration.instance(IScheduler, DOM.scheduler).register(this.container);
    }

    return dom;
  }
}

export const IDOMInitializerRegistration = JSDOMInitializer as IRegistry;
export const IJSDOMSchedulerRegistration = JSDOMScheduler as IRegistry;

/**
 * Default HTML-specific, jsdom-specific implementations for the following interfaces:
 * - `IDOMInitializer`
 */
export const DefaultComponents = [
  IDOMInitializerRegistration,
  IJSDOMSchedulerRegistration,
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

export {
  JSDOMInitializer,
  JSDOMScheduler,
};
