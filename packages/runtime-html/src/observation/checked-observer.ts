import {
  CollectionKind,
  LifecycleFlags,
  SetterObserver,
  subscriberCollection,
  AccessorType,
  withFlushQueue,
} from '@aurelia/runtime';
import { getCollectionObserver } from './observer-locator.js';
import { hasOwnProperty } from '../utilities.js';

import type { INode } from '../dom.js';
import type { EventSubscriber } from './event-delegator.js';
import type { ValueAttributeObserver } from './value-attribute-observer.js';
import type {
  ICollectionObserver,
  IndexMap,
  ISubscriber,
  ISubscriberCollection,
  IObserver,
  IObserverLocator,
  IFlushable,
  IWithFlushQueue,
  FlushQueue,
} from '@aurelia/runtime';

export interface IInputElement extends HTMLInputElement {
  model?: unknown;
  $observers?: {
    model?: SetterObserver;
    value?: ValueAttributeObserver;
  };
  matcher?: typeof defaultMatcher;
}

function defaultMatcher(a: unknown, b: unknown): boolean {
  return a === b;
}

export interface CheckedObserver extends
  ISubscriberCollection { }

export class CheckedObserver implements IObserver, IFlushable, IWithFlushQueue {
  public type: AccessorType = AccessorType.Node | AccessorType.Observer | AccessorType.Layout;

  public readonly queue!: FlushQueue;

  /** @internal */
  private _value: unknown = void 0;

  /** @internal */
  private _oldValue: unknown = void 0;

  /** @internal */
  private readonly _obj: IInputElement;

  /** @internal */
  private _collectionObserver?: ICollectionObserver<CollectionKind> = void 0;

  /** @internal */
  private _valueObserver?: ValueAttributeObserver | SetterObserver = void 0;

  /** @internal */
  private f: LifecycleFlags = LifecycleFlags.none;

  /** @internal */
  private readonly oL: IObserverLocator;

  public constructor(
    obj: INode,
    // deepscan-disable-next-line
    _key: PropertyKey,
    public readonly handler: EventSubscriber,
    observerLocator: IObserverLocator,
  ) {
    this._obj = obj as IInputElement;
    this.oL = observerLocator;
  }

  public getValue(): unknown {
    return this._value;
  }

  public setValue(newValue: unknown, flags: LifecycleFlags): void {
    const currentValue = this._value;
    if (newValue === currentValue) {
      return;
    }
    this._value = newValue;
    this._oldValue = currentValue;
    this.f = flags;
    this._observe();
    this._synchronizeElement();
    this.queue.add(this);
  }

  public handleCollectionChange(_indexMap: IndexMap, _flags: LifecycleFlags): void {
    this._synchronizeElement();
  }

  public handleChange(_newValue: unknown, _previousValue: unknown, _flags: LifecycleFlags): void {
    this._synchronizeElement();
  }

  /** @internal */
  private _synchronizeElement(): void {
    const currentValue = this._value;
    const obj = this._obj;
    const elementValue = hasOwnProperty.call(obj, 'model') ? obj.model : obj.value;
    const isRadio = obj.type === 'radio';
    const matcher = obj.matcher !== void 0 ? obj.matcher : defaultMatcher;

    if (isRadio) {
      obj.checked = !!matcher(currentValue, elementValue);
    } else if (currentValue === true) {
      obj.checked = true;
    } else {
      let hasMatch = false;
      if (currentValue instanceof Array) {
        hasMatch = currentValue.findIndex(item => !!matcher(item, elementValue)) !== -1;
      } else if (currentValue instanceof Set) {
        for (const v of currentValue) {
          if (matcher(v, elementValue)) {
            hasMatch = true;
            break;
          }
        }
      } else if (currentValue instanceof Map) {
        for (const pair of currentValue) {
          const existingItem = pair[0];
          const $isChecked = pair[1];
          // a potential complain, when only `true` is supported
          // but it's consistent with array
          if (matcher(existingItem, elementValue) && $isChecked === true) {
            hasMatch = true;
            break;
          }
        }
      }
      obj.checked = hasMatch;
    }
  }

  public handleEvent(): void {
    let currentValue = this._oldValue = this._value;
    const obj = this._obj;
    const elementValue = hasOwnProperty.call(obj, 'model') ? obj.model : obj.value;
    const isChecked = obj.checked;
    const matcher = obj.matcher !== void 0 ? obj.matcher : defaultMatcher;

    if (obj.type === 'checkbox') {
      if (currentValue instanceof Array) {
        // Array binding steps on a change event:
        // 1. find corresponding item INDEX in the Set based on current model/value and matcher
        // 2. is the checkbox checked?
        //    2.1. Yes: is the corresponding item in the Array (index === -1)?
        //        2.1.1 No: push the current model/value to the Array
        //    2.2. No: is the corresponding item in the Array (index !== -1)?
        //        2.2.1: Yes: remove the corresponding item
        // =================================================
        const index = currentValue.findIndex(item => !!matcher(item, elementValue));

        // if the checkbox is checkde, and there's no matching value in the existing array
        // add the checkbox model/value to the array
        if (isChecked && index === -1) {
          currentValue.push(elementValue);
        } else if (!isChecked && index !== -1) {
          // if the checkbox is not checked, and found a matching item in the array
          // based on the checkbox model/value
          // remove the existing item
          currentValue.splice(index, 1);
        }
        // when existing currentValue is an array,
        // do not invoke callback as only the array obj has changed
        return;
      } else if (currentValue instanceof Set) {
        // Set binding steps on a change event:
        // 1. find corresponding item in the Set based on current model/value and matcher
        // 2. is the checkbox checked?
        //    2.1. Yes: is the corresponding item in the Set?
        //        2.1.1 No: add the current model/value to the Set
        //    2.2. No: is the corresponding item in the Set?
        //        2.2.1: Yes: remove the corresponding item
        // =================================================

        // 1. find corresponding item
        const unset = {};
        let existingItem: unknown = unset;
        for (const value of currentValue) {
          if (matcher(value, elementValue) === true) {
            existingItem = value;
            break;
          }
        }
        // 2.1. Checkbox is checked, is the corresponding item in the Set?
        //
        // if checkbox is checked and there's no value in the existing Set
        // add the checkbox model/value to the Set
        if (isChecked && existingItem === unset) {
          // 2.1.1. add the current model/value to the Set
          currentValue.add(elementValue);
        } else if (!isChecked && existingItem !== unset) {
          // 2.2.1 Checkbox is unchecked, corresponding is in the Set
          //
          // if checkbox is not checked, and found a matching item in the Set
          // based on the checkbox model/value
          // remove the existing item
          currentValue.delete(existingItem);
        }
        // when existing value is a Set,
        // do not invoke callback as only the Set has been mutated
        return;
      } else if (currentValue instanceof Map) {
        // Map binding steps on a change event
        // 1. find corresponding item in the Map based on current model/value and matcher
        // 2. Set the value of the corresponding item in the Map based on checked state of the checkbox
        // =================================================

        // 1. find the corresponding item
        let existingItem: unknown;
        for (const pair of currentValue) {
          const currItem = pair[0];
          if (matcher(currItem, elementValue) === true) {
            existingItem = currItem;
            break;
          }
        }

        // 2. set the value of the corresponding item in the map
        // if checkbox is checked and there's no value in the existing Map
        // add the checkbox model/value to the Map as key,
        // and value will be checked state of the checkbox
        currentValue.set(existingItem, isChecked);
        // when existing value is a Map,
        // do not invoke callback as only the Map has been mutated
        return;
      }
      currentValue = isChecked;
    } else if (isChecked) {
      currentValue = elementValue;
    } else {
      // if it's a radio and it has been unchecked
      // do nothing, as the radio that was checked will fire change event and it will be handle there
      // a radio cannot be unchecked by user
      return;
    }
    this._value = currentValue;
    this.queue.add(this);
  }

  public start() {
    this.handler.subscribe(this._obj, this);
    this._observe();
  }

  public stop(): void {
    this.handler.dispose();
    this._collectionObserver?.unsubscribe(this);
    this._collectionObserver = void 0;

    this._valueObserver?.unsubscribe(this);
  }

  public subscribe(subscriber: ISubscriber): void {
    if (this.subs.add(subscriber) && this.subs.count === 1) {
      this.start();
    }
  }

  public unsubscribe(subscriber: ISubscriber): void {
    if (this.subs.remove(subscriber) && this.subs.count === 0) {
      this.stop();
    }
  }

  public flush(): void {
    oV = this._oldValue;
    this._oldValue = this._value;
    this.subs.notify(this._value, oV, this.f);
  }

  /** @internal */
  private _observe() {
    const obj = this._obj;

    (this._valueObserver ??= obj.$observers?.model ?? obj.$observers?.value)?.subscribe(this);

    this._collectionObserver?.unsubscribe(this);
    this._collectionObserver = void 0;

    if (obj.type === 'checkbox') {
      (this._collectionObserver = getCollectionObserver(this._value, this.oL))?.subscribe(this);
    }
  }
}

subscriberCollection(CheckedObserver);
withFlushQueue(CheckedObserver);

// a reusable variable for `.flush()` methods of observers
// so that there doesn't need to create an env record for every call
let oV: unknown = void 0;
