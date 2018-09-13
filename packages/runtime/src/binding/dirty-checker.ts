import { DI, IIndexable, Primitive } from '@aurelia/kernel';
import { BindingFlags } from './binding-flags';
import { IBindingTargetAccessor, IBindingTargetObserver, IObservable, IPropertySubscriber } from './observation';
import { propertyObserver } from './property-observer';

export interface IDirtyChecker {
  createProperty(obj: IObservable, propertyName: string): IBindingTargetAccessor;
}

export const IDirtyChecker = DI.createInterface<IDirtyChecker>()
  .withDefault(x => x.singleton(DirtyChecker));

/*@internal*/
export class DirtyChecker {
  private tracked: DirtyCheckProperty[] = [];
  private checkDelay: number = 120;

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
    setTimeout(() => this.check(), this.checkDelay);
  }

  public check(): void {
    const tracked = this.tracked;
    let i = tracked.length;

    while (i--) {
      const current = tracked[i];

      if (current.isDirty()) {
        current.flushChanges();
      }
    }

    if (tracked.length) {
      this.scheduleDirtyCheck();
    }
  }
}

// tslint:disable-next-line:interface-name
export interface DirtyCheckProperty extends IBindingTargetObserver { }

/*@internal*/
@propertyObserver()
export class DirtyCheckProperty implements DirtyCheckProperty {
  public oldValue: IIndexable | Primitive;

  constructor(
    private dirtyChecker: DirtyChecker,
    public obj: IObservable,
    public propertyKey: string) {

    }

  public isDirty(): boolean {
    return this.oldValue !== this.obj[this.propertyKey];
  }

  public getValue(): IIndexable | Primitive {
    return this.obj[this.propertyKey];
  }

  public setValue(newValue: IIndexable | Primitive): void {
    this.obj[this.propertyKey] = newValue;
  }

  public flushChanges(): void {
    const oldValue = this.oldValue;
    const newValue = this.getValue();

    this.callSubscribers(newValue, oldValue, BindingFlags.updateTargetInstance | BindingFlags.fromFlushChanges);

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
