import { type IRegistry, IContainer, ILogger, Registration, lazy } from '@aurelia/kernel';
import { IActionHandler, IStore, IStateMiddleware, MiddlewarePlacement, IStoreManager, IStoreRegistration, IState } from './interfaces';
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
import { StoreManager } from './store-manager';

const standardRegistrations = [
  StateBindingCommand,
  StateBindingInstructionRenderer,

  DispatchBindingCommand,
  DispatchBindingInstructionRenderer,

  StateBindingBehavior,
];

export interface IMiddlewareRegistration<T = any, S = any> {
  middleware: IStateMiddleware<T, S>;
  placement: MiddlewarePlacement;
  settings?: S;
}

const createConfiguration = <T extends object>(
  initialState: T,
  actionHandlers: IActionHandler<T>[],
  options: IStateConfigurationOptions = {}
): IStateConfiguration => {
  const normalizedHandlers = actionHandlers.slice();
  return {
    register: (c: IContainer) => {
      if (!c.has(IStoreManager, false)) {
        c.register(Registration.singleton(IStoreManager, StoreManager));
      }
      c.register(
        ...standardRegistrations,
        /* istanbul ignore next */
        AppTask.creating(IContainer, container => {
          const logger = container.get(ILogger);
          const getDevTools = container.get(lazy(IDevToolsExtension));

          const storeName = options.storeName;
          const primaryKey = (options.storeKey ?? storeName ?? IStore) as IStoreRegistration['key'];
          const isDefaultStore = options.isDefault ?? primaryKey === IStore;

          const store = new Store<T, unknown>(initialState, normalizedHandlers, logger, getDevTools, typeof storeName === 'string' ? storeName : undefined);

          const registrations: IRegistry[] = [];
          if (primaryKey != null) {
            registrations.push(Registration.instance(primaryKey, store));
          }

          if (isDefaultStore) {
            if (primaryKey !== IStore) {
              registrations.push(Registration.instance(IStore, store));
            }
            registrations.push(Registration.instance(Store, store));
            if (!container.has(IState, false)) {
              registrations.push(Registration.instance(IState, initialState));
            }
          }

          if (registrations.length > 0) {
            container.register(...registrations);
          }

          const storeManager = container.get(IStoreManager);
          storeManager.register(store, {
            name: storeName,
            key: primaryKey,
            isDefault: isDefaultStore,
          });

          if (options.middlewares) {
            for (const middlewareReg of options.middlewares) {
              store.registerMiddleware(middlewareReg.middleware, middlewareReg.placement, middlewareReg.settings);
            }
          }

          if (options.devToolsOptions?.disable !== true && container.has(IDevToolsExtension, true)) {
            store.connectDevTools(options.devToolsOptions ?? {});
          }
        })
      );
    },
    init: <T1>(state: T1, optionsOrHandler: IStateConfigurationOptions | IActionHandler<T1>, ...actionHandlers: IActionHandler[]) => {
      const isHandler = typeof optionsOrHandler === 'function';
      const options = isHandler ? {} : optionsOrHandler;
      actionHandlers = isHandler ? [optionsOrHandler, ...actionHandlers] : actionHandlers;
      return createConfiguration(state, actionHandlers, options);
    }
  };
};

export const StateDefaultConfiguration = /*@__PURE__*/createConfiguration({}, []);

export interface IStateConfiguration {
  register(c: IContainer): void;
  /**
   * Create a new configuration for the State plugin
   */
  init: IConfigurationInit;
}

export interface IStateConfigurationOptions {
  devToolsOptions?: IDevToolsOptions;
  middlewares?: IMiddlewareRegistration[];
  storeName?: string;
  storeKey?: IStoreRegistration['key'];
  isDefault?: boolean;
}

export interface IConfigurationInit {
  /**
   * @param state - the initial state
   */
  <T1>(state: T1, ...actionHandlers: IActionHandler<T1>[]): IStateConfiguration;
  /**
   * @param state - the initial state
   * @param options - configuration for the Store
   */
  <T1>(state: T1, options: IStateConfigurationOptions, ...actionHandlers: IActionHandler<T1>[]): IStateConfiguration;
}
