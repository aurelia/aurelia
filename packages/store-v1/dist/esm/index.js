import { Registration, ILogger } from '@aurelia/kernel';
import { IWindow } from '@aurelia/runtime-html';
import { isStateHistory } from './history.js';
import { Store, STORE } from './store.js';
export const StoreConfiguration = {
    withInitialState(state) {
        Reflect.set(this, 'state', state);
        return this;
    },
    withOptions(options) {
        Reflect.set(this, 'options', options);
        return this;
    },
    register(container) {
        var _a;
        // Stores a reference of the DI container for internal use
        // TODO: get rid of this workaround for unit tests
        STORE.container = container;
        const state = Reflect.get(this, 'state');
        const options = Reflect.get(this, 'options');
        const logger = container.get(ILogger);
        const window = container.get(IWindow);
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!state) {
            throw new Error("initialState must be provided via withInitialState builder method");
        }
        let initState = state;
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (((_a = options === null || options === void 0 ? void 0 : options.history) === null || _a === void 0 ? void 0 : _a.undoable) && !isStateHistory(state)) {
            initState = { past: [], present: state, future: [] };
        }
        Registration.instance(Store, new Store(initState, logger, window, options)).register(container);
        return container;
    }
};
export { ActionRegistrationError, DevToolsRemoteDispatchError, PerformanceMeasurement, ReducerNoStateError, STORE, Store, UnregisteredActionError, dispatchify, } from './store.js';
export { executeSteps } from './test-helpers.js';
export { applyLimits, isStateHistory, jump, nextStateHistory, } from './history.js';
export { LogLevel, getLogType, } from './logging.js';
export { DEFAULT_LOCAL_STORAGE_KEY, MiddlewarePlacement, localStorageMiddleware, logMiddleware, rehydrateFromLocalStorage, } from './middleware.js';
export { connectTo, } from './decorator.js';
//# sourceMappingURL=index.js.map