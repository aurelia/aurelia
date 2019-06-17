import { DI, Key, Reporter, Tracer, IIndexable } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { ILifecycle, Priority } from '../lifecycle';
import { IBindingTargetObserver, IObservable, ISubscriber } from '../observation';
import { subscriberCollection } from './subscriber-collection';

export interface IDirtyChecker {
  createProperty(obj: object, propertyName: string): IBindingTargetObserver;
  addProperty(property: DirtyCheckProperty): void;
  removeProperty(property: DirtyCheckProperty): void;
}

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
   * Default: `true`
   *
   * Log a warning message to the console if a property is being dirty-checked.
   */
  warn: true,
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
    this.warn = true;
    this.throw = false;
  }
};

/** @internal */
export class DirtyChecker {
  public static readonly inject: readonly Key[] = [ILifecycle];

  private readonly tracked: DirtyCheckProperty[];
  private readonly lifecycle: ILifecycle;

  private elapsedFrames: number;

  public constructor(lifecycle: ILifecycle) {
    this.elapsedFrames = 0;
    this.tracked = [];
    this.lifecycle = lifecycle;
  }

  public createProperty(obj: object, propertyName: string): DirtyCheckProperty {
    if (DirtyCheckSettings.throw) {
      throw Reporter.error(800, propertyName); // TODO: create/organize error code
    }
    if (DirtyCheckSettings.warn) {
      Reporter.write(801, propertyName);
    }
    return new DirtyCheckProperty(this, obj, propertyName);
  }

  public addProperty(property: DirtyCheckProperty): void {
    this.tracked.push(property);

    if (this.tracked.length === 1) {
      this.lifecycle.enqueueRAF(this.check, this, Priority.low);
    }
  }

  public removeProperty(property: DirtyCheckProperty): void {
    this.tracked.splice(this.tracked.indexOf(property), 1);
    if (this.tracked.length === 0) {
      this.lifecycle.dequeueRAF(this.check, this);
    }
  }

  public check(delta?: number): void {
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
        current.flush(LifecycleFlags.fromTick);
      }
    }
  }
}

const slice = Array.prototype.slice;

export interface DirtyCheckProperty extends IBindingTargetObserver { }

@subscriberCollection()
export class DirtyCheckProperty implements DirtyCheckProperty {
  public obj: IObservable & IIndexable;
  public oldValue: unknown;
  public propertyKey: string;

  private readonly dirtyChecker: IDirtyChecker;

  constructor(dirtyChecker: IDirtyChecker, obj: object, propertyKey: string) {
    if (Tracer.enabled) { Tracer.enter('DirtyCheckProperty', 'constructor', slice.call(arguments)); }
    this.obj = obj as IObservable & IIndexable;
    this.propertyKey = propertyKey;

    this.dirtyChecker = dirtyChecker;
    if (Tracer.enabled) { Tracer.leave(); }
  }

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
