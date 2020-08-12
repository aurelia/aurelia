import {
  Store,
  StoreOptions,
  StateHistory,
  IStoreWindow,
  DevToolsOptions
} from '@aurelia/store';
import { DI, ILogger, Registration } from '@aurelia/kernel';

export type testState = {
  foo: string;
  bar?: string;
};

export class DevToolsMock {
  public subscriptions: ((message: any) => void)[] = [];
  public init() { /**/ }
  public subscribe(cb: (message: any) => void) {
    this.subscriptions.push(cb);
  }
  public send() { /**/ }

  public constructor(public devToolsOptions: DevToolsOptions) { }
}

export function createDI(storeWindowMock?: unknown) {
  const container = DI.createContainer();
  container.register(Registration.instance(IStoreWindow,
    storeWindowMock !== undefined
      ? storeWindowMock
  : { devToolsExtension: {}, __REDUX_DEVTOOLS_EXTENSION__: {
    connect: (devToolsOptions?: DevToolsOptions) => new DevToolsMock(devToolsOptions)
  }}));

  return {
    logger: container.get(ILogger),
    storeWindow: container.get(IStoreWindow)
  };
}

export function createTestStore() {
  const initialState = { foo: "bar" };
  const { logger, storeWindow } = createDI();
  const store: Store<testState> = new Store(initialState, logger, storeWindow);

  return { initialState, store };
}

export function createUndoableTestStore() {
  const initialState: StateHistory<testState> = {
    past: [],
    present: { foo: "bar" },
    future: []
  };
  const options = { history: { undoable: true } };
  const { logger, storeWindow } = createDI();
  const store = new Store(initialState, logger, storeWindow, options);

  return { initialState, store };
}

export function createStoreWithState<T>(state: T, withUndo = false) {
  const options = withUndo ? { history: { undoable: true } } : {};
  const { logger, storeWindow } = createDI();
  return new Store<T>(state, logger, storeWindow, options);
}

export function createStoreWithStateAndOptions<T>(state: T, options: Partial<StoreOptions>) {
  const { logger, storeWindow } = createDI();
  return new Store<T>(state, logger, storeWindow, options);
}

export function createCallCounter(object: any, forMethod: string, callThrough = true) {
  const spyObj = {
    callCounter: 0,
    lastArgs: undefined,
    reset() {
      object[forMethod] = origMethod;
      spyObj.callCounter = 0;
    }
  };
  const origMethod = object[forMethod];

  object[forMethod] = (...args) => {
    spyObj.callCounter++;
    spyObj.lastArgs = args;

    if (callThrough) {
      origMethod.apply(object, ...args);
    }
  };

  return { spyObj, origMethod };
}
