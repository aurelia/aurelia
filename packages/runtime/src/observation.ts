import { areEqual, isFunction, resolve } from '@aurelia/kernel';
import { IExpressionParser, IsBindingBehavior } from '@aurelia/expression-parser';
import { connectable, IObserverLocatorBasedConnectable, type IObserverRecord } from './connectable';
import { enterConnectable, exitConnectable } from './connectable-switcher';
import { IObserverLocator } from './observer-locator';
import { rtCreateInterface } from './utilities';

import { astEvaluate } from './ast.eval';
import { mixinNoopAstEvaluator } from './ast.utilities';
import { createMappedError, ErrorNames } from './errors';
import type { ICollectionSubscriber, IConnectable, ISubscriber } from './interfaces';
import { Scope } from './scope';

export interface IObservation {
  /**
   * Run an effect function an track the dependencies inside it,
   * to re-run whenever a dependency has changed
   */
  run(fn: EffectRunFunc): IEffect;
  /**
   * Run a getter based on the given object as its first parameter and track the dependencies via this getter,
   * to call the callback whenever the value has changed
   */
  watch<T, R>(
    obj: T,
    getter: (obj: T, watcher: IConnectable) => R,
    callback: (value: R, oldValue: R | undefined) => unknown,
    options?: IWatchOptions,
  ): IEffect;
  /**
   * Run a expression based observer and call the callback whenever the value has changed
   *
   * Use options.immediate to indicate whether the callback should be called immediately on init
   */
  watchExpression<R>(
    obj: object,
    expression: string,
    callback: (value: R, oldValue: R | undefined) => unknown,
    options?: IWatchOptions,
  ): IEffect;
}
export const IObservation = /*@__PURE__*/rtCreateInterface<IObservation>('IObservation', x => x.singleton(Observation));

export interface IWatchOptions {
  /**
   * Indicates whether the callback of a watch should be immediately called on init
   */
  immediate?: boolean;
}

export class Observation implements IObservation {
  /** @internal */
  private readonly oL = resolve(IObserverLocator);

  /** @internal */
  private readonly _parser = resolve(IExpressionParser);

  public run(fn: EffectRunFunc): IEffect {
    const effect = new RunEffect(this.oL, fn);
    // todo: batch effect run after it's in
    effect.run();
    return effect;
  }

  public watch<T, R>(
    obj: T,
    getter: (obj: T, watcher: IConnectable) => R,
    callback: (value: R, oldValue: R | undefined) => unknown,
    options?: IWatchOptions,
  ): IEffect {
    // eslint-disable-next-line no-undef-init
    let $oldValue: R | undefined = undefined;
    let running = false;
    let cleanupTask: (() => void) | undefined;
    const observer = this.oL.getObserver(obj, getter);
    const handleChange = (newValue: R, oldValue: R) => {
      cleanupTask?.();
      cleanupTask = void 0;
      const result = callback(newValue, $oldValue = oldValue);
      if (isFunction(result)) {
        cleanupTask =  result as NonNullable<typeof cleanupTask>;
      } else {
        // throw or ignore?
      }
    };
    const handler = {
      handleChange
    };
    const run = () => {
      if (running) return;
      running = true;
      observer.subscribe(handler);
      handleChange(observer.getValue(), $oldValue as R);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      observer.unsubscribe(handler);
      cleanupTask?.();
      cleanupTask = void 0;
    };

    if (options?.immediate !== false) {
      run();
    }
    return { run, stop };
  }

  public watchExpression<R>(
    obj: object,
    expression: string,
    callback: (value: R, oldValue: R | undefined) => unknown,
    options?: IWatchOptions
  ): IEffect {
    let running = false;
    let cleanupTask: (() => void) | undefined;
    const handleChange = (newValue: unknown, oldValue: unknown) => {
      cleanupTask?.();
      cleanupTask = void 0;
      const result = callback(newValue as R, oldValue as R);
      if (isFunction(result)) {
        cleanupTask =  result as NonNullable<typeof cleanupTask>;
      } else {
        // throw or ignore?
      }
    };
    const observer = new ExpressionObserver(
      Scope.create(obj),
      this.oL,
      this._parser.parse(expression, 'IsProperty'),
      handleChange,
    );
    const run = () => {
      if (running) return;
      running = true;
      observer.run();
    };
    const stop = () => {
      if (!running) return;
      running = false;
      observer.stop();
      cleanupTask?.();
      cleanupTask = void 0;
    };
    if (options?.immediate !== false) {
      run();
    }
    return { run, stop };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function testObservationWatch(a: IObservation) {
  a.watch({ b: 5 }, o => o.b + 1, v => v.toFixed());
  a.watch({ b: { c: '' } }, o => o.b.c === '', v => v);
  a.watchExpression<number>({ b: { c: { d: 5 }} }, 'b.c.d', v => v.toFixed());
}

export type EffectCleanupFunc = () => void;
export type EffectRunFunc = (this: IConnectable, runner: IConnectable) => EffectCleanupFunc | void;
export interface IEffect {
  run(): void;
  stop(): void;
}

interface RunEffect extends IConnectable {}
class RunEffect implements IEffect, IObserverLocatorBasedConnectable, ISubscriber, ICollectionSubscriber {
  static {
    connectable(RunEffect, null!);
  }

  public readonly obs!: IObserverRecord;
  // to configure this, potentially a 2nd parameter is needed for run
  public maxRunCount: number = 10;
  private queued: boolean = false;
  private running: boolean = false;
  private runCount: number = 0;
  private stopped: boolean = false;

  /** @internal */
  private _cleanupTask: (() => void) | undefined = undefined;

  public constructor(
    public readonly oL: IObserverLocator,
    public readonly fn: EffectRunFunc,
  ) {
  }

  public handleChange(): void {
    this.queued = true;
    this.run();
  }

  public handleCollectionChange(): void {
    this.queued = true;
    this.run();
  }

  public run = () => {
    if (this.stopped) {
      throw createMappedError(ErrorNames.stopping_a_stopped_effect);
    }
    if (this.running) {
      return;
    }
    ++this.runCount;
    this.running = true;
    this.queued = false;
    ++this.obs.version;
    try {
      this._cleanupTask?.call(void 0);
      enterConnectable(this);
      this._cleanupTask = this.fn(this) as EffectCleanupFunc;
    } finally {
      this.obs.clear();
      this.running = false;
      exitConnectable(this);
    }
    // when doing this.fn(this), there's a chance that it has recursive effect
    // continue to run for a certain number before bailing
    // whenever there's a dependency change while running, this.queued will be true
    // so we use it as an indicator to continue to run the effect
    if (this.queued) {
      if (this.runCount > this.maxRunCount) {
        this.runCount = 0;
        throw createMappedError(ErrorNames.effect_maximum_recursion_reached);
      }
      this.run();
    } else {
      this.runCount = 0;
    }
  };

  public stop = () => {
    this._cleanupTask?.call(void 0);
    this._cleanupTask = void 0;
    this.stopped = true;
    this.obs.clearAll();
  };
}

interface ExpressionObserver extends IObserverLocatorBasedConnectable { }

class ExpressionObserver implements IObserverLocatorBasedConnectable,
  ISubscriber,
  ICollectionSubscriber {

  static {
    connectable(ExpressionObserver, null!);
    mixinNoopAstEvaluator(ExpressionObserver);
  }

  /** @internal */
  private _value: unknown = void 0;

  // see Listener binding for explanation
  /** @internal */
  public readonly boundFn = false;

  /** @internal */
  private readonly ast: IsBindingBehavior;

  /** @internal */
  private readonly _callback: (value: unknown, oldValue: unknown) => void;

  /** @internal */
  private readonly _scope: Scope;

  public constructor(
    scope: Scope,
    public oL: IObserverLocator,
    expression: IsBindingBehavior,
    callback: (value: unknown, oldValue: unknown) => void,
  ) {
    this._scope = scope;
    this.ast = expression;
    this._callback = callback;
  }

  public handleChange(): void {
    this.run();
  }

  public handleCollectionChange(): void {
    this.run();
  }

  public run(): void {
    this.obs.version++;
    const oldValue = this._value;
    const value = astEvaluate(this.ast, this._scope, this, this);
    this.obs.clear();
    if (!areEqual(value, oldValue)) {
      this._value = value;
      this._callback.call(void 0, value, oldValue);
    }
  }

  public stop(): void {
    this.obs.clearAll();
    this._value = void 0;
  }
}

