import { IContainer, Registration, ILogger } from '@aurelia/kernel';
import { IWindow } from '@aurelia/runtime-html';

import { isStateHistory, StateHistory } from './history';
import { Store, STORE, StoreOptions } from './store';

export interface StorePluginOptions<T> extends StoreOptions {
  initialState: T;
}

export interface IConfigure {
  withInitialState(state: unknown): IConfigure;
  withOptions(options: Partial<StorePluginOptions<unknown>>): IConfigure;
  register(container: IContainer): IContainer;
}

export const StoreConfiguration: IConfigure = {
  withInitialState(state: unknown): IConfigure {
    Reflect.set(this, 'state', state);
    return this;
  },
  withOptions(options: Partial<StorePluginOptions<unknown>>): IConfigure {
    Reflect.set(this, 'options', options);
    return this;
  },
  register(container: IContainer): IContainer {
    // Stores a reference of the DI container for internal use
    // TODO: get rid of this workaround for unit tests
    STORE.container = container;

    const state = Reflect.get(this, 'state') as unknown & Partial<StateHistory<unknown>>;
    const options = Reflect.get(this, 'options') as Partial<StorePluginOptions<unknown>>;
    const logger = container.get(ILogger);
    const window = container.get(IWindow);

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!state) {
      throw new Error("initialState must be provided via withInitialState builder method");
    }

    let initState: unknown = state;

    if (options?.history?.undoable && !isStateHistory(state)) {
      initState = { past: [], present: state, future: [] };
    }

    Registration.instance(Store, new Store(initState, logger, window, options)).register(container);

    return container;
  }
};

export {
  ActionRegistrationError,
  DevToolsRemoteDispatchError,
  type IStoreWindow,
  type MiddlewareSettings,
  PerformanceMeasurement,
  type PipedDispatch,
  type Reducer,
  ReducerNoStateError,
  STORE,
  Store,
  type StoreOptions,
  UnregisteredActionError,
  dispatchify,
} from './store';

export {
  type StepFn,
  executeSteps
} from './test-helpers';

export {
  type HistoryOptions,
  type StateHistory,
  applyLimits,
  isStateHistory,
  jump,
  nextStateHistory,
} from './history';

export {
  type LogDefinitions,
  LogLevel,
  getLogType,
} from './logging';

export {
  type CallingAction,
  DEFAULT_LOCAL_STORAGE_KEY,
  type Middleware,
  MiddlewarePlacement,
  localStorageMiddleware,
  logMiddleware,
  rehydrateFromLocalStorage,
} from './middleware';

export {
  type ConnectToSettings,
  type MultipleSelector,
  connectTo,
} from './decorator';

export {
  type Action,
  type ActionCreator,
  type DevTools,
  type DevToolsExtension,
  type DevToolsMessage,
  type DevToolsOptions,
} from './devtools';
