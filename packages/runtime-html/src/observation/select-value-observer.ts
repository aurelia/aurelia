import {
  type CollectionKind,
  subscriberCollection,
  AccessorType,
} from '@aurelia/runtime';

import type { INode } from '../dom';
import type {
  ICollectionObserver,
  IObserverLocator,
  ISubscriberCollection,
} from '@aurelia/runtime';
import { createError, hasOwnProperty, isArray } from '../utilities';
import { INodeObserver, INodeObserverConfigBase } from './observer-locator';
import { mixinNodeObserverUseConfig } from './observation-utils';

const childObserverOptions = {
  childList: true,
  subtree: true,
  characterData: true
};

function defaultMatcher(a: unknown, b: unknown): boolean {
  return a === b;
}

export interface ISelectElement extends HTMLSelectElement {
  options: HTMLCollectionOf<IOptionElement> & Pick<HTMLOptionsCollection, 'length' | 'selectedIndex' | 'add' | 'remove'>;
  matcher?: typeof defaultMatcher;
}
export interface IOptionElement extends HTMLOptionElement {
  model?: unknown;
}

export interface SelectValueObserver extends
  ISubscriberCollection {}

export class SelectValueObserver implements INodeObserver {
  // ObserverType.Layout is not always true
  // but for simplicity, always treat as such
  public type: AccessorType = AccessorType.Node | AccessorType.Observer | AccessorType.Layout;

  /** @internal */
  private _value: unknown = void 0;

  /** @internal */
  private _oldValue: unknown = void 0;

  /** @internal */
  public readonly _el: ISelectElement;

  /** @internal */
  private _hasChanges: boolean = false;
  /** @internal */
  private _arrayObserver?: ICollectionObserver<CollectionKind.array> = void 0;
  /** @internal */
  private _nodeObserver?: MutationObserver = void 0;

  /** @internal */
  private _observing: boolean = false;

  /** @internal */
  private readonly _observerLocator: IObserverLocator;

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
   */
  public useConfig!: (config: INodeObserverConfigBase) => void;

  public constructor(
    obj: INode,
    // deepscan-disable-next-line
    _key: PropertyKey,
    config: INodeObserverConfigBase,
    observerLocator: IObserverLocator,
  ) {
    this._el = obj as ISelectElement;
    this._observerLocator = observerLocator;
    this._config = config;
  }

  public getValue(): unknown {
    // is it safe to assume the observer has the latest value?
    // todo: ability to turn on/off cache based on type
    return this._observing
      ? this._value
      : this._el.multiple
        // todo: maybe avoid double iteration?
        ? getSelectedOptions(this._el.options)
        : this._el.value;
  }

  public setValue(newValue: unknown): void {
    this._oldValue = this._value;
    this._value = newValue;
    this._hasChanges = newValue !== this._oldValue;
    this._observeArray(newValue instanceof Array ? newValue : null);
    this._flushChanges();
  }

  /** @internal */
  private _flushChanges(): void {
    if (this._hasChanges) {
      this._hasChanges = false;
      this.syncOptions();
    }
  }

  public handleCollectionChange(): void {
    // always sync "selected" property of <options/>
    // immediately whenever the array notifies its mutation
    this.syncOptions();
  }

  public syncOptions(): void {
    const value = this._value;
    const obj = this._el;
    const $isArray = isArray(value);
    const matcher = obj.matcher ?? defaultMatcher;
    const options = obj.options;
    let i = options.length;

    while (i-- > 0) {
      const option = options[i];
      const optionValue = hasOwnProperty.call(option, 'model') ? option.model : option.value;
      if ($isArray) {
        option.selected = value.findIndex(item => !!matcher(optionValue, item)) !== -1;
        continue;
      }
      option.selected = !!matcher(optionValue, value);
    }
  }

  public syncValue(): boolean {
    // Spec for synchronizing value from `<select/>`  to `SelectObserver`
    // When synchronizing value to observed <select/> element, do the following steps:
    // A. If `<select/>` is multiple
    //    1. Check if current value, called `currentValue` is an array
    //      a. If not an array, return true to signal value has changed
    //      b. If is an array:
    //        i. gather all current selected <option/>, in to array called `values`
    //        ii. loop through the `currentValue` array and remove items that are nolonger selected based on matcher
    //        iii. loop through the `values` array and add items that are selected based on matcher
    //        iv. Return false to signal value hasn't changed
    // B. If the select is single
    //    1. Let `value` equal the first selected option, if no option selected, then `value` is `null`
    //    2. assign `this.currentValue` to `this.oldValue`
    //    3. assign `value` to `this.currentValue`
    //    4. return `true` to signal value has changed
    const obj = this._el;
    const options = obj.options;
    const len = options.length;
    const currentValue = this._value;
    let i = 0;

    if (obj.multiple) {
      // A.
      if (!(currentValue instanceof Array)) {
        // A.1.a
        return true;
      }
      // A.1.b
      // multi select
      let option: IOptionElement;
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      const matcher = obj.matcher || defaultMatcher;
      // A.1.b.i
      const values: unknown[] = [];
      while (i < len) {
        option = options[i];
        if (option.selected) {
          values.push(hasOwnProperty.call(option, 'model')
            ? option.model
            : option.value
          );
        }
        ++i;
      }
      let a: unknown;
      // A.1.b.ii
      i = 0;
      while (i < currentValue.length) {
        a = currentValue[i];
        // Todo: remove arrow fn
        if (values.findIndex(b => !!matcher(a, b)) === -1) {
          currentValue.splice(i, 1);
        } else {
          ++i;
        }
      }
      // A.1.b.iii
      i = 0;
      while (i < values.length) {
        a = values[i];
        // Todo: remove arrow fn
        if (currentValue.findIndex(b => !!matcher(a, b)) === -1) {
          currentValue.push(a);
        }
        ++i;
      }
      // A.1.b.iv
      return false;
    }
    // B. single select
    // B.1
    let value: unknown = null;
    let option: IOptionElement;
    while (i < len) {
      option = options[i];
      if (option.selected) {
        value = hasOwnProperty.call(option, 'model')
          ? option.model
          : option.value;
        break;
      }
      ++i;
    }
    // B.2
    this._oldValue = this._value;
    // B.3
    this._value = value;
    // B.4
    return true;
  }

  /**
   * Used by mixing defined methods subscribe
   *
   * @internal
   */
  public _start(): void {
    (this._nodeObserver = new this._el.ownerDocument.defaultView!.MutationObserver(this._handleNodeChange.bind(this)))
      .observe(this._el, childObserverOptions);
    this._observeArray(this._value instanceof Array ? this._value : null);
    this._observing = true;
  }

  /**
   * Used by mixing defined method unsubscribe
   *
   * @internal
   */
  public _stop(): void {
    this._nodeObserver!.disconnect();
    this._arrayObserver?.unsubscribe(this);
    this._nodeObserver
      = this._arrayObserver
      = void 0;
    this._observing = false;
  }

  // todo: observe all kind of collection
  /** @internal */
  private _observeArray(array: unknown[] | null): void {
    this._arrayObserver?.unsubscribe(this);
    this._arrayObserver = void 0;
    if (array != null) {
      if (!this._el.multiple) {
        if (__DEV__)
          throw createError(`AUR0654: Only null or Array instances can be bound to a multi-select.`);
        else
          throw createError(`AUR0654`);
      }
      (this._arrayObserver = this._observerLocator.getArrayObserver(array)).subscribe(this);
    }
  }

  public handleEvent(): void {
    const shouldNotify = this.syncValue();
    if (shouldNotify) {
      this._flush();
    }
  }

  /** @internal */
  private _handleNodeChange(_records: MutationRecord[]): void {
    // syncing options first means forcing the UI to take the existing state from the model
    // example: if existing state has only 3 selected option
    //          and it's adding a 4th <option/> with selected state
    //          [selected] state will be disregarded as it's not present in the model
    //          this force uni-direction flow: where UI update is only via user event, or model changes
    //          Cons:
    //          Sometimes, an <option selected /> maybe added to the UI, and causes confusion, as it's not selected anymore after the sync
    //          Consider this before entering release candidate
    this.syncOptions();
    const shouldNotify = this.syncValue();
    if (shouldNotify) {
      this._flush();
    }
  }

  /** @internal */
  private _flush(): void {
    oV = this._oldValue;
    this._oldValue = this._value;
    this.subs.notify(this._value, oV);
  }
}

mixinNodeObserverUseConfig(SelectValueObserver);
subscriberCollection(SelectValueObserver);

function getSelectedOptions(options: ArrayLike<IOptionElement>): unknown[] {
  const selection: unknown[] = [];
  if (options.length === 0) {
    return selection;
  }
  const ii = options.length;
  let i = 0;
  let option: IOptionElement;
  while (ii > i) {
    option = options[i];
    if (option.selected) {
      selection[selection.length] = hasOwnProperty.call(option, 'model') ? option.model : option.value;
    }
    ++i;
  }
  return selection;
}

// a shared variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV: unknown = void 0;
