import { DI, IContainer, IRegistry, Registration } from '@aurelia/kernel';
import { IDOM, IDOMInitializer, ISinglePageApp } from '@aurelia/runtime';
import { HTMLDOM, HTMLRuntimeConfiguration } from '@aurelia/runtime-html';
import { JSDOM } from 'jsdom';

class JSDOMInitializer implements IDOMInitializer {
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
        const doc = new JSDOM().window.document;
        if (config.host) {
          doc.body.appendChild(config.host);
        }
        dom = new HTMLDOM(doc);
      }
    } else {
      const doc = new JSDOM().window.document;
      dom = new HTMLDOM(doc);
    }
    Registration.instance(IDOM, dom).register(this.container, IDOM);
    return dom;
  }
}

export const DOMInitializerRegistration = Registration.singleton(IDOMInitializer, JSDOMInitializer) as IRegistry;

export const HTMLJSDOMRuntimeConfiguration = {
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
