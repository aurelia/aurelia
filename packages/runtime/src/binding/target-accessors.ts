import { IIndexable, Primitive } from '../../kernel';
import { DOM, IHTMLElement, INode } from '../dom';
import { ILifecycle } from '../lifecycle';
import { IBindingTargetAccessor } from '../observation';
import { targetObserver } from './target-observer';

// tslint:disable-next-line:no-http-string
const xlinkAttributeNS = 'http://www.w3.org/1999/xlink';

export interface XLinkAttributeAccessor extends IBindingTargetAccessor<IHTMLElement, string, string> {}

@targetObserver('')
export class XLinkAttributeAccessor implements XLinkAttributeAccessor {
  public currentValue: string;
  public oldValue: string;
  public defaultValue: string;

  // xlink namespaced attributes require getAttributeNS/setAttributeNS
  // (even though the NS version doesn't work for other namespaces
  // in html5 documents)

  // Using very HTML-specific code here since this isn't likely to get
  // called unless operating against a real HTML element.

  constructor(
    public lifecycle: ILifecycle,
    public obj: IHTMLElement,
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

XLinkAttributeAccessor.prototype.attributeName = '';

export interface DataAttributeAccessor extends IBindingTargetAccessor<INode, string, string> {}

@targetObserver()
export class DataAttributeAccessor implements DataAttributeAccessor {
  public currentValue: string;
  public oldValue: string;
  public defaultValue: string;

  constructor(
    public lifecycle: ILifecycle,
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

export interface StyleAttributeAccessor extends IBindingTargetAccessor<IHTMLElement, 'style', string | IIndexable> {}

@targetObserver()
export class StyleAttributeAccessor implements StyleAttributeAccessor {
  public currentValue: string | IIndexable;
  public oldValue: string | IIndexable;
  public defaultValue: string | IIndexable;

  public propertyKey: 'style';

  public styles: IIndexable;
  public version: number;

  constructor(
    public lifecycle: ILifecycle,
    public obj: IHTMLElement) {

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
        const rx = /\s*([\w\-]+)\s*:\s*((?:(?:[\w\-]+\(\s*(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[\w\-]+\(\s*(?:[^"](?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^\)]*)\),?|[^\)]*)\),?|"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^;]*),?\s*)+);?/g;
        let pair;
        while ((pair = rx.exec(newValue as any)) !== null) {
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

StyleAttributeAccessor.prototype.styles = null;
StyleAttributeAccessor.prototype.version = 0;
StyleAttributeAccessor.prototype.propertyKey = 'style';

export interface ClassAttributeAccessor extends IBindingTargetAccessor<INode, string, string> {}

@targetObserver('')
export class ClassAttributeAccessor implements ClassAttributeAccessor {
  public currentValue: string;
  public oldValue: string;
  public defaultValue: string;

  public doNotCache: true;
  public version: number;
  public nameIndex: IIndexable;

  constructor(
    public lifecycle: ILifecycle,
    public obj: INode) { }

  public getValue(): string {
    return this.currentValue;
  }

  public setValueCore(newValue: string): void {
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
        DOM.addClass(node, name);
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
      DOM.removeClass(this.obj, name);
    }
  }
}

ClassAttributeAccessor.prototype.doNotCache = true;
ClassAttributeAccessor.prototype.version = 0;
ClassAttributeAccessor.prototype.nameIndex = null;

export interface ElementPropertyAccessor extends IBindingTargetAccessor<IIndexable, string, Primitive | IIndexable> {}

@targetObserver('')
export class ElementPropertyAccessor implements ElementPropertyAccessor {
  constructor(
    public lifecycle: ILifecycle,
    public obj: IIndexable,
    public propertyKey: string) { }

  public getValue(): Primitive | IIndexable {
    return this.obj[this.propertyKey];
  }

  public setValueCore(value: Primitive | IIndexable): void {
    this.obj[this.propertyKey] = value;
  }
}

export interface PropertyAccessor extends IBindingTargetAccessor<IIndexable, string, Primitive | IIndexable> {}

export class PropertyAccessor implements PropertyAccessor {
  constructor(public obj: IIndexable, public propertyKey: string) { }

  public getValue(): Primitive | IIndexable {
    return this.obj[this.propertyKey];
  }

  public setValue(value: Primitive | IIndexable): void {
    this.obj[this.propertyKey] = value;
  }
}
