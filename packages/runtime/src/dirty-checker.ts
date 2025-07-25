import { IContainer, IPlatform, Registration, resolve } from '@aurelia/kernel';
import { type AccessorType, type IObserver, type ISubscriberCollection, type IObservable, type ISubscriber, atNone } from './interfaces';
import { subscriberCollection } from './subscriber-collection';
import { rtCreateInterface } from './utilities';

import type { IIndexable } from '@aurelia/kernel';
import { ErrorNames, createMappedError } from './errors';
import { queueRecurringTask, RecurringTask } from './queue';

export interface IDirtyChecker extends DirtyChecker {}
export const IDirtyChecker = /*@__PURE__*/ rtCreateInterface<IDirtyChecker>('IDirtyChecker', __DEV__
  ? x => x.callback(() => {
    throw createMappedError(ErrorNames.dirty_check_no_handler);
  })
  : void 0
);

export const DirtyCheckSettings = {
  /**
   * Default: `6`
   *
   * Adjust the global dirty check frequency.
   * Measures in "timeouts per check", such that (given a default of 250 timeouts per second in modern browsers):
   * - A value of 1 will result in 250 dirty checks per second (or 1 dirty check per second for an inactive tab)
   * - A value of 25 will result in 10 dirty checks per second (or 1 dirty check per 25 seconds for an inactive tab)
   */
  timeoutsPerCheck: 25,
  /**
   * Default: `false`
   *
   * Disable dirty-checking entirely. Properties that cannot be observed without dirty checking
   * or an adapter, will simply not be observed.
   */
  disabled: false,
  /**
   * Default: `false`
   *
   * Throw an error if a property is being dirty-checked.
   */
  throw: false,
  /**
   * Resets all dirty checking settings to the framework's defaults.
   */
  resetToDefault(): void {
    this.timeoutsPerCheck = 6;
    this.disabled = false;
    this.throw = false;
  }
};

export class DirtyChecker {
  public static register(c: IContainer) {
    c.register(
      Registration.singleton(this, this),
      Registration.aliasTo(this, IDirtyChecker),
    );
  }
  private readonly tracked: DirtyCheckProperty[] = [];

  /** @internal */
  private _task: RecurringTask | null = null;
  /** @internal */
  private _elapsedFrames: number = 0;

  private readonly p = resolve(IPlatform);
  public constructor(
  ) {
    subscriberCollection(DirtyCheckProperty, null!);
  }

  public createProperty(obj: object, key: PropertyKey): DirtyCheckProperty {
    if (DirtyCheckSettings.throw) {
      throw createMappedError(ErrorNames.dirty_check_not_allowed, key);
    }
    return new DirtyCheckProperty(this, obj as IIndexable, key as string);
  }

  public addProperty(property: DirtyCheckProperty): void {
    this.tracked.push(property);

    if (this.tracked.length === 1) {
      this._task = queueRecurringTask(this.check, { interval: 0 });
    }
  }

  public removeProperty(property: DirtyCheckProperty): void {
    this.tracked.splice(this.tracked.indexOf(property), 1);
    if (this.tracked.length === 0) {
      this._task!.cancel();
      this._task = null;
    }
  }

  private readonly check = () => {
    if (DirtyCheckSettings.disabled) {
      return;
    }
    if (++this._elapsedFrames < DirtyCheckSettings.timeoutsPerCheck) {
      return;
    }
    this._elapsedFrames = 0;
    const tracked = this.tracked.slice(0);
    const len = tracked.length;
    let current: DirtyCheckProperty;
    let i = 0;
    for (; i < len; ++i) {
      current = tracked[i];
      if (current.isDirty()) {
        current.flush();
      }
    }
  };
}

export interface DirtyCheckProperty extends IObserver, ISubscriberCollection { }

export class DirtyCheckProperty implements DirtyCheckProperty {
  public type: AccessorType = atNone;

  /** @internal */
  private _oldValue: unknown = void 0;
  /** @internal */
  private readonly _dirtyChecker: IDirtyChecker;

  public constructor(
    dirtyChecker: IDirtyChecker,
    public obj: IObservable & IIndexable,
    public key: string,
  ) {
    this._dirtyChecker = dirtyChecker;
  }

  public getValue() {
    return this.obj[this.key];
  }

  public setValue(_v: unknown) {
    // todo: this should be allowed, probably
    // but the construction of dirty checker should throw instead
    throw createMappedError(ErrorNames.dirty_check_setter_not_allowed, this.key);
  }

  public isDirty(): boolean {
    return this._oldValue !== this.obj[this.key];
  }

  public flush(): void {
    const oldValue = this._oldValue;
    const newValue = this.getValue();

    this._oldValue = newValue;
    this.subs.notify(newValue, oldValue);
  }

  public subscribe(subscriber: ISubscriber): void {
    if (this.subs.add(subscriber) && this.subs.count === 1) {
      this._oldValue = this.obj[this.key];
      this._dirtyChecker.addProperty(this);
    }
  }

  public unsubscribe(subscriber: ISubscriber): void {
    if (this.subs.remove(subscriber) && this.subs.count === 0) {
      this._dirtyChecker.removeProperty(this);
    }
  }
}
