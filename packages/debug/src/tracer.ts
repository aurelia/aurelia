import { ILiveLoggingOptions, ITraceInfo, ITraceWriter, PLATFORM, Reporter, Tracer } from '@aurelia/kernel';
import { IScope, LifecycleFlags } from '@aurelia/runtime';

const marker: ITraceInfo = {
  objName: 'marker',
  methodName: 'noop',
  params: PLATFORM.emptyArray,
  depth: -1,
  prev: null,
  next: null
};
class TraceInfo implements ITraceInfo {
  public static head: ITraceInfo = marker;
  public static tail: ITraceInfo = marker;
  public static stack: ITraceInfo[] = [];

  public readonly objName: string;
  public readonly methodName: string;
  public readonly depth: number;
  public params: unknown[] | null;
  public next: ITraceInfo | null;
  public prev: ITraceInfo | null;

  public constructor(objName: string, methodName: string, params: unknown[] | null) {
    this.objName = objName;
    this.methodName = methodName;
    this.depth = TraceInfo.stack.length;
    this.params = params;
    this.next = marker;
    this.prev = TraceInfo.tail;
    TraceInfo.tail.next = this;
    TraceInfo.tail = this;
    TraceInfo.stack.push(this);
  }

  public static reset(): void {
    let current: ITraceInfo | null = TraceInfo.head;
    let next = null;
    while (current != null) {
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

  public static enter(objName: string, methodName: string, params: unknown[] | null): ITraceInfo {
    return new TraceInfo(objName, methodName, params);
  }

  public static leave(): ITraceInfo {
    return TraceInfo.stack.pop() as ITraceInfo;
  }
}

export const DebugTracer: typeof Tracer = {
  ...Tracer,
  /**
   * A convenience property for the user to conditionally call the tracer.
   * This saves unnecessary `noop` and `slice` calls in non-AOT scenarios even if debugging is disabled.
   * In AOT these calls will simply be removed entirely.
   *
   * This property **only** turns on tracing if `@aurelia/debug` is included and configured as well.
   */
  enabled: false,
  liveLoggingEnabled: false,
  liveWriter: null!,
  /**
   * Call this at the start of a method/function.
   * Each call to `enter` **must** have an accompanying call to `leave` for the tracer to work properly.
   *
   * @param objName - Any human-friendly name to identify the traced object with.
   * @param methodName - Any human-friendly name to identify the traced method with.
   * @param args - Pass in `Array.prototype.slice.call(arguments)` to also trace the parameters, or `null` if this is not needed (to save memory/cpu)
   */
  enter(objName: string, methodName: string, args: unknown[] | null): void {
    if (this.enabled) {
      const info = TraceInfo.enter(objName, methodName, args);
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
   *
   * @param writer - An object to write the output to.
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
   *
   * @param writer - An object to write the output to. Can be null to simply reset the tracer state.
   */
  flushAll(writer: ITraceWriter | null): void {
    if (writer != null) {
      let current = TraceInfo.head.next; // skip the marker
      while (current != null && current !== marker) {
        writer.write(current);
        current = current.next;
      }
    }
    TraceInfo.reset();
  },
  enableLiveLogging,
  /**
   * Stops writing out each trace info item as they are traced.
   */
  disableLiveLogging(): void {
    this.liveLoggingEnabled = false;
    this.liveWriter = null!;
  }
};

const defaultOptions: ILiveLoggingOptions = Object.freeze({
  rendering: true,
  binding: true,
  observation: true,
  attaching: true,
  mounting: true,
  di: true,
  lifecycle: true,
  jit: true
});

/**
 * Writes out each trace info item as they are traced.
 *
 * @param writer - An object to write the output to.
 */
function enableLiveLogging(this: typeof DebugTracer, writer: ITraceWriter): void;
/**
 * Writes out each trace info item as they are traced.
 *
 * @param options - Optional. Specify which logging categories to output. If omitted, all will be logged.
 */
function enableLiveLogging(this: typeof DebugTracer, options?: ILiveLoggingOptions): void;
function enableLiveLogging(this: typeof DebugTracer, optionsOrWriter?: ILiveLoggingOptions | ITraceWriter): void {
  this.liveLoggingEnabled = true;
  if (optionsOrWriter && 'write' in optionsOrWriter) {
    this.liveWriter = optionsOrWriter;
  } else {
    const options = optionsOrWriter !== undefined ? optionsOrWriter : defaultOptions;
    this.liveWriter = createLiveTraceWriter(options);
  }
}

type Instance = {
  constructor?: {
    prototype: unknown;
    name: string;
    description?: {
      name: string;
    };
  };
};

const toString = Object.prototype.toString;
function flagsText(info: ITraceInfo, i: number = 0): string {
  if (info.params != null && info.params.length > i) {
    return stringifyLifecycleFlags(info.params[i] as LifecycleFlags);
  }
  return 'none';
}
function _ctorName(obj: Instance | undefined): string {
  let name: string;
  if (obj === undefined) {
    name = 'undefined';
  } else if (obj === null) {
    name = 'null';
  } else if (obj.constructor !== undefined) {
    if (obj.constructor.description) {
      name = `Resource{'${obj.constructor.description.name}'}`;
    } else {
      name = obj.constructor.name;
    }
  } else if (typeof obj === 'string') {
    name = `'${obj}'`;
  } else {
    name = toString.call(obj);
  }
  return name;
}
function ctorName(info: ITraceInfo, i: number = 0): string {
  if (info.params != null && info.params.length > i) {
    return _ctorName(info.params[i] as Instance);
  }
  return 'undefined';
}
function scopeText(info: ITraceInfo, i: number = 0): string {
  let $ctorName: string;
  if (info.params != null && info.params.length > i) {
    const $scope = info.params[i] as IScope | undefined;
    if ($scope != null && $scope.bindingContext != null) {
      $ctorName = _ctorName($scope.bindingContext as Instance);
    } else {
      $ctorName = 'undefined';
    }
    return `Scope{${$ctorName}}`;
  }
  return 'undefined';
}
function keyText(info: ITraceInfo, i: number = 0): string {
  if (info.params != null && info.params.length > i) {
    const $key = info.params[i] as object | undefined;
    if (typeof $key === 'string') {
      return `'${$key}'`;
    }
    if ($key !== undefined && Reflect.has($key, 'friendlyName')) {
      return ($key as Record<string, string>)['friendlyName'];
    }
    return _ctorName($key);
  }
  return 'undefined';
}
function primitive(info: ITraceInfo, i: number = 0): string {
  if (info.params != null && info.params.length > i) {
    const $key = info.params[i] as string | symbol | number;
    if (typeof $key === 'string') {
      return `'${$key}'`;
    }
    return $key.toString();
  }
  return 'undefined';
}

const RenderingArgsProcessor = {
  $hydrate(info: ITraceInfo): string {
    return flagsText(info);
  },
  render(info: ITraceInfo): string {
    return `${flagsText(info)},IDOM,IRenderContext,${ctorName(info, 3)}`;
  },
  addBinding(info: ITraceInfo): string {
    return `${ctorName(info)},${ctorName(info, 1)}`;
  },
  addComponent(info: ITraceInfo): string {
    return `${ctorName(info)},${ctorName(info, 1)}`;
  }
};

const BindingArgsProcessor = {
  $bind(info: ITraceInfo): string {
    return flagsText(info);
  },
  $unbind(info: ITraceInfo): string {
    return flagsText(info);
  },
  connect(info: ITraceInfo): string {
    return flagsText(info);
  },
  // currently only observers trace constructor calls but keep an eye on this if others are added, then we'd need additional filtering
  constructor(info: ITraceInfo): string {
    switch (info.objName) {
      case 'ArrayObserver':
      case 'MapObserver':
      case 'SetObserver':
        return flagsText(info);
      case 'SetterObserver':
      case 'SelfObserver':
        return `${flagsText(info)},${ctorName(info, 1)},${primitive(info, 2)}`;
      case 'ProxyObserver':
        return ctorName(info);
      case 'ProxySubscriberCollection':
      case 'DirtyCheckProperty':
        return `${ctorName(info, 1)},${primitive(info, 2)}`;
      case 'PrimitiveObserver':
      case 'PropertyAccessor':
        return `${ctorName(info)},${primitive(info, 1)}`;
      default:
        return '';
    }
  },
  lockedBind(info: ITraceInfo): string {
    return flagsText(info);
  },
  lockedUnbind(info: ITraceInfo): string {
    return flagsText(info);
  },
  InternalObserversLookup(info: ITraceInfo): string {
    return `${flagsText(info)},${ctorName(info, 1)},${primitive(info, 2)}`;
  },
  BindingContext(info: ITraceInfo): string {
    switch (info.methodName) {
      case 'get':
        return `${scopeText(info)},${primitive(info, 1)},${primitive(info, 2)},${flagsText(info, 3)}`;
      case 'getObservers':
        return flagsText(info);
      default:
        return 'unknown';
    }
  },
  Scope(info: ITraceInfo): string {
    switch (info.methodName) {
      case 'create':
        return `${flagsText(info)},${ctorName(info, 1)},${ctorName(info, 2)}`;
      case 'fromOverride':
        return `${flagsText(info)},${ctorName(info, 1)}`;
      case 'fromParent':
        return `${flagsText(info)},${scopeText(info, 1)},${ctorName(info, 2)}`;
      default:
        return 'unknown';
    }
  },
  OverrideContext(info: ITraceInfo): string {
    switch (info.methodName) {
      case 'create':
        return `${flagsText(info)},${ctorName(info, 1)},${ctorName(info, 2)}`;
      case 'getObservers':
        return '';
      default:
        return 'unknown';
    }
  }
};

const ObservationArgsProcessor = {
  callSource(info: ITraceInfo): string {
    const names: string[] = [];
    switch (info.objName) {
      case 'Listener':
        return ((info.params as readonly { type: string }[])[0]).type;
      case 'CallBinding':
        if (info.params != null) {
          for (let i = 0, ii = info.params.length; i < ii; ++i) {
            names.push(ctorName(info, i));
          }
        }
        return names.join(',');
      default:
        return 'unknown';
    }
  },
  setValue(info: ITraceInfo): string {
    let valueText: string;
    const value = (info.params as readonly unknown[])[0];
    switch (typeof value) {
      case 'undefined':
        valueText = 'undefined';
        break;
      case 'object':
        if (value === null) {
          valueText = 'null';
        } else {
          valueText = _ctorName(value);
        }
        break;
      case 'string':
        valueText = `'${value}'`;
        break;
      case 'number':
        valueText = value.toString();
        break;
      default:
        valueText = _ctorName(value as Instance);
    }
    return `${valueText},${flagsText(info, 1)}`;
  },
  flush(info: ITraceInfo): string {
    return flagsText(info);
  },
  handleChange(info: ITraceInfo): string {
    return `${primitive(info)},${primitive(info, 1)},${flagsText(info, 2)}`;
  },
  lockScope(info: ITraceInfo): string {
    return scopeText(info);
  }
};

const AttachingArgsProcessor = {
  $attach(info: ITraceInfo): string {
    return flagsText(info);
  },
  $detach(info: ITraceInfo): string {
    return flagsText(info);
  },
  $cache(info: ITraceInfo): string {
    return flagsText(info);
  },
  hold(info: ITraceInfo): string {
    return `Node{'${((info.params as readonly { textContent: string }[])[0]).textContent}'}`;
  },
  release(info: ITraceInfo): string {
    return flagsText(info);
  }
};

const MountingArgsProcessor = {
  $mount(info: ITraceInfo): string {
    return flagsText(info);
  },
  $unmount(info: ITraceInfo): string {
    return flagsText(info);
  },
  project(info: ITraceInfo): string {
    return ctorName(info);
  },
  take(info: ITraceInfo): string {
    return ctorName(info);
  }
};

const DIArgsProcessor = {
  construct(info: ITraceInfo): string {
    return ctorName(info);
  },
  Container(info: ITraceInfo): string {
    const names: string[] = [];
    switch (info.methodName) {
      case 'get':
      case 'getAll':
        return keyText(info);
      case 'register':
        if (info.params != null) {
          for (let i = 0, ii = info.params.length; i < ii; ++i) {
            names.push(keyText(info, i));
          }
        }
        return names.join(',');
      case 'createChild':
        return '';
      default:
        return 'unknown';
    }
  }
};

const LifecycleArgsProcessor = {
  Lifecycle(info: ITraceInfo): string {
    switch (info.methodName.slice(0, 3)) {
      case 'beg':
        return '';
      case 'enq':
        return ctorName(info);
      case 'end':
      case 'pro':
        return flagsText(info);
      default:
        return 'unknown';
    }
  },
  CompositionCoordinator(info: ITraceInfo): string {
    switch (info.methodName) {
      case 'enqueue':
        return 'IController';
      case 'swap':
        return `IController,${flagsText(info, 1)}`;
      case 'processNext':
        return '';
      default:
        return 'unknown';
    }
  },
  AggregateLifecycleTask(info: ITraceInfo): string {
    switch (info.methodName) {
      case 'addTask':
      case 'removeTask':
        return ctorName(info);
      case 'complete':
        return `${primitive(info, 2)}`;
      default:
        return 'unknown';
    }
  }
};

const JitArgsProcessor = {
  TemplateBinder(info: ITraceInfo): string {
    return ''; // TODO
  }
};

function createLiveTraceWriter(options: ILiveLoggingOptions): ITraceWriter {
  const Processors: Record<string, (info: ITraceInfo) => string> = {};
  if (options.rendering) {
    Object.assign(Processors, RenderingArgsProcessor);
  }
  if (options.binding) {
    Object.assign(Processors, BindingArgsProcessor);
  }
  if (options.observation) {
    Object.assign(Processors, ObservationArgsProcessor);
  }
  if (options.attaching) {
    Object.assign(Processors, AttachingArgsProcessor);
  }
  if (options.mounting) {
    Object.assign(Processors, MountingArgsProcessor);
  }
  if (options.di) {
    Object.assign(Processors, DIArgsProcessor);
  }
  if (options.lifecycle) {
    Object.assign(Processors, LifecycleArgsProcessor);
  }
  if (options.jit) {
    Object.assign(Processors, JitArgsProcessor);
  }

  return {
    write(info: ITraceInfo): void {
      let output: string;
      if (Processors[info.methodName] !== undefined) {
        output = Processors[info.methodName](info);
      } else if (Processors[info.objName] !== undefined) {
        output = Processors[info.objName](info);
      } else {
        return;
      }
      Reporter.write(10000, `${'-'.repeat(info.depth)}${info.objName}.${info.methodName}(${output})`);
    }
  };
}

export function stringifyLifecycleFlags(flags: LifecycleFlags): string {
  const flagNames: string[] = [];

  if (flags & LifecycleFlags.mustEvaluate) { flagNames.push('mustEvaluate'); }
  if (flags & LifecycleFlags.isCollectionMutation) { flagNames.push('isCollectionMutation'); }
  if (flags & LifecycleFlags.updateTargetInstance) { flagNames.push('updateTargetInstance'); }
  if (flags & LifecycleFlags.updateSourceExpression) { flagNames.push('updateSourceExpression'); }
  if (flags & LifecycleFlags.fromAsyncFlush) { flagNames.push('fromAsyncFlush'); }
  if (flags & LifecycleFlags.fromSyncFlush) { flagNames.push('fromSyncFlush'); }
  if (flags & LifecycleFlags.fromTick) { flagNames.push('fromTick'); }
  if (flags & LifecycleFlags.fromStartTask) { flagNames.push('fromStartTask'); }
  if (flags & LifecycleFlags.fromStopTask) { flagNames.push('fromStopTask'); }
  if (flags & LifecycleFlags.fromBind) { flagNames.push('fromBind'); }
  if (flags & LifecycleFlags.fromUnbind) { flagNames.push('fromUnbind'); }
  if (flags & LifecycleFlags.fromAttach) { flagNames.push('fromAttach'); }
  if (flags & LifecycleFlags.fromDetach) { flagNames.push('fromDetach'); }
  if (flags & LifecycleFlags.fromCache) { flagNames.push('fromCache'); }
  if (flags & LifecycleFlags.fromDOMEvent) { flagNames.push('fromDOMEvent'); }
  if (flags & LifecycleFlags.fromLifecycleTask) { flagNames.push('fromLifecycleTask'); }
  if (flags & LifecycleFlags.isTraversingParentScope) { flagNames.push('isTraversingParentScope'); }
  if (flags & LifecycleFlags.allowParentScopeTraversal) { flagNames.push('allowParentScopeTraversal'); }
  if (flags & LifecycleFlags.getterSetterStrategy) { flagNames.push('getterSetterStrategy'); }
  if (flags & LifecycleFlags.proxyStrategy) { flagNames.push('proxyStrategy'); }
  if (flags & LifecycleFlags.secondaryExpression) { flagNames.push('secondaryExpression'); }

  if (flagNames.length === 0) {
    return 'none';
  }
  return flagNames.join('|');
}
