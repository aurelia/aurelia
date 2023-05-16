import { isObject } from '@aurelia/metadata';
import { IContainer, IRegistry, Registration } from '@aurelia/kernel';
import { AppTask, IWindow } from '@aurelia/runtime-html';

import { RouteContext } from './route-context';
import { IRouterOptions as $IRouterOptions, IRouterOptions, RouterOptions } from './options';
import { IRouter } from './router';

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

export interface IRouterConfigurationOptions extends $IRouterOptions {
  /**
   * Set a custom routing root by setting this path.
   * When not set, path from the `document.baseURI` is used by default.
   */
  basePath?: string | null;
}

function configure(container: IContainer, options?: IRouterConfigurationOptions): IContainer {
  let basePath: string | null = null;
  if (isObject(options)) {
    basePath = (options as IRouterConfigurationOptions).basePath ?? null;
  } else {
    options = {};
  }
  const routerOptions = RouterOptions.create(options);
  return container.register(
    Registration.cachedCallback(IBaseHref, (handler, _, __) => {
      const window = handler.get(IWindow);
      const url = new URL(window.document.baseURI);
      url.pathname = normalizePath(basePath ?? url.pathname);
      return url;
    }),
    Registration.instance(IRouterOptions, routerOptions),
    Registration.instance(RouterOptions, routerOptions),
    AppTask.hydrated(IContainer, RouteContext.setRoot),
    AppTask.activated(IRouter, router => router.start(true)),
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
  customize(options?: IRouterConfigurationOptions): IRegistry {
    return {
      register(container: IContainer): IContainer {
        return configure(container, options);
      },
    };
  },
};
