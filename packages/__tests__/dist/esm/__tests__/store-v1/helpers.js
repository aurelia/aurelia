import { Store, STORE } from '@aurelia/store-v1';
import { DI, ILogger, IPlatform, Registration } from '@aurelia/kernel';
import { BrowserPlatform, IWindow } from '@aurelia/runtime-html';
export class DevToolsMock {
    constructor(devToolsOptions) {
        this.devToolsOptions = devToolsOptions;
        this.subscriptions = [];
    }
    init() { }
    subscribe(cb) {
        this.subscriptions.push(cb);
    }
    send() { }
}
const devtoolsInstalled = Symbol();
export function createDI(mockWindow) {
    const container = DI.createContainer();
    const platform = BrowserPlatform.getOrCreate(globalThis);
    const win = mockWindow !== null && mockWindow !== void 0 ? mockWindow : (() => {
        const $win = platform.window;
        if (!$win[devtoolsInstalled]) {
            $win[devtoolsInstalled] = true;
            Object.assign($win, {
                devToolsExtension: {},
                __REDUX_DEVTOOLS_EXTENSION__: {
                    connect: (devToolsOptions) => new DevToolsMock(devToolsOptions)
                }
            });
        }
        return $win;
    })();
    container.register(Registration.instance(IPlatform, platform), Registration.instance(IWindow, win));
    return {
        container,
        logger: container.get(ILogger),
        storeWindow: container.get(IWindow)
    };
}
export function createTestStore() {
    const initialState = { foo: "bar" };
    const { container, logger, storeWindow } = createDI();
    STORE.container = container;
    const store = new Store(initialState, logger, storeWindow);
    return { container, initialState, store };
}
export function createUndoableTestStore() {
    const initialState = {
        past: [],
        present: { foo: "bar" },
        future: []
    };
    const options = { history: { undoable: true } };
    const { logger, storeWindow } = createDI();
    const store = new Store(initialState, logger, storeWindow, options);
    return { initialState, store };
}
export function createStoreWithState(state, withUndo = false) {
    const options = withUndo ? { history: { undoable: true } } : {};
    const { container, logger, storeWindow } = createDI();
    STORE.container = container;
    return new Store(state, logger, storeWindow, options);
}
export function createStoreWithStateAndOptions(state, options) {
    const { container, logger, storeWindow } = createDI();
    STORE.container = container;
    return new Store(state, logger, storeWindow, options);
}
export function createCallCounter(object, forMethod, callThrough = true) {
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
//# sourceMappingURL=helpers.js.map