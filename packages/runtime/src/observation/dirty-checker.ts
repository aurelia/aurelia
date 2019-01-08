import { DI, PLATFORM } from '@aurelia/kernel';
import { IBindingTargetAccessor, IBindingTargetObserver, IObservable, IPropertySubscriber, LifecycleFlags } from '../observation';
import { propertyObserver } from './property-observer';

export interface IDirtyChecker {
  createProperty(obj: IObservable, propertyName: string): IBindingTargetAccessor;
}

export const IDirtyChecker = DI.createInterface<IDirtyChecker>('IDirtyChecker').withDefault(x => x.singleton(DirtyChecker));

/** @internal */
export class DirtyChecker {
  private readonly checkDelay: number;
  private readonly tracked: DirtyCheckProperty[];

  public constructor() {
    this.checkDelay = 120;
    this.tracked = [];
  }

  public createProperty(obj: IObservable, propertyName: string): DirtyCheckProperty {
    return new DirtyCheckProperty(this, obj, propertyName);
  }

  public addProperty(property: DirtyCheckProperty): void {
    const tracked = this.tracked;

    tracked.push(property);

    if (tracked.length === 1) {
      this.scheduleDirtyCheck();
    }
  }

  public removeProperty(property: DirtyCheckProperty): void {
    const tracked = this.tracked;
    tracked.splice(tracked.indexOf(property), 1);
  }

  public scheduleDirtyCheck(): void {
    PLATFORM.global.setTimeout(() => { this.check(); }, this.checkDelay);
  }

  public check(): void {
    const tracked = this.tracked;
    let i = tracked.length;

    while (i--) {
      const current = tracked[i];

      if (current.isDirty()) {
        current.flush(LifecycleFlags.fromFlush);
      }
    }

    if (tracked.length) {
      this.scheduleDirtyCheck();
    }
  }
}

/** @internal */
export interface DirtyCheckProperty extends IBindingTargetObserver { }

/** @internal */
@propertyObserver()
export class DirtyCheckProperty implements DirtyCheckProperty {
  public obj: IObservable;
  public oldValue: unknown;
  public propertyKey: string;

  private readonly dirtyChecker: DirtyChecker;

  constructor(dirtyChecker: DirtyChecker, obj: IObservable, propertyKey: string) {
    this.obj = obj;
    this.propertyKey = propertyKey;

    this.dirtyChecker = dirtyChecker;
  }

  public isDirty(): boolean {
    return this.oldValue !== this.obj[this.propertyKey];
  }

  public getValue(): unknown {
    return this.obj[this.propertyKey];
  }

  public setValue(newValue: unknown): void {
    this.obj[this.propertyKey] = newValue;
  }

  public flush(flags: LifecycleFlags): void {
    const oldValue = this.oldValue;
    const newValue = this.getValue();

    this.callSubscribers(newValue, oldValue, flags | LifecycleFlags.updateTargetInstance);

    this.oldValue = newValue;
  }

  public subscribe(subscriber: IPropertySubscriber): void {
    if (!this.hasSubscribers()) {
      this.oldValue = this.getValue();
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
