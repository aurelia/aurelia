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

    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (options?.history?.undoable && !isStateHistory(state)) {
      initState = { past: [], present: state, future: [] };
    }

    Registration.instance(Store, new Store(initState, logger, window, options)).register(container);

    return container;
  }
};

export * from './store';
export * from './test-helpers';
export * from './history';
export * from './logging';
export * from './middleware';
export * from './decorator';
export * from './devtools';
