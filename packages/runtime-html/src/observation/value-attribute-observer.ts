import { AccessorType, subscriberCollection } from '@aurelia/runtime';

import type { IIndexable } from '@aurelia/kernel';
import type { IObserver, ISubscriber, ISubscriberCollection } from '@aurelia/runtime';
import type { INode } from '../dom';
import type { EventSubscriber } from './event-delegator';

export interface ValueAttributeObserver extends ISubscriberCollection {}
/**
 * Observer for non-radio, non-checkbox input.
 */
export class ValueAttributeObserver implements IObserver {
  // ObserverType.Layout is not always true, it depends on the element & property combo
  // but for simplicity, always treat as such
  public type: AccessorType = AccessorType.Node | AccessorType.Observer | AccessorType.Layout;

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

  public setValue(newValue: string | null): void {
    if (Object.is(newValue, this._value)) {
      return;
    }
    this._oldValue = this._value;
    this._value = newValue;
    this._hasChanges = true;
    if (!this.handler.config.readonly) {
      this._flushChanges();
    }
  }

  /** @internal */
  private _flushChanges(): void {
    if (this._hasChanges) {
      this._hasChanges = false;
      this._obj[this._key as string] = this._value ?? this.handler.config.default;
      this._flush();
    }
  }

  public handleEvent(): void {
    this._oldValue = this._value;
    this._value = this._obj[this._key as string];
    if (this._oldValue !== this._value) {
      this._hasChanges = false;
      this._flush();
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

  /** @internal */
  private _flush() {
    oV = this._oldValue;
    this._oldValue = this._value;
    this.subs.notify(this._value, oV);
  }
}

subscriberCollection(ValueAttributeObserver);

// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV: unknown = void 0;
