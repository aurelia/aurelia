import { DOM, INode, INodeObserver } from '../dom';
import { BindingFlags } from './binding-flags';
import { IChangeSet } from './change-set';
import { IEventSubscriber } from './event-manager';
import { CollectionKind, IAccessor, IBatchedCollectionSubscriber, IChangeTracker, IPropertySubscriber, ISubscribable, MutationKind, ICollectionObserver, IBindingTargetObserver } from './observation';
import { IObserverLocator } from './observer-locator';
import { SubscriberCollection } from './subscriber-collection';

type ElementObserver = ValueAttributeObserver | CheckedObserver | SelectValueObserver;

function setValue(this: ElementObserver, newValue: string): Promise<void> {
  const currentValue = this.currentValue;
  newValue = newValue === null || newValue === undefined ? this.defaultValue : newValue;
  if (currentValue !== newValue) {
    this.hasChanges = true;
    this.previousValue = currentValue;
    this.currentValue = newValue;
    return this.changeSet.add(this);
  }
  return Promise.resolve();
}

function flushChanges(this: ElementObserver): void {
  if (this.hasChanges) {
    this.hasChanges = false;
    this.setValueCore(this.currentValue);
    this.oldValue = this.previousValue = this.currentValue;
  }
}

function dispose(this: ElementObserver): void {
  this.obj = null;
  this.currentValue = null;
  this.previousValue = null;
  this.oldValue = null;
}

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

export class ValueAttributeObserver extends SubscriberCollection implements IBindingTargetObserver<INode, string, any> {
  public hasChanges: boolean;
  public currentValue: string;
  public previousValue: string;
  public oldValue: string;
  public defaultValue: string;

  public setValue: (newValue: any) => Promise<void>;
  public flushChanges: () => void;
  public dispose: () => void;

  constructor(
    public changeSet: IChangeSet,
    public obj: INode,
    public propertyKey: string,
    public handler: IEventSubscriber
  ) {
    super();

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
    this.oldValue = this.previousValue = this.currentValue = obj[propertyKey];
  }

  public getValue(): any {
    return this.obj[this.propertyKey];
  }

  public setValueCore(newValue: any): void {
    this.obj[this.propertyKey] = newValue;
    this.notify(BindingFlags.sourceContext);
  }

  public notify(flags?: BindingFlags): void {
    this.callSubscribers(this.currentValue, this.previousValue, flags);
  }

  public handleEvent(): void {
    this.previousValue = this.currentValue;
    this.currentValue = this.getValue();
    this.notify(BindingFlags.targetContext);
    this.oldValue = this.previousValue = this.currentValue;
  }

  public subscribe(subscriber: IPropertySubscriber, flags?: BindingFlags): void {
    if (!this.hasSubscribers()) {
      this.oldValue = this.getValue();
      this.handler.subscribe(this.obj, this);
    }
    this.addSubscriber(subscriber, flags);
  }

  public unsubscribe(subscriber: IPropertySubscriber, flags?: BindingFlags): void {
    if (this.removeSubscriber(subscriber, flags) && !this.hasSubscribers()) {
      this.handler.dispose();
    }
  }

  private flushFileChanges(): void {
    if (this.hasChanges) {
      this.hasChanges = false;
      if (this.currentValue === '') {
        this.obj[this.propertyKey] = this.currentValue;
        this.notify(BindingFlags.sourceContext);
        this.oldValue = this.previousValue = this.currentValue;
      }
    }
  }
}

ValueAttributeObserver.prototype.hasChanges = false;
ValueAttributeObserver.prototype.currentValue = '';
ValueAttributeObserver.prototype.previousValue = '';
ValueAttributeObserver.prototype.oldValue = '';
ValueAttributeObserver.prototype.defaultValue = '';

ValueAttributeObserver.prototype.setValue = setValue;
ValueAttributeObserver.prototype.flushChanges = flushChanges;
ValueAttributeObserver.prototype.dispose = dispose;

ValueAttributeObserver.prototype.changeSet = null;
ValueAttributeObserver.prototype.obj = null;
ValueAttributeObserver.prototype.propertyKey = '';
ValueAttributeObserver.prototype.handler = null;

export class CheckedObserver extends SubscriberCollection implements IBindingTargetObserver<HTMLInputElement, string, any>, IBatchedCollectionSubscriber, IPropertySubscriber {
  public hasChanges: boolean;
  public currentValue: any;
  public previousValue: any;
  public oldValue: any;
  public defaultValue: any;

  public setValue: (newValue: any) => Promise<void>;
  public flushChanges: () => void;
  public dispose: () => void;

  private initialSync: boolean;
  private arrayObserver: ICollectionObserver<CollectionKind.array>;
  private valueObserver: ValueAttributeObserver;

  constructor(
    public changeSet: IChangeSet,
    public obj: HTMLInputElement & { $observers?: any; matcher?: any; model?: any; },
    public handler: IEventSubscriber,
    public observerLocator: IObserverLocator
  ) {
    super();
  }

  public getValue(): any {
    return this.currentValue;
  }

  public setValueCore(newValue: any): void {
    if (this.initialSync) {
      return;
    }
    if (!this.valueObserver) {
      this.valueObserver = this.obj['$observers'].model || this.obj['$observers'].value;
      if (this.valueObserver) {
        this.valueObserver.subscribe(this, BindingFlags.checkedValueContext);
      }
    }
    if (this.arrayObserver) {
      this.arrayObserver.unsubscribeBatched(this, BindingFlags.checkedArrayContext);
      this.arrayObserver = null;
    }
    if (this.obj.type === 'checkbox' && Array.isArray(newValue)) {
      this.arrayObserver = this.observerLocator.getArrayObserver(newValue);
      this.arrayObserver.subscribeBatched(this, BindingFlags.checkedArrayContext);
    }
    this.synchronizeElement();
    this.notify();
  }

  // handleBatchedCollectionChange (todo: rename to make this explicit?)
  public handleBatchedChange(indexMap: number[], flags?: BindingFlags): void {
    // todo: utilize indexMap
    this.synchronizeElement();
    this.notify();
  }

  // handlePropertyChange (todo: rename normal subscribe methods in target observers to batched, since that's what they really are)
  public handleChange(newValue: any, previousValue?: any, flags?: BindingFlags): void {
    this.setValue(newValue);
  }

  public synchronizeElement(): void {
    const value = this.currentValue;
    const element = this.obj;
    const elementValue = element.hasOwnProperty('model') ? element['model'] : element.value;
    const isRadio = element.type === 'radio';
    const matcher = element['matcher'] || ((a: any, b: any) => a === b);

    element.checked =
      isRadio && !!matcher(value, elementValue)
      || !isRadio && value === true
      || !isRadio && Array.isArray(value) && value.findIndex(item => !!matcher(item, elementValue)) !== -1;
  }

  public notify(): void {
    const oldValue = this.oldValue;
    const newValue = this.currentValue;
    if (newValue === oldValue) {
      return;
    }
    this.callSubscribers(newValue, oldValue);
  }

  public handleEvent(): void {
    this.synchronizeValue();
    this.notify();
  }

  public synchronizeValue(): void {
    let value = this.currentValue;
    const element = this.obj;
    const elementValue = element.hasOwnProperty('model') ? element['model'] : element.value;
    let index;
    const matcher = element['matcher'] || ((a: any, b: any) => a === b);

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
  }

  public subscribe(subscriber: IPropertySubscriber, flags?: BindingFlags): void {
    if (!this.hasSubscribers()) {
      this.handler.subscribe(this.obj, this);
    }
    this.addSubscriber(subscriber, flags);
  }

  public unsubscribe(subscriber: IPropertySubscriber, flags?: BindingFlags): void {
    if (this.removeSubscriber(subscriber, flags) && !this.hasSubscribers()) {
      this.handler.dispose();
    }
  }

  public unbind(): void {
    if (this.arrayObserver) {
      this.arrayObserver.unsubscribeBatched(this, BindingFlags.checkedArrayContext);
      this.arrayObserver = null;
    }
    if (this.valueObserver) {
      this.valueObserver.unsubscribe(this, BindingFlags.checkedValueContext);
    }
  }
}

CheckedObserver.prototype.hasChanges = false;
CheckedObserver.prototype.currentValue = '';
CheckedObserver.prototype.previousValue = '';
CheckedObserver.prototype.oldValue = '';
CheckedObserver.prototype.defaultValue = '';

CheckedObserver.prototype.setValue = setValue;
CheckedObserver.prototype.flushChanges = flushChanges;
CheckedObserver.prototype.dispose = dispose;

CheckedObserver.prototype.changeSet = null;
CheckedObserver.prototype.obj = null;
CheckedObserver.prototype.handler = null;
CheckedObserver.prototype.observerLocator = null;

const childObserverOptions = {
  childList: true,
  subtree: true,
  characterData: true
};

export class SelectValueObserver extends SubscriberCollection implements IBindingTargetObserver<HTMLSelectElement, string, any>, IBatchedCollectionSubscriber, IPropertySubscriber {
  public hasChanges: boolean;
  public currentValue: any;
  public previousValue: any;
  public oldValue: any;
  public defaultValue: any;

  public setValue: (newValue: any) => Promise<void>;
  public flushChanges: () => void;
  public dispose: () => void;

  private arrayObserver: ICollectionObserver<CollectionKind.array>;
  private nodeObserver: INodeObserver;

  constructor(
    public changeSet: IChangeSet,
    public obj: HTMLSelectElement,
    public handler: IEventSubscriber,
    public observerLocator: IObserverLocator
  ) {
    super();
  }

  public getValue(): any {
    return this.currentValue;
  }

  public setValueCore(newValue: any): void {
    if (newValue !== null && newValue !== undefined && this.obj.multiple && !Array.isArray(newValue)) {
      throw new Error('Only null or Array instances can be bound to a multi-select.');
    }
    if (this.arrayObserver) {
      this.arrayObserver.unsubscribeBatched(this, BindingFlags.selectArrayContext);
      this.arrayObserver = null;
    }
    if (Array.isArray(newValue)) {
      this.arrayObserver = this.observerLocator.getArrayObserver(newValue);
      this.arrayObserver.subscribeBatched(this, BindingFlags.selectArrayContext);
    }
    this.synchronizeOptions();
    this.notify();
  }

  // handleBatchedCollectionChange (todo: rename to make this explicit?)
  public handleBatchedChange(indexMap: number[], flags?: BindingFlags): void {
    // todo: utilize indexMap
    this.synchronizeOptions();
    this.notify();
  }

  // handlePropertyChange (todo: rename normal subscribe methods in target observers to batched, since that's what they really are)
  public handleChange(newValue: any, previousValue?: any, flags?: BindingFlags): void {
    this.setValue(newValue);
  }

  public synchronizeOptions(): void {
    const value = this.currentValue;
    let isArray: boolean;
    if (Array.isArray(value)) {
      isArray = true;
    }
    const options = this.obj.options;
    let i = options.length;
    const matcher = (<any>this.obj).matcher || ((a: any, b: any) => a === b);

    while (i--) {
      const option = options.item(i) as HTMLOptionElement & { model?: any };
      const optionValue = option.hasOwnProperty('model') ? option.model : option.value;
      if (isArray) {
        option.selected = value.findIndex((item: any) => !!matcher(optionValue, item)) !== -1; // eslint-disable-line no-loop-func
        continue;
      }
      option.selected = !!matcher(optionValue, value);
    }
  }

  public notify(): void {
    const oldValue = this.oldValue;
    const newValue = this.currentValue;
    if (newValue === oldValue) {
      return;
    }
    this.callSubscribers(newValue, oldValue);
  }

  public handleEvent(): void {
    this.synchronizeValue();
    this.notify();
  }

  public synchronizeValue(): void {
    const options = this.obj.options;
    let count = 0;
    let value = [];

    for (let i = 0, ii = options.length; i < ii; i++) {
      const option = options.item(i) as HTMLOptionElement & { model?: any };
      if (!option.selected) {
        continue;
      }
      value.push(option.hasOwnProperty('model') ? option.model : option.value);
      count++;
    }

    if (this.obj.multiple) {
      // multi-select
      if (Array.isArray(this.currentValue)) {
        const matcher = (<any>this.obj).matcher || ((a: any, b: any) => a === b);
        // remove items that are no longer selected.
        let i = 0;
        while (i < this.currentValue.length) {
          const a = this.currentValue[i];
          if (value.findIndex(b => matcher(a, b)) === -1) { // eslint-disable-line no-loop-func
            this.currentValue.splice(i, 1);
          } else {
            i++;
          }
        }
        // add items that have been selected.
        i = 0;
        while (i < value.length) {
          const a = value[i];
          if (this.currentValue.findIndex(b => matcher(a, b)) === -1) { // eslint-disable-line no-loop-func
            this.currentValue.push(a);
          }
          i++;
        }
        return; // don't notify.
      }
    } else {
      // single-select
      if (count === 0) {
        value = null;
      } else {
        value = value[0];
      }
    }
    this.oldValue = this.currentValue;
    this.currentValue = value;
  }

  public subscribe(subscriber: IPropertySubscriber, flags?: BindingFlags): void {
    if (!this.hasSubscribers()) {
      this.oldValue = this.getValue();
      this.handler.subscribe(this.obj, this);
    }
    this.addSubscriber(subscriber, flags);
  }

  public unsubscribe(subscriber: IPropertySubscriber, flags?: BindingFlags): void {
    if (this.removeSubscriber(subscriber, flags) && !this.hasSubscribers()) {
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
      this.arrayObserver.unsubscribeBatched(this, BindingFlags.selectArrayContext);
      this.arrayObserver = null;
    }
  }
}

SelectValueObserver.prototype.hasChanges = false;
SelectValueObserver.prototype.currentValue = '';
SelectValueObserver.prototype.previousValue = '';
SelectValueObserver.prototype.oldValue = '';
SelectValueObserver.prototype.defaultValue = '';

SelectValueObserver.prototype.setValue = setValue;
SelectValueObserver.prototype.flushChanges = flushChanges;
SelectValueObserver.prototype.dispose = dispose;

SelectValueObserver.prototype.changeSet = null;
SelectValueObserver.prototype.obj = null;
SelectValueObserver.prototype.handler = null;
SelectValueObserver.prototype.observerLocator = null;
