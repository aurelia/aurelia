import { IIndexable, Primitive } from '../../kernel';
import { DOM, IElement, IInputElement, INode, INodeObserver } from '../dom';
import { ILifecycle } from '../lifecycle';
import {
  CollectionKind, IBatchedCollectionSubscriber, IBindingTargetObserver, ICollectionObserver,
  IndexMap, IObserversLookup,  IPropertySubscriber, LifecycleFlags
} from '../observation';
import { IEventSubscriber } from './event-manager';
import { IObserverLocator } from './observer-locator';
import { SetterObserver } from './property-observation';
import { targetObserver } from './target-observer';

const inputValueDefaults = {
  ['button']: '',
  ['checkbox']: 'on',
  ['color']: '#000000',
  ['date']: '',
  ['datetime-local']: '',
  ['email']: '',
  ['file']: '',
  ['hidden']: '',
  ['image']: '',
  ['month']: '',
  ['number']: '',
  ['password']: '',
  ['radio']: 'on',
  ['range']: '50',
  ['reset']: '',
  ['search']: '',
  ['submit']: '',
  ['tel']: '',
  ['text']: '',
  ['time']: '',
  ['url']: '',
  ['week']: ''
};

const handleEventFlags = LifecycleFlags.fromDOMEvent | LifecycleFlags.updateSourceExpression;

export interface ValueAttributeObserver extends
  IBindingTargetObserver<INode, string, Primitive | IIndexable> { }

@targetObserver('')
export class ValueAttributeObserver implements ValueAttributeObserver {
  public currentValue: Primitive | IIndexable;
  public currentFlags: LifecycleFlags;
  public oldValue: Primitive | IIndexable;
  public defaultValue: Primitive | IIndexable;

  public flush: () => void;

  constructor(
    public lifecycle: ILifecycle,
    public obj: INode,
    public propertyKey: string,
    public handler: IEventSubscriber
  ) {
    // note: input.files can be assigned and this was fixed in Firefox 57:
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1384030

    // input.value (for type='file') however, can only be assigned an empty string
    if (propertyKey === 'value') {
      const nodeType = obj['type'];
      this.defaultValue = inputValueDefaults[nodeType || 'text'];
      if (nodeType === 'file') {
        this.flush = this.flushFileChanges;
      }
    } else {
      this.defaultValue = '';
    }
    this.oldValue = this.currentValue = obj[propertyKey];
  }

  public getValue(): Primitive | IIndexable {
    return this.obj[this.propertyKey];
  }

  public setValueCore(newValue: Primitive | IIndexable, flags: LifecycleFlags): void {
    this.obj[this.propertyKey] = newValue;
    if (flags & LifecycleFlags.fromBind) {
      return;
    }
    this.callSubscribers(this.currentValue, this.oldValue, flags);
  }

  public handleEvent(): void {
    const oldValue = this.oldValue = this.currentValue;
    const newValue = this.currentValue = this.getValue();
    if (oldValue !== newValue) {
      this.callSubscribers(newValue, oldValue, handleEventFlags);
      this.oldValue = newValue;
    }
  }

  public subscribe(subscriber: IPropertySubscriber): void {
    if (!this.hasSubscribers()) {
      this.oldValue = this.getValue();
      this.handler.subscribe(this.obj, this);
    }
    this.addSubscriber(subscriber);
  }

  public unsubscribe(subscriber: IPropertySubscriber): void {
    if (this.removeSubscriber(subscriber) && !this.hasSubscribers()) {
      this.handler.dispose();
    }
  }

  private flushFileChanges(): void {
    const currentValue = this.currentValue;
    if (this.oldValue !== currentValue) {
      if (currentValue === '') {
        this.setValueCore(currentValue, this.currentFlags);
        this.oldValue = this.currentValue;
      }
    }
  }
}

ValueAttributeObserver.prototype.propertyKey = '';
ValueAttributeObserver.prototype.handler = null;

const defaultHandleBatchedChangeFlags = LifecycleFlags.fromFlush | LifecycleFlags.updateTargetInstance;

interface IInternalInputElement extends IInputElement {
  matcher?: typeof defaultMatcher;
  model?: Primitive | IIndexable;
  $observers?: IObserversLookup & {
    model?: SetterObserver;
    value?: ValueAttributeObserver;
  };
}

export interface CheckedObserver extends
  IBindingTargetObserver<IInternalInputElement, string, Primitive | IIndexable>,
  IBatchedCollectionSubscriber,
  IPropertySubscriber { }

@targetObserver()
export class CheckedObserver implements CheckedObserver {
  public currentValue: Primitive | IIndexable;
  public currentFlags: LifecycleFlags;
  public oldValue: Primitive | IIndexable;
  public defaultValue: Primitive | IIndexable;

  public flush: () => void;

  private arrayObserver: ICollectionObserver<CollectionKind.array>;
  private valueObserver: ValueAttributeObserver | SetterObserver;

  constructor(
    public lifecycle: ILifecycle,
    public obj: IInternalInputElement,
    public handler: IEventSubscriber,
    public observerLocator: IObserverLocator
  ) { }

  public getValue(): Primitive | IIndexable {
    return this.currentValue;
  }

  public setValueCore(newValue: Primitive | IIndexable, flags: LifecycleFlags): void {
    if (!this.valueObserver) {
      this.valueObserver = this.obj['$observers'] && (this.obj['$observers'].model || this.obj['$observers'].value);
      if (this.valueObserver) {
        this.valueObserver.subscribe(this);
      }
    }
    if (this.arrayObserver) {
      this.arrayObserver.unsubscribeBatched(this);
      this.arrayObserver = null;
    }
    if (this.obj.type === 'checkbox' && Array.isArray(newValue)) {
      this.arrayObserver = this.observerLocator.getArrayObserver(newValue);
      this.arrayObserver.subscribeBatched(this);
    }
    this.synchronizeElement();
  }

  // handleBatchedCollectionChange (todo: rename to make this explicit?)
  public handleBatchedChange(): void {
    this.synchronizeElement();
    this.notify(defaultHandleBatchedChangeFlags);
  }

  // handlePropertyChange (todo: rename normal subscribe methods in target observers to batched, since that's what they really are)
  public handleChange(newValue: Primitive | IIndexable, previousValue: Primitive | IIndexable, flags: LifecycleFlags): void {
    this.synchronizeElement();
    this.notify(flags);
  }

  public synchronizeElement(): void {
    const value = this.currentValue;
    const element = this.obj;
    const elementValue = element.hasOwnProperty('model') ? element['model'] : element.value;
    const isRadio = element.type === 'radio';
    const matcher = element['matcher'] || ((a: Primitive | IIndexable, b: Primitive | IIndexable) => a === b);

    if (isRadio) {
      element.checked = !!matcher(value, elementValue);
    } else if (value === true) {
      element.checked = true;
    } else if (Array.isArray(value)) {
      element.checked = value.findIndex(item => !!matcher(item, elementValue)) !== -1;
    } else {
      element.checked = false;
    }
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
    this.callSubscribers(this.currentValue, this.oldValue, flags);
  }

  public handleEvent(): void {
    let value = this.currentValue;
    const element = this.obj;
    const elementValue = element.hasOwnProperty('model') ? element['model'] : element.value;
    let index;
    const matcher = element['matcher'] || defaultMatcher;

    if (element.type === 'checkbox') {
      if (Array.isArray(value)) {
        index = value.findIndex(item => !!matcher(item, elementValue));
        if (element.checked && index === -1) {
          value.push(elementValue);
        } else if (!element.checked && index !== -1) {
          value.splice(index, 1);
        }
        // when existing value is array, do not invoke callback as only the array element has changed
        return;
      }
      value = element.checked;
    } else if (element.checked) {
      value = elementValue;
    } else {
      return;
    }
    this.oldValue = this.currentValue;
    this.currentValue = value;
    this.notify(handleEventFlags);
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

  public unbind(): void {
    if (this.arrayObserver) {
      this.arrayObserver.unsubscribeBatched(this);
      this.arrayObserver = null;
    }
    if (this.valueObserver) {
      this.valueObserver.unsubscribe(this);
    }
  }
}

CheckedObserver.prototype.handler = null;
CheckedObserver.prototype.observerLocator = null;

const childObserverOptions = {
  childList: true,
  subtree: true,
  characterData: true
};

type UntypedArray = (Primitive | IIndexable)[];

function defaultMatcher(a: Primitive | IIndexable, b: Primitive | IIndexable): boolean {
  return a === b;
}

export interface ISelectElement extends IElement {
  multiple: boolean;
  value: string;
  options: ArrayLike<IOptionElement>;
  matcher?: typeof defaultMatcher;
}
export interface IOptionElement extends IElement {
  model?: Primitive | IIndexable;
  selected: boolean;
  value: string;
}

export interface SelectValueObserver extends
  IBindingTargetObserver<ISelectElement, string, Primitive | IIndexable | UntypedArray>,
  IBatchedCollectionSubscriber,
  IPropertySubscriber { }

@targetObserver()
export class SelectValueObserver implements SelectValueObserver {
  public currentValue: Primitive | IIndexable | UntypedArray;
  public currentFlags: LifecycleFlags;
  public oldValue: Primitive | IIndexable | UntypedArray;
  public defaultValue: Primitive | UntypedArray;

  public flush: () => void;

  private arrayObserver: ICollectionObserver<CollectionKind.array>;
  private nodeObserver: INodeObserver;

  constructor(
    public lifecycle: ILifecycle,
    public obj: ISelectElement,
    public handler: IEventSubscriber,
    public observerLocator: IObserverLocator
  ) { }

  public getValue(): Primitive | IIndexable | UntypedArray {
    return this.currentValue;
  }

  public setValueCore(newValue: Primitive | UntypedArray, flags: LifecycleFlags): void {
    const isArray = Array.isArray(newValue);
    if (!isArray && newValue !== null && newValue !== undefined && this.obj.multiple) {
      throw new Error('Only null or Array instances can be bound to a multi-select.');
    }
    if (this.arrayObserver) {
      this.arrayObserver.unsubscribeBatched(this);
      this.arrayObserver = null;
    }
    if (isArray) {
      this.arrayObserver = this.observerLocator.getArrayObserver(<(Primitive | IIndexable)[]>newValue);
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
  public handleChange(newValue: Primitive | UntypedArray, previousValue: Primitive | UntypedArray, flags: LifecycleFlags): void {
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
        option.selected = (<UntypedArray>currentValue).findIndex(item => !!matcher(optionValue, item)) !== -1;
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
      const values: UntypedArray = [];
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
    let value: Primitive | IIndexable | UntypedArray = null;
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
    this.nodeObserver = DOM.createNodeObserver(
      this.obj,
      this.handleNodeChange.bind(this),
      childObserverOptions
    );
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
