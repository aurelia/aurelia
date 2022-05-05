import {
  Store,
  StoreOptions,
  StateHistory,
  DevToolsOptions,
  IStoreWindow,
  STORE
} from '@aurelia/store-v1';
import { BrowserPlatform } from '@aurelia/platform-browser';
import { DI, ILogger, IPlatform, Registration } from '@aurelia/kernel';
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

  public constructor(public devToolsOptions: DevToolsOptions) {}
}

const devtoolsInstalled = Symbol();

export function createDI(mockWindow?: object) {
  const container = DI.createContainer();
  const platform = BrowserPlatform.getOrCreate(globalThis);
  const win = mockWindow ?? (() => {
    const $win = platform.window;
    if (!$win[devtoolsInstalled]) {
      $win[devtoolsInstalled] = true;
      Object.assign($win, {
        devToolsExtension: {},
        __REDUX_DEVTOOLS_EXTENSION__: {
          connect: (devToolsOptions?: DevToolsOptions) => new DevToolsMock(devToolsOptions)
        }
      });
    }
    return $win;
  })();
  container.register(
    Registration.instance(IPlatform, platform),
    Registration.instance(IWindow, win)
  );

  return {
    container,
    logger: container.get(ILogger),
    storeWindow: container.get<IStoreWindow>(IWindow)
  };
}

export function createTestStore() {
  const initialState = { foo: "bar" };
  const { container, logger, storeWindow } = createDI();
  STORE.container = container;
  const store: Store<testState> = new Store(initialState, logger, storeWindow);

  return { container, initialState, store };
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
  const { container, logger, storeWindow } = createDI();
  STORE.container = container;
  return new Store<T>(state, logger, storeWindow, options);
}

export function createStoreWithStateAndOptions<T>(state: T, options: Partial<StoreOptions>) {
  const { container, logger, storeWindow } = createDI();
  STORE.container = container;
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
