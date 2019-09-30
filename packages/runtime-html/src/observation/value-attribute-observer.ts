import { IIndexable } from '@aurelia/kernel';
import {
  IAccessor,
  ILifecycle,
  ISubscriber,
  ISubscriberCollection,
  LifecycleFlags,
  Priority,
  subscriberCollection,
} from '@aurelia/runtime';
import { IEventSubscriber } from './event-manager';

export interface ValueAttributeObserver
  extends ISubscriberCollection {}

// TODO: handle file attribute properly again, etc

@subscriberCollection()
export class ValueAttributeObserver implements IAccessor<unknown> {
  public readonly lifecycle: ILifecycle;
  public readonly handler: IEventSubscriber;

  public readonly obj: Node & IIndexable;
  public readonly propertyKey: string;
  public currentValue: unknown;
  public oldValue: unknown;

  public readonly persistentFlags: LifecycleFlags;

  public hasChanges: boolean;
  public priority: Priority;

  constructor(
    lifecycle: ILifecycle,
    flags: LifecycleFlags,
    handler: IEventSubscriber,
    obj: Node,
    propertyKey: string,
  ) {
    this.lifecycle = lifecycle;
    this.handler = handler;

    this.obj = obj as Node & IIndexable;
    this.propertyKey = propertyKey;
    this.currentValue = '';
    this.oldValue = '';

    this.hasChanges = false;
    this.priority = Priority.propagate;
    this.persistentFlags = flags & LifecycleFlags.targetObserverFlags;
  }

  public getValue(): unknown {
    return this.currentValue;
  }

  public setValue(newValue: string | null, flags: LifecycleFlags): void {
    this.currentValue = newValue;
    this.hasChanges = newValue !== this.oldValue;
    if ((flags & LifecycleFlags.fromBind) > 0 || this.persistentFlags === LifecycleFlags.noTargetObserverQueue) {
      this.flushRAF(flags);
    } else if (this.persistentFlags !== LifecycleFlags.persistentTargetObserverQueue) {
      this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority, true);
    }
  }

  public flushRAF(flags: LifecycleFlags): void {
    if (this.hasChanges) {
      this.hasChanges = false;
      const { currentValue, oldValue } = this;
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
      this.callSubscribers(currentValue, oldValue, LifecycleFlags.fromDOMEvent | LifecycleFlags.allowPublishRoundtrip);
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

  public bind(flags: LifecycleFlags): void {
    if (this.persistentFlags === LifecycleFlags.persistentTargetObserverQueue) {
      this.lifecycle.enqueueRAF(this.flushRAF, this, this.priority);
    }
  }

  public unbind(flags: LifecycleFlags): void {
    if (this.persistentFlags === LifecycleFlags.persistentTargetObserverQueue) {
      this.lifecycle.dequeueRAF(this.flushRAF, this);
    }
  }
}
