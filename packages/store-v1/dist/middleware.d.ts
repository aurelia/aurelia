export declare const DEFAULT_LOCAL_STORAGE_KEY = "aurelia-store-state";
export interface CallingAction {
    name: string;
    params?: unknown[];
    pipedActions?: {
        name: string;
        params?: unknown[];
    }[];
}
export declare type Middleware<T, S = any> = (state: T, originalState: T | undefined, settings: S, action?: CallingAction) => T | Promise<T | undefined | false> | void | false;
export declare enum MiddlewarePlacement {
    Before = "before",
    After = "after"
}
export declare function logMiddleware(state: unknown, _: unknown, settings?: {
    logType: "debug" | "error" | "info" | "log" | "trace" | "warn";
}): void;
export declare function localStorageMiddleware(state: unknown, _: unknown, settings?: {
    key: string;
}): void;
export declare function rehydrateFromLocalStorage<T>(state: T, key?: string): T;
//# sourceMappingURL=middleware.d.ts.map