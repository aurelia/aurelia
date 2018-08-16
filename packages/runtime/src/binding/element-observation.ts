import { IIndexable, Primitive } from '@aurelia/kernel';
import { DOM, INode, INodeObserver } from '../dom';
import { BindingFlags } from './binding-flags';
import { IChangeSet } from './change-set';
import { IEventSubscriber } from './event-manager';
import { CollectionKind, IBatchedCollectionSubscriber, IBindingTargetObserver, ICollectionObserver, IPropertySubscriber } from './observation';
import { IObserverLocator } from './observer-locator';
import { SubscriberCollection } from './subscriber-collection';
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

@targetObserver('')
export class ValueAttributeObserver extends SubscriberCollection implements IBindingTargetObserver<INode, string, Primitive | IIndexable> {
  public currentValue: Primitive | IIndexable;
  public currentFlags: BindingFlags;
  public oldValue: Primitive | IIndexable;
  public defaultValue: Primitive | IIndexable;

  public setValue: (newValue: Primitive | IIndexable, flags: BindingFlags) => Promise<void>;
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
    this.oldValue = this.currentValue = obj[propertyKey];
  }

  public getValue(): Primitive | IIndexable {
    return this.obj[this.propertyKey];
  }

  public setValueCore(newValue: Primitive | IIndexable, flags: BindingFlags): void {
    this.obj[this.propertyKey] = newValue;
    if (!(flags & BindingFlags.bindOrigin)) {
      this.notify(flags | BindingFlags.sourceOrigin);
    }
  }

  public notify(flags?: BindingFlags): void {
    this.callSubscribers(this.currentValue, this.oldValue, flags);
  }

  public handleEvent(): void {
    this.oldValue = this.currentValue;
    this.currentValue = this.getValue();
    this.notify(BindingFlags.targetOrigin);
    this.oldValue = this.currentValue;
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

@targetObserver()
export class CheckedObserver extends SubscriberCollection implements IBindingTargetObserver<HTMLInputElement, string, Primitive | IIndexable>, IBatchedCollectionSubscriber, IPropertySubscriber {
  public currentValue: Primitive | IIndexable;
  public currentFlags: BindingFlags;
  public oldValue: Primitive | IIndexable;
  public defaultValue: Primitive | IIndexable;

  public setValue: (newValue: Primitive | IIndexable, flags: BindingFlags) => Promise<void>;
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

  public getValue(): Primitive | IIndexable {
    return this.currentValue;
  }

  public setValueCore(newValue: Primitive | IIndexable, flags: BindingFlags): void {
    if (this.initialSync) {
      return;
    }
    if (!this.valueObserver) {
      this.valueObserver = this.obj['$observers'].model || this.obj['$observers'].value;
      if (this.valueObserver) {
        this.valueObserver.subscribe(this, BindingFlags.checkedValueOrigin);
      }
    }
    if (this.arrayObserver) {
      this.arrayObserver.unsubscribeBatched(this, BindingFlags.checkedArrayOrigin);
      this.arrayObserver = null;
    }
    if (this.obj.type === 'checkbox' && Array.isArray(newValue)) {
      this.arrayObserver = this.observerLocator.getArrayObserver(newValue);
      this.arrayObserver.subscribeBatched(this, BindingFlags.checkedArrayOrigin);
    }
    this.synchronizeElement();
    if (!(flags & BindingFlags.bindOrigin)) {
      this.notify(flags);
    }
  }

  // handleBatchedCollectionChange (todo: rename to make this explicit?)
  public handleBatchedChange(indexMap: number[], flags?: BindingFlags): void {
    // todo: utilize indexMap
    this.synchronizeElement();
    this.notify(flags);
  }

  // handlePropertyChange (todo: rename normal subscribe methods in target observers to batched, since that's what they really are)
  public handleChange(newValue: Primitive | IIndexable, previousValue?: Primitive | IIndexable, flags?: BindingFlags): void {
    this.setValue(newValue, flags | BindingFlags.callbackOrigin);
  }

  public synchronizeElement(): void {
    const value = this.currentValue;
    const element = this.obj;
    const elementValue = element.hasOwnProperty('model') ? element['model'] : element.value;
    const isRadio = element.type === 'radio';
    const matcher = element['matcher'] || ((a: Primitive | IIndexable, b: Primitive | IIndexable) => a === b);

    element.checked =
      isRadio && !!matcher(value, elementValue)
      || !isRadio && value === true
      || !isRadio && Array.isArray(value) && value.findIndex(item => !!matcher(item, elementValue)) !== -1;
  }

  public notify(flags: BindingFlags): void {
    const oldValue = this.oldValue;
    const newValue = this.currentValue;
    if (newValue === oldValue) {
      return;
    }
    this.callSubscribers(newValue, oldValue, flags);
  }

  public handleEvent(): void {
    this.synchronizeValue();
    this.notify(BindingFlags.callbackOrigin);
  }

  public synchronizeValue(): void {
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
      this.arrayObserver.unsubscribeBatched(this, BindingFlags.checkedArrayOrigin);
      this.arrayObserver = null;
    }
    if (this.valueObserver) {
      this.valueObserver.unsubscribe(this, BindingFlags.checkedValueOrigin);
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

@targetObserver()
export class SelectValueObserver
  extends SubscriberCollection
  implements
    IBindingTargetObserver<HTMLSelectElement & { matcher?: typeof defaultMatcher }, string, Primitive | UntypedArray>,
    IBatchedCollectionSubscriber,
    IPropertySubscriber {

  public currentValue: Primitive | UntypedArray;
  public currentFlags: BindingFlags;
  public oldValue: Primitive | UntypedArray;
  public defaultValue: Primitive | UntypedArray;

  public setValue: (newValue: Primitive | UntypedArray, flags: BindingFlags) => Promise<void>;
  public flushChanges: () => void;
  public dispose: () => void;

  private arrayObserver: ICollectionObserver<CollectionKind.array>;
  private nodeObserver: INodeObserver;

  constructor(
    public changeSet: IChangeSet,
    public obj: HTMLSelectElement & { matcher?: typeof defaultMatcher },
    public handler: IEventSubscriber,
    public observerLocator: IObserverLocator
  ) {
    super();
  }

  public getValue(): Primitive | UntypedArray {
    return this.currentValue;
  }

  public setValueCore(newValue: Primitive | UntypedArray, flags: BindingFlags): void {
    const isArray = Array.isArray(newValue);
    if (!isArray && newValue !== null && newValue !== undefined && this.obj.multiple) {
      throw new Error('Only null or Array instances can be bound to a multi-select.');
    }
    if (this.arrayObserver) {
      this.arrayObserver.unsubscribeBatched(this, BindingFlags.selectArrayOrigin);
      this.arrayObserver = null;
    }
    if (isArray) {
      this.arrayObserver = this.observerLocator.getArrayObserver(<(Primitive | IIndexable)[]>newValue);
      this.arrayObserver.subscribeBatched(this, BindingFlags.selectArrayOrigin);
    }
    this.synchronizeOptions();
    if (!(flags & BindingFlags.bindOrigin)) {
      this.notify(flags);
    }
  }

  // called when the array mutated (items sorted/added/removed, etc)
  public handleBatchedChange(indexMap: number[], flags?: BindingFlags): void {
    // we don't need to go through the normal setValue logic and can directly call synchronizeOptions here,
    // because the change already waited one tick (batched) and there's no point in calling notify when the instance didn't change
    this.synchronizeOptions();
  }

  // called when a different value was assigned
  public handleChange(newValue: Primitive | UntypedArray, previousValue?: Primitive | UntypedArray, flags?: BindingFlags): void {
    this.setValue(newValue, flags);
  }

  public notify(flags: BindingFlags): void {
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
    this.notify(BindingFlags.callbackOrigin);
  }

  public synchronizeOptions(): void {
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
      this.arrayObserver.unsubscribeBatched(this, BindingFlags.selectArrayOrigin);
      this.arrayObserver = null;
    }
  }
}

SelectValueObserver.prototype.handler = null;
SelectValueObserver.prototype.observerLocator = null;
