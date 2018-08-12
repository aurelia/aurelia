import { DOM, INode } from '../dom';
import { BindingFlags } from './binding-flags';
import { IChangeSet } from './change-set';
import { IEventSubscriber } from './event-manager';
import { IAccessor, IPropertySubscriber, ISubscribable, MutationKind } from './observation';
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
