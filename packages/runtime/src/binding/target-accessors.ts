import { IIndexable } from '@aurelia/kernel';
import { DOM, INode } from '../dom';
import { IChangeSet } from './change-set';
import { IBindingTargetAccessor } from './observation';

// tslint:disable:no-any
type BindingTargetAccessor = IBindingTargetAccessor & {
  changeSet: IChangeSet;
  defaultValue: any;
  setValueCore(value: any): void;
};

function setValue(this: BindingTargetAccessor, newValue: any): Promise<void> {
  const currentValue = this.currentValue;
  newValue = newValue === null || newValue === undefined ? this.defaultValue : newValue;
  if (currentValue !== newValue) {
    this.hasChanges = true;
    this.currentValue = newValue;
    return this.changeSet.add(this);
  }
  return Promise.resolve();
}
// tslint:enable:no-any

function flushChanges(this: BindingTargetAccessor): void {
  if (this.hasChanges) {
    this.hasChanges = false;
    this.setValueCore(this.currentValue);
    this.oldValue = this.currentValue;
  }
}

function dispose(this: BindingTargetAccessor): void {
  this.obj = null;
  this.currentValue = null;
  this.oldValue = null;
}

// tslint:disable-next-line:no-http-string
const xlinkAttributeNS = 'http://www.w3.org/1999/xlink';

export class XLinkAttributeAccessor implements IBindingTargetAccessor<Element, string, string> {
  public hasChanges: boolean;
  public currentValue: string;
  public oldValue: string;
  public defaultValue: string;

  public setValue: (newValue: string) => Promise<void>;
  public flushChanges: () => void;
  public dispose: () => void;

  // xlink namespaced attributes require getAttributeNS/setAttributeNS
  // (even though the NS version doesn't work for other namespaces
  // in html5 documents)

  // Using very HTML-specific code here since this isn't likely to get
  // called unless operating against a real HTML element.

  constructor(
    public changeSet: IChangeSet,
    public obj: Element,
    public propertyKey: string,
    public attributeName: string) {

    this.oldValue = this.currentValue = this.getValue();
  }

  public getValue(): string {
    return this.obj.getAttributeNS(xlinkAttributeNS, this.attributeName);
  }

  public setValueCore(newValue: string): void {
    this.obj.setAttributeNS(xlinkAttributeNS, this.attributeName, newValue);
  }
}

XLinkAttributeAccessor.prototype.hasChanges = false;
XLinkAttributeAccessor.prototype.currentValue = '';
XLinkAttributeAccessor.prototype.oldValue = '';
XLinkAttributeAccessor.prototype.defaultValue = null;

XLinkAttributeAccessor.prototype.setValue = setValue;
XLinkAttributeAccessor.prototype.flushChanges = flushChanges;
XLinkAttributeAccessor.prototype.dispose = dispose;

XLinkAttributeAccessor.prototype.changeSet = null;
XLinkAttributeAccessor.prototype.obj = null;
XLinkAttributeAccessor.prototype.propertyKey = '';
XLinkAttributeAccessor.prototype.attributeName = '';

export class DataAttributeAccessor implements IBindingTargetAccessor<INode, string, string> {
  public hasChanges: boolean;
  public currentValue: string;
  public oldValue: string;
  public defaultValue: string;

  public setValue: (newValue: string) => Promise<void>;
  public flushChanges: () => void;
  public dispose: () => void;

  constructor(
    public changeSet: IChangeSet,
    public obj: INode,
    public propertyKey: string) {

    this.oldValue = this.currentValue = this.getValue();
  }

  public getValue(): string {
    return DOM.getAttribute(this.obj, this.propertyKey);
  }

  public setValueCore(newValue: string): void {
    if (newValue === null) {
      DOM.removeAttribute(this.obj, this.propertyKey);
    } else {
      DOM.setAttribute(this.obj, this.propertyKey, newValue);
    }
  }
}

DataAttributeAccessor.prototype.hasChanges = false;
DataAttributeAccessor.prototype.currentValue = '';
DataAttributeAccessor.prototype.oldValue = '';
DataAttributeAccessor.prototype.defaultValue = null;

DataAttributeAccessor.prototype.setValue = setValue;
DataAttributeAccessor.prototype.flushChanges = flushChanges;
DataAttributeAccessor.prototype.dispose = dispose;

DataAttributeAccessor.prototype.changeSet = null;
DataAttributeAccessor.prototype.obj = null;
DataAttributeAccessor.prototype.propertyKey = '';

export class StyleAttributeAccessor implements IBindingTargetAccessor<HTMLElement, 'style', string | IIndexable> {
  public hasChanges: boolean;
  public currentValue: string | IIndexable;
  public oldValue: string | IIndexable;
  public defaultValue: string | IIndexable;

  public propertyKey: 'style';

  public setValue: (newValue: string | IIndexable) => Promise<void>;
  public flushChanges: () => void;
  public dispose: () => void;

  public styles: IIndexable;
  public version: number;

  constructor(
    public changeSet: IChangeSet,
    public obj: HTMLElement) {

    this.oldValue = this.currentValue = obj.style.cssText;
  }

  public getValue(): string {
    return this.obj.style.cssText;
  }

  // tslint:disable-next-line:function-name
  public _setProperty(style: string, value: string): void {
    let priority = '';

    if (value !== null && value !== undefined && typeof value.indexOf === 'function' && value.indexOf('!important') !== -1) {
      priority = 'important';
      value = value.replace('!important', '');
    }

    this.obj.style.setProperty(style, value, priority);
  }

  public setValueCore(newValue: string | IIndexable): void {
    const styles = this.styles || {};
    let style;
    let version = this.version;

    if (newValue !== null) {
      if (newValue instanceof Object) {
        let value;
        for (style in (<Object>newValue)) {
          if (newValue.hasOwnProperty(style)) {
            value = newValue[style];
            style = style.replace(/([A-Z])/g, m => `-${m.toLowerCase()}`);
            styles[style] = version;
            this._setProperty(style, value);
          }
        }
      } else if ((<string>newValue).length) {
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
      this.obj.style.removeProperty(style);
    }
  }
}

StyleAttributeAccessor.prototype.hasChanges = false;
StyleAttributeAccessor.prototype.currentValue = '';
StyleAttributeAccessor.prototype.oldValue = '';
StyleAttributeAccessor.prototype.defaultValue = null;

StyleAttributeAccessor.prototype.setValue = setValue;
StyleAttributeAccessor.prototype.flushChanges = flushChanges;
StyleAttributeAccessor.prototype.dispose = dispose;

StyleAttributeAccessor.prototype.styles = null;
StyleAttributeAccessor.prototype.version = 0;
StyleAttributeAccessor.prototype.changeSet = null;
StyleAttributeAccessor.prototype.obj = null;
StyleAttributeAccessor.prototype.propertyKey = 'style';

export class ClassAttributeAccessor implements IBindingTargetAccessor<INode, string, string> {
  public hasChanges: boolean;
  public currentValue: string;
  public oldValue: string;
  public defaultValue: string;

  public setValue: (newValue: string) => Promise<void>;
  public flushChanges: () => void;
  public dispose: () => void;

  public doNotCache: true;
  public version: number;
  public nameIndex: IIndexable;

  constructor(public changeSet: IChangeSet, public obj: INode) { }

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
      const node = this.obj;
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
      removeClass(this.obj, name);
    }
  }
}

ClassAttributeAccessor.prototype.hasChanges = false;
ClassAttributeAccessor.prototype.currentValue = '';
ClassAttributeAccessor.prototype.oldValue = '';
ClassAttributeAccessor.prototype.defaultValue = '';

ClassAttributeAccessor.prototype.setValue = setValue;
ClassAttributeAccessor.prototype.flushChanges = flushChanges;
ClassAttributeAccessor.prototype.dispose = dispose;

ClassAttributeAccessor.prototype.doNotCache = true;
ClassAttributeAccessor.prototype.version = 0;
ClassAttributeAccessor.prototype.changeSet = null;
ClassAttributeAccessor.prototype.obj = null;
ClassAttributeAccessor.prototype.nameIndex = null;

// tslint:disable:no-any
export class PropertyAccessor implements IBindingTargetAccessor<IIndexable, string, any> {
  public hasChanges: boolean;
  public currentValue: string;
  public oldValue: string;
  public defaultValue: string;

  public setValue: (newValue: string) => Promise<void>;
  public flushChanges: () => void;
  public dispose: () => void;

  constructor(
    public changeSet: IChangeSet,
    public obj: IIndexable,
    public propertyKey: string) {
    this.oldValue = this.currentValue = obj[propertyKey];
  }

  public getValue(): any {
    return this.obj[this.propertyKey];
  }

  public setValueCore(value: any): void {
    this.obj[this.propertyKey] = value;
  }
}
// tslint:enable:no-any

PropertyAccessor.prototype.hasChanges = false;
PropertyAccessor.prototype.currentValue = undefined;
PropertyAccessor.prototype.oldValue = undefined;
PropertyAccessor.prototype.defaultValue = undefined;

PropertyAccessor.prototype.setValue = setValue;
PropertyAccessor.prototype.flushChanges = flushChanges;
PropertyAccessor.prototype.dispose = dispose;

PropertyAccessor.prototype.changeSet = null;
PropertyAccessor.prototype.obj = null;
