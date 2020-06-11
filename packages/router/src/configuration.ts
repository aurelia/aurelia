import {
  IContainer,
  IRegistry,
  isObject,
} from '@aurelia/kernel';
import {
  StartTask,
} from '@aurelia/runtime';

import {
  RouteContext,
} from './route-context';
import {
  IRouterOptions,
  IRouter,
} from './router';

import {
  ViewportCustomElement,
} from './resources/viewport';
import {
  GotoCustomAttribute,
} from './resources/goto';
import {
  HrefCustomAttribute,
} from './resources/href';

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
  GotoCustomAttribute,
  HrefCustomAttribute,
};

export const ViewportCustomElementRegistration = ViewportCustomElement as unknown as IRegistry;
export const GotoCustomAttributeRegistration = GotoCustomAttribute as unknown as IRegistry;
export const HrefCustomAttributeRegistration = HrefCustomAttribute as unknown as IRegistry;

/**
 * Default router resources:
 * - Custom Elements: `au-viewport`
 * - Custom Attributes: `goto`, `href`
 */
export const DefaultResources: IRegistry[] = [
  ViewportCustomElement as unknown as IRegistry,
  GotoCustomAttribute as unknown as IRegistry,
  HrefCustomAttribute as unknown as IRegistry,
];

export type RouterConfig = IRouterOptions | ((router: IRouter) => ReturnType<IRouter['start']>);
function configure(container: IContainer, config?: RouterConfig): IContainer {
  return container.register(
    StartTask.with(IContainer).beforeCompileChildren().call(RouteContext.setRoot),
    // TODO(fkleuver): hook this up to MountQueue after that's added back in, to delay mounting until the whole tree
    // has loaded. This to prevent flicker in case of cancellation.
    StartTask.with(IRouter).afterAttach().call(function (router) {
      if (isObject(config)) {
        if (typeof config === 'function') {
          return config(router);
        } else {
          return router.start(config, true);
        }
      }
      return router.start({}, true);
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
  customize(config?: RouterConfig) {
    return {
      register(container: IContainer): IContainer {
        return configure(container, config);
      },
    };
  },
};
