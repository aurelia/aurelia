export var LogLevel;
(function (LogLevel) {
    LogLevel["trace"] = "trace";
    LogLevel["debug"] = "debug";
    LogLevel["info"] = "info";
    LogLevel["warn"] = "warn";
    LogLevel["error"] = "error";
})(LogLevel || (LogLevel = {}));
export function getLogType(options, definition, defaultLevel) {
    var _a;
    // eslint-disable-next-line no-prototype-builtins
    if (((_a = options.logDefinitions) === null || _a === void 0 ? void 0 : _a.hasOwnProperty(definition)) &&
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        options.logDefinitions[definition] &&
        Object.values(LogLevel).includes(options.logDefinitions[definition])) {
        return options.logDefinitions[definition];
    }
    return defaultLevel;
}
//# sourceMappingURL=logging.js.map