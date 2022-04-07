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

  public readonly queue!: FlushQueue;

  /** @internal */
  private readonly _obj: INode & IIndexable;

  /** @internal */
  private readonly _key: PropertyKey;

  /** @internal */
  private _value: unknown = '';

  /** @internal */
  private _oldValue: unknown = '';

  /** @internal */
  private _hasChanges: boolean = false;

  public constructor(
    obj: INode,
    key: PropertyKey,
    public readonly handler: EventSubscriber,
  ) {
    this._obj = obj as INode & IIndexable;
    this._key = key;
  }

  public getValue(): unknown {
    // is it safe to assume the observer has the latest value?
    // todo: ability to turn on/off cache based on type
    return this._value;
  }

  public setValue(newValue: string | null, flags: LifecycleFlags): void {
    if (Object.is(newValue, this._value)) {
      return;
    }
    this._oldValue = this._value;
    this._value = newValue;
    this._hasChanges = true;
    if (!this.handler.config.readonly && (flags & LifecycleFlags.noFlush) === 0) {
      this._flushChanges(flags);
    }
  }

  /** @internal */
  private _flushChanges(flags: LifecycleFlags): void {
    if (this._hasChanges) {
      this._hasChanges = false;
      this._obj[this._key as string] = this._value ?? this.handler.config.default;

      if ((flags & LifecycleFlags.fromBind) === 0) {
        this.queue.add(this);
      }
    }
  }

  public handleEvent(): void {
    this._oldValue = this._value;
    this._value = this._obj[this._key as string];
    if (this._oldValue !== this._value) {
      this._hasChanges = false;
      this.queue.add(this);
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    if (this.subs.add(subscriber) && this.subs.count === 1) {
      this.handler.subscribe(this._obj, this);
      this._value = this._oldValue = this._obj[this._key as string];
    }
  }

  public unsubscribe(subscriber: ISubscriber): void {
    if (this.subs.remove(subscriber) && this.subs.count === 0) {
      this.handler.dispose();
    }
  }

  public flush(): void {
    oV = this._oldValue;
    this._oldValue = this._value;
    this.subs.notify(this._value, oV, LifecycleFlags.none);
  }
}

subscriberCollection(ValueAttributeObserver);
withFlushQueue(ValueAttributeObserver);

// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV: unknown = void 0;
