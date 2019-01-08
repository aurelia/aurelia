import { ITraceInfo, PLATFORM, Tracer } from '@aurelia/kernel';
import { Tracer as DebugTracer } from '../../../../../debug/src/reporter';

export const TraceWriter = {
  write(info: ITraceInfo): void {
    console.debug(`${'  '.repeat(info.depth)}${info.name}`);
  }
};

const RuntimeTracer = { ...Tracer };
export function enableTracing() {
  Object.assign(Tracer, DebugTracer);
  Tracer.enabled = true;
}
export function disableTracing() {
  Tracer.flushAll(null);
  Object.assign(Tracer, RuntimeTracer);
  Tracer.enabled = false;
}
