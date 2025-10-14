import { IIndexable, isString, isObject, isArray, isMap, isSet } from '@aurelia/kernel';
import { IObserver, ISubscriberCollection, ISubscriberRecord, ISubscriber, AccessorType, atObserver, InterceptorFunc, ICoercionConfiguration, IConnectable } from './interfaces';
import { IObserverLocator } from './observer-locator';
import { unwrap } from './proxy-observation';
import { queueTask } from './queue';
import { subscriberCollection } from './subscriber-collection';

export class ControlledComputedObserver implements IObserver, ISubscriberCollection {
  static {
    subscriberCollection(ControlledComputedObserver, null!);
  }
  /** @internal */
  public static mixed = false;
  /** @internal */
  public subs!: ISubscriberRecord<ISubscriber>;

  public type: AccessorType = atObserver;
  public doNotCache = false;
  /** @internal */
  private _value: unknown = void 0;
  private readonly _observers: IObserver[] = [];
  /** @internal */
  private _queued = false;
  /** @internal */
  private _started = false;
  /** @internal */
  private _callback?: (newValue: unknown, oldValue: unknown) => void = void 0;
  /** @internal */
  private _coercer: InterceptorFunc | undefined = void 0;
  /** @internal */
  private _coercionConfig: ICoercionConfiguration | undefined = void 0;

  public constructor(
    private readonly obj: object,
    private readonly key: PropertyKey,
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
  }

  public setValue(newValue: unknown): void {
    if (this._coercer != null) {
      newValue = this._coercer.call(null, newValue, this._coercionConfig);
    }

    (this.obj as IIndexable)[this.key] = newValue;
  }

  public useCallback(callback: (newValue: unknown, oldValue: unknown) => void): boolean {
    this._callback = callback;
    return true;
  }

  public useCoercer(coercer: InterceptorFunc, coercionConfig?: ICoercionConfiguration | undefined): boolean {
    this._coercer = coercer;
    this._coercionConfig = coercionConfig;
    return true;
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
    this._callback?.(value, oldValue);
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
