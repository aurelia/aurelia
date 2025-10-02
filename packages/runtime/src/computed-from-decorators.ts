import { isArray, isMap, isObject, isSet, isString } from '@aurelia/kernel';
import { createMappedError, ErrorNames } from './errors';
import { AccessorType, atObserver, IConnectable, IObserver, ISubscriber, ISubscriberCollection, ISubscriberRecord } from './interfaces';
import { IObserverLocator } from './observer-locator';
import { queueTask } from './queue';
import { subscriberCollection } from './subscriber-collection';
import { rtObjectAssign } from './utilities';
import { unwrap } from './proxy-observation';

type ClassGetterFunction<T> = (target: () => unknown, context: ClassGetterDecoratorContext<T>) => void;

/**
 * Decorate a getter to configure various aspects of the computed property created by the getter.
 *
 * Example usage:
 *
 * ```ts
 * export class MyElement {
 *  \@computedFrom('value')
 *   private value = 1;
 *   public get prop(): number {
 *     return this.value;
 *   }
 * }
 * ```
 */
export function computedFrom<TThis extends object>(...dependencies: (keyof TThis)[]): ClassGetterFunction<TThis>;
export function computedFrom<TThis extends object>(...dependencies: (string | symbol)[]): ClassGetterFunction<TThis>;
export function computedFrom<TThis extends object>(config: {
  dependencies: (keyof TThis)[];
  flush?: 'sync' | 'async';
  deep?: boolean;
}): ClassGetterFunction<TThis>;
export function computedFrom<TThis extends object>(config: {
  dependencies: (string | symbol)[];
  flush?: 'sync' | 'async';
  deep?: boolean;
}): ClassGetterFunction<TThis>;
export function computedFrom<
  TThis extends object
>(
  args: (keyof TThis) | (string | symbol) | {
    dependencies: (keyof TThis | (string | symbol))[];
    flush?: 'sync' | 'async';
    deep?: boolean;
  },
  ...rest: (keyof TThis | string | symbol)[]
) {
  if (!ComputedFromObserver.mixed) {
    ComputedFromObserver.mixed = true;
    subscriberCollection(ComputedFromObserver, null!);
  }
  const cache = new WeakMap<object, ComputedFromObserver>();

  const options: {
    flush?: 'sync' | 'async';
    deep?: boolean;
  } = (isObject(args) && !isArray(args)) ? args : {};
  const dependencies = (isObject(args) && !isArray(args)) ? args.dependencies : [args, ...rest];

  return function decorator(
    target: () => unknown,
    context: ClassGetterDecoratorContext<TThis>
  ) {
    if (context.kind !== 'getter') {
      throw createMappedError(ErrorNames.computedFrom_not_getter, context.name);
    }

    function getObsever(obj: TThis, requestor?: null): IObserver | null;
    function getObsever(obj: TThis, requestor: IObserverLocator): IObserver;
    function getObsever(obj: TThis, requestor?: IObserverLocator | null): IObserver | null {
      let observer = cache.get(obj);

      if (observer == null) {
        if (requestor == null) {
          return null;
        }

        observer = new ComputedFromObserver(
          obj,
          target,
          requestor,
          dependencies as (string | symbol)[],
          options.flush ?? 'async',
          options.deep === true
        );
        cache.set(obj, observer);
      }

      return observer;
    }

    return rtObjectAssign(function (this: TThis) {
      const observer = getObsever(this, null);
      return observer == null ? target.call(this) : observer.getValue();
    }, {
      getObserver(obj: TThis, requestor: IObserverLocator): IObserver {
        return getObsever(obj, requestor);
      }
    });
  };
}

/* eslint-disable @typescript-eslint/no-unused-vars */
function testComputed() {

  // normal usages
  class MyClass {
    private readonly value = 1;
    public v = 1;
    public valueee = 2;
    @computedFrom('prop2')
    public get prop2(): number {
      return 2;
    }

    @computedFrom({ dependencies: ['prop2'], flush: 'async' })
    public get prop3(): number {
      return 2;
    }
  }
}

class ComputedFromObserver implements IObserver, ISubscriberCollection {
  /** @internal */
  public static mixed = false;
  /** @internal */
  public subs!: ISubscriberRecord<ISubscriber>;

  public type: AccessorType = atObserver;
  public doNotCache?: boolean | undefined;
  /** @internal */
  private _value: unknown = void 0;
  private readonly _observers: IObserver[] = [];
  /** @internal */
  private _queued = false;
  /** @internal */
  private _started = false;

  public constructor(
    private readonly obj: object,
    private readonly getter: () => unknown,
    private readonly oL: IObserverLocator,
    private readonly dependencies: (string | symbol)[],
    private readonly flush: 'sync' | 'async',
    private readonly deep: boolean
  ) {
  }

  public getValue(): unknown {
    if (!this._started) {
      return this._eval();
    }
    return this._value;
    // return this._evalCount === -1 ? this.getter.call(this.obj) : this._value;
  }

  public setValue(_newValue: unknown): void {
    throw new Error(`Computed property is read-only.`);
  }

  public handleChange(): void {
    if (this.flush === 'sync') {
      this._doFlush();
      return;
    }

    if (this._queued) {
      return;
    }
    this._queued = true;
    queueTask(() => {
      this._queued = false;
      this._doFlush();
    });
  }

  public handleCollectionChange(): void {
    if (this.flush === 'sync') {
      this._doFlush();
      return;
    }

    if (this._queued) {
      return;
    }
    this._queued = true;
    queueTask(() => {
      this._queued = false;
      this._doFlush();
    });
  }

  /** @internal */
  private _eval() {
    return this.getter.call(this.obj);
  }

  /** @internal */
  private _doFlush() {
    if (!this._started) {
      return;
    }

    const oldValue = this._value;
    const value = this._eval();

    this._stop();
    this._observe();

    if (oldValue === value) {
      return;
    }

    this._value = value;
    this.subs.notify(value, oldValue);
  }

  /** @internal */
  private _observe() {
    const observers = this._observers;
    this.dependencies.forEach(dep => {
      let obs: IObserver = isString(dep)
        ? this.oL.getExpressionObserver(this.obj, dep)
        : this.oL.getObserver(this.obj, dep);
      observers.push(obs);
      obs.subscribe(this);
      obs.useFlush?.(this.flush);

      if (this.deep) {
        obs = observeDeep(obs.getValue(), this.oL);
        observers.push(obs);
        obs.subscribe(this);
        obs.useFlush?.(this.flush);
      }
    });
  }

  /** @internal */
  private _stop() {
    this._observers.forEach(obs => {
      obs.unsubscribe(this);
    });
    this._observers.length = 0;
  }

  public subscribe(subscriber: ISubscriber): void {
    if (this.subs.add(subscriber) && this.subs.count === 1) {
      this._observe();
      this._started = true;
      this._value = this._eval();
    }
  }

  public unsubscribe(subscriber: ISubscriber): void {
    if (this.subs.remove(subscriber) && this.subs.count === 0) {
      this._stop();
      this._started = false;
      this._value = void 0;
    }
  }
}

function observeDeep(obj: unknown, requestor: IObserverLocator) {
  function walk(obj: unknown, connectable: IConnectable) {
    const raw = unwrap(obj);

    if (!isObject(raw)) {
      return;
    }

    if (isArray(raw)) {
      connectable.observeCollection(raw);
      for (let i = 0; i < raw.length; i++) {
        walk(raw[i], connectable);
      }
      return;
    }

    if (isMap(raw)) {
      connectable.observeCollection(raw);
      for (const [k, v] of raw) {
        walk(k, connectable);
        walk(v, connectable);
      }
      return;
    }

    if (isSet(raw)) {
      connectable.observeCollection(raw);
      for (const v of raw) {
        walk(v, connectable);
      }
      return;
    }

    for (const key of Object.keys(raw)) {
      connectable.observe(raw, key);
      walk((raw as Record<string, unknown>)[key], connectable);
    }
  }

  return requestor.getObserver(obj, ((obj, connectable) => {
    walk(obj, connectable);
  }));
}
