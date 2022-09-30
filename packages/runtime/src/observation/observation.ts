import { connectable } from '../binding/connectable';
import { enterConnectable, exitConnectable } from './connectable-switcher';
import { IObserverLocator } from './observer-locator';

import type { ICollectionSubscriber, IConnectable, ISubscriber } from '../observation';
import type { BindingObserverRecord } from '../binding/connectable';
import { createError, createInterface } from '../utilities-objects';

export interface IObservation extends Observation {}
export const IObservation = createInterface<IObservation>('IObservation', x => x.singleton(Observation));

export class Observation implements IObservation {

  public static get inject() { return [IObserverLocator]; }

  public constructor(
    private readonly oL: IObserverLocator,
  ) {}

  /**
   * Run an effect function an track the dependencies inside it,
   * to re-run whenever a dependency has changed
   */
  public run(fn: EffectFunc): IEffect {
    const effect = new Effect(this.oL, fn);
    // todo: batch effect run after it's in
    effect.run();
    return effect;
  }
}

export type EffectFunc = (runner: IConnectable) => void;
export interface IEffect extends IConnectable {
  run(): void;
  stop(): void;
}

interface Effect extends IConnectable {}
class Effect implements IEffect, ISubscriber, ICollectionSubscriber {
  public readonly obs!: BindingObserverRecord;
  // to configure this, potentially a 2nd parameter is needed for run
  public maxRunCount: number = 10;
  private queued: boolean = false;
  private running: boolean = false;
  private runCount: number = 0;
  private stopped: boolean = false;

  public constructor(
    public readonly oL: IObserverLocator,
    public readonly fn: EffectFunc,
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
      if (__DEV__)
        throw createError(`AUR0225: Effect has already been stopped`);
      else
        throw createError(`AUR0225`);
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
        if (__DEV__)
          throw createError(`AUR0226: Maximum number of recursive effect run reached. Consider handle effect dependencies differently.`);
        else
          throw createError(`AUR0226`);
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

connectable(Effect);
