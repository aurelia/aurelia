import {
  Store,
  StoreOptions
} from '../../src/store';

import { SinonStub } from 'sinon';
import { StateHistory } from '../../src/history';

export type testState = {
  foo: string;
};

export function createTestStore() {
  const initialState = { foo: 'bar' };
  const store: Store<testState> = new Store(initialState);

  return { initialState, store };
}

export function createUndoableTestStore() {
  // tslint:disable-next-line:no-object-literal-type-assertion
  const initialState = {
    past: [],
    present: { foo: 'bar' },
    future: []
  } as StateHistory<testState>;
  const options = { history: { undoable: true } };
  const store = new Store(initialState, options);

  return { initialState, store };
}

export function createStoreWithState<T>(state: T, withUndo = false) {
  const options = withUndo ? { history: { undoable: true } } : {};
  return new Store<T>(state, options);
}

export function createStoreWithStateAndOptions<T>(state: T, options: Partial<StoreOptions>) {
  return new Store<T>(state, options);
}

export type Spied<T> = {
  [Method in keyof T]: T[Method] & SinonStub;
};
