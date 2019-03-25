import {
  IBindingTargetAccessor,
  ILifecycle,
  INode,
  subscriberCollection,
  ISubscriberCollection,
  Priority,
  ISubscriber,
} from '@aurelia/runtime';

export interface ClassAttributeAccessor extends IBindingTargetAccessor<INode, string, string>, ISubscriberCollection {}

@subscriberCollection()
export class ClassAttributeAccessor implements ClassAttributeAccessor {
  public readonly lifecycle: ILifecycle;

  public readonly obj: HTMLElement;
  public currentValue: string;
  public oldValue: string;

  public readonly doNotCache: true;
  public nameIndex: Record<string, number>;
  public version: number;

  public hasChanges: boolean;
  public isActive: boolean;

  constructor(lifecycle: ILifecycle, obj: HTMLElement) {
    this.lifecycle = lifecycle;

    this.obj = obj;
    this.currentValue = '';
    this.oldValue = '';

    this.doNotCache = true;
    this.nameIndex = {};
    this.version = 0;

    this.isActive = false;
    this.hasChanges = false;
  }

  public getValue(): string {
    return this.currentValue;
  }

  public setValueCore(newValue: string): void {
    const { nameIndex } = this;
    let { version } = this;
    let names: string[];
    let name: string;

    // Add the classes, tracking the version at which they were added.
    if (newValue.length) {
      const node = this.obj;
      names = newValue.split(/\s+/);
      for (let i = 0, length = names.length; i < length; i++) {
        name = names[i];
        if (!name.length) {
          continue;
        }
        nameIndex[name] = version;
        node.classList.add(name);
      }
    }

    // Update state variables.
    this.nameIndex = nameIndex;
    this.version += 1;

    // First call to setValue?  We're done.
    if (version === 0) {
      return;
    }

    // Remove classes from previous version.
    version -= 1;
    for (name in nameIndex) {
      if (!nameIndex.hasOwnProperty(name) || nameIndex[name] !== version) {
        continue;
      }

      // TODO: this has the side-effect that classes already present which are added again,
      // will be removed if they're not present in the next update.
      // Better would be do have some configurability for this behavior, allowing the user to
      // decide whether initial classes always need to be kept, always removed, or something in between
      this.obj.classList.remove(name);
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    if (!this.isActive) {
      this.isActive = true;
      this.lifecycle.enqueueRAF(this.flushRAF, this, Priority.propagate);
      this.currentValue = this.oldValue = this.obj[this.propertyKey];
    }
    this.addSubscriber(subscriber);
  }

  public unsubscribe(subscriber: ISubscriber): void {
    this.removeSubscriber(subscriber);
    if (!this.hasSubscribers()) {
      this.isActive = false;
      this.lifecycle.dequeueRAF(this.flushRAF, this);
    }
  }
}
