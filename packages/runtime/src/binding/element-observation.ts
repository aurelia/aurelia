import { IIndexable } from '@aurelia/kernel';
import { DOM, INode, INodeObserver } from '../dom';
import { BindingFlags } from './binding-flags';
import { IChangeSet } from './change-set';
import { IEventSubscriber } from './event-manager';
import { CollectionKind, IAccessor, IBatchedCollectionSubscriber, IChangeTracker, IPropertySubscriber, ISubscribable, MutationKind, ICollectionObserver } from './observation';
import { IObserverLocator } from './observer-locator';
import { SubscriberCollection } from './subscriber-collection';

type ElementObserver = XLinkAttributeObserver | DataAttributeObserver | StyleObserver | ValueAttributeObserver;

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

// tslint:disable-next-line:no-http-string
const xlinkAttributeNS = 'http://www.w3.org/1999/xlink';

export class XLinkAttributeObserver implements IAccessor {
  public hasChanges: boolean;
  public currentValue: string;
  public previousValue: string;
  public oldValue: string;
  public defaultValue: string;

  public setValue: (newValue: any) => Promise<void>;
  public flushChanges: () => void;

  // xlink namespaced attributes require getAttributeNS/setAttributeNS
  // (even though the NS version doesn't work for other namespaces
  // in html5 documents)

  // Using very HTML-specific code here since this isn't likely to get
  // called unless operating against a real HTML element.

  constructor(
    public changeSet: IChangeSet,
    public node: INode,
    public propertyName: string,
    public attributeName: string) {

    this.oldValue = this.previousValue = this.currentValue = this.getValue();
  }

  public getValue(): string {
    return (<Element>this.node).getAttributeNS(xlinkAttributeNS, this.attributeName);
  }

  public setValueCore(newValue: any): void {
    (<Element>this.node).setAttributeNS(xlinkAttributeNS, this.attributeName, newValue);
  }

  public subscribe(): void {
    throw new Error(`Observation of a "${DOM.normalizedTagName(this.node)}" element\'s "${this.propertyName}" property is not supported.`);
  }
}

XLinkAttributeObserver.prototype.hasChanges = false;
XLinkAttributeObserver.prototype.currentValue = '';
XLinkAttributeObserver.prototype.previousValue = '';
XLinkAttributeObserver.prototype.oldValue = '';
XLinkAttributeObserver.prototype.defaultValue = null;

XLinkAttributeObserver.prototype.setValue = setValue;
XLinkAttributeObserver.prototype.flushChanges = flushChanges;

XLinkAttributeObserver.prototype.changeSet = null;
XLinkAttributeObserver.prototype.node = null;
XLinkAttributeObserver.prototype.propertyName = '';
XLinkAttributeObserver.prototype.attributeName = '';

export const dataAttributeAccessor = {
  getValue: (obj: INode, propertyName: string) => DOM.getAttribute(obj, propertyName),
  setValue: (value: any, obj: INode, propertyName: string) => {
    if (value === null || value === undefined) {
      DOM.removeAttribute(obj, propertyName);
    } else {
      DOM.setAttribute(obj, propertyName, value);
    }
  }
};

export class DataAttributeObserver implements IAccessor {
  public hasChanges: boolean;
  public currentValue: string;
  public previousValue: string;
  public oldValue: string;
  public defaultValue: string;

  public setValue: (newValue: any) => Promise<void>;
  public flushChanges: () => void;

  constructor(
    public changeSet: IChangeSet,
    public node: INode,
    public propertyName: string) {

    this.oldValue = this.previousValue = this.currentValue = this.getValue();
  }

  public getValue(): string {
    return DOM.getAttribute(this.node, this.propertyName);
  }

  public setValueCore(newValue: any): void {
    if (newValue === null) {
      DOM.removeAttribute(this.node, this.propertyName);
    } else {
      DOM.setAttribute(this.node, this.propertyName, newValue);
    }
  }

  public subscribe(): void {
    throw new Error(`Observation of a "${DOM.normalizedTagName(this.node)}" element\'s "${this.propertyName}" property is not supported.`);
  }
}

DataAttributeObserver.prototype.hasChanges = false;
DataAttributeObserver.prototype.currentValue = '';
DataAttributeObserver.prototype.previousValue = '';
DataAttributeObserver.prototype.oldValue = '';
DataAttributeObserver.prototype.defaultValue = null;

DataAttributeObserver.prototype.setValue = setValue;
DataAttributeObserver.prototype.flushChanges = flushChanges;

DataAttributeObserver.prototype.changeSet = null;
DataAttributeObserver.prototype.node = null;
DataAttributeObserver.prototype.propertyName = '';

export class StyleObserver implements IAccessor {
  public hasChanges: boolean;
  public currentValue: any;
  public previousValue: any;
  public oldValue: any;
  public defaultValue: any;

  public setValue: (newValue: any) => Promise<void>;
  public flushChanges: () => void;

  public styles: any;
  public version: number;

  constructor(
    public changeSet: IChangeSet,
    public element: HTMLElement,
    public propertyName: string) {

    this.oldValue = this.previousValue = this.currentValue = element.style.cssText;
  }

  public getValue(): string {
    return this.element.style.cssText;
  }

  // tslint:disable-next-line:function-name
  public _setProperty(style: string, value: string): void {
    let priority = '';

    if (value !== null && value !== undefined && typeof value.indexOf === 'function' && value.indexOf('!important') !== -1) {
      priority = 'important';
      value = value.replace('!important', '');
    }

    this.element.style.setProperty(style, value, priority);
  }

  public setValueCore(newValue: any): void {
    const styles = this.styles || {};
    let style;
    let version = this.version;

    if (newValue !== null) {
      if (newValue instanceof Object) {
        let value;
        for (style in newValue) {
          if (newValue.hasOwnProperty(style)) {
            value = newValue[style];
            style = style.replace(/([A-Z])/g, m => `-${m.toLowerCase()}`);
            styles[style] = version;
            this._setProperty(style, value);
          }
        }
      } else if (newValue.length) {
        const rx = /\s*([\w\-]+)\s*:\s*((?:(?:[\w\-]+\(\s*(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[\w\-]+\(\s*(?:^"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^\)]*)\),?|[^\)]*)\),?|"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^;]*),?\s*)+);?/g;
        let pair;
        while ((pair = rx.exec(newValue)) !== null) {
          style = pair[1];
          if (!style) { continue; }

          styles[style] = version;
          this._setProperty(style, pair[2]);
        }
      }
    }

    this.styles = styles;
    this.version += 1;
    if (version === 0) {
      return;
    }

    version -= 1;
    for (style in styles) {
      if (!styles.hasOwnProperty(style) || styles[style] !== version) {
        continue;
      }
      this.element.style.removeProperty(style);
    }
  }

  public subscribe(): void {
    throw new Error(`Observation of a "${this.element.nodeName}" element\'s "${this.propertyName}" property is not supported.`);
  }
}

StyleObserver.prototype.hasChanges = false;
StyleObserver.prototype.currentValue = '';
StyleObserver.prototype.previousValue = '';
StyleObserver.prototype.oldValue = '';
StyleObserver.prototype.defaultValue = null;

StyleObserver.prototype.setValue = setValue;
StyleObserver.prototype.flushChanges = flushChanges;

StyleObserver.prototype.styles = null;
StyleObserver.prototype.version = 0;
StyleObserver.prototype.changeSet = null;
StyleObserver.prototype.element = null;
StyleObserver.prototype.propertyName = '';

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

export class ValueAttributeObserver extends SubscriberCollection implements IAccessor, ISubscribable<MutationKind.instance> {
  public hasChanges: boolean;
  public currentValue: string;
  public previousValue: string;
  public oldValue: string;
  public defaultValue: string;

  public setValue: (newValue: any) => Promise<void>;
  public flushChanges: () => void;

  constructor(
    public changeSet: IChangeSet,
    public node: INode,
    public propertyName: string,
    public handler: IEventSubscriber
  ) {
    super();

    // note: input.files can be assigned and this was fixed in Firefox 57:
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1384030

    // input.value (for type='file') however, can only be assigned an empty string
    if (propertyName === 'value') {
      const nodeType = node['type'];
      this.defaultValue = inputValueDefaults[nodeType || 'text'];
      if (nodeType === 'file') {
        this.flushChanges = this.flushFileChanges;
      }
    } else {
      this.defaultValue = '';
    }
    this.oldValue = this.previousValue = this.currentValue = node[propertyName];
  }

  public getValue(): string {
    return this.node[this.propertyName];
  }

  public setValueCore(newValue: any): void {
    this.node[this.propertyName] = newValue;
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
      this.handler.subscribe(this.node, this);
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
        this.node[this.propertyName] = this.currentValue;
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

ValueAttributeObserver.prototype.changeSet = null;
ValueAttributeObserver.prototype.node = null;
ValueAttributeObserver.prototype.propertyName = '';
ValueAttributeObserver.prototype.handler = null;

export class ClassObserver implements IAccessor {
  public hasChanges: boolean;
  public currentValue: string;
  public previousValue: string;
  public oldValue: string;
  public defaultValue: string;

  public setValue: (newValue: any) => Promise<void>;
  public flushChanges: () => void;

  public doNotCache: true;
  public version: number;
  public nameIndex: IIndexable;

  constructor(public changeSet: IChangeSet, public node: INode) { }

  public getValue(): string {
    return this.currentValue;
  }

  public setValueCore(newValue: string): void {
    const addClass = DOM.addClass;
    const removeClass = DOM.removeClass;
    const nameIndex = this.nameIndex || {};
    let version = this.version;
    let names;
    let name;

    // Add the classes, tracking the version at which they were added.
    if (newValue.length) {
      const node = this.node;
      names = newValue.split(/\s+/);
      for (let i = 0, length = names.length; i < length; i++) {
        name = names[i];
        if (!name.length) {
          continue;
        }
        nameIndex[name] = version;
        addClass(node, name);
      }
    }

    // Update state variables.
    this.nameIndex = nameIndex;
    this.version += 1;

    // First call to setValue?  We're done.
    if (version === 0) {
      return;
    }

    // Remove classes from previous version.
    version -= 1;
    for (name in nameIndex) {
      if (!nameIndex.hasOwnProperty(name) || nameIndex[name] !== version) {
        continue;
      }

      // TODO: this has the side-effect that classes already present which are added again,
      // will be removed if they're not present in the next update.
      // Better would be do have some configurability for this behavior, allowing the user to
      // decide whether initial classes always need to be kept, always removed, or something in between
      removeClass(this.node, name);
    }
  }

  public subscribe(): void {
    throw new Error(`Observation of a "${DOM.normalizedTagName(this.node)}" element\'s "class" property is not supported.`);
  }
}

ClassObserver.prototype.hasChanges = false;
ClassObserver.prototype.currentValue = '';
ClassObserver.prototype.previousValue = '';
ClassObserver.prototype.oldValue = '';
ClassObserver.prototype.defaultValue = '';

ClassObserver.prototype.setValue = setValue;
ClassObserver.prototype.flushChanges = flushChanges;

ClassObserver.prototype.doNotCache = true;
ClassObserver.prototype.version = 0;
ClassObserver.prototype.changeSet = null;
ClassObserver.prototype.node = null;
ClassObserver.prototype.nameIndex = null;

export class CheckedObserver extends SubscriberCollection implements IAccessor, ISubscribable<MutationKind.instance>, IChangeTracker, IBatchedCollectionSubscriber, IPropertySubscriber {
  public hasChanges: boolean;
  public currentValue: any;
  public previousValue: any;
  public oldValue: any;
  public defaultValue: any;

  public setValue: (newValue: any) => Promise<void>;
  public flushChanges: () => void;

  private initialSync: boolean;
  private arrayObserver: ICollectionObserver<CollectionKind.array>;
  private valueObserver: ValueAttributeObserver;

  constructor(
    public changeSet: IChangeSet,
    public node: HTMLInputElement & { $observers?: any; matcher?: any; model?: any; },
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
      this.valueObserver = this.node['$observers'].model || this.node['$observers'].value;
      if (this.valueObserver) {
        this.valueObserver.subscribe(this, BindingFlags.checkedValueContext);
      }
    }
    if (this.arrayObserver) {
      this.arrayObserver.unsubscribeBatched(this, BindingFlags.checkedArrayContext);
      this.arrayObserver = null;
    }
    if (this.node.type === 'checkbox' && Array.isArray(newValue)) {
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
    const element = this.node;
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
    const element = this.node;
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
      this.handler.subscribe(this.node, this);
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

CheckedObserver.prototype.changeSet = null;
CheckedObserver.prototype.node = null;
CheckedObserver.prototype.handler = null;
CheckedObserver.prototype.observerLocator = null;

const selectArrayContext = 'SelectValueObserver:array';
const childObserverOptions = {
  childList: true,
  subtree: true,
  characterData: true
};

export class SelectValueObserver extends SubscriberCollection implements IChangeTracker {
  private value: any;
  private oldValue: any;
  private arrayObserver: any;
  private initialSync = false;
  private nodeObserver: INodeObserver;

  constructor(
    private node: HTMLSelectElement,
    public handler: IEventSubscriber,
    private changeSet: IChangeSet,
    private observerLocator: IObserverLocator
  ) {
    super();
    this.node = node;
    this.handler = handler;
    this.observerLocator = observerLocator;
  }

  public getValue() {
    return this.value;
  }

  public setValue(newValue: any) {
    if (newValue !== null && newValue !== undefined && this.node.multiple && !Array.isArray(newValue)) {
      throw new Error('Only null or Array instances can be bound to a multi-select.');
    }

    if (this.value === newValue) {
      return;
    }

    // unsubscribe from old array.
    if (this.arrayObserver) {
      this.arrayObserver.unsubscribe(selectArrayContext, this);
      this.arrayObserver = null;
    }

    // subscribe to new array.
    if (Array.isArray(newValue)) {
      this.arrayObserver = this.observerLocator.getArrayObserver(newValue);
      this.arrayObserver.subscribe(selectArrayContext, this);
    }

    // assign and sync element.
    this.oldValue = this.value;
    this.value = newValue;
    this.synchronizeOptions();
    this.notify();
    // queue up an initial sync after the bindings have been evaluated.
    if (!this.initialSync) {
      this.initialSync = true;
      this.changeSet.add(this);
    }
  }

  public flushChanges(): void {
    // called by task queue and array observer.
    this.synchronizeOptions();
  }

  public synchronizeOptions() {
    let value = this.value;
    let isArray: boolean;

    if (Array.isArray(value)) {
      isArray = true;
    }

    let options = this.node.options;
    let i = options.length;
    let matcher = (<any>this.node).matcher || ((a: any, b: any) => a === b);

    while (i--) {
      let option = options.item(i) as HTMLOptionElement & { model?: any };
      let optionValue = option.hasOwnProperty('model') ? option.model : option.value;
      if (isArray) {
        option.selected = value.findIndex((item: any) => !!matcher(optionValue, item)) !== -1; // eslint-disable-line no-loop-func
        continue;
      }
      option.selected = !!matcher(optionValue, value);
    }
  }

  public synchronizeValue() {
    let options = this.node.options;
    let count = 0;
    let value = [];

    for (let i = 0, ii = options.length; i < ii; i++) {
      let option = options.item(i) as HTMLOptionElement & { model?: any };
      if (!option.selected) {
        continue;
      }
      value.push(option.hasOwnProperty('model') ? option.model : option.value);
      count++;
    }

    if (this.node.multiple) {
      // multi-select
      if (Array.isArray(this.value)) {
        let matcher = (<any>this.node).matcher || ((a: any, b: any) => a === b);
        // remove items that are no longer selected.
        let i = 0;
        while (i < this.value.length) {
          let a = this.value[i];
          if (value.findIndex(b => matcher(a, b)) === -1) { // eslint-disable-line no-loop-func
            this.value.splice(i, 1);
          } else {
            i++;
          }
        }
        // add items that have been selected.
        i = 0;
        while (i < value.length) {
          let a = value[i];
          if (this.value.findIndex(b => matcher(a, b)) === -1) { // eslint-disable-line no-loop-func
            this.value.push(a);
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

    if (value !== this.value) {
      this.oldValue = this.value;
      this.value = value;
      this.notify();
    }
  }

  public notify() {
    let oldValue = this.oldValue;
    let newValue = this.value;

    this.callSubscribers(newValue, oldValue);
  }

  public handleEvent() {
    this.synchronizeValue();
  }

  public subscribe(subscriber: IPropertySubscriber, flags?: BindingFlags) {
    if (!this.hasSubscribers()) {
      this.oldValue = this.getValue();
      this.handler.subscribe(this.node, this);
    }
    this.addSubscriber(subscriber, flags);
  }

  public unsubscribe(subscriber: IPropertySubscriber, flags?: BindingFlags) {
    if (this.removeSubscriber(subscriber, flags) && !this.hasSubscribers()) {
      this.handler.dispose();
    }
  }

  public bind() {
    this.nodeObserver = DOM.createNodeObserver(this.node, () => {
      this.synchronizeOptions();
      this.synchronizeValue();
    }, childObserverOptions);
  }

  public unbind() {
    this.nodeObserver.disconnect();
    this.nodeObserver = null;

    if (this.arrayObserver) {
      this.arrayObserver.unsubscribe(selectArrayContext, this);
      this.arrayObserver = null;
    }
  }
}
