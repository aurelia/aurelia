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
  // ObserverType.Layout is not always true, it depends on the element & property combo
  // but for simplicity, always treat as such
  public type: AccessorType = AccessorType.Node | AccessorType.Observer | AccessorType.Layout;

  public readonly obj: INode & IIndexable;
  public value: unknown = '';
  /** @internal */
  private _oldValue: unknown = '';

  /** @internal */
  private _hasChanges: boolean = false;
  public readonly queue!: FlushQueue;

  public constructor(
    obj: INode,
    public readonly key: PropertyKey,
    public readonly handler: EventSubscriber,
  ) {
    this.obj = obj as INode & IIndexable;
  }

  public getValue(): unknown {
    // is it safe to assume the observer has the latest value?
    // todo: ability to turn on/off cache based on type
    return this.value;
  }

  public setValue(newValue: string | null, flags: LifecycleFlags): void {
    if (Object.is(newValue, this.value)) {
      return;
    }
    this._oldValue = this.value;
    this.value = newValue;
    this._hasChanges = true;
    if (!this.handler.config.readonly && (flags & LifecycleFlags.noFlush) === 0) {
      this._flushChanges(flags);
    }
  }

  /** @internal */
  private _flushChanges(flags: LifecycleFlags): void {
    if (this._hasChanges) {
      this._hasChanges = false;
      this.obj[this.key as string] = this.value ?? this.handler.config.default;

      if ((flags & LifecycleFlags.fromBind) === 0) {
        this.queue.add(this);
      }
    }
  }

  public handleEvent(): void {
    this._oldValue = this.value;
    this.value = this.obj[this.key as string];
    if (this._oldValue !== this.value) {
      this._hasChanges = false;
      this.queue.add(this);
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    if (this.subs.add(subscriber) && this.subs.count === 1) {
      this.handler.subscribe(this.obj, this);
      this.value = this._oldValue = this.obj[this.key as string];
    }
  }

  public unsubscribe(subscriber: ISubscriber): void {
    if (this.subs.remove(subscriber) && this.subs.count === 0) {
      this.handler.dispose();
    }
  }

  public flush(): void {
    oV = this._oldValue;
    this._oldValue = this.value;
    this.subs.notify(this.value, oV, LifecycleFlags.none);
  }
}

subscriberCollection(ValueAttributeObserver);
withFlushQueue(ValueAttributeObserver);

// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV: unknown = void 0;
