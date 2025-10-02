import { isArray, isObject, isString } from '@aurelia/kernel';
import { createMappedError, ErrorNames } from './errors';
import { AccessorType, atObserver, IObserver, ISubscriber, ISubscriberCollection, ISubscriberRecord } from './interfaces';
import { IObserverLocator } from './observer-locator';
import { queueTask } from './queue';
import { subscriberCollection } from './subscriber-collection';

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
  options?: { flush?: 'sync' | 'async' };
}): ClassGetterFunction<TThis>;
export function computedFrom<TThis extends object>(config: {
  dependencies: (string | symbol)[];
  options?: { flush?: 'sync' | 'async' };
}): ClassGetterFunction<TThis>;
export function computedFrom<
  TThis extends object
>(
  args: (keyof TThis) | (string | symbol) | {
    dependencies: (keyof TThis | (string | symbol))[];
    options?: { flush?: 'sync' | 'async' };
  },
  ...rest: (keyof TThis | string | symbol)[]
) {
  if (!ComputedFromObserver.mixed) {
    ComputedFromObserver.mixed = true;
    subscriberCollection(ComputedFromObserver, null!);
  }
  const cache = new WeakMap<object, ComputedFromObserver>();

  const options = (isObject(args) && !isArray(args)) ? args.options : {} as const;
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
          options?.flush ?? 'async'
        );
        cache.set(obj, observer);
      }

      return observer;
    }

    return Object.assign(function (this: TThis) {
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

    @computedFrom({ dependencies: ['prop2'], options: { flush: 'async' } })
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
  private _observers: IObserver[] = [];
  /** @internal */
  private _queued = false;

  public constructor(
    private readonly obj: object,
    private readonly getter: () => unknown,
    private readonly oL: IObserverLocator,
    private readonly dependencies: (string | symbol)[],
    private readonly flush: 'sync' | 'async'
  ) {
  }

  public getValue(): unknown {
    return this.getter.call(this.obj);
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

  /** @internal */
  private _doFlush() {
    const oldValue = this._value;
    const value = this.getValue();

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
    this._observers = this.dependencies.map(dep => {
      const obs = isString(dep)
        ? this.oL.getExpressionObserver(this.obj, dep)
        : this.oL.getObserver(this.obj, dep);
      obs.subscribe(this);
      return obs;
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
    }
  }

  public unsubscribe(subscriber: ISubscriber): void {
    if (this.subs.remove(subscriber) && this.subs.count === 0) {
      this._stop();
    }
  }
}

// function observeDeep(obj: object, requestor: IObserverLocator) {
//   function walk(obj: unknown) {
//     if (!isObject(obj)) {
//       return;
//     }
//     if (isArray(obj)) {
//       for (let i = 0; i < obj.length; i++) {
//         walk(obj[i]);
//       }
//       return;
//     }
//     if (isMap(obj) || isSet(obj)) {
//       obj.forEach((v, k) => {
//         walk(v);
//       });
//       return;
//     }
//     for (const key of Object.keys(obj)) {
//       walk((obj as Record<string, unknown>)[key]);
//     }
//   }

//   requestor.getObserver(obj, (obj => {
//     if (isArray(obj)) {
//       obj.
//     }
//   }));
// }

class DeepComputedFromObserver implements IObserver, ISubscriberCollection {
  /** @internal */
  public static mixed = false;
  /** @internal */
  public subs!: ISubscriberRecord<ISubscriber>;

  public type: AccessorType = atObserver;
  public doNotCache?: boolean | undefined;
  /** @internal */
  private _value: unknown = void 0;
  private _observers: IObserver[] | null = null;
  /** @internal */
  private _queued = false;

  public constructor(
    private readonly obj: object,
    private readonly getter: () => unknown,
    private readonly requestor: IObserverLocator,
    private readonly dependencies: (string | symbol)[],
    private readonly flush: 'sync' | 'async'
  ) {
  }

  public getValue(): unknown {
    return this.getter.call(this.obj);
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

  /** @internal */
  private _doFlush() {
    const oldValue = this._value;
    const value = this.getValue();
    if (oldValue === value) {
      return;
    }

    this._value = value;
    this.subs.notify(value, oldValue);
  }

  /** @internal */
  private _start() {
    this._observers = this.dependencies.map(dep => {
      const obs = isString(dep)
        ? this.requestor.getExpressionObserver(this.obj, dep)
        : this.requestor.getObserver(this.obj, dep);
      obs.subscribe(this);
      return obs;
    });
  }

  /** @internal */
  private _stop() {
    this._observers?.forEach(obs => {
      obs.unsubscribe(this);
    });
    this._observers = null;
  }

  public subscribe(subscriber: ISubscriber): void {
    if (this.subs.add(subscriber) && this.subs.count === 1) {
      this._start();
    }
  }

  public unsubscribe(subscriber: ISubscriber): void {
    if (this.subs.remove(subscriber) && this.subs.count === 0) {
      this._stop();
    }
  }
}
