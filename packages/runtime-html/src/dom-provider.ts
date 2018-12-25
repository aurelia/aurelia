import { IContainer } from '@aurelia/kernel';
import { IDOM, IDOMInitializer, ISinglePageApp } from '@aurelia/runtime';
import { HTMLDOM } from './dom';

export class HTMLDOMInitializer implements IDOMInitializer {
  public static inject: unknown[] = [IContainer];

  private readonly container: IContainer;

  constructor(container: IContainer) {
    this.container = container;
  }

  /**
   * Either create a new HTML `DOM` backed by the supplied `document` or uses the supplied `DOM` directly.
   *
   * If no argument is provided, uses the default global `document` variable.
   * (this will throw an error in non-browser environments).
   */
  public initialize(config: ISinglePageApp<Node>): IDOM {
    if (this.container.has(IDOM, false)) {
      return this.container.get(IDOM);
    }
    let dom: IDOM;
    if (config.dom !== undefined) {
      dom = config.dom;
    } else if (config.host.ownerDocument !== null) {
      dom = new HTMLDOM(config.host.ownerDocument);
    } else {
      dom = new HTMLDOM(document);
    }
    return dom;
  }
}
