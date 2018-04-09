import { DOM } from '../dom';
import { getArrayObserver } from './array-observation';
import { getMapObserver } from './map-observation';
import { getSetObserver } from './set-observation';
import { EventManager } from './event-manager';
import { DirtyChecker } from './dirty-checker';
import {
  SetterObserver,
  PrimitiveObserver,
  propertyAccessor
} from './property-observation';
import { SelectValueObserver } from './select-value-observer';
import { CheckedObserver } from './checked-observer';
import {
  ValueAttributeObserver,
  XLinkAttributeObserver,
  DataAttributeObserver,
  StyleObserver,
  dataAttributeAccessor
} from './element-observation';
import { ClassObserver } from './class-observer';
import { SVGAnalyzer } from './svg-analyzer';
import { IBindingTargetObserver, IObservable, IBindingTargetAccessor, IBindingCollectionObserver, AccessorOrObserver, IAccessor } from './observation';
import { Reporter } from '../reporter';

export interface IObserverLocator {
  getObserver(obj: any, propertyName: string): AccessorOrObserver;
  getAccessor(obj: any, propertyName: string): IAccessor | IBindingTargetAccessor;

  getArrayObserver(array: any[]): IBindingCollectionObserver;
  getMapObserver(map: Map<any, any>): IBindingCollectionObserver;
}

function getPropertyDescriptor(subject: object, name: string) {
  let pd = Object.getOwnPropertyDescriptor(subject, name);
  let proto = Object.getPrototypeOf(subject);

  while (typeof pd === 'undefined' && proto !== null) {
    pd = Object.getOwnPropertyDescriptor(proto, name);
    proto = Object.getPrototypeOf(proto);
  }

  return pd;
}

export class ObserverLocator implements IObserverLocator {
  public static instance = new ObserverLocator();
  private adapters: ObjectObservationAdapter[] = [];

  getObserver(obj: any, propertyName: string): AccessorOrObserver {
    let observersLookup = obj.$observers;
    let observer;

    if (observersLookup && propertyName in observersLookup) {
      return observersLookup[propertyName];
    }

    observer = this.createPropertyObserver(obj, propertyName);

    if (!observer.doNotCache) {
      if (observersLookup === undefined) {
        observersLookup = this.getOrCreateObserversLookup(obj);
      }

      observersLookup[propertyName] = observer;
    }

    return observer;
  }

  getOrCreateObserversLookup(obj: IObservable) {
    return obj.$observers || this.createObserversLookup(obj);
  }

  createObserversLookup(obj: IObservable): Record<string, IBindingTargetObserver> {
    let value: Record<string, IBindingTargetObserver> = {};

    if (!Reflect.defineProperty(obj, '$observers', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: value
    })) {
      Reporter.write(0, obj);
    }

    return value;
  }

  addAdapter(adapter: ObjectObservationAdapter) {
    this.adapters.push(adapter);
  }

  getAdapterObserver(obj: any, propertyName: string, descriptor: PropertyDescriptor) {
    for (let i = 0, ii = this.adapters.length; i < ii; i++) {
      let adapter = this.adapters[i];
      let observer = adapter.getObserver(obj, propertyName, descriptor);
      if (observer) {
        return observer;
      }
    }
    return null;
  }

  createPropertyObserver(obj: any, propertyName: string) {
    let descriptor;
    let handler;
    let xlinkResult;

    if (!(obj instanceof Object)) {
      return new PrimitiveObserver(obj, propertyName);
    }

    if (obj instanceof DOM.Element) {
      if (propertyName === 'class') {
        return new ClassObserver(obj);
      }

      if (propertyName === 'style' || propertyName === 'css') {
        return new StyleObserver(<HTMLElement>obj, propertyName);
      }

      handler = EventManager.getElementHandler(obj, propertyName);
      if (propertyName === 'value' && obj.tagName.toLowerCase() === 'select') {
        return new SelectValueObserver(obj as HTMLSelectElement, handler, this);
      }

      if (propertyName === 'checked' && obj.tagName.toLowerCase() === 'input') {
        return new CheckedObserver(<HTMLInputElement>obj, handler, this);
      }

      if (handler) {
        return new ValueAttributeObserver(obj, propertyName, handler);
      }

      xlinkResult = /^xlink:(.+)$/.exec(propertyName);
      if (xlinkResult) {
        return new XLinkAttributeObserver(obj, propertyName, xlinkResult[1]);
      }

      if (propertyName === 'role' && (obj instanceof DOM.Element || <any>obj instanceof DOM.SVGElement)
        || /^\w+:|^data-|^aria-/.test(propertyName)
        || obj instanceof DOM.SVGElement && SVGAnalyzer.isStandardSvgAttribute(obj.nodeName, propertyName)) {
        return new DataAttributeObserver(obj, propertyName);
      }
    }

    descriptor = getPropertyDescriptor(obj, propertyName);

    //TODO: do something with this so that it doesn't always require the full expression parser
    //if (hasDeclaredDependencies(descriptor)) {
    //  return createComputedObserver(obj, propertyName, descriptor, this);
    //}

    if (descriptor) {
      const existingGetterOrSetter: ((arg?: any) => any) & { getObserver?: Function } = descriptor.get || descriptor.set;
      if (existingGetterOrSetter) {
        if (existingGetterOrSetter.getObserver) {
          return existingGetterOrSetter.getObserver(obj);
        }

        // attempt to use an adapter before resorting to dirty checking.
        let adapterObserver = this.getAdapterObserver(obj, propertyName, descriptor);
        if (adapterObserver) {
          return adapterObserver;
        }

        return DirtyChecker.createProperty(obj, propertyName);
      }
    }

    if (obj instanceof Array) {
      if (propertyName === 'length') {
        return this.getArrayObserver(obj).getLengthObserver();
      }

      return DirtyChecker.createProperty(obj, propertyName);
    } else if (obj instanceof Map) {
      if (propertyName === 'size') {
        return this.getMapObserver(obj).getLengthObserver();
      }

      return DirtyChecker.createProperty(obj, propertyName);
    } else if (obj instanceof Set) {
      if (propertyName === 'size') {
        return this.getSetObserver(obj).getLengthObserver();
      }

      return DirtyChecker.createProperty(obj, propertyName);
    }

    return new SetterObserver(obj, propertyName);
  }

  getAccessor(obj: any, propertyName: string): IBindingTargetObserver | IBindingTargetAccessor {
    if (obj instanceof DOM.Element) {
      if (propertyName === 'class'
        || propertyName === 'style' || propertyName === 'css'
        || propertyName === 'value' && (obj.tagName.toLowerCase() === 'input' || obj.tagName.toLowerCase() === 'select')
        || propertyName === 'checked' && obj.tagName.toLowerCase() === 'input'
        || propertyName === 'model' && obj.tagName.toLowerCase() === 'input'
        || /^xlink:.+$/.exec(propertyName)) {
        return <any>this.getObserver(obj, propertyName);
      }

      if (/^\w+:|^data-|^aria-/.test(propertyName)
        || obj instanceof DOM.SVGElement && SVGAnalyzer.isStandardSvgAttribute(obj.nodeName, propertyName)
        || obj.tagName.toLowerCase() === 'img' && propertyName === 'src'
        || obj.tagName.toLowerCase() === 'a' && propertyName === 'href'
      ) {
        return dataAttributeAccessor;
      }
    }

    return propertyAccessor;
  }

  getArrayObserver(array: any[]) {
    return getArrayObserver(array);
  }

  getMapObserver(map: Map<any, any>) {
    return getMapObserver(map);
  }

  getSetObserver(set: Set<any>) {
    return getSetObserver(set);
  }
}

export interface ObjectObservationAdapter {
  getObserver(object: any, propertyName: string, descriptor: PropertyDescriptor): IBindingTargetObserver;
}
