import { DI, IIndexable } from '@aurelia/kernel';
import { IBindingTargetObserver, IObservable, ISubscriber, AccessorType, LifecycleFlags } from '../observation';
import { subscriberCollection } from './subscriber-collection';
import { IScheduler, ITask } from '@aurelia/scheduler';

export interface IDirtyChecker extends DirtyChecker {}
export const IDirtyChecker = DI.createInterface<IDirtyChecker>('IDirtyChecker').withDefault(x => x.singleton(DirtyChecker));

export const DirtyCheckSettings = {
  /**
   * Default: `6`
   *
   * Adjust the global dirty check frequency.
   * Measures in "frames per check", such that (given an FPS of 60):
   * - A value of 1 will result in 60 dirty checks per second
   * - A value of 6 will result in 10 dirty checks per second
   */
  framesPerCheck: 6,
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
    this.framesPerCheck = 6;
    this.disabled = false;
    this.throw = false;
  }
};

export class DirtyChecker {
  private readonly tracked: DirtyCheckProperty[] = [];

  private task: ITask | null = null;
  private elapsedFrames: number = 0;

  public constructor(
    @IScheduler private readonly scheduler: IScheduler,
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
      this.task = this.scheduler.queueRenderTask(() => this.check(), { persistent: true });
    }
  }

  public removeProperty(property: DirtyCheckProperty): void {
    this.tracked.splice(this.tracked.indexOf(property), 1);
    if (this.tracked.length === 0) {
      this.task!.cancel();
      this.task = null;
    }
  }

  private check(delta?: number): void {
    if (DirtyCheckSettings.disabled) {
      return;
    }
    if (++this.elapsedFrames < DirtyCheckSettings.framesPerCheck) {
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
  }
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

  public isDirty(): boolean {
    return this.oldValue !== this.obj[this.propertyKey];
  }

  public flush(flags: LifecycleFlags): void {
    const oldValue = this.oldValue;
    const newValue = this.obj[this.propertyKey];

    this.callSubscribers(newValue, oldValue, flags | LifecycleFlags.updateTargetInstance);

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
