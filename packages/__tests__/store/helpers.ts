import {
  Store,
  StoreOptions,
  StateHistory,
  DevToolsOptions,
  IStoreWindow
} from '@aurelia/store';
import { DI, ILogger, Registration } from '@aurelia/kernel';
import { IWindow } from '@aurelia/runtime-html';

export type testState = {
  foo: string;
  bar?: string;
};

export class DevToolsMock {
  public subscriptions: ((message: any) => void)[] = [];
  public init(): void { /**/ }
  public subscribe(cb: (message: any) => void): void {
    this.subscriptions.push(cb);
  }
  public send(): void { /**/ }

  public constructor(public devToolsOptions: DevToolsOptions) { }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createDI(storeWindowMock?: unknown) {
  const container = DI.createContainer();
  container.register(Registration.instance(IWindow,
    storeWindowMock !== undefined
      ? storeWindowMock
  : { devToolsExtension: {}, __REDUX_DEVTOOLS_EXTENSION__: {
    connect: (devToolsOptions?: DevToolsOptions) => new DevToolsMock(devToolsOptions)
  }}));

  return {
    logger: container.get(ILogger),
    storeWindow: container.get<IStoreWindow>(IWindow)
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createTestStore() {
  const initialState = { foo: "bar" };
  const { logger, storeWindow } = createDI();
  const store: Store<testState> = new Store(initialState, logger, storeWindow);

  return { initialState, store };
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createStoreWithState<T>(state: T, withUndo = false) {
  const options = withUndo ? { history: { undoable: true } } : {};
  const { logger, storeWindow } = createDI();
  return new Store<T>(state, logger, storeWindow, options);
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createStoreWithStateAndOptions<T>(state: T, options: Partial<StoreOptions>) {
  const { logger, storeWindow } = createDI();
  return new Store<T>(state, logger, storeWindow, options);
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
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
