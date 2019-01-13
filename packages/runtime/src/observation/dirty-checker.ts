import { DI, PLATFORM, Reporter } from '@aurelia/kernel';
import { IBindingTargetObserver, IObservable, IPropertySubscriber, LifecycleFlags } from '../observation';
import { propertyObserver } from './property-observer';

export interface IDirtyChecker {
  createProperty(obj: IObservable, propertyName: string): IBindingTargetObserver;
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
  private readonly tracked: DirtyCheckProperty[];

  private elapsedFrames: number;

  public constructor() {
    this.elapsedFrames = 0;
    this.tracked = [];
  }

  public createProperty(obj: IObservable, propertyName: string): DirtyCheckProperty {
    if (DirtyCheckSettings.throw) {
      throw Reporter.error(800); // TODO: create/organize error code
    }
    if (DirtyCheckSettings.warn) {
      Reporter.write(801);
    }
    return new DirtyCheckProperty(this, obj, propertyName);
  }

  public addProperty(property: DirtyCheckProperty): void {
    this.tracked.push(property);

    if (this.tracked.length === 1) {
      PLATFORM.ticker.add(this.check, this);
    }
  }

  public removeProperty(property: DirtyCheckProperty): void {
    this.tracked.splice(this.tracked.indexOf(property), 1);
    if (this.tracked.length === 0) {
      PLATFORM.ticker.remove(this.check, this);
    }
  }

  public check(delta: number): void {
    if (DirtyCheckSettings.disabled) {
      return;
    }
    this.elapsedFrames += delta;
    if (this.elapsedFrames < DirtyCheckSettings.framesPerCheck) {
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

export interface DirtyCheckProperty extends IBindingTargetObserver { }

@propertyObserver()
export class DirtyCheckProperty implements DirtyCheckProperty {
  public obj: IObservable;
  public oldValue: unknown;
  public propertyKey: string;

  private readonly dirtyChecker: IDirtyChecker;

  constructor(dirtyChecker: IDirtyChecker, obj: IObservable, propertyKey: string) {
    this.obj = obj;
    this.propertyKey = propertyKey;

    this.dirtyChecker = dirtyChecker;
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

  public subscribe(subscriber: IPropertySubscriber): void {
    if (!this.hasSubscribers()) {
      this.oldValue = this.obj[this.propertyKey];
      this.dirtyChecker.addProperty(this);
    }
    this.addSubscriber(subscriber);
  }

  public unsubscribe(subscriber: IPropertySubscriber): void {
    if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
      this.dirtyChecker.removeProperty(this);
    }
  }
}
