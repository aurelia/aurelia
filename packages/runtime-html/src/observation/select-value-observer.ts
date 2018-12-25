import {
  CollectionKind,
  IBatchedCollectionSubscriber,
  IBindingTargetObserver,
  ICollectionObserver,
  IDOM,
  ILifecycle,
  IndexMap,
  IObserverLocator,
  IPropertySubscriber,
  LifecycleFlags,
  targetObserver
} from '@aurelia/runtime';
import { IEventSubscriber } from './event-manager';

const handleEventFlags = LifecycleFlags.fromDOMEvent | LifecycleFlags.updateSourceExpression;

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
  IBindingTargetObserver<ISelectElement, string>,
  IBatchedCollectionSubscriber,
  IPropertySubscriber { }

@targetObserver()
export class SelectValueObserver implements SelectValueObserver {
  public readonly isDOMObserver: true;
  public lifecycle: ILifecycle;
  public obj: ISelectElement;
  public handler: IEventSubscriber;
  public observerLocator: IObserverLocator;
  public currentValue: unknown;
  public currentFlags: LifecycleFlags;
  public oldValue: unknown;
  public defaultValue: unknown;

  public flush: () => void;

  private arrayObserver: ICollectionObserver<CollectionKind.array>;
  private nodeObserver: MutationObserver;

  constructor(
    lifecycle: ILifecycle,
    obj: ISelectElement,
    handler: IEventSubscriber,
    observerLocator: IObserverLocator
  ) {
    this.isDOMObserver = true;
    this.lifecycle = lifecycle;
    this.obj = obj;
    this.handler = handler;
    this.observerLocator = observerLocator;
  }

  public getValue(): unknown {
    return this.currentValue;
  }

  public setValueCore(newValue: unknown, flags: LifecycleFlags): void {
    const isArray = Array.isArray(newValue);
    if (!isArray && newValue !== null && newValue !== undefined && this.obj.multiple) {
      throw new Error('Only null or Array instances can be bound to a multi-select.');
    }
    if (this.arrayObserver) {
      this.arrayObserver.unsubscribeBatched(this);
      this.arrayObserver = null;
    }
    if (isArray) {
      this.arrayObserver = this.observerLocator.getArrayObserver(newValue as unknown[]);
      this.arrayObserver.subscribeBatched(this);
    }
    this.synchronizeOptions();
    this.notify(flags);
  }

  // called when the array mutated (items sorted/added/removed, etc)
  public handleBatchedChange(indexMap: number[]): void {
    // we don't need to go through the normal setValue logic and can directly call synchronizeOptions here,
    // because the change already waited one tick (batched) and there's no point in calling notify when the instance didn't change
    this.synchronizeOptions(indexMap);
  }

  // called when a different value was assigned
  public handleChange(newValue: unknown, previousValue: unknown, flags: LifecycleFlags): void {
    this.setValue(newValue, flags);
  }

  public notify(flags: LifecycleFlags): void {
    if (flags & LifecycleFlags.fromBind) {
      return;
    }
    const oldValue = this.oldValue;
    const newValue = this.currentValue;
    if (newValue === oldValue) {
      return;
    }
    this.callSubscribers(newValue, oldValue, flags);
  }

  public handleEvent(): void {
    // "from-view" changes are always synchronous now, so immediately sync the value and notify subscribers
    const shouldNotify = this.synchronizeValue();
    if (shouldNotify) {
      this.notify(handleEventFlags);
    }
  }

  public synchronizeOptions(indexMap?: IndexMap): void {
    const currentValue = this.currentValue;
    const isArray = Array.isArray(currentValue);
    const obj = this.obj;
    const matcher = obj.matcher || defaultMatcher;
    const options = obj.options;
    let i = options.length;

    while (i--) {
      const option = options[i];
      const optionValue = option.hasOwnProperty('model') ? option.model : option.value;
      if (isArray) {
        option.selected = (currentValue as unknown[]).findIndex(item => !!matcher(optionValue, item)) !== -1;
        continue;
      }
      option.selected = !!matcher(optionValue, currentValue);
    }
  }

  public synchronizeValue(): boolean {
    // Spec for synchronizing value from `SelectObserver` to `<select/>`
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
    const obj = this.obj;
    const options = obj.options;
    const len = options.length;
    const currentValue = this.currentValue;
    let i = 0;

    if (obj.multiple) {
      // A.
      if (!Array.isArray(currentValue)) {
        // A.1.a
        return true;
      }
      // A.1.b
      // multi select
      let option: IOptionElement;
      const matcher = obj.matcher || defaultMatcher;
      // A.1.b.i
      const values: unknown[] = [];
      while (i < len) {
        option = options[i];
        if (option.selected) {
          values.push(option.hasOwnProperty('model')
            ? option.model
            : option.value
          );
        }
        ++i;
      }
      // A.1.b.ii
      i = 0;
      while (i < currentValue.length) {
        const a = currentValue[i];
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
        const a = values[i];
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
    while (i < len) {
      const option = options[i];
      if (option.selected) {
        value = option.hasOwnProperty('model')
          ? option.model
          : option.value;
        break;
      }
      ++i;
    }
    // B.2
    this.oldValue = this.currentValue;
    // B.3
    this.currentValue = value;
    // B.4
    return true;
  }

  public subscribe(subscriber: IPropertySubscriber): void {
    if (!this.hasSubscribers()) {
      this.handler.subscribe(this.obj, this);
    }
    this.addSubscriber(subscriber);
  }

  public unsubscribe(subscriber: IPropertySubscriber): void {
    if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
      this.handler.dispose();
    }
  }

  public bind(): void {
    this.nodeObserver = new MutationObserver(this.handleNodeChange.bind(this))
    this.nodeObserver.observe(this.obj, childObserverOptions);
  }

  public unbind(): void {
    this.nodeObserver.disconnect();
    this.nodeObserver = null;

    if (this.arrayObserver) {
      this.arrayObserver.unsubscribeBatched(this);
      this.arrayObserver = null;
    }
  }

  public handleNodeChange(): void {
    this.synchronizeOptions();
    const shouldNotify = this.synchronizeValue();
    if (shouldNotify) {
      this.notify(handleEventFlags);
    }
  }
}

SelectValueObserver.prototype.handler = null;
SelectValueObserver.prototype.observerLocator = null;
