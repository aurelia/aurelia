import { DI, IContainer, IRegistry, Registration } from '@aurelia/kernel';
import { IDOM, IDOMInitializer, ISinglePageApp } from '@aurelia/runtime';
import { HTMLDOM, HTMLRuntimeConfiguration } from '@aurelia/runtime-html';

class BrowserDOMInitializer implements IDOMInitializer {
  public static inject: unknown[] = [IContainer];

  private readonly container: IContainer;

  constructor(container: IContainer) {
    this.container = container;
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
        dom = new HTMLDOM(config.host.ownerDocument);
      } else {
        dom = new HTMLDOM(document);
      }
    } else {
      dom = new HTMLDOM(document);
    }
    Registration.instance(IDOM, dom).register(this.container, IDOM);
    return dom;
  }
}

export const DOMInitializerRegistration = Registration.singleton(IDOMInitializer, BrowserDOMInitializer) as IRegistry;

export const HTMLBrowserRuntimeConfiguration = {
  register(container: IContainer): void {
    container.register(
      HTMLRuntimeConfiguration,
      DOMInitializerRegistration
    );
  },
  createContainer(): IContainer {
    const container = DI.createContainer();
    container.register(HTMLRuntimeConfiguration);
    return container;
  }
};
