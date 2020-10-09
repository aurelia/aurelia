import { IIndexable } from '@aurelia/kernel';
import {
  IAccessor,
  ISubscriber,
  ISubscriberCollection,
  LifecycleFlags,
  subscriberCollection,
  IScheduler,
  ITask,
  AccessorType,
} from '@aurelia/runtime';
import { IEventSubscriber } from './event-manager';

export interface ValueAttributeObserver
  extends ISubscriberCollection {}

// TODO: handle file attribute properly again, etc

/**
 * Observer for non-radio, non-checkbox input.
 */
@subscriberCollection()
export class ValueAttributeObserver implements IAccessor {
  public currentValue: unknown = '';
  public oldValue: unknown = '';

  public readonly persistentFlags: LifecycleFlags;

  public hasChanges: boolean = false;
  public task: ITask | null = null;
  // ObserverType.Layout is not always true, it depends on the element & property combo
  // but for simplicity, always treat as such
  public type: AccessorType = AccessorType.Node | AccessorType.Observer | AccessorType.Layout;

  public constructor(
    public readonly scheduler: IScheduler,
    flags: LifecycleFlags,
    public readonly handler: IEventSubscriber,
    public readonly obj: Node & IIndexable,
    public readonly propertyKey: string,
  ) {
    this.persistentFlags = flags & LifecycleFlags.targetObserverFlags;
  }

  public getValue(): unknown {
    // is it safe to assume the observer has the latest value?
    // todo: ability to turn on/off cache based on type
    return this.currentValue;
  }

  public setValue(newValue: string | null, flags: LifecycleFlags): void {
    this.currentValue = newValue;
    this.hasChanges = newValue !== this.oldValue;
    if ((flags & LifecycleFlags.noTargetObserverQueue) === 0) {
      this.flushChanges(flags);
    }
  }

  public flushChanges(flags: LifecycleFlags): void {
    if (this.hasChanges) {
      this.hasChanges = false;
      const currentValue = this.currentValue;
      const oldValue = this.oldValue;
      this.oldValue = currentValue;
      if (currentValue == void 0) {
        this.obj[this.propertyKey] = '';
      } else {
        this.obj[this.propertyKey] = currentValue;
      }

      if ((flags & LifecycleFlags.fromBind) === 0) {
        this.callSubscribers(currentValue, oldValue, flags);
      }
    }
  }

  public handleEvent(): void {
    const oldValue = this.oldValue = this.currentValue;
    const currentValue = this.currentValue = this.obj[this.propertyKey];
    if (oldValue !== currentValue) {
      this.oldValue = currentValue;
      this.callSubscribers(currentValue, oldValue, LifecycleFlags.none);
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    if (!this.hasSubscribers()) {
      this.handler.subscribe(this.obj, this);
      this.currentValue = this.oldValue = this.obj[this.propertyKey];
    }
    this.addSubscriber(subscriber);
  }

  public unsubscribe(subscriber: ISubscriber): void {
    this.removeSubscriber(subscriber);
    if (!this.hasSubscribers()) {
      this.handler.dispose();
    }
  }
}
