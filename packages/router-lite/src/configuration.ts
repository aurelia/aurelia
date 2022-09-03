import { isObject } from '@aurelia/metadata';
import { IContainer, InterfaceSymbol, IRegistry, Registration } from '@aurelia/kernel';
import { AppTask, AppTaskCallback, IWindow } from '@aurelia/runtime-html';

import { RouteContext } from './route-context';
import { IRouterOptions, IRouter } from './router';

import { ViewportCustomElement } from './resources/viewport';
import { LoadCustomAttribute } from './resources/load';
import { HrefCustomAttribute } from './resources/href';
import { IBaseHref, normalizePath } from './location-manager';

export const RouterRegistration = IRouter as unknown as IRegistry;

/**
 * Default runtime/environment-agnostic implementations for the following interfaces:
 * - `IRouter`
 */
export const DefaultComponents = [
  RouterRegistration,
];

export {
  ViewportCustomElement,
  LoadCustomAttribute,
  HrefCustomAttribute,
};

export const ViewportCustomElementRegistration = ViewportCustomElement as unknown as IRegistry;
export const LoadCustomAttributeRegistration = LoadCustomAttribute as unknown as IRegistry;
export const HrefCustomAttributeRegistration = HrefCustomAttribute as unknown as IRegistry;

/**
 * Default router resources:
 * - Custom Elements: `au-viewport`
 * - Custom Attributes: `load`, `href`
 */
export const DefaultResources: IRegistry[] = [
  ViewportCustomElement as unknown as IRegistry,
  LoadCustomAttribute as unknown as IRegistry,
  HrefCustomAttribute as unknown as IRegistry,
];

export type RouterConfig = IRouterOptions | ((router: IRouter) => ReturnType<IRouter['start']>);
function configure(container: IContainer, config?: RouterConfig): IContainer {
  let activation: AppTaskCallback<InterfaceSymbol<IRouter>>;
  let basePath: string | null = null;
  if (isObject(config)) {
    if (typeof config === 'function') {
      activation = router => config(router) as void | Promise<void>;
    } else {
      basePath = (config as IRouterOptions).basePath ?? null;
      activation = router => router.start(config, true) as void | Promise<void>;
    }
  } else {
    activation = router => router.start({}, true) as void | Promise<void>;
  }
  return container.register(
    Registration.cachedCallback(IBaseHref, (handler, _, __) => {
      const window = handler.get(IWindow);
      const url = new URL(window.document.baseURI);
      url.pathname = normalizePath(basePath ?? url.pathname);
      return url;
    }),
    AppTask.hydrated(IContainer, RouteContext.setRoot),
    AppTask.activated(IRouter, activation),
    AppTask.deactivated(IRouter, router => {
      router.stop();
    }),
    ...DefaultComponents,
    ...DefaultResources,
  );
}

export const RouterConfiguration = {
  register(container: IContainer): IContainer {
    return configure(container);
  },
  /**
   * Make it possible to specify options to Router activation.
   * Parameter is either a config object that's passed to Router's activate
   * or a config function that's called instead of Router's activate.
   */
  customize(config?: RouterConfig): IRegistry {
    return {
      register(container: IContainer): IContainer {
        return configure(container, config);
      },
    };
  },
};
