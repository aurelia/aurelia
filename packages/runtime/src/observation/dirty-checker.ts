import { IContainer, IPlatform, Registration } from '@aurelia/kernel';
import { type AccessorType, type IObserver, type ISubscriberCollection, type IObservable, type ISubscriber, atNone } from '../observation';
import { subscriberCollection } from './subscriber-collection';
import { createError, createInterface, safeString } from '../utilities';

import type { ITask } from '@aurelia/platform';
import type { IIndexable } from '@aurelia/kernel';

export interface IDirtyChecker extends DirtyChecker {}
export const IDirtyChecker = /*@__PURE__*/ createInterface<IDirtyChecker>('IDirtyChecker', __DEV__
  ? x => x.callback(() => {
    throw createError('AURxxxx: There is no registration for IDirtyChecker interface. If you want to use your own dirty checker, make sure you register it.');
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
  /**
   * @internal
   */
  public static inject = [IPlatform];
  public static register(c: IContainer) {
    c.register(
      Registration.singleton(this, this),
      Registration.aliasTo(this, IDirtyChecker),
    );
  }
  private readonly tracked: DirtyCheckProperty[] = [];

  /** @internal */
  private _task: ITask | null = null;
  /** @internal */
  private _elapsedFrames: number = 0;

  public constructor(
    private readonly p: IPlatform,
  ) {
    subscriberCollection(DirtyCheckProperty);
  }

  public createProperty(obj: object, key: PropertyKey): DirtyCheckProperty {
    if (DirtyCheckSettings.throw) {
      if (__DEV__)
        throw createError(`AUR0222: Property '${safeString(key)}' is being dirty-checked.`);
      else
        throw createError(`AUR0222:${safeString(key)}`);
    }
    return new DirtyCheckProperty(this, obj as IIndexable, key as string);
  }

  public addProperty(property: DirtyCheckProperty): void {
    this.tracked.push(property);

    if (this.tracked.length === 1) {
      this._task = this.p.taskQueue.queueTask(this.check, { persistent: true });
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
    const tracked = this.tracked;
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
    throw createError(`Trying to set value for property ${safeString(this.key)} in dirty checker`);
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
