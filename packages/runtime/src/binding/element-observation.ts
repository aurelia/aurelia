import { SubscriberCollection } from './subscriber-collection';
import { ICallable } from '../../kernel/interfaces';
import { IAccessor, ISubscribable } from './observation';
import { IEventSubscriber } from './event-manager';
import { INode, DOM } from '../dom';

export class XLinkAttributeObserver implements IAccessor {
  // xlink namespaced attributes require getAttributeNS/setAttributeNS
  // (even though the NS version doesn't work for other namespaces
  // in html5 documents)

  // Using very HTML-specific code here since this isn't likely to get
  // called unless operating against a real HTML element.

  constructor(private node: INode, private propertyName: string, private attributeName: string) { }

  getValue() {
    return (<Element>this.node).getAttributeNS('http://www.w3.org/1999/xlink', this.attributeName);
  }

  setValue(newValue: any) {
    return (<Element>this.node).setAttributeNS('http://www.w3.org/1999/xlink', this.attributeName, newValue);
  }

  subscribe() {
    throw new Error(`Observation of a "${DOM.normalizedTagName(this.node)}" element\'s "${this.propertyName}" property is not supported.`);
  }
}

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
  constructor(private node: INode, private propertyName: string) { }

  getValue() {
    return DOM.getAttribute(this.node, this.propertyName);
  }

  setValue(newValue: any) {
    if (newValue === null || newValue === undefined) {
      return DOM.removeAttribute(this.node, this.propertyName);
    }

    return DOM.setAttribute(this.node, this.propertyName, newValue);
  }

  subscribe() {
    throw new Error(`Observation of a "${DOM.normalizedTagName(this.node)}" element\'s "${this.propertyName}" property is not supported.`);
  }
}

export class StyleObserver implements IAccessor {
  styles: any = null;
  version = 0;

  constructor(private element: HTMLElement, private propertyName: string) { }

  getValue() {
    return this.element.style.cssText;
  }

  _setProperty(style: string, value: string) {
    let priority = '';

    if (value !== null && value !== undefined && typeof value.indexOf === 'function' && value.indexOf('!important') !== -1) {
      priority = 'important';
      value = value.replace('!important', '');
    }

    this.element.style.setProperty(style, value, priority);
  }

  setValue(newValue: any) {
    let styles = this.styles || {};
    let style;
    let version = this.version;

    if (newValue !== null && newValue !== undefined) {
      if (newValue instanceof Object) {
        let value;
        for (style in newValue) {
          if (newValue.hasOwnProperty(style)) {
            value = newValue[style];
            style = style.replace(/([A-Z])/g, m => '-' + m.toLowerCase());
            styles[style] = version;
            this._setProperty(style, value);
          }
        }
      } else if (newValue.length) {
        let rx = /\s*([\w\-]+)\s*:\s*((?:(?:[\w\-]+\(\s*(?:"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[\w\-]+\(\s*(?:^"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^\)]*)\),?|[^\)]*)\),?|"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|[^;]*),?\s*)+);?/g;
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

  subscribe() {
    throw new Error(`Observation of a "${this.element.nodeName}" element\'s "${this.propertyName}" property is not supported.`);
  }
}

export class ValueAttributeObserver extends SubscriberCollection implements IAccessor, ISubscribable {
  private oldValue: any;

  constructor(
    private node: INode,
    private propertyName: string,
    public handler: IEventSubscriber
  ) {
    super();

    if (propertyName === 'files') {
      // input.files cannot be assigned.
      this.setValue = () => { };
    }
  }

  getValue(): any {
    return (this.node as any)[this.propertyName];
  }

  setValue(newValue: any) {
    newValue = newValue === undefined || newValue === null ? '' : newValue;
    if ((this.node as any)[this.propertyName] !== newValue) {
      (this.node as any)[this.propertyName] = newValue;
      this.notify();
    }
  }

  notify() {
    let oldValue = this.oldValue;
    let newValue = this.getValue();

    this.callSubscribers(newValue, oldValue);

    this.oldValue = newValue;
  }

  handleEvent() {
    this.notify();
  }

  subscribe(context: string, callable: ICallable) {
    if (!this.hasSubscribers()) {
      this.oldValue = this.getValue();
      this.handler.subscribe(this.node, this);
    }

    this.addSubscriber(context, callable);
  }

  unsubscribe(context: string, callable: ICallable) {
    if (this.removeSubscriber(context, callable) && !this.hasSubscribers()) {
      this.handler.dispose();
    }
  }
}
