export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["error"] = 0] = "error";
    LogLevel[LogLevel["warn"] = 1] = "warn";
    LogLevel[LogLevel["info"] = 2] = "info";
    LogLevel[LogLevel["debug"] = 3] = "debug";
})(LogLevel || (LogLevel = {}));
export const Reporter = {
    level: 1 /* warn */,
    write(code, ...params) { return; },
    error(code, ...params) { return new Error(`Code ${code}`); }
};
export const Tracer = {
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
//# sourceMappingURL=reporter.js.map