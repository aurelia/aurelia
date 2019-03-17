import {
  Tracer as DebugTracer,
  stringifyLifecycleFlags
} from '@aurelia/debug';
import {
  Tracer,
  ITraceInfo,
} from '@aurelia/kernel';
import {
  ISymbol,
  INodeSymbol,
  IAttributeSymbol
} from '@aurelia/jit';

const RuntimeTracer = { ...Tracer };
export function enableTracing(): void {
  Object.assign(Tracer, DebugTracer);
  Tracer.enabled = true;
}
export function disableTracing(): void {
  Tracer.flushAll(null);
  Object.assign(Tracer, RuntimeTracer);
  Tracer.enabled = false;
}

export const SymbolTraceWriter = {
  write(info: ITraceInfo): void {
    let output: string = '(';
    const params = info.params!;
    for (let i = 0, ii = params.length; i < ii; ++i) {
      const p = info.params![i];
      switch (typeof p) {
        case 'string':
        case 'boolean':
          output += p.toString();
          break;
        case 'number':
          output += p > 0 ? `flags=${stringifyLifecycleFlags(p)}` : '0';
          break;
        case 'object':
          if (p === null) {
            output += 'null';
          } else {
            if ((p as ISymbol).flags !== undefined) {
              const symbol = p as INodeSymbol | IAttributeSymbol;
              if ('target' in symbol) {
                //@ts-ignore
                output += `attr: ${symbol.target}=${symbol.rawValue}`;
              } else if ('interpolation' in symbol) {
                //@ts-ignore
                output += `text: "${symbol.physicalNode.textContent}"`;
              } else {
                //@ts-ignore
                output += `element: ${symbol.physicalNode.outerHTML}`;
              }
            } else {
              if ('outerHTML' in (p as HTMLElement)) {
                const el = p as HTMLElement;
                output += `${Object.getPrototypeOf(el).constructor.name}=${el.outerHTML}`;
              } else {
                output += `[Object ${Object.getPrototypeOf(p).constructor.name || 'anonymous'}]`;
              }
            }
          }
          break;
        case 'undefined':
          output += 'undefined';
          break;
        default:
          output += '?';
      }
      if (i + 1 < ii) {
        output += ', ';
      }
    }
    output += ')';
    console.debug(`${'  '.repeat(info.depth)}${info.objName}.${info.methodName} - ${output}`);
  }
};
