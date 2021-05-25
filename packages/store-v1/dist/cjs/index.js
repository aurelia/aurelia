"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectTo = exports.rehydrateFromLocalStorage = exports.logMiddleware = exports.localStorageMiddleware = exports.MiddlewarePlacement = exports.DEFAULT_LOCAL_STORAGE_KEY = exports.getLogType = exports.LogLevel = exports.nextStateHistory = exports.jump = exports.isStateHistory = exports.applyLimits = exports.executeSteps = exports.dispatchify = exports.UnregisteredActionError = exports.Store = exports.STORE = exports.ReducerNoStateError = exports.PerformanceMeasurement = exports.DevToolsRemoteDispatchError = exports.ActionRegistrationError = exports.StoreConfiguration = void 0;
const kernel_1 = require("@aurelia/kernel");
const runtime_html_1 = require("@aurelia/runtime-html");
const history_js_1 = require("./history.js");
const store_js_1 = require("./store.js");
exports.StoreConfiguration = {
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
        store_js_1.STORE.container = container;
        const state = Reflect.get(this, 'state');
        const options = Reflect.get(this, 'options');
        const logger = container.get(kernel_1.ILogger);
        const window = container.get(runtime_html_1.IWindow);
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!state) {
            throw new Error("initialState must be provided via withInitialState builder method");
        }
        let initState = state;
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (((_a = options === null || options === void 0 ? void 0 : options.history) === null || _a === void 0 ? void 0 : _a.undoable) && !history_js_1.isStateHistory(state)) {
            initState = { past: [], present: state, future: [] };
        }
        kernel_1.Registration.instance(store_js_1.Store, new store_js_1.Store(initState, logger, window, options)).register(container);
        return container;
    }
};
var store_js_2 = require("./store.js");
Object.defineProperty(exports, "ActionRegistrationError", { enumerable: true, get: function () { return store_js_2.ActionRegistrationError; } });
Object.defineProperty(exports, "DevToolsRemoteDispatchError", { enumerable: true, get: function () { return store_js_2.DevToolsRemoteDispatchError; } });
Object.defineProperty(exports, "PerformanceMeasurement", { enumerable: true, get: function () { return store_js_2.PerformanceMeasurement; } });
Object.defineProperty(exports, "ReducerNoStateError", { enumerable: true, get: function () { return store_js_2.ReducerNoStateError; } });
Object.defineProperty(exports, "STORE", { enumerable: true, get: function () { return store_js_2.STORE; } });
Object.defineProperty(exports, "Store", { enumerable: true, get: function () { return store_js_2.Store; } });
Object.defineProperty(exports, "UnregisteredActionError", { enumerable: true, get: function () { return store_js_2.UnregisteredActionError; } });
Object.defineProperty(exports, "dispatchify", { enumerable: true, get: function () { return store_js_2.dispatchify; } });
var test_helpers_js_1 = require("./test-helpers.js");
Object.defineProperty(exports, "executeSteps", { enumerable: true, get: function () { return test_helpers_js_1.executeSteps; } });
var history_js_2 = require("./history.js");
Object.defineProperty(exports, "applyLimits", { enumerable: true, get: function () { return history_js_2.applyLimits; } });
Object.defineProperty(exports, "isStateHistory", { enumerable: true, get: function () { return history_js_2.isStateHistory; } });
Object.defineProperty(exports, "jump", { enumerable: true, get: function () { return history_js_2.jump; } });
Object.defineProperty(exports, "nextStateHistory", { enumerable: true, get: function () { return history_js_2.nextStateHistory; } });
var logging_js_1 = require("./logging.js");
Object.defineProperty(exports, "LogLevel", { enumerable: true, get: function () { return logging_js_1.LogLevel; } });
Object.defineProperty(exports, "getLogType", { enumerable: true, get: function () { return logging_js_1.getLogType; } });
var middleware_js_1 = require("./middleware.js");
Object.defineProperty(exports, "DEFAULT_LOCAL_STORAGE_KEY", { enumerable: true, get: function () { return middleware_js_1.DEFAULT_LOCAL_STORAGE_KEY; } });
Object.defineProperty(exports, "MiddlewarePlacement", { enumerable: true, get: function () { return middleware_js_1.MiddlewarePlacement; } });
Object.defineProperty(exports, "localStorageMiddleware", { enumerable: true, get: function () { return middleware_js_1.localStorageMiddleware; } });
Object.defineProperty(exports, "logMiddleware", { enumerable: true, get: function () { return middleware_js_1.logMiddleware; } });
Object.defineProperty(exports, "rehydrateFromLocalStorage", { enumerable: true, get: function () { return middleware_js_1.rehydrateFromLocalStorage; } });
var decorator_js_1 = require("./decorator.js");
Object.defineProperty(exports, "connectTo", { enumerable: true, get: function () { return decorator_js_1.connectTo; } });
//# sourceMappingURL=index.js.map