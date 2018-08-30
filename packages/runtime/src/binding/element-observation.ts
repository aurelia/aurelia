import { IIndexable, Primitive } from '@aurelia/kernel';
import { DOM, INode, INodeObserver } from '../dom';
import { BindingFlags } from './binding-flags';
import { IChangeSet } from './change-set';
import { IEventSubscriber } from './event-manager';
import { CollectionKind, IBatchedCollectionSubscriber, IBindingTargetObserver, ICollectionObserver, IndexMap, IPropertySubscriber } from './observation';
import { IObserverLocator } from './observer-locator';
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

const handleEventFlags = BindingFlags.fromDOMEvent | BindingFlags.updateSourceExpression;

// tslint:disable-next-line:interface-name
export interface ValueAttributeObserver extends
  IBindingTargetObserver<INode, string, Primitive | IIndexable> { }

@targetObserver('')
export class ValueAttributeObserver implements ValueAttributeObserver {
  public currentValue: Primitive | IIndexable;
  public currentFlags: BindingFlags;
  public oldValue: Primitive | IIndexable;
  public defaultValue: Primitive | IIndexable;

  public flushChanges: () => void;

  constructor(
    public changeSet: IChangeSet,
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
        this.flushChanges = this.flushFileChanges;
      }
    } else {
      this.defaultValue = '';
    }
    this.oldValue = this.currentValue = obj[propertyKey];
  }

  public getValue(): Primitive | IIndexable {
    return this.obj[this.propertyKey];
  }

  public setValueCore(newValue: Primitive | IIndexable, flags: BindingFlags): void {
    this.obj[this.propertyKey] = newValue;
    if (flags & BindingFlags.fromBind) {
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

const defaultHandleBatchedChangeFlags = BindingFlags.fromFlushChanges | BindingFlags.updateTargetInstance;

// tslint:disable-next-line:interface-name
export interface CheckedObserver extends
  IBindingTargetObserver<HTMLInputElement, string, Primitive | IIndexable>,
  IBatchedCollectionSubscriber,
  IPropertySubscriber { }

@targetObserver()
export class CheckedObserver implements CheckedObserver {
  public currentValue: Primitive | IIndexable;
  public currentFlags: BindingFlags;
  public oldValue: Primitive | IIndexable;
  public defaultValue: Primitive | IIndexable;

  public flushChanges: () => void;

  private arrayObserver: ICollectionObserver<CollectionKind.array>;
  private valueObserver: ValueAttributeObserver;

  constructor(
    public changeSet: IChangeSet,
    public obj: HTMLInputElement & { $observers?: any; matcher?: any; model?: any; },
    public handler: IEventSubscriber,
    public observerLocator: IObserverLocator
  ) { }

  public getValue(): Primitive | IIndexable {
    return this.currentValue;
  }

  public setValueCore(newValue: Primitive | IIndexable, flags: BindingFlags): void {
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
  public handleChange(newValue: Primitive | IIndexable, previousValue: Primitive | IIndexable, flags: BindingFlags): void {
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
    } else if (Array.isArray(value)){
      element.checked = value.findIndex(item => !!matcher(item, elementValue)) !== -1;
    } else {
      element.checked = false;
    }
  }

  public notify(flags: BindingFlags): void {
    if (flags & BindingFlags.fromBind) {
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
    const matcher = element['matcher'] || ((a: Primitive | IIndexable, b: Primitive | IIndexable) => a === b);

    if (element.type === 'checkbox') {
      if (Array.isArray(value)) {
        index = value.findIndex(item => !!matcher(item, elementValue));
        if (element.checked && index === -1) {
          value.push(elementValue);
        } else if (!element.checked && index !== -1) {
          value.splice(index, 1);
        }
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
type HTMLOptionElementWithModel = HTMLOptionElement & { model?: Primitive | IIndexable };

function defaultMatcher(a: Primitive | IIndexable, b: Primitive | IIndexable): boolean {
  return a === b;
}

// tslint:disable-next-line:interface-name
export interface SelectValueObserver extends
  IBindingTargetObserver<HTMLSelectElement & { matcher?: typeof defaultMatcher }, string, Primitive | UntypedArray>,
  IBatchedCollectionSubscriber,
  IPropertySubscriber { }

@targetObserver()
export class SelectValueObserver implements SelectValueObserver {
  public currentValue: Primitive | UntypedArray;
  public currentFlags: BindingFlags;
  public oldValue: Primitive | UntypedArray;
  public defaultValue: Primitive | UntypedArray;

  public flushChanges: () => void;

  private arrayObserver: ICollectionObserver<CollectionKind.array>;
  private nodeObserver: INodeObserver;

  constructor(
    public changeSet: IChangeSet,
    public obj: HTMLSelectElement & { matcher?: typeof defaultMatcher },
    public handler: IEventSubscriber,
    public observerLocator: IObserverLocator
  ) { }

  public getValue(): Primitive | UntypedArray {
    return this.currentValue;
  }

  public setValueCore(newValue: Primitive | UntypedArray, flags: BindingFlags): void {
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
  public handleChange(newValue: Primitive | UntypedArray, previousValue: Primitive | UntypedArray, flags: BindingFlags): void {
    this.setValue(newValue, flags);
  }

  public notify(flags: BindingFlags): void {
    if (flags & BindingFlags.fromBind) {
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
    this.synchronizeValue();
    // TODO: need to clean up / improve the way collection changes are handled here (we currently just create and assign a new array to the source each change)
    this.notify(handleEventFlags);
  }

  public synchronizeOptions(indexMap?: IndexMap): void {
    const currentValue = this.currentValue;
    const isArray = Array.isArray(currentValue);
    const obj = this.obj;
    const matcher = obj.matcher || defaultMatcher;
    const options = obj.options;
    let i = options.length;

    while (i--) {
      const option = options.item(i) as HTMLOptionElement & { model?: Primitive | IIndexable };
      const optionValue = option.hasOwnProperty('model') ? option.model : option.value;
      if (isArray) {
        option.selected = (<UntypedArray>currentValue).findIndex(item => !!matcher(optionValue, item)) !== -1;
        continue;
      }
      option.selected = !!matcher(optionValue, currentValue);
    }
  }

  public synchronizeValue(): void {
    const obj = this.obj;
    const options = obj.options;
    const len = options.length;
    this.oldValue = this.currentValue;

    if (obj.multiple) {
      // multi select
      let i = 0;
      const newValue: UntypedArray = [];
      while (i < len) {
        const option = options.item(i) as HTMLOptionElementWithModel;
        if (option.selected) {
          const optionValue = option.hasOwnProperty('model') ? option.model : option.value;
          newValue.push(optionValue);
        }
        i++;
      }
      this.currentValue = newValue;
    } else {
      // single select
      let i = 0;
      while (i < len) {
        const option = options.item(i) as HTMLOptionElementWithModel;
        if (option.selected) {
          const optionValue = option.hasOwnProperty('model') ? option.model : option.value;
          this.currentValue = optionValue as Primitive | UntypedArray;
          return;
        }
        i++;
      }
    }
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
    this.nodeObserver = DOM.createNodeObserver(this.obj, () => {
      this.synchronizeOptions();
      this.synchronizeValue();
    }, childObserverOptions);
  }

  public unbind(): void {
    this.nodeObserver.disconnect();
    this.nodeObserver = null;

    if (this.arrayObserver) {
      this.arrayObserver.unsubscribeBatched(this);
      this.arrayObserver = null;
    }
  }
}

SelectValueObserver.prototype.handler = null;
SelectValueObserver.prototype.observerLocator = null;
