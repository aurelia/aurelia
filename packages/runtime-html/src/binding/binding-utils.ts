import { IDisposable, IServiceLocator, Key, Writable, type Constructable } from '@aurelia/kernel';
import { ITask } from '@aurelia/platform';
import { astEvaluate, BindingBehaviorInstance, IBinding, IRateLimitOptions, ISignaler, Scope, type ISubscriber, type ValueConverterInstance } from '@aurelia/runtime';
import { BindingBehavior } from '../resources/binding-behavior';
import { ValueConverter } from '../resources/value-converter';
import { createError, def, defineHiddenProp } from '../utilities';
import { createInterface, resource } from '../utilities-di';
import { PropertyBinding } from './property-binding';

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
    if (value !== astEvaluate(b.ast, b.scope!, b, null)) {
      this._value = value;
      this._flushQueue.add(this);
    }
  }
}

/**
 * Implement method `useScope` in a common way for a binding. For internal use only for size saving.
 */
export const mixinBindingUseScope = <T extends IBinding>(target: Constructable<T>) => {
  defineHiddenProp(target.prototype, 'useScope', function (this: IBinding, scope: Scope) {
    (this as Writable<T>).scope = scope;
  });
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
    defineHiddenProp(proto, 'get', function (this: T, key: Key) {
      return this.l.get(key);
    });
    defineHiddenProp(proto, 'getSignaler', function (this: T) {
      return this.l.root.get(ISignaler);
    });
    defineHiddenProp(proto, 'getConverter', function (this: T, name: string) {
      const key = ValueConverter.keyFrom(name);
      let resourceLookup = resourceLookupCache.get(this);
      if (resourceLookup == null) {
        resourceLookupCache.set(this, resourceLookup = new ResourceLookup());
      }
      return resourceLookup[key] ??= this.l.get<ValueConverterInstance>(resource(key));
    });
    defineHiddenProp(proto, 'getBehavior', function (this: T, name: string) {
      const key = BindingBehavior.keyFrom(name);
      let resourceLookup = resourceLookupCache.get(this);
      if (resourceLookup == null) {
        resourceLookupCache.set(this, resourceLookup = new ResourceLookup());
      }
      return resourceLookup[key] ??= this.l.get<BindingBehaviorInstance>(resource(key));
    });
  };
};

const resourceLookupCache = new WeakMap<{ l: IServiceLocator }, ResourceLookup>();
class ResourceLookup {
  [key: string]: ValueConverterInstance | BindingBehaviorInstance;
}

export interface IFlushable {
  flush(): void;
}

export const IFlushQueue = createInterface<IFlushQueue>('IFlushQueue', x => x.singleton(FlushQueue));
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
      throw createError(`AURXXXX: a rate limit has already been applied.`);
    }
    withLimitationBindings.add(this);
    const prop = getMethodName(this, opts);
    const originalFn = this[prop] as unknown as (...args: unknown[]) => unknown;
    const callOriginal = (...args: unknown[]) => originalFn.call(this, ...args);
    const limitedFn = opts.type === 'debounce'
      ? debounced(opts, callOriginal, this)
      : throttled(opts, callOriginal, this);
    this[prop] = limitedFn as unknown as typeof this[typeof prop];

    return {
      dispose: () => {
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
 *
 * @param startCounter - indicate at what call number the debounce effect should happens
 * Some bindings calls the debounced method during bind cycle, but that shouldn't be counted as the start of debounce
 */
const debounced = <T extends (v?: unknown) => unknown>(opts: IRateLimitOptions, callOriginal: T, binding: IBinding) => {
  let limiterTask: ITask | undefined;
  let task: ITask | undefined;
  let latestValue: unknown;
  const taskQueue = opts.queue;
  const fn = (v: unknown) => {
    latestValue = v;
    if (binding.isBound) {
      task = limiterTask;
      limiterTask = taskQueue.queueTask(() => callOriginal(latestValue), { delay: opts.delay, reusable: false });
      task?.cancel();
    } else {
      callOriginal(latestValue);
    }
  };
  fn.dispose = () => {
    task?.cancel();
    limiterTask?.cancel();
  };

  return fn as unknown as T & IDisposable;
};

/**
 * A helper for creating rated limited functions for binding. For internal use only
 */
const throttled = <T extends (v?: unknown) => unknown>(opts: IRateLimitOptions, callOriginal: T, binding: IBinding) => {
  let limiterTask: ITask | undefined;
  let task: ITask | undefined;
  let last: number = 0;
  let elapsed = 0;
  let latestValue: unknown;
  const taskQueue = opts.queue;
  const now = () => opts.now();
  // const callOriginal = () => originalFn.call(context, latestValue);
  const fn = (v: unknown) => {
    latestValue = v;
    if (binding.isBound) {
      elapsed = now() - last;
      task = limiterTask;
      if (elapsed > opts.delay) {
        last = now();
        callOriginal(latestValue);
      } else {
        // Queue the new one before canceling the old one, to prevent early yield
        limiterTask = taskQueue.queueTask(() => {
          last = now();
          callOriginal(latestValue);
        }, { delay: opts.delay - elapsed, reusable: false });
      }
      task?.cancel();
    } else {
      callOriginal(latestValue);
    }
  };
  fn.dispose = () => {
    task?.cancel();
    limiterTask?.cancel();
  };
  return fn as unknown as T & IDisposable;
};
