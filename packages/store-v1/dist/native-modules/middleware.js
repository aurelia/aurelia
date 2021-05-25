import { IPlatform } from '../../../kernel/dist/native-modules/index.js';
import { IWindow } from '../../../runtime-html/dist/native-modules/index.js';
import { STORE } from './store.js';
export const DEFAULT_LOCAL_STORAGE_KEY = "aurelia-store-state";
export var MiddlewarePlacement;
(function (MiddlewarePlacement) {
    MiddlewarePlacement["Before"] = "before";
    MiddlewarePlacement["After"] = "after";
})(MiddlewarePlacement || (MiddlewarePlacement = {}));
export function logMiddleware(state, _, settings) {
    const cons = STORE.container.get(IPlatform).console;
    const logType = (settings === null || settings === void 0 ? void 0 : settings.logType) !== undefined && cons[settings.logType] !== undefined ? settings.logType : "log";
    cons[logType]("New state: ", state);
}
export function localStorageMiddleware(state, _, settings) {
    const localStorage = STORE.container.get(IWindow).localStorage;
    if (localStorage !== undefined) {
        const key = (settings === null || settings === void 0 ? void 0 : settings.key) !== undefined ? settings.key : DEFAULT_LOCAL_STORAGE_KEY;
        localStorage.setItem(key, JSON.stringify(state));
    }
}
export function rehydrateFromLocalStorage(state, key) {
    const localStorage = STORE.container.get(IWindow).localStorage;
    if (localStorage === undefined) {
        return state;
    }
    const storedState = localStorage.getItem(key === undefined ? DEFAULT_LOCAL_STORAGE_KEY : key);
    if (storedState === null || storedState === "") {
        return state;
    }
    try {
        return JSON.parse(storedState);
    }
    catch ( /**/_a) { /**/ }
    return state;
}
//# sourceMappingURL=middleware.js.map