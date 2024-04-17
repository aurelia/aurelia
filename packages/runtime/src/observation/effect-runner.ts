import { connectable, type BindingObserverRecord } from './connectable';
import { enterConnectable, exitConnectable } from './connectable-switcher';
import { IObserverLocator } from './observer-locator';
import { createInterface } from '../utilities';

import type { ICollectionSubscriber, IConnectable, ISubscriber } from '../observation';
import { ErrorNames, createMappedError } from '../errors';

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
}
export const IObservation = /*@__PURE__*/createInterface<IObservation>('IObservation', x => x.singleton(Observation));

export interface IWatchOptions {
  /**
   * Indicates whether the callback of a watch should be immediately called on init
   */
  immediate?: boolean;
}

export class Observation implements IObservation {

  public static get inject() { return [IObserverLocator]; }

  /** @internal */
  private readonly _defaultWatchOptions: IWatchOptions = { immediate: true };

  public constructor(
    private readonly oL: IObserverLocator,
  ) {}

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
    options: IWatchOptions = this._defaultWatchOptions
  ): IEffect {
    // eslint-disable-next-line no-undef-init
    let $oldValue: R | undefined = undefined;
    let stopped = false;
    const observer = this.oL.getObserver(obj, getter);
    const handler = {
      handleChange: (newValue: R, oldValue: R) => callback(newValue, $oldValue = oldValue),
    };
    const run = () => {
      if (stopped) return;
      callback(observer.getValue(), $oldValue);
    };
    const stop = () => {
      stopped = true;
      observer.unsubscribe(handler);
    };
    observer.subscribe(handler);
    if (options.immediate) {
      run();
    }
    return { run, stop };
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function testObservationWatch(a: IObservation) {
  a.watch({ b: 5 }, o => o.b + 1, v => v.toFixed());
  a.watch({ b: { c: '' } }, o => o.b.c === '', v => v);
}

export type EffectRunFunc = (this: IConnectable, runner: IConnectable) => void;
export interface IEffect {
  run(): void;
  stop(): void;
}

interface RunEffect extends IConnectable {}
class RunEffect implements IEffect, ISubscriber, ICollectionSubscriber {
  public readonly obs!: BindingObserverRecord;
  // to configure this, potentially a 2nd parameter is needed for run
  public maxRunCount: number = 10;
  private queued: boolean = false;
  private running: boolean = false;
  private runCount: number = 0;
  private stopped: boolean = false;

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

  public run(): void {
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
      enterConnectable(this);
      this.fn(this);
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
  }

  public stop(): void {
    this.stopped = true;
    this.obs.clearAll();
  }
}

connectable(RunEffect, null!);
