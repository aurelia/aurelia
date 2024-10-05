import { type IServiceLocator, Key, type Constructable, IDisposable, IContainer } from '@aurelia/kernel';
import { ITask } from '@aurelia/platform';
import { type ISubscriber, astEvaluate, type Scope } from '@aurelia/runtime';
import { type IBinding, type IRateLimitOptions } from './interfaces-bindings';
import { BindingBehavior, BindingBehaviorInstance } from '../resources/binding-behavior';
import { ValueConverter, ValueConverterInstance } from '../resources/value-converter';
import { addSignalListener, defineHiddenProp, removeSignalListener, tsPending } from '../utilities';
import { createInterface } from '../utilities-di';
import { PropertyBinding } from './property-binding';
import { ErrorNames, createMappedError } from '../errors';
import { ISignaler } from '../signaler';

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
export const mixinUseScope = /*@__PURE__*/(() => {
  function useScope<T extends { _scope?: Scope }>(this: T, scope: Scope) {
    this._scope = scope;
  }
  return <T extends { _scope?: Scope }>(target: Constructable<T>) => {
    defineHiddenProp(target.prototype, 'useScope', useScope);
  };
})();

/**
 * Turns a class into AST evaluator with support for value converter & binding behavior. For internal use only
 */
export const mixinAstEvaluator = /*@__PURE__*/(() => {
  type IHasServiceLocator = { l: IServiceLocator };

  class ResourceLookup {
    [key: string]: ValueConverterInstance | BindingBehaviorInstance;
  }

  const converterResourceLookupCache = new WeakMap<{ l: IServiceLocator }, Record<string, ValueConverterInstance>>();
  const behaviorResourceLookupCache = new WeakMap<{ l: IServiceLocator }, Record<string, BindingBehaviorInstance>>();
  const appliedBehaviors = new WeakMap<{ l: IServiceLocator }, Record<string, boolean>>();

  function evaluatorGet<T extends IHasServiceLocator>(this: T, key: Key) {
    return this.l.get(key);
  }
  function evaluatorGetBehavior<T extends IHasServiceLocator>(b: T, name: string) {
    let resourceLookup = behaviorResourceLookupCache.get(b);
    if (resourceLookup == null) {
      behaviorResourceLookupCache.set(b, resourceLookup = new ResourceLookup() as Record<string, BindingBehaviorInstance>);
    }
    return resourceLookup[name] ??= BindingBehavior.get(b.l, name);
  }
  function evaluatorBindBehavior<T extends IHasServiceLocator>(this: T, name: string, scope: Scope, args: unknown[]) {
    const behavior = evaluatorGetBehavior(this, name);
    if (behavior == null) {
      throw createMappedError(ErrorNames.ast_behavior_not_found, name);
    }

    let applied = appliedBehaviors.get(this);
    if (applied == null) {
      appliedBehaviors.set(this, applied = {});
    }
    if (applied[name]) {
      throw createMappedError(ErrorNames.ast_behavior_duplicated, name);
    }
    // todo: remove casting
    // there should be a base "mixinAstEvaluator" factory that takes parameters to handle behaviors/converters
    // so observation infra can be free of template oriented features: behaviors/converters
    // or anything that is not supposed to be supporting binding behavior shouldn't be using this mixin
    behavior.bind?.(scope, this as unknown as IBinding, ...args);
  }

  function evaluatorUnbindBehavior<T extends IHasServiceLocator>(this: T, name: string, scope: Scope) {
    const behavior = evaluatorGetBehavior(this, name);
    const applied = appliedBehaviors.get(this);

    // todo: remove casting
    // there should be a base "mixinAstEvaluator" factory that takes parameters to handle behaviors/converters
    // so observation infra can be free of template oriented features: behaviors/converters
    // or anything that is not supposed to be supporting binding behavior shouldn't be using this mixin
    behavior?.unbind?.(scope, this as unknown as IBinding);
    if (applied != null) {
      applied[name] = false;
    }
  }

  function evaluatorGetConverter<T extends IHasServiceLocator>(b: T, name: string) {
    let resourceLookup = converterResourceLookupCache.get(b);
    if (resourceLookup == null) {
      converterResourceLookupCache.set(b, resourceLookup = new ResourceLookup() as Record<string, ValueConverterInstance>);
    }
    return resourceLookup[name] ??= ValueConverter.get(b.l as IContainer, name);
  }
  function evaluatorBindConverter<T extends IHasServiceLocator>(this: T, name: string) {
    const vc = evaluatorGetConverter(this, name);
    if (vc == null) {
      throw createMappedError(ErrorNames.ast_converter_not_found, name);
    }
    const signals = vc.signals;
    if (signals != null) {
      const signaler = this.l.get(ISignaler);
      const ii = signals.length;
      let i = 0;
      for (; i < ii; ++i) {
        // note: the cast is expected. To connect, it just needs to be a IConnectable
        // though to work with signal, it needs to have `handleChange`
        // so having `handleChange` as a guard in the connectable as a safe measure is needed
        // to make sure signaler works
        signaler.addSignalListener(signals[i], this as unknown as ISubscriber);
      }
    }
  }

  function evaluatorUnbindConverter<T extends IHasServiceLocator>(this: T, name: string) {
    const vc = evaluatorGetConverter(this, name);
    if (vc?.signals === void 0) {
      return;
    }
    const signaler = this.l.get(ISignaler);
    let i = 0;
    for (; i < vc.signals.length; ++i) {
      signaler.removeSignalListener(vc.signals[i], this as unknown as ISubscriber);
    }
  }

  function evaluatorUseConverter<T extends IHasServiceLocator>(this: T, name: string, mode: 'toView' | 'fromView', value: unknown, args: unknown[]) {
    const vc = evaluatorGetConverter(this, name);
    if (vc == null) {
      throw createMappedError(ErrorNames.ast_converter_not_found, name);
    }
    switch (mode) {
      case 'toView':
        return 'toView' in vc ? vc.toView(value, ...args) : value;
      case 'fromView':
        return 'fromView' in vc ? vc.fromView?.(value, ...args) : value;
    }
  }

  return <T extends IHasServiceLocator>(target: Constructable<T>) => {
    const proto = target.prototype;
    defineHiddenProp(proto, 'get', evaluatorGet<T>);
    defineHiddenProp(proto, 'bindBehavior', evaluatorBindBehavior<T>);
    defineHiddenProp(proto, 'unbindBehavior', evaluatorUnbindBehavior<T>);
    defineHiddenProp(proto, 'bindConverter', evaluatorBindConverter<T>);
    defineHiddenProp(proto, 'unbindConverter', evaluatorUnbindConverter<T>);
    defineHiddenProp(proto, 'useConverter', evaluatorUseConverter<T>);
  };
})();

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

const flushItem = function (item: IFlushable, _: IFlushable, items: Set<IFlushable>) {
  items.delete(item);
  item.flush();
};

/**
 * A mixing for bindings to implement a set of default behvaviors for rate limiting their calls.
 *
 * For internal use only
 */
export const mixingBindingLimited = /*@__PURE__*/ (() => {
  const withLimitationBindings = new WeakSet<IBinding>();
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
        limiterTask = taskQueue.queueTask(callOriginalCallback, { delay: opts.delay });
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
          }, { delay: opts.delay - elapsed });
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

  return <T extends IBinding>(target: Constructable<T>, getMethodName: (binding: T, opts: IRateLimitOptions) => keyof T) => {
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
})();

export const createPrototypeMixer = ((mixed = new WeakSet<Constructable<IBinding>>()) => {
  return (mixer: () => void) => {
    return function<T extends Constructable<IBinding>>(this: T) {
      if (!mixed.has(this)) {
        mixed.add(this);
        mixer.call(this);
      }
    };
  };
})();
