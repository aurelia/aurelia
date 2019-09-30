import { DebugConfiguration } from '@aurelia/debug';
import { JitHtmlBrowserConfiguration } from '@aurelia/jit-html-browser';
import { IRegistry } from '@aurelia/kernel';
import { Aurelia, ICustomElementType, INode } from '@aurelia/runtime';

function start(component: unknown, host: INode, deps: IRegistry[]): Aurelia {
  const au = new Aurelia();
  au.register(JitHtmlBrowserConfiguration, ...deps);

  if (typeof process !== 'undefined' && typeof process.env === 'object') {
    // Just use NODE_ENV to control build process.
    // Bundlers (at least webpack/dumber/parcel) have feature to remove this branch in production.
    // Then tree-shaking/minifier will remove unused DebugConfiguration import.
    // tslint:disable-next-line:no-collapsible-if
    if (process.env.NODE_ENV !== 'production') {
      au.register(DebugConfiguration);
    }
  }

  au.app({ host, component }).start();
  return au;
}

interface IQuickStartOptions {
  host?: string | Element | null;
  dependencies?: unknown[];
  // Support deps as an alias of dependencies
  deps?: unknown[];
}

// TODO: SSR?? abstract HTMLElement and document.

/**
 * A wrapper to quick start an Aurelia app
 */
export function quickStart(component: unknown, options: IQuickStartOptions = {}): Aurelia {
  let host = options.host;
  const deps = (options.dependencies || options.deps || []) as IRegistry[];

  // Try to get host from custom element name.
  if (host === undefined || host === null) {
    const comp = component as ICustomElementType;
    // tslint:disable-next-line:no-collapsible-if
    if (comp && comp.kind && comp.kind.name === 'custom-element') {
      // Default to custom element element name
      const elementName = comp.description && comp.description.name;
      host = elementName;
    }
  }

  if (typeof host === 'string') {
    host = document.querySelector(host);
  }

  // When no target is found, default to body.
  // For example, when user forgot to write <my-app></my-app> in html.
  if (host === undefined || host === null) {
    host = document.body;
  }

  return start(component, host, deps);
}
