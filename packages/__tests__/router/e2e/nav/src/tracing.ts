import { ITraceInfo, Tracer } from '@aurelia/kernel';
import { DebugTracer } from '../../../../../debug/src/tracer';

export const TraceWriter = {
  write(info: ITraceInfo): void {
    console.debug(`${'  '.repeat(info.depth)}${info.objName}.${info.methodName}`);
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
