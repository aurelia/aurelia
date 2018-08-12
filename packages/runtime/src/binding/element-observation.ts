import { DOM, INode, INodeObserver } from '../dom';
import { BindingFlags } from './binding-flags';
import { IChangeSet } from './change-set';
import { IEventSubscriber } from './event-manager';
import { IAccessor, IPropertySubscriber, ISubscribable, MutationKind, IChangeTracker } from './observation';
import { SubscriberCollection } from './subscriber-collection';
import { IObserverLocator } from './observer-locator';

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
  public doNotCache = true;
  public value = '';
  public version = 0;
  public nameIndex: any;

  constructor(private node: INode) { }

  public getValue() {
    return this.value;
  }

  public setValue(newValue: any) {
    const addClass = DOM.addClass;
    const removeClass = DOM.removeClass;

    let nameIndex = this.nameIndex || {};
    let version = this.version;
    let names;
    let name;

    // Add the classes, tracking the version at which they were added.
    if (newValue !== null && newValue !== undefined && newValue.length) {
      names = newValue.split(/\s+/);
      for (let i = 0, length = names.length; i < length; i++) {
        name = names[i];

        if (name === '') {
          continue;
        }

        nameIndex[name] = version;
        addClass(this.node, name);
      }
    }

    // Update state variables.
    this.value = newValue;
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

      removeClass(this.node, name);
    }
  }

  public subscribe() {
    throw new Error(`Observation of a "${DOM.normalizedTagName(this.node)}" element\'s "class" property is not supported.`);
  }
}


const checkedArrayContext = 'CheckedObserver:array';
const checkedValueContext = 'CheckedObserver:value';

export class CheckedObserver extends SubscriberCollection implements IAccessor, ISubscribable<MutationKind.instance>, IChangeTracker {
  private value: any;
  private initialSync: boolean;
  private arrayObserver: any;
  private oldValue: any;
  private valueObserver: any;

  constructor(
    private node: HTMLInputElement & { $observers?: any; matcher?: any; model?: any; },
    public handler: IEventSubscriber,
    private changeSet: IChangeSet,
    private observerLocator: IObserverLocator
  ) {
    super();
  }

  public getValue() {
    return this.value;
  }

  public setValue(newValue: any) {
    if (this.initialSync && this.value === newValue) {
      return;
    }

    // unsubscribe from old array.
    if (this.arrayObserver) {
      this.arrayObserver.unsubscribe(checkedArrayContext, this);
      this.arrayObserver = null;
    }

    // subscribe to new array.
    if (this.node.type === 'checkbox' && Array.isArray(newValue)) {
      this.arrayObserver = this.observerLocator.getArrayObserver(newValue);
      this.arrayObserver.subscribe(checkedArrayContext, this);
    }

    // assign and sync element.
    this.oldValue = this.value;
    this.value = newValue;
    this.synchronizeElement();
    this.notify();

    // queue up an initial sync after the bindings have been evaluated.
    if (!this.initialSync) {
      this.initialSync = true;
      this.changeSet.add(this);
    }
  }

  public flushChanges(): void {
    // called by task queue, array observer, and model/value observer.
    this.synchronizeElement();
    // if the input's model or value property is data-bound, subscribe to it's
    // changes to enable synchronizing the element's checked status when a change occurs.
    if (!this.valueObserver) {
      this.valueObserver = this.node['$observers'].model || this.node['$observers'].value;
      if (this.valueObserver) {
        this.valueObserver.subscribe(checkedValueContext, this);
      }
    }
  }

  public synchronizeElement() {
    let value = this.value;
    let element = this.node;
    let elementValue = element.hasOwnProperty('model') ? element['model'] : element.value;
    let isRadio = element.type === 'radio';
    let matcher = element['matcher'] || ((a: any, b: any) => a === b);

    element.checked =
      isRadio && !!matcher(value, elementValue)
      || !isRadio && value === true
      || !isRadio && Array.isArray(value) && value.findIndex(item => !!matcher(item, elementValue)) !== -1;
  }

  public synchronizeValue() {
    let value = this.value;
    let element = this.node;
    let elementValue = element.hasOwnProperty('model') ? element['model'] : element.value;
    let index;
    let matcher = element['matcher'] || ((a: any, b: any) => a === b);

    if (element.type === 'checkbox') {
      if (Array.isArray(value)) {
        index = value.findIndex(item => !!matcher(item, elementValue));
        if (element.checked && index === -1) {
          value.push(elementValue);
        } else if (!element.checked && index !== -1) {
          value.splice(index, 1);
        }
        // don't invoke callbacks.
        return;
      }

      value = element.checked;
    } else if (element.checked) {
      value = elementValue;
    } else {
      // don't invoke callbacks.
      return;
    }

    this.oldValue = this.value;
    this.value = value;
    this.notify();
  }

  public notify() {
    let oldValue = this.oldValue;
    let newValue = this.value;

    if (newValue === oldValue) {
      return;
    }

    this.callSubscribers(newValue, oldValue);
  }

  public handleEvent() {
    this.synchronizeValue();
  }

  public subscribe(subscriber: IPropertySubscriber, flags?: BindingFlags) {
    if (!this.hasSubscribers()) {
      this.handler.subscribe(this.node, this);
    }
    this.addSubscriber(subscriber, flags);
  }

  public unsubscribe(subscriber: IPropertySubscriber, flags?: BindingFlags) {
    if (this.removeSubscriber(subscriber, flags) && !this.hasSubscribers()) {
      this.handler.dispose();
    }
  }

  public unbind() {
    if (this.arrayObserver) {
      this.arrayObserver.unsubscribe(checkedArrayContext, this);
      this.arrayObserver = null;
    }
    if (this.valueObserver) {
      this.valueObserver.unsubscribe(checkedValueContext, this);
    }
  }
}



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
