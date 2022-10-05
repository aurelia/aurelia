import { AccessorType, subscriberCollection } from '@aurelia/runtime';
import { mixinNodeObserverUseConfig } from './observation-utils';
import { areEqual } from '../utilities';

import type { IIndexable } from '@aurelia/kernel';
import type { ISubscriberCollection } from '@aurelia/runtime';
import type { INode } from '../dom';
import type { INodeObserver, INodeObserverConfigBase } from './observer-locator';

export interface ValueAttributeObserver extends ISubscriberCollection {}
/**
 * Observer for non-radio, non-checkbox input.
 */
export class ValueAttributeObserver implements INodeObserver {
  // ObserverType.Layout is not always true, it depends on the element & property combo
  // but for simplicity, always treat as such
  public type: AccessorType = AccessorType.Node | AccessorType.Observer | AccessorType.Layout;

  /** @internal */
  public readonly _el: INode & IIndexable;

  /** @internal */
  private readonly _key: PropertyKey;

  /** @internal */
  private _value: unknown = '';

  /** @internal */
  private _oldValue: unknown = '';

  /** @internal */
  private _hasChanges: boolean = false;

  /**
   * Used by mixing defined methods subscribe/unsubscribe
   *
   * @internal
   */
  public _listened: boolean = false;

  /** @internal */
  public _config: INodeObserverConfigBase;

  /**
   * Comes from mixin
   *
   * @internal
   */
  public useConfig!: (config: INodeObserverConfigBase) => void;

  public constructor(
    obj: INode,
    key: PropertyKey,
    config:  INodeObserverConfigBase,
  ) {
    this._el = obj as INode & IIndexable;
    this._key = key;
    this._config = config;
  }

  public getValue(): unknown {
    // is it safe to assume the observer has the latest value?
    // todo: ability to turn on/off cache based on type
    return this._value;
  }

  public setValue(newValue: string | null): void {
    if (areEqual(newValue, this._value)) {
      return;
    }
    this._oldValue = this._value;
    this._value = newValue;
    this._hasChanges = true;
    if (!this._config.readonly) {
      this._flushChanges();
    }
  }

  /** @internal */
  private _flushChanges(): void {
    if (this._hasChanges) {
      this._hasChanges = false;
      this._el[this._key as string] = this._value ?? this._config.default;
      this._flush();
    }
  }

  public handleEvent(): void {
    this._oldValue = this._value;
    this._value = this._el[this._key as string];
    if (this._oldValue !== this._value) {
      this._hasChanges = false;
      this._flush();
    }
  }

  /**
   * Used by mixing defined methods subscribe
   *
   * @internal
   */
  public _start(): void {
    this._value = this._oldValue = this._el[this._key as string];
  }

  /** @internal */
  private _flush() {
    oV = this._oldValue;
    this._oldValue = this._value;
    this.subs.notify(this._value, oV);
  }
}

mixinNodeObserverUseConfig(ValueAttributeObserver);
subscriberCollection(ValueAttributeObserver);

// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV: unknown = void 0;
