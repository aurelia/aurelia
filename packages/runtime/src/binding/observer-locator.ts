import { DOM } from '../dom';
import { getArrayObserver } from './array-observation';
import { getMapObserver } from './map-observation';
import { getSetObserver } from './set-observation';
import { IEventManager } from './event-manager';
import { IDirtyChecker } from './dirty-checker';
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
import { ISVGAnalyzer } from './svg-analyzer';
import { IBindingTargetObserver, IObservable, IBindingTargetAccessor, IBindingCollectionObserver, AccessorOrObserver, IAccessor } from './observation';
import { Reporter } from '@aurelia/kernel';
import { DI, inject } from '@aurelia/kernel';
import { ITaskQueue } from '../task-queue';
import { createComputedObserver } from './computed-observer';

export interface ObjectObservationAdapter {
  getObserver(object: any, propertyName: string, descriptor: PropertyDescriptor): IBindingTargetObserver;
}

export interface IObserverLocator {
  getObserver(obj: any, propertyName: string): AccessorOrObserver;
  getAccessor(obj: any, propertyName: string): IAccessor | IBindingTargetAccessor;
  addAdapter(adapter: ObjectObservationAdapter);
  getArrayObserver(array: any[]): IBindingCollectionObserver;
  getMapObserver(map: Map<any, any>): IBindingCollectionObserver;
  getSetObserver(set: Set<any>): IBindingCollectionObserver;
}

export const IObserverLocator = DI.createInterface<IObserverLocator>()
  .withDefault(x => x.singleton(ObserverLocator));

function getPropertyDescriptor(subject: object, name: string) {
  let pd = Object.getOwnPropertyDescriptor(subject, name);
  let proto = Object.getPrototypeOf(subject);

  while (typeof pd === 'undefined' && proto !== null) {
    pd = Object.getOwnPropertyDescriptor(proto, name);
    proto = Object.getPrototypeOf(proto);
  }

  return pd;
}

@inject(ITaskQueue, IEventManager, IDirtyChecker, ISVGAnalyzer)
class ObserverLocator implements IObserverLocator {
  private adapters: ObjectObservationAdapter[] = [];

  constructor(
    private taskQueue: ITaskQueue,
    private eventManager: IEventManager, 
    private dirtyChecker: IDirtyChecker,
    private svgAnalyzer: ISVGAnalyzer
  ) {}

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

  private getOrCreateObserversLookup(obj: IObservable) {
    return obj.$observers || this.createObserversLookup(obj);
  }

  private createObserversLookup(obj: IObservable): Record<string, IBindingTargetObserver> {
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

  private getAdapterObserver(obj: any, propertyName: string, descriptor: PropertyDescriptor) {
    for (let i = 0, ii = this.adapters.length; i < ii; i++) {
      let adapter = this.adapters[i];
      let observer = adapter.getObserver(obj, propertyName, descriptor);
      if (observer) {
        return observer;
      }
    }
    return null;
  }

  private createPropertyObserver(obj: any, propertyName: string) {
    if (!(obj instanceof Object)) {
      return new PrimitiveObserver(obj, propertyName);
    }

    if (DOM.isNodeInstance(obj)) {
      if (propertyName === 'class') {
        return new ClassObserver(obj);
      }

      if (propertyName === 'style' || propertyName === 'css') {
        return new StyleObserver(<HTMLElement>obj, propertyName);
      }

      const handler = this.eventManager.getElementHandler(obj, propertyName);
      if (propertyName === 'value' && DOM.normalizedTagName(obj) === 'select') {
        return new SelectValueObserver(<HTMLSelectElement>obj, handler, this.taskQueue, this);
      }

      if (propertyName === 'checked' && DOM.normalizedTagName(obj) === 'input') {
        return new CheckedObserver(<HTMLInputElement>obj, handler, this.taskQueue, this);
      }

      if (handler) {
        return new ValueAttributeObserver(obj, propertyName, handler);
      }

      const xlinkResult = /^xlink:(.+)$/.exec(propertyName);
      if (xlinkResult) {
        return new XLinkAttributeObserver(obj, propertyName, xlinkResult[1]);
      }

      if (propertyName === 'role'
        || /^\w+:|^data-|^aria-/.test(propertyName)
        || this.svgAnalyzer.isStandardSvgAttribute(obj, propertyName)) {
        return new DataAttributeObserver(obj, propertyName);
      }
    }

    const descriptor: any = getPropertyDescriptor(obj, propertyName);

    if (descriptor) {
      if (descriptor.get || descriptor.set) {
        if (descriptor.get && descriptor.get.getObserver) {
          return descriptor.get.getObserver(obj);
        }

        // attempt to use an adapter before resorting to dirty checking.
        let adapterObserver = this.getAdapterObserver(obj, propertyName, descriptor);
        if (adapterObserver) {
          return adapterObserver;
        }

        return createComputedObserver(this, this.dirtyChecker, this.taskQueue, obj, propertyName, descriptor);
      }
    }

    if (obj instanceof Array) {
      if (propertyName === 'length') {
        return this.getArrayObserver(obj).getLengthObserver();
      }

      return this.dirtyChecker.createProperty(obj, propertyName);
    } else if (obj instanceof Map) {
      if (propertyName === 'size') {
        return this.getMapObserver(obj).getLengthObserver();
      }

      return this.dirtyChecker.createProperty(obj, propertyName);
    } else if (obj instanceof Set) {
      if (propertyName === 'size') {
        return this.getSetObserver(obj).getLengthObserver();
      }

      return this.dirtyChecker.createProperty(obj, propertyName);
    }

    return new SetterObserver(this.taskQueue, obj, propertyName);
  }

  getAccessor(obj: any, propertyName: string): IBindingTargetObserver | IBindingTargetAccessor {
    if (DOM.isNodeInstance(obj)) {
      let normalizedTagName = DOM.normalizedTagName;

      if (propertyName === 'class'
        || propertyName === 'style' || propertyName === 'css'
        || propertyName === 'value' && (normalizedTagName(obj) === 'input' || normalizedTagName(obj) === 'select')
        || propertyName === 'checked' && normalizedTagName(obj) === 'input'
        || propertyName === 'model' && normalizedTagName(obj) === 'input'
        || /^xlink:.+$/.exec(propertyName)) {
        return <any>this.getObserver(obj, propertyName);
      }

      if (/^\w+:|^data-|^aria-/.test(propertyName)
        || this.svgAnalyzer.isStandardSvgAttribute(obj, propertyName)
        || normalizedTagName(obj) === 'img' && propertyName === 'src'
        || normalizedTagName(obj) === 'a' && propertyName === 'href'
      ) {
        return dataAttributeAccessor;
      }
    }

    return propertyAccessor;
  }

  getArrayObserver(array: any[]): IBindingCollectionObserver {
    return getArrayObserver(this.taskQueue, array);
  }

  getMapObserver(map: Map<any, any>): IBindingCollectionObserver {
    return getMapObserver(this.taskQueue, map);
  }

  getSetObserver(set: Set<any>): IBindingCollectionObserver {
    return getSetObserver(this.taskQueue, set);
  }
}
