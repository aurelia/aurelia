import { DI, IPlatform } from '@aurelia/kernel';
import { AccessorType, LifecycleFlags } from '../observation.js';
import { subscriberCollection } from './subscriber-collection.js';

import type { IIndexable, ITask, QueueTaskOptions } from '@aurelia/kernel';
import type { IBindingTargetObserver, IObservable, ISubscriber } from '../observation';

export interface IDirtyChecker extends DirtyChecker {}
export const IDirtyChecker = DI.createInterface<IDirtyChecker>('IDirtyChecker', x => x.singleton(DirtyChecker));

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

const queueTaskOpts: QueueTaskOptions = {
  persistent: true,
};

export class DirtyChecker {
  private readonly tracked: DirtyCheckProperty[] = [];

  private task: ITask | null = null;
  private elapsedFrames: number = 0;

  public constructor(
    @IPlatform private readonly platform: IPlatform,
  ) {}

  public createProperty(obj: object, propertyName: string): DirtyCheckProperty {
    if (DirtyCheckSettings.throw) {
      throw new Error(`Property '${propertyName}' is being dirty-checked.`);
    }
    return new DirtyCheckProperty(this, obj as IIndexable, propertyName);
  }

  public addProperty(property: DirtyCheckProperty): void {
    this.tracked.push(property);

    if (this.tracked.length === 1) {
      this.task = this.platform.macroTaskQueue.queueTask(this.check, queueTaskOpts);
    }
  }

  public removeProperty(property: DirtyCheckProperty): void {
    this.tracked.splice(this.tracked.indexOf(property), 1);
    if (this.tracked.length === 0) {
      this.task!.cancel();
      this.task = null;
    }
  }

  private readonly check = () => {
    if (DirtyCheckSettings.disabled) {
      return;
    }
    if (++this.elapsedFrames < DirtyCheckSettings.timeoutsPerCheck) {
      return;
    }
    this.elapsedFrames = 0;
    const tracked = this.tracked;
    const len = tracked.length;
    let current: DirtyCheckProperty;
    let i = 0;
    for (; i < len; ++i) {
      current = tracked[i];
      if (current.isDirty()) {
        current.flush(LifecycleFlags.none);
      }
    }
  };
}

export interface DirtyCheckProperty extends IBindingTargetObserver { }

@subscriberCollection()
export class DirtyCheckProperty implements DirtyCheckProperty {
  public oldValue: unknown;
  public type: AccessorType = AccessorType.Obj;

  public constructor(
    private readonly dirtyChecker: IDirtyChecker,
    public obj: IObservable & IIndexable,
    public propertyKey: string,
  ) {}

  public setValue(v: unknown, f: LifecycleFlags) {
    // todo: this should be allowed, probably
    // but the construction of dirty checker should throw instead
    throw new Error(`Trying to set value for property ${this.propertyKey} in dirty checker`);
  }

  public isDirty(): boolean {
    return this.oldValue !== this.obj[this.propertyKey];
  }

  public flush(flags: LifecycleFlags): void {
    const oldValue = this.oldValue;
    const newValue = this.obj[this.propertyKey];

    this.callSubscribers(newValue, oldValue, flags | LifecycleFlags.updateTarget);

    this.oldValue = newValue;
  }

  public subscribe(subscriber: ISubscriber): void {
    if (!this.hasSubscribers()) {
      this.oldValue = this.obj[this.propertyKey];
      this.dirtyChecker.addProperty(this);
    }
    this.addSubscriber(subscriber);
  }

  public unsubscribe(subscriber: ISubscriber): void {
    if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
      this.dirtyChecker.removeProperty(this);
    }
  }
}
