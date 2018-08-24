import { DI, ICallable } from '@aurelia/kernel';
import { BindingFlags } from './binding-flags';
import { IAccessor, IChangeTracker, IPropertySubscriber, ISubscribable, MutationKind } from './observation';
import { SubscriberCollection } from './subscriber-collection';

export interface IDirtyChecker {
  createProperty(obj: any, propertyName: string): IAccessor & ISubscribable<MutationKind.instance> & IChangeTracker;
}

export const IDirtyChecker = DI.createInterface<IDirtyChecker>()
  .withDefault(x => x.singleton(DirtyChecker));

/*@internal*/
export class DirtyChecker {
  private tracked = [];
  private checkDelay = 120;

  public createProperty(obj: any, propertyName: string) {
    return new DirtyCheckProperty(this, obj, propertyName);
  }

  public addProperty(property: DirtyCheckProperty) {
    let tracked = this.tracked;

    tracked.push(property);

    if (tracked.length === 1) {
      this.scheduleDirtyCheck();
    }
  }

  public removeProperty(property: DirtyCheckProperty) {
    let tracked = this.tracked;
    tracked.splice(tracked.indexOf(property), 1);
  }

  public scheduleDirtyCheck() {
    setTimeout(() => this.check(), this.checkDelay);
  }

  public check() {
    let tracked = this.tracked;
    let i = tracked.length;

    while (i--) {
      let current = tracked[i];

      if (current.isDirty()) {
        current.call();
      }
    }

    if (tracked.length) {
      this.scheduleDirtyCheck();
    }
  }
}

/*@internal*/
export class DirtyCheckProperty extends SubscriberCollection implements IAccessor, ISubscribable<MutationKind.instance>, IChangeTracker {
  public oldValue;

  constructor(private dirtyChecker: DirtyChecker, private obj: any, private propertyName: string) {
    super();
  }

  public isDirty(): boolean {
    return this.oldValue !== this.obj[this.propertyName];
  }

  public getValue() {
    return this.obj[this.propertyName];
  }

  public setValue(newValue) {
    this.obj[this.propertyName] = newValue;
  }

  public flushChanges() {
    let oldValue = this.oldValue;
    let newValue = this.getValue();

    this.callSubscribers(newValue, oldValue, BindingFlags.updateTargetInstance | BindingFlags.fromFlushChanges);

    this.oldValue = newValue;
  }

  public subscribe(subscriber: IPropertySubscriber) {
    if (!this.hasSubscribers()) {
      this.oldValue = this.getValue();
      this.dirtyChecker.addProperty(this);
    }
    this.addSubscriber(subscriber);
  }

  public unsubscribe(subscriber: IPropertySubscriber) {
    if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
      this.dirtyChecker.removeProperty(this);
    }
  }
}
