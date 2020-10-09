
export interface ITraceInfo {
  readonly objName: string;
  readonly methodName: string;
  readonly depth: number;
  params: readonly unknown[] | null;
  next: ITraceInfo | null;
  prev: ITraceInfo | null;
}
export interface ITraceWriter {
  write(info: ITraceInfo): void;
}
export interface ILiveLoggingOptions {
  rendering?: boolean;
  binding?: boolean;
  observation?: boolean;
  attaching?: boolean;
  mounting?: boolean;
  di?: boolean;
  lifecycle?: boolean;
  jit?: boolean;
}
export const enum LogLevel {
  /**
   * The most detailed information about internal app state.
   *
   * Disabled by default and should never be enabled in a production environment.
   */
  trace = 0,
  /**
   * Information that is useful for debugging during development and has no long-term value.
   */
  debug = 1,
  /**
   * Information about the general flow of the application that has long-term value.
   */
  info = 2,
  /**
   * Unexpected circumstances that require attention but do not otherwise cause the current flow of execution to stop.
   */
  warn = 3,
  /**
   * Unexpected circumstances that cause the flow of execution in the current activity to stop but do not cause an app-wide failure.
   */
  error = 4,
  /**
   * Unexpected circumstances that cause an app-wide failure or otherwise require immediate attention.
   */
  fatal = 5,
  /**
   * No messages should be written.
   */
  none = 6,
}
export const Reporter = {
  level: LogLevel.warn,
  write(code: number, ...params: unknown[]): void { return; },
  error(code: number, ...params: unknown[]): Error { return new Error(`Code ${code}`); }
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
  liveWriter: null! as ITraceWriter,
  /**
   * Call this at the start of a method/function.
   * Each call to `enter` **must** have an accompanying call to `leave` for the tracer to work properly.
   *
   * @param objName - Any human-friendly name to identify the traced object with.
   * @param methodName - Any human-friendly name to identify the traced method with.
   * @param args - Pass in `Array.prototype.slice.call(arguments)` to also trace the parameters, or `null` if this is not needed (to save memory/cpu)
   */
  enter(objName: string, methodName: string, args: unknown[] | null): void { return; },
  /**
   * Call this at the end of a method/function. Pops one trace item off the stack.
   */
  leave(): void { return; },
  /**
   * Writes only the trace info leading up to the current method call.
   *
   * @param writer - An object to write the output to.
   */
  writeStack(writer: ITraceWriter): void { return; },
  /**
   * Writes all trace info captured since the previous flushAll operation.
   *
   * @param writer - An object to write the output to. Can be null to simply reset the tracer state.
   */
  flushAll(writer: ITraceWriter | null): void { return; },
  enableLiveLogging,
  /**
   * Stops writing out each trace info item as they are traced.
   */
  disableLiveLogging(): void { return; }
};

/**
 * Writes out each trace info item as they are traced.
 *
 * @param writer - An object to write the output to.
 */
function enableLiveLogging(writer: ITraceWriter): void;
/**
 * Writes out each trace info item as they are traced.
 *
 * @param options - Optional. Specify which logging categories to output. If omitted, all will be logged.
 */
function enableLiveLogging(options?: ILiveLoggingOptions): void;
function enableLiveLogging(optionsOrWriter?: ILiveLoggingOptions | ITraceWriter): void { return; }
