import { DI } from '@aurelia/kernel';
import { BindingFlags } from './binding-flags';
import { IAccessor, IChangeTracker, IPropertySubscriber, ISubscribable, ISubscriberCollection, MutationKind } from './observation';
import { subscriberCollection } from './subscriber-collection';

export interface IDirtyChecker {
  createProperty(obj: any, propertyName: string): IAccessor & ISubscribable<MutationKind.instance> & IChangeTracker;
}

export const IDirtyChecker = DI.createInterface<IDirtyChecker>()
  .withDefault(x => x.singleton(DirtyChecker));

/*@internal*/
export class DirtyChecker {
  private tracked: any[] = [];
  private checkDelay: number = 120;

  public createProperty(obj: any, propertyName: string): DirtyCheckProperty {
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
        current.call();
      }
    }

    if (tracked.length) {
      this.scheduleDirtyCheck();
    }
  }
}

// tslint:disable-next-line:interface-name
export interface DirtyCheckProperty extends
  IAccessor,
  ISubscribable<MutationKind.instance>,
  ISubscriberCollection<MutationKind.instance>,
  IChangeTracker { }

/*@internal*/
@subscriberCollection(MutationKind.instance)
export class DirtyCheckProperty implements DirtyCheckProperty {
  public oldValue: any;

  constructor(private dirtyChecker: DirtyChecker, private obj: any, private propertyName: string) { }

  public isDirty(): boolean {
    return this.oldValue !== this.obj[this.propertyName];
  }

  public getValue(): any {
    return this.obj[this.propertyName];
  }

  public setValue(newValue: any): void {
    this.obj[this.propertyName] = newValue;
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
