import { isObject } from '@aurelia/metadata';
import { IContainer, InterfaceSymbol, IRegistry, Registration } from '@aurelia/kernel';
import { AppTask, AppTaskCallback } from '@aurelia/runtime-html';

import { RouteContext } from './route-context';
import { IRouterOptions, IRouter } from './router';

import { ViewportCustomElement } from './resources/viewport';
import { LoadCustomAttribute } from './resources/load';
import { HrefCustomAttribute } from './resources/href';
import { IBasePath } from './location-manager';

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
  // this is transient because the IBaseHrefProvider is needed only once in the router ctor, and ATM there is no need to keep a reference of this around.
  let basePathRegistration: IRegistry = null!;
  let activation: AppTaskCallback<InterfaceSymbol<IRouter>>;
  if (isObject(config)) {
    if (typeof config === 'function') {
      activation = router => config(router) as void | Promise<void>;
    } else {
      const basePath = (config as IRouterOptions).basePath;
      if (typeof basePath === 'string') {
        basePathRegistration = Registration.instance(IBasePath, basePath);
      }
      activation = router => router.start(config, true) as void | Promise<void>;
    }
  } else {
    activation = router => router.start({}, true) as void | Promise<void>;
  }
  return container.register(
    basePathRegistration !== null
      ? basePathRegistration
      : Registration.instance(IBasePath, null),
    AppTask.hydrated(IContainer, RouteContext.setRoot),
    AppTask.afterActivate(IRouter, activation),
    AppTask.afterDeactivate(IRouter, router => {
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
