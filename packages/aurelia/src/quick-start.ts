import { DebugConfiguration } from '@aurelia/debug';
import { JitHtmlBrowserConfiguration } from '@aurelia/jit-html-browser';
import { DI, IContainer, IRegistry } from '@aurelia/kernel';
import { Aurelia as $Aurelia, CompositionRoot, ICustomElementType, ILifecycleTask, ISinglePageApp } from '@aurelia/runtime';

// TODO: SSR?? abstract HTMLElement and document.

function createAurelia(): Aurelia {
  const au = new Aurelia();
  au.register(JitHtmlBrowserConfiguration);

  if (typeof process !== 'undefined' && typeof process.env === 'object') {
    // Just use NODE_ENV to control build process.
    // Bundlers (at least webpack/dumber/parcel) have feature to remove this branch in production.
    // Then tree-shaking/minifier will remove unused DebugConfiguration import.
    // tslint:disable-next-line:no-collapsible-if
    if (process.env.NODE_ENV !== 'production') {
      au.register(DebugConfiguration);
    }
  }

  return au;
}

export class Aurelia extends $Aurelia<HTMLElement> {
  constructor(container: IContainer = DI.createContainer()) {
    super(container);
  }

  public static start(root: CompositionRoot<HTMLElement> | undefined): ILifecycleTask {
    return createAurelia().start(root);
  }

  public static app(config: ISinglePageApp<HTMLElement> | unknown): Aurelia {
    return createAurelia().app(config);
  }

  public static register(...params: (IRegistry | Record<string, Partial<IRegistry>>)[]): Aurelia {
    return createAurelia().register(...params);
  }

  public app(config: ISinglePageApp<HTMLElement> | unknown): this {
    const comp = config as ICustomElementType;
    // tslint:disable-next-line:no-collapsible-if
    if (comp && comp.kind && comp.kind.name === 'custom-element') {
      // Default to custom element element name
      const elementName = comp.description && comp.description.name;
      let host = document.querySelector(elementName);
      if (host === null) {
        // When no target is found, default to body.
        // For example, when user forgot to write <my-app></my-app> in html.
        host = document.body;
      }
      return super.app({
        host: host as HTMLElement,
        component: comp as unknown
      });
    }

    return super.app(config as ISinglePageApp<HTMLElement>);
  }
}
