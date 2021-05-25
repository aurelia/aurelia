"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogType = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["trace"] = "trace";
    LogLevel["debug"] = "debug";
    LogLevel["info"] = "info";
    LogLevel["warn"] = "warn";
    LogLevel["error"] = "error";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
function getLogType(options, definition, defaultLevel) {
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
exports.getLogType = getLogType;
//# sourceMappingURL=logging.js.map