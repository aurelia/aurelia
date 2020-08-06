import { IContainer, Registration, Reporter, ILogger } from '@aurelia/kernel';
import { isStateHistory } from './history';
import { Store, STORE, StoreOptions } from './store';

export interface StorePluginOptions<T> extends StoreOptions {
  initialState: T;
}

export interface IConfigure {
  initialState(state: unknown): IConfigure;
  options(options: Partial<StorePluginOptions<unknown>>): IConfigure;
  register(container: IContainer): IContainer;
}

export const StoreConfiguration: IConfigure = {
  initialState(state: unknown): IConfigure {
    Reflect.set(this, 'state', state);
    return this;
  },
  options(options: Partial<StorePluginOptions<unknown>>): IConfigure {
    Reflect.set(this, 'options', options);
    return this;
  },
  register(container: IContainer): IContainer {
    // Stores a reference of the DI container for internal use
    STORE.container = container;

    const state = Reflect.get(this, 'state') || {};
    const options: Partial<StorePluginOptions<unknown>> = Reflect.get(this, 'options');
    const logger = container.get(ILogger);

    if (!options || !state) {
      Reporter.error(506);
    }

    let initState: unknown = state;

    if (options?.history?.undoable && !isStateHistory(state)) {
      initState = { past: [], present: state, future: [] };
    }

    Reflect.deleteProperty(this, 'initialState');

    Registration.instance(Store, new Store(initState, logger, options)).register(container);

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
