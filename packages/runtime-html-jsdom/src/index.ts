import { DI, IContainer, IRegistry, IResolver, Registration } from '@aurelia/kernel';
import { IDOM, IDOMInitializer, ISinglePageApp, IScheduler } from '@aurelia/runtime';
import { RuntimeHtmlConfiguration, HTMLDOM } from '@aurelia/runtime-html';
import { createDOMScheduler } from '@aurelia/scheduler-dom';
import { JSDOM } from 'jsdom';

class JSDOMInitializer implements IDOMInitializer {
  private readonly jsdom: JSDOM;

  public constructor(
    @IContainer private readonly container: IContainer,
  ) {
    this.jsdom = new JSDOM('', { pretendToBeVisual: true });
  }

  public static register(container: IContainer): IResolver<IDOMInitializer> {
    return Registration.singleton(IDOMInitializer, this).register(container);
  }

  public initialize(config?: ISinglePageApp<Node>): IDOM {
    const container = this.container;
    if (container.has(IDOM, false)) {
      return container.get(IDOM);
    }

    const $window = this.jsdom.window;
    const scheduler = createDOMScheduler(container, $window);
    let dom: IDOM;

    if (config !== undefined) {
      if (config.dom !== undefined) {
        dom = config.dom;
      } else if (config.host.ownerDocument) {
        dom = new HTMLDOM(
          $window,
          config.host.ownerDocument,
          $window.Node,
          $window.Element,
          $window.HTMLElement,
          $window.CustomEvent,
          $window.CSSStyleSheet,
          ($window as unknown as { ShadowRoot: typeof ShadowRoot }).ShadowRoot,
          scheduler,
        );
      } else {
        if (config.host !== undefined) {
          $window.document.body.appendChild(config.host);
        }
        dom = new HTMLDOM(
          $window,
          $window.document,
          $window.Node,
          $window.Element,
          $window.HTMLElement,
          $window.CustomEvent,
          $window.CSSStyleSheet,
          ($window as unknown as { ShadowRoot: typeof ShadowRoot }).ShadowRoot,
          scheduler,
        );
      }
    } else {
      dom = new HTMLDOM(
        $window,
        $window.document,
        $window.Node,
        $window.Element,
        $window.HTMLElement,
        $window.CustomEvent,
        $window.CSSStyleSheet,
        ($window as unknown as { ShadowRoot: typeof ShadowRoot }).ShadowRoot,
        scheduler,
      );
    }
    Registration.instance(IDOM, dom).register(container);
    Registration.instance(IScheduler, scheduler).register(container);

    return dom;
  }
}

export const IDOMInitializerRegistration = JSDOMInitializer as IRegistry;

/**
 * Default HTML-specific, jsdom-specific implementations for the following interfaces:
 * - `IDOMInitializer`
 */
export const DefaultComponents = [
  IDOMInitializerRegistration,
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
};
