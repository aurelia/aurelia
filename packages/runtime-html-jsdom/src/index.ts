import { DI, IContainer, IRegistry, IResolver, Registration } from '@aurelia/kernel';
import { IDOM, IDOMInitializer, ISinglePageApp } from '@aurelia/runtime';
import { BasicConfiguration as RuntimeHtmlConfiguration, HTMLDOM } from '@aurelia/runtime-html';
import { JSDOM } from 'jsdom';

class JSDOMInitializer implements IDOMInitializer {
  public static inject: unknown[] = [IContainer];

  private readonly container: IContainer;
  private readonly jsdom: JSDOM;

  constructor(container: IContainer) {
    this.container = container;
    this.jsdom = new JSDOM();
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
          this.jsdom.window.CustomEvent
        );
      } else {
        if (config.host) {
          this.jsdom.window.document.body.appendChild(config.host);
        }
        dom = new HTMLDOM(
          this.jsdom.window,
          this.jsdom.window.document,
          this.jsdom.window.Node,
          this.jsdom.window.Element,
          this.jsdom.window.HTMLElement,
          this.jsdom.window.CustomEvent
        );
      }
    } else {
      dom = new HTMLDOM(
        this.jsdom.window,
        this.jsdom.window.document,
        this.jsdom.window.Node,
        this.jsdom.window.Element,
        this.jsdom.window.HTMLElement,
        this.jsdom.window.CustomEvent
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
 * - `BasicConfiguration` from `@aurelia/runtime-html`
 * - `DefaultComponents`
 */
export const BasicConfiguration = {
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
