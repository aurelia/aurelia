import {
  Store,
  StoreOptions,
  StateHistory
} from '@aurelia/store';
import { DI, ILogger } from '@aurelia/kernel';

export type testState = {
  foo: string;
  bar?: string;
};

function createLogger() {
  const container = DI.createContainer();

  return container.get(ILogger);
}

export function createTestStore() {
  const initialState = { foo: "bar" };


  const store: Store<testState> = new Store(initialState, createLogger());

  return { initialState, store };
}

export function createUndoableTestStore() {
  const initialState: StateHistory<testState> = {
    past: [],
    present: { foo: "bar" },
    future: []
  };
  const options = { history: { undoable: true } };
  const store = new Store(initialState, createLogger(), options);

  return { initialState, store };
}

export function createStoreWithState<T>(state: T, withUndo = false) {
  const options = withUndo ? { history: { undoable: true } } : {};
  return new Store<T>(state, createLogger(), options);
}

export function createStoreWithStateAndOptions<T>(state: T, options: Partial<StoreOptions>) {
  return new Store<T>(state, createLogger(), options);
}

export type Spied<T> = {
  [Method in keyof T]: T[Method];
};
