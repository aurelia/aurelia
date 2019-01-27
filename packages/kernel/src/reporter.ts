
export interface ITraceInfo {
  readonly objName: string;
  readonly methodName: string;
  readonly depth: number;
  params: ReadonlyArray<unknown> | null;
  next: ITraceInfo | null;
  prev: ITraceInfo | null;
}
export interface ITraceWriter {
  write(info: ITraceInfo): void;
}
export const Reporter = {
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
  liveWriter: null as ITraceWriter,
  /**
   * Call this at the start of a method/function.
   * Each call to `enter` **must** have an accompanying call to `leave` for the tracer to work properly.
   * @param objName Any human-friendly name to identify the traced object with.
   * @param methodName Any human-friendly name to identify the traced method with.
   * @param args Pass in `Array.prototype.slice.call(arguments)` to also trace the parameters, or `null` if this is not needed (to save memory/cpu)
   */
  enter(objName: string, methodName: string, args: unknown[] | null): void { return; },
  /**
   * Call this at the end of a method/function. Pops one trace item off the stack.
   */
  leave(): void { return; },
  /**
   * Writes only the trace info leading up to the current method call.
   * @param writer An object to write the output to.
   */
  writeStack(writer: ITraceWriter): void { return; },
  /**
   * Writes all trace info captured since the previous flushAll operation.
   * @param writer An object to write the output to. Can be null to simply reset the tracer state.
   */
  flushAll(writer: ITraceWriter | null): void { return; },
  /**
   * Writes out each trace info item as they are traced.
   * @param writer An object to write the output to.
   */
  enableLiveLogging(writer: ITraceWriter): void { return; },
  /**
   * Stops writing out each trace info item as they are traced.
   */
  disableLiveLogging(): void { return; }
};
