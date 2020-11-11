import { IIndexable } from '@aurelia/kernel';
import { IAccessor, ISubscriber, ISubscriberCollection, LifecycleFlags, subscriberCollection, AccessorType } from '@aurelia/runtime';
import { EventSubscriber } from './event-delegator';
import { INode } from '../dom';

export interface ValueAttributeObserver
  extends ISubscriberCollection {}

// TODO: handle file attribute properly again, etc

/**
 * Observer for non-radio, non-checkbox input.
 */
@subscriberCollection()
export class ValueAttributeObserver implements IAccessor {
  public readonly obj: INode & IIndexable;
  public currentValue: unknown = '';
  public oldValue: unknown = '';

  public readonly persistentFlags: LifecycleFlags = LifecycleFlags.none;

  public hasChanges: boolean = false;
  // ObserverType.Layout is not always true, it depends on the element & property combo
  // but for simplicity, always treat as such
  public type: AccessorType = AccessorType.Node | AccessorType.Observer | AccessorType.Layout;

  private readonly readonly: boolean;

  public constructor(
    obj: INode,
    public readonly propertyKey: PropertyKey,
    public readonly handler: EventSubscriber,
  ) {
    this.obj = obj as INode & IIndexable;
    this.readonly = handler.config.readonly === true;
  }

  public getValue(): unknown {
    // is it safe to assume the observer has the latest value?
    // todo: ability to turn on/off cache based on type
    return this.currentValue;
  }

  public setValue(newValue: string | null, flags: LifecycleFlags): void {
    this.currentValue = newValue;
    this.hasChanges = newValue !== this.oldValue;
    if (!this.readonly && (flags & LifecycleFlags.noFlush) === 0) {
      this.flushChanges(flags);
    }
  }

  public flushChanges(flags: LifecycleFlags): void {
    if (this.hasChanges) {
      this.hasChanges = false;
      const currentValue = this.currentValue;
      const oldValue = this.oldValue;
      this.oldValue = currentValue;
      this.obj[this.propertyKey as string] = currentValue ?? this.handler.config.default;

      if ((flags & LifecycleFlags.fromBind) === 0) {
        this.callSubscribers(currentValue, oldValue, flags);
      }
    }
  }

  public handleEvent(): void {
    const oldValue = this.oldValue = this.currentValue;
    const currentValue = this.currentValue = this.obj[this.propertyKey as string];
    if (oldValue !== currentValue) {
      this.oldValue = currentValue;
      this.callSubscribers(currentValue, oldValue, LifecycleFlags.none);
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    if (!this.hasSubscribers()) {
      this.handler.subscribe(this.obj, this);
      this.currentValue = this.oldValue = this.obj[this.propertyKey as string];
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
