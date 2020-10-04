import { DI, IContainer, IRegistry, IResolver, Registration } from '@aurelia/kernel';
import { AureliaEvents, IDOM, IDOMInitializer, ISinglePageApp, IScheduler, INode, Aurelia  } from '@aurelia/runtime';
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
    const container = this.container;
    if (container.has(IDOM, false)) {
      return container.get(IDOM);
    }
    const host = container.get(INode) as HTMLElement;
    host.addEventListener(AureliaEvents.Stopped, function diposeDom(e: Event) {
      if (e.target === host) {
        host.removeEventListener(AureliaEvents.Stopped, diposeDom);
        dom.dispose();
      }
    });
    const scheduler = createDOMScheduler(container, window);
    const $win = window;
    const $doc = document;
    const $Node = Node;
    const $Element = Element;
    const $HTMLElement = HTMLElement;
    const $CustomEvent = CustomEvent;
    const $CssStyleSheet = CSSStyleSheet;
    const $ShadowRoot = ShadowRoot;

    let dom: IDOM;
    if (config !== undefined) {
      if (config.dom !== undefined) {
        dom = config.dom;
      } else if (config.host.ownerDocument !== null) {
        dom = new HTMLDOM(
          $win,
          config.host.ownerDocument,
          $Node,
          $Element,
          $HTMLElement,
          $CustomEvent,
          $CssStyleSheet,
          $ShadowRoot,
          scheduler,
        );
      } else {
        dom = new HTMLDOM(
          $win,
          $doc,
          $Node,
          $Element,
          $HTMLElement,
          $CustomEvent,
          $CssStyleSheet,
          $ShadowRoot,
          scheduler,
        );
      }
    } else {
      dom = new HTMLDOM(
        $win,
        $doc,
        $Node,
        $Element,
        $HTMLElement,
        $CustomEvent,
        $CssStyleSheet,
        $ShadowRoot,
        scheduler,
      );
    }
    Registration.instance(IDOM, dom).register(container);
    Registration.instance(IScheduler, scheduler).register(container);

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
