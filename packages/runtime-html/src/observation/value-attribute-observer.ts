import { LifecycleFlags, subscriberCollection, AccessorType, withFlushQueue } from '@aurelia/runtime';

import type { EventSubscriber } from './event-delegator.js';
import type { INode } from '../dom.js';
import type { IIndexable } from '@aurelia/kernel';
import type {
  ISubscriberCollection,
  ISubscriber,
  IObserver,
  IFlushable,
  IWithFlushQueue,
  FlushQueue,
} from '@aurelia/runtime';

export interface ValueAttributeObserver extends ISubscriberCollection {}
/**
 * Observer for non-radio, non-checkbox input.
 */
export class ValueAttributeObserver implements IObserver, IWithFlushQueue, IFlushable {
  public readonly obj: INode & IIndexable;
  public currentValue: unknown = '';
  public oldValue: unknown = '';

  public hasChanges: boolean = false;
  // ObserverType.Layout is not always true, it depends on the element & property combo
  // but for simplicity, always treat as such
  public type: AccessorType = AccessorType.Node | AccessorType.Observer | AccessorType.Layout;
  public readonly queue!: FlushQueue;

  public constructor(
    obj: INode,
    public readonly propertyKey: PropertyKey,
    public readonly handler: EventSubscriber,
  ) {
    this.obj = obj as INode & IIndexable;
  }

  public getValue(): unknown {
    // is it safe to assume the observer has the latest value?
    // todo: ability to turn on/off cache based on type
    return this.currentValue;
  }

  public setValue(newValue: string | null, flags: LifecycleFlags): void {
    if (Object.is(newValue, this.currentValue)) {
      return;
    }
    this.oldValue = this.currentValue;
    this.currentValue = newValue;
    this.hasChanges = true;
    if (!this.handler.config.readonly && (flags & LifecycleFlags.noFlush) === 0) {
      this.flushChanges(flags);
    }
  }

  public flushChanges(flags: LifecycleFlags): void {
    if (this.hasChanges) {
      this.hasChanges = false;
      this.obj[this.propertyKey as string] = this.currentValue ?? this.handler.config.default;

      if ((flags & LifecycleFlags.fromBind) === 0) {
        this.queue.add(this);
      }
    }
  }

  public handleEvent(): void {
    const oldValue = this.oldValue = this.currentValue;
    const currentValue = this.currentValue = this.obj[this.propertyKey as string];
    if (oldValue !== currentValue) {
      this.hasChanges = false;
      this.queue.add(this);
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    if (this.subs.add(subscriber) && this.subs.count === 1) {
      this.handler.subscribe(this.obj, this);
      this.currentValue = this.oldValue = this.obj[this.propertyKey as string];
    }
  }

  public unsubscribe(subscriber: ISubscriber): void {
    if (this.subs.remove(subscriber) && this.subs.count === 0) {
      this.handler.dispose();
    }
  }

  public flush(): void {
    oV = this.oldValue;
    this.oldValue = this.currentValue;
    this.subs.notify(this.currentValue, oV, LifecycleFlags.none);
  }
}

subscriberCollection(ValueAttributeObserver);
withFlushQueue(ValueAttributeObserver);

// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV: unknown = void 0;
