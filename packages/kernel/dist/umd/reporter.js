(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var LogLevel;
    (function (LogLevel) {
        /**
         * The most detailed information about internal app state.
         *
         * Disabled by default and should never be enabled in a production environment.
         */
        LogLevel[LogLevel["trace"] = 0] = "trace";
        /**
         * Information that is useful for debugging during development and has no long-term value.
         */
        LogLevel[LogLevel["debug"] = 1] = "debug";
        /**
         * Information about the general flow of the application that has long-term value.
         */
        LogLevel[LogLevel["info"] = 2] = "info";
        /**
         * Unexpected circumstances that require attention but do not otherwise cause the current flow of execution to stop.
         */
        LogLevel[LogLevel["warn"] = 3] = "warn";
        /**
         * Unexpected circumstances that cause the flow of execution in the current activity to stop but do not cause an app-wide failure.
         */
        LogLevel[LogLevel["error"] = 4] = "error";
        /**
         * Unexpected circumstances that cause an app-wide failure or otherwise require immediate attention.
         */
        LogLevel[LogLevel["fatal"] = 5] = "fatal";
        /**
         * No messages should be written.
         */
        LogLevel[LogLevel["none"] = 6] = "none";
    })(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
    exports.Reporter = {
        level: 3 /* warn */,
        write(code, ...params) { return; },
        error(code, ...params) { return new Error(`Code ${code}`); }
    };
    exports.Tracer = {
        /**
         * A convenience property for the user to conditionally call the tracer.
         * This saves unnecessary `noop` and `slice` calls in non-AOT scenarios even if debugging is disabled.
         * In AOT these calls will simply be removed entirely.
         *
         * This property **only** turns on tracing if `@aurelia/debug` is included and configured as well.
         */
        enabled: false,
        liveLoggingEnabled: false,
        liveWriter: null,
        /**
         * Call this at the start of a method/function.
         * Each call to `enter` **must** have an accompanying call to `leave` for the tracer to work properly.
         *
         * @param objName - Any human-friendly name to identify the traced object with.
         * @param methodName - Any human-friendly name to identify the traced method with.
         * @param args - Pass in `Array.prototype.slice.call(arguments)` to also trace the parameters, or `null` if this is not needed (to save memory/cpu)
         */
        enter(objName, methodName, args) { return; },
        /**
         * Call this at the end of a method/function. Pops one trace item off the stack.
         */
        leave() { return; },
        /**
         * Writes only the trace info leading up to the current method call.
         *
         * @param writer - An object to write the output to.
         */
        writeStack(writer) { return; },
        /**
         * Writes all trace info captured since the previous flushAll operation.
         *
         * @param writer - An object to write the output to. Can be null to simply reset the tracer state.
         */
        flushAll(writer) { return; },
        enableLiveLogging,
        /**
         * Stops writing out each trace info item as they are traced.
         */
        disableLiveLogging() { return; }
    };
    function enableLiveLogging(optionsOrWriter) { return; }
});
//# sourceMappingURL=reporter.js.map