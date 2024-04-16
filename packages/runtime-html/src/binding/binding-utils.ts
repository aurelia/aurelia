import { type IServiceLocator, Key, type Constructable, IDisposable, IContainer } from '@aurelia/kernel';
import { ITask } from '@aurelia/platform';
import { Scope, type ISubscriber } from '@aurelia/runtime';
import { astEvaluate } from './ast.eval';
import { type IBinding, type IRateLimitOptions } from './interfaces-bindings';
import { BindingBehavior, BindingBehaviorInstance } from '../resources/binding-behavior';
import { ValueConverter, ValueConverterInstance } from '../resources/value-converter';
import { addSignalListener, def, defineHiddenProp, removeSignalListener, tsPending } from '../utilities';
import { createInterface } from '../utilities-di';
import { PropertyBinding } from './property-binding';
import { ErrorNames, createMappedError } from '../errors';
import { ISignaler } from './signaler';

/**
 * A subscriber that is used for subcribing to target observer & invoking `updateSource` on a binding
 */
export class BindingTargetSubscriber implements ISubscriber {
  /** @internal */
  private readonly b: PropertyBinding;
  // flush queue is a way to handle the notification order in a synchronous change notification system
  // without a flush queue, changes are notified depth first
  // with    a flush queue, changes are notified breadth first
  //
  // though we are only queueing target->source direction and that's already enough to prevent such issues
  /** @internal */
  private readonly _flushQueue: IFlushQueue;
  /** @internal */
  private _value: unknown = void 0;

  public constructor(
    b: PropertyBinding,
    // flush queue is a way to handle the notification order in a synchronous change notification system
    // without a flush queue, changes are notified depth first
    // with    a flush queue, changes are notified breadth first
    flushQueue: IFlushQueue,
  ) {
    this.b = b;
    this._flushQueue = flushQueue;
  }

  public flush() {
    this.b.updateSource(this._value);
  }

  // deepscan-disable-next-line
  public handleChange(value: unknown, _: unknown): void {
    const b = this.b;
    if (value !== astEvaluate(b.ast, b._scope!, b, null)) {
      this._value = value;
      this._flushQueue.add(this);
    }
  }
}

/**
 * Implement method `useScope` in a common way for a binding. For internal use only for size saving.
 */
export const mixinUseScope = <T extends { _scope?: Scope }>(target: Constructable<T>) => {
  defineHiddenProp(target.prototype, 'useScope', useScope);
};

/**
 * Turns a class into AST evaluator. For internal use only
 *
 * @param strict - whether the evaluation of AST nodes will be in strict mode
 */
export const mixinAstEvaluator = (strict?: boolean | undefined, strictFnCall = true) => {
  return <T extends { l: IServiceLocator }>(target: Constructable<T>) => {
    const proto = target.prototype;
    // some evaluator may have their strict configurable in some way
    // undefined to leave the property alone
    if (strict != null) {
      def(proto, 'strict', { enumerable: true, get: function () { return strict; } });
    }
    def(proto, 'strictFnCall', { enumerable: true, get: function () { return strictFnCall; } });
    defineHiddenProp(proto, 'get', evaluatorGet<T>);
    defineHiddenProp(proto, 'getSignaler', evaluatorGetSignaler<T>);
    defineHiddenProp(proto, 'getConverter', evaluatorGetConverter<T>);
    defineHiddenProp(proto, 'getBehavior', evaluatorGetBehavior<T>);
  };
};

const converterResourceLookupCache = new WeakMap<{ l: IServiceLocator }, ResourceLookup>();
const behaviorResourceLookupCache = new WeakMap<{ l: IServiceLocator }, ResourceLookup>();
class ResourceLookup {
  [key: string]: ValueConverterInstance | BindingBehaviorInstance;
}

export interface IFlushable {
  flush(): void;
}

export const IFlushQueue = /*@__PURE__*/createInterface<IFlushQueue>('IFlushQueue', x => x.singleton(FlushQueue));
export interface IFlushQueue {
  get count(): number;
  add(flushable: IFlushable): void;
}

export class FlushQueue implements IFlushQueue {
  /** @internal */
  private _flushing: boolean = false;
  /** @internal */
  private readonly _items: Set<IFlushable> = new Set();

  public get count(): number {
    return this._items.size;
  }

  public add(flushable: IFlushable): void {
    this._items.add(flushable);
    if (this._flushing) {
      return;
    }
    this._flushing = true;
    try {
      this._items.forEach(flushItem);
    } finally {
      this._flushing = false;
    }
  }

  public clear(): void {
    this._items.clear();
    this._flushing = false;
  }
}

type IHasServiceLocator = { l: IServiceLocator };
function useScope<T extends { _scope?: Scope }>(this: T, scope: Scope) {
  this._scope = scope;
}
function evaluatorGet<T extends IHasServiceLocator>(this: T, key: Key) {
  return this.l.get(key);
}
function evaluatorGetSignaler<T extends IHasServiceLocator>(this: T) {
  return this.l.root.get(ISignaler);
}
function evaluatorGetConverter<T extends IHasServiceLocator>(this: T, name: string) {
  let resourceLookup = converterResourceLookupCache.get(this);
  if (resourceLookup == null) {
    converterResourceLookupCache.set(this, resourceLookup = new ResourceLookup());
  }
  return resourceLookup[name] ??= ValueConverter.get(this.l as IContainer, name);
}
function evaluatorGetBehavior<T extends IHasServiceLocator>(this: T, name: string) {
  let resourceLookup = behaviorResourceLookupCache.get(this);
  if (resourceLookup == null) {
    behaviorResourceLookupCache.set(this, resourceLookup = new ResourceLookup());
  }
  return resourceLookup[name] ??= BindingBehavior.get(this.l, name);
}

function flushItem(item: IFlushable, _: IFlushable, items: Set<IFlushable>) {
  items.delete(item);
  item.flush();
}

const withLimitationBindings = new WeakSet<IBinding>();
/**
 * A mixing for bindings to implement a set of default behvaviors for rate limiting their calls.
 *
 * For internal use only
 */
export const mixingBindingLimited = <T extends IBinding>(target: Constructable<T>, getMethodName: (binding: T, opts: IRateLimitOptions) => keyof T) => {
  defineHiddenProp(target.prototype, 'limit', function (this: T, opts: IRateLimitOptions) {
    if (withLimitationBindings.has(this)) {
      throw createMappedError(ErrorNames.binding_already_has_rate_limited);
    }
    withLimitationBindings.add(this);
    const prop = getMethodName(this, opts);
    const signals = opts.signals;
    const signaler = signals.length > 0 ? this.get(ISignaler) : null;
    const originalFn = this[prop] as unknown as (...args: unknown[]) => unknown;
    const callOriginal = (...args: unknown[]) => originalFn.call(this, ...args);
    const limitedFn = opts.type === 'debounce'
      ? debounced(opts, callOriginal, this)
      : throttled(opts, callOriginal, this);
    const signalListener = signaler ? { handleChange: limitedFn.flush } : null;
    this[prop] = limitedFn as unknown as typeof this[typeof prop];
    if (signaler) {
      signals.forEach(s => addSignalListener(signaler, s, signalListener!));
    }

    return {
      dispose: () => {
        if (signaler) {
          signals.forEach(s => removeSignalListener(signaler, s, signalListener!));
        }
        withLimitationBindings.delete(this);
        limitedFn.dispose();
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete this[prop];
      }
    };
  });
};

/**
 * A helper for creating rated limited functions for binding. For internal use only
 */
const debounced = <T extends (v?: unknown) => unknown>(opts: IRateLimitOptions, callOriginal: T, binding: IBinding): LimiterHandle => {
  let limiterTask: ITask | undefined;
  let task: ITask | undefined;
  let latestValue: unknown;
  let isPending = false;
  const taskQueue = opts.queue;
  const callOriginalCallback = () => callOriginal(latestValue);
  const fn = (v: unknown) => {
    latestValue = v;
    if (binding.isBound) {
      task = limiterTask;
      limiterTask = taskQueue.queueTask(callOriginalCallback, { delay: opts.delay, reusable: false });
      task?.cancel();
    } else {
      callOriginalCallback();
    }
  };
  const dispose = fn.dispose = () => {
    task?.cancel();
    limiterTask?.cancel();
    task = limiterTask = void 0;
  };
  fn.flush = () => {
    // only call callback when there's actually task being queued
    isPending = limiterTask?.status === tsPending;
    dispose();
    if (isPending) {
      callOriginalCallback();
    }
  };

  return fn;
};

/**
 * A helper for creating rated limited functions for binding. For internal use only
 */
const throttled = <T extends (v?: unknown) => unknown>(opts: IRateLimitOptions, callOriginal: T, binding: IBinding): LimiterHandle => {
  let limiterTask: ITask | undefined;
  let task: ITask | undefined;
  let last: number = 0;
  let elapsed = 0;
  let latestValue: unknown;
  let isPending = false;
  const taskQueue = opts.queue;
  const now = () => opts.now();
  const callOriginalCallback = () => callOriginal(latestValue);
  const fn = (v: unknown) => {
    latestValue = v;
    if (binding.isBound) {
      elapsed = now() - last;
      task = limiterTask;
      if (elapsed > opts.delay) {
        last = now();
        callOriginalCallback();
      } else {
        // Queue the new one before canceling the old one, to prevent early yield
        limiterTask = taskQueue.queueTask(() => {
          last = now();
          callOriginalCallback();
        }, { delay: opts.delay - elapsed, reusable: false });
      }
      task?.cancel();
    } else {
      callOriginalCallback();
    }
  };
  const dispose = fn.dispose = () => {
    task?.cancel();
    limiterTask?.cancel();
    task = limiterTask = void 0;
  };
  fn.flush = () => {
    // only call callback when there's actually task being queued
    isPending = limiterTask?.status === tsPending;
    dispose();
    if (isPending) {
      callOriginalCallback();
    }
  };
  return fn;
};

type LimiterHandle = IDisposable & {
  (v: unknown, oV?: unknown): void;
  flush(): void;
};
