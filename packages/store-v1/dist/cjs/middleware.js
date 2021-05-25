"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rehydrateFromLocalStorage = exports.localStorageMiddleware = exports.logMiddleware = exports.MiddlewarePlacement = exports.DEFAULT_LOCAL_STORAGE_KEY = void 0;
const kernel_1 = require("@aurelia/kernel");
const runtime_html_1 = require("@aurelia/runtime-html");
const store_js_1 = require("./store.js");
exports.DEFAULT_LOCAL_STORAGE_KEY = "aurelia-store-state";
var MiddlewarePlacement;
(function (MiddlewarePlacement) {
    MiddlewarePlacement["Before"] = "before";
    MiddlewarePlacement["After"] = "after";
})(MiddlewarePlacement = exports.MiddlewarePlacement || (exports.MiddlewarePlacement = {}));
function logMiddleware(state, _, settings) {
    const cons = store_js_1.STORE.container.get(kernel_1.IPlatform).console;
    const logType = (settings === null || settings === void 0 ? void 0 : settings.logType) !== undefined && cons[settings.logType] !== undefined ? settings.logType : "log";
    cons[logType]("New state: ", state);
}
exports.logMiddleware = logMiddleware;
function localStorageMiddleware(state, _, settings) {
    const localStorage = store_js_1.STORE.container.get(runtime_html_1.IWindow).localStorage;
    if (localStorage !== undefined) {
        const key = (settings === null || settings === void 0 ? void 0 : settings.key) !== undefined ? settings.key : exports.DEFAULT_LOCAL_STORAGE_KEY;
        localStorage.setItem(key, JSON.stringify(state));
    }
}
exports.localStorageMiddleware = localStorageMiddleware;
function rehydrateFromLocalStorage(state, key) {
    const localStorage = store_js_1.STORE.container.get(runtime_html_1.IWindow).localStorage;
    if (localStorage === undefined) {
        return state;
    }
    const storedState = localStorage.getItem(key === undefined ? exports.DEFAULT_LOCAL_STORAGE_KEY : key);
    if (storedState === null || storedState === "") {
        return state;
    }
    try {
        return JSON.parse(storedState);
    }
    catch ( /**/_a) { /**/ }
    return state;
}
exports.rehydrateFromLocalStorage = rehydrateFromLocalStorage;
//# sourceMappingURL=middleware.js.map