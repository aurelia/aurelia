import { type IRegistry, IContainer, ILogger, Registration, lazy } from '@aurelia/kernel';
import { IActionHandler, IStateMiddleware, MiddlewarePlacement, IStoreRegistry, IStore } from './interfaces';
import { Store } from './store';
import { StateBindingBehavior } from './state-binding-behavior';
import {
  DispatchBindingCommand,
  DispatchBindingInstructionRenderer,
  StateBindingCommand,
  StateBindingInstructionRenderer,
} from './state-templating';
import { IDevToolsExtension, IDevToolsOptions } from './interfaces-devtools';
import { AppTask } from '@aurelia/runtime-html';
import { StoreRegistry } from './store-registry';

export interface IMiddlewareRegistration<T = any, S = any> {
  middleware: IStateMiddleware<T, S>;
  placement: MiddlewarePlacement;
  settings?: S;
}

export const StateDefaultConfiguration = {
  /**
   * Create a new configuration for the State plugin with a default store
   */
  init: <T1>(state: T1, optionsOrHandler?: IStoreConfigurationOptions | IActionHandler<T1>, ...actionHandlers: IActionHandler[]): IStateConfiguration => {
    const standardRegistrations = [
      StateBindingCommand,
      StateBindingInstructionRenderer,

      DispatchBindingCommand,
      DispatchBindingInstructionRenderer,

      StateBindingBehavior,
    ];
    const createStoreRegistration = <T extends object>(
      name: string,
      initialState: T,
      actionHandlers: IActionHandler<T>[],
      options: IStoreConfigurationOptions = {}
    ): IRegistry => {
      const normalizedHandlers = actionHandlers.slice();
      return AppTask.creating(IContainer, container => {
        const logger = container.get(ILogger);
        const getDevTools = container.get(lazy(IDevToolsExtension));

        const store = new Store<T, unknown>(initialState, normalizedHandlers, logger, getDevTools, name);
        container.get(IStoreRegistry).registerStore(name, store);
        if (name === 'default') {
          container.register(
            Registration.instance(Store, store),
            Registration.aliasTo(Store, IStore),
          );
        }

        if (options.middlewares) {
          for (const middlewareReg of options.middlewares) {
            store.registerMiddleware(middlewareReg.middleware, middlewareReg.placement, middlewareReg.settings);
          }
        }

        if (options.devToolsOptions?.disable !== true && container.has(IDevToolsExtension, true)) {
          store.connectDevTools(options.devToolsOptions ?? {});
        }
      });
    };

    const isHandler = typeof optionsOrHandler === 'function';
    const options = isHandler ? {} : optionsOrHandler;
    actionHandlers = isHandler ? [optionsOrHandler, ...actionHandlers] : actionHandlers;

    const storeRegistrations: IRegistry[] = [
      createStoreRegistration('default', state, actionHandlers, options)
    ];
    let registered = false;
    return {
      register: (c: IContainer) => {
        Registration.singleton(IStoreRegistry, StoreRegistry).register(c);
        c.register(
          ...standardRegistrations,
          ...storeRegistrations,
        );
        registered = true;
      },
      withStore(name: string, state: T1, optionsOrHandler?: IStoreConfigurationOptions | IActionHandler<T1>, ...actionHandlers: IActionHandler[]) {
        if (registered) {
          throw new Error('withStore can only be called before the configuration is registered.');
        }
        if (name === 'default') {
          throw new Error('The store name "default" is reserved. Please choose a different name for this store.');
        }

        const isHandler = typeof optionsOrHandler === 'function';
        const options = isHandler ? {} : optionsOrHandler;
        actionHandlers = isHandler ? [optionsOrHandler, ...actionHandlers] : actionHandlers;
        storeRegistrations.push(
          createStoreRegistration(name, state, actionHandlers, options)
        );
        return this;
      },
    };
  }
};

export interface IStateConfiguration {
  register(c: IContainer): void;
  /**
   * @param name - the name of the store
   * @param state - the initial state
   */
  withStore<T1>(name: string, state: T1, ...actionHandlers: IActionHandler<T1>[]): IStateConfiguration;
  /**
   * @param name - the name of the store
   * @param state - the initial state
   * @param options - configuration for the Store
   */
  withStore<T1>(name: string, state: T1, options: IStoreConfigurationOptions, ...actionHandlers: IActionHandler<T1>[]): IStateConfiguration;
}

export interface IStoreConfigurationOptions {
  devToolsOptions?: IDevToolsOptions;
  middlewares?: IMiddlewareRegistration[];
}

export interface IConfigurationInit {
  /**
   * @param state - the initial state
   */
  <T1>(name: string, state: T1, ...actionHandlers: IActionHandler<T1>[]): IStateConfiguration;
  /**
   * @param state - the initial state
   * @param options - configuration for the Store
   */
  <T1>(name: string, state: T1, options: IStoreConfigurationOptions, ...actionHandlers: IActionHandler<T1>[]): IStateConfiguration;
}
