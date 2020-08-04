import { DI, IContainer, IRegistry, IResolver, Registration } from '@aurelia/kernel';
import { IDOM, IDOMInitializer, ISinglePageApp, IScheduler  } from '@aurelia/runtime';
import { RuntimeHtmlConfiguration, HTMLDOM } from '@aurelia/runtime-html';
import { createDOMScheduler } from '@aurelia/scheduler-dom';

class BrowserDOMInitializer implements IDOMInitializer {
  public constructor(
    @IContainer private readonly container: IContainer,
  ) {}

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
      } else if (config.host.ownerDocument !== null) {
        dom = new HTMLDOM(
          window,
          config.host.ownerDocument,
          Node,
          Element,
          HTMLElement,
          CustomEvent,
          CSSStyleSheet,
          ShadowRoot
        );
      } else {
        dom = new HTMLDOM(
          window,
          document,
          Node,
          Element,
          HTMLElement,
          CustomEvent,
          CSSStyleSheet,
          ShadowRoot
        );
      }
    } else {
      dom = new HTMLDOM(
        window,
        document,
        Node,
        Element,
        HTMLElement,
        CustomEvent,
        CSSStyleSheet,
        ShadowRoot
      );
    }
    Registration.instance(IDOM, dom).register(this.container);
    Registration.instance(IScheduler, createDOMScheduler(this.container, window)).register(this.container);

    return dom;
  }
}

export const IDOMInitializerRegistration = BrowserDOMInitializer as IRegistry;

/**
 * Default HTML-specific, browser-specific implementations for the following interfaces:
 * - `IDOMInitializer`
 */
export const DefaultComponents = [
  IDOMInitializerRegistration,
];

/**
 * A DI configuration object containing html-specific, browser-specific registrations:
 * - `RuntimeHtmlConfiguration` from `@aurelia/runtime-html`
 * - `DefaultComponents`
 */
export const RuntimeHtmlBrowserConfiguration = {
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
  BrowserDOMInitializer,
};
