import type { StoreOptions } from './store.js';
export declare enum LogLevel {
    trace = "trace",
    debug = "debug",
    info = "info",
    warn = "warn",
    error = "error"
}
export interface LogDefinitions {
    performanceLog?: LogLevel;
    dispatchedActions?: LogLevel;
    devToolsStatus?: LogLevel;
}
export declare function getLogType(options: Partial<StoreOptions>, definition: keyof LogDefinitions, defaultLevel: LogLevel): LogLevel;
//# sourceMappingURL=logging.d.ts.map