import { ITraceInfo, ITraceWriter, PLATFORM, Tracer as RuntimeTracer } from '@aurelia/kernel';

const marker: ITraceInfo = {
  name: 'marker',
  params: PLATFORM.emptyArray,
  depth: -1,
  prev: null,
  next: null
};
class TraceInfo implements ITraceInfo {
  public static head: ITraceInfo = marker;
  public static tail: ITraceInfo = marker;
  public static stack: ITraceInfo[] = [];

  public readonly name: string;
  public readonly depth: number;
  public params: unknown[] | null;
  public next: ITraceInfo | null;
  public prev: ITraceInfo | null;

  constructor(name: string, params: unknown[] | null) {
    this.name = name;
    this.depth = TraceInfo.stack.length;
    this.params = params;
    this.next = marker;
    this.prev = TraceInfo.tail;
    TraceInfo.tail.next = this;
    TraceInfo.tail = this;
    TraceInfo.stack.push(this);
  }

  public static reset(): void {
    let current = TraceInfo.head;
    let next = null;
    while (current !== null) {
      next = current.next;
      current.next = null;
      current.prev = null;
      current.params = null;
      current = next;
    }
    TraceInfo.head = marker;
    TraceInfo.tail = marker;
    TraceInfo.stack = [];
  }

  public static enter(name: string, params: unknown[] | null): ITraceInfo {
    return new TraceInfo(name, params);
  }

  public static leave(): ITraceInfo {
    return TraceInfo.stack.pop();
  }
}

export const Tracer: typeof RuntimeTracer = {
  ...RuntimeTracer,
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
   * @param name Any human-friendly name to identify the traced method with.
   * @param args Pass in `Array.prototype.slice.call(arguments)` to also trace the parameters, or `null` if this is not needed (to save memory/cpu)
   */
  enter(name: string, args: unknown[] | null): void {
    if (this.enabled) {
      const info = TraceInfo.enter(name, args);
      if (this.liveLoggingEnabled) {
        this.liveWriter.write(info);
      }
    }
  },
  /**
   * Call this at the end of a method/function. Pops one trace item off the stack.
   */
  leave(): void {
    if (this.enabled) {
      TraceInfo.leave();
    }
  },
  /**
   * Writes only the trace info leading up to the current method call.
   * @param writer An object to write the output to.
   */
  writeStack(writer: ITraceWriter): void {
    let i = 0;
    const stack = TraceInfo.stack;
    const len = stack.length;
    while (i < len) {
      writer.write(stack[i]);
      ++i;
    }
  },
  /**
   * Writes all trace info captured since the previous flushAll operation.
   * @param writer An object to write the output to. Can be null to simply reset the tracer state.
   */
  flushAll(writer: ITraceWriter | null): void {
    if (writer !== null) {
      let current = TraceInfo.head.next; // skip the marker
      while (current !== null && current !== marker) {
        writer.write(current);
        current = current.next;
      }
    }
    TraceInfo.reset();
  },
  /**
   * Writes out each trace info item as they are traced.
   * @param writer An object to write the output to.
   */
  enableLiveLogging(writer: ITraceWriter): void {
    this.liveLoggingEnabled = true;
    this.liveWriter = writer;
  },
  /**
   * Stops writing out each trace info item as they are traced.
   */
  disableLiveLogging(): void {
    this.liveLoggingEnabled = false;
    this.liveWriter = null;
  }
};
