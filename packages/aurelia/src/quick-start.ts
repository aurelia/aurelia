import { DebugConfiguration } from '@aurelia/debug';
import { JitHtmlBrowserConfiguration } from '@aurelia/jit-html-browser';
import { DI, IContainer, IRegistry } from '@aurelia/kernel';
import { Aurelia as $Aurelia, CompositionRoot, CustomElementType, ILifecycleTask, ISinglePageApp, CustomElement } from '@aurelia/runtime';

// TODO: SSR?? abstract HTMLElement and document.

function createAurelia(): Aurelia {
  const au = new Aurelia();
  au.register(JitHtmlBrowserConfiguration);

  // eslint-disable-next-line sonarjs/no-collapsible-if
  if (typeof process !== 'undefined' && typeof process.env === 'object') {
    // Just use NODE_ENV to control build process.
    // Bundlers (at least webpack/dumber/parcel) have feature to remove this branch in production.
    // Then tree-shaking/minifier will remove unused DebugConfiguration import.
    if (process.env.NODE_ENV !== 'production') {
      au.register(DebugConfiguration);
    }
  }

  return au;
}

export class Aurelia extends $Aurelia<HTMLElement> {
  public constructor(container: IContainer = DI.createContainer()) {
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
    if (CustomElement.isType(config as CustomElementType)) {
      // Default to custom element element name
      const definition = CustomElement.getDefinition(config as CustomElementType);
      let host = document.querySelector(definition.name);
      if (host === null) {
        // When no target is found, default to body.
        // For example, when user forgot to write <my-app></my-app> in html.
        host = document.body;
      }
      return super.app({
        host: host as HTMLElement,
        component: config as CustomElementType
      });
    }

    return super.app(config as ISinglePageApp<HTMLElement>);
  }
}
