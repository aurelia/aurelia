import { DI, inject, Reporter } from '@aurelia/kernel';
import { DOM } from '../dom';
import { getArrayObserver } from './array-observer';
import { IChangeSet } from './change-set';
import { createComputedObserver } from './computed-observer';
import { IDirtyChecker } from './dirty-checker';
import { CheckedObserver, ClassObserver, DataAttributeObserver, SelectValueObserver, StyleObserver, ValueAttributeObserver, XLinkAttributeObserver } from './element-observation';
import { IEventManager } from './event-manager';
import { getMapObserver } from './map-observer';
import { AccessorOrObserver, CollectionKind, IAccessor, IBindingTargetObserver, ICollectionObserver, IObservable } from './observation';
import { PrimitiveObserver, PropertyAccessor, SetterObserver } from './property-observation';
import { getSetObserver } from './set-observer';
import { ISVGAnalyzer } from './svg-analyzer';

export interface ObjectObservationAdapter {
  getObserver(object: any, propertyName: string, descriptor: PropertyDescriptor): IBindingTargetObserver;
}

export interface IObserverLocator {
  getObserver(obj: any, propertyName: string): AccessorOrObserver;
  getAccessor(obj: any, propertyName: string): IAccessor;
  addAdapter(adapter: ObjectObservationAdapter): void;
  getArrayObserver(array: any[]): ICollectionObserver<CollectionKind.array>;
  getMapObserver(map: Map<any, any>): ICollectionObserver<CollectionKind.map>;
  // tslint:disable-next-line:no-reserved-keywords
  getSetObserver(set: Set<any>): ICollectionObserver<CollectionKind.set>;
}

export const IObserverLocator = DI.createInterface<IObserverLocator>()
  .withDefault(x => x.singleton(ObserverLocator));

function getPropertyDescriptor(subject: object, name: string): PropertyDescriptor {
  let pd = Object.getOwnPropertyDescriptor(subject, name);
  let proto = Object.getPrototypeOf(subject);

  while (pd === undefined && proto !== null) {
    pd = Object.getOwnPropertyDescriptor(proto, name);
    proto = Object.getPrototypeOf(proto);
  }

  return pd;
}

@inject(IChangeSet, IEventManager, IDirtyChecker, ISVGAnalyzer)
/*@internal*/
export class ObserverLocator implements IObserverLocator {
  private adapters: ObjectObservationAdapter[] = [];

  constructor(
    private changeSet: IChangeSet,
    private eventManager: IEventManager,
    private dirtyChecker: IDirtyChecker,
    private svgAnalyzer: ISVGAnalyzer
  ) {}

  public getObserver(obj: any, propertyName: string): AccessorOrObserver {
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

  public addAdapter(adapter: ObjectObservationAdapter): void {
    this.adapters.push(adapter);
  }

  public getAccessor(obj: any, propertyName: string): IBindingTargetObserver | IAccessor {
    if (DOM.isNodeInstance(obj)) {
      const normalizedTagName = DOM.normalizedTagName;

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
        return new DataAttributeObserver(this.changeSet, obj, propertyName);
      }
    }

    return new PropertyAccessor(this.changeSet, obj, propertyName);
  }

  public getArrayObserver(array: any[]): ICollectionObserver<CollectionKind.array> {
    return getArrayObserver(this.changeSet, array);
  }

  public getMapObserver(map: Map<any, any>): ICollectionObserver<CollectionKind.map>  {
    return getMapObserver(this.changeSet, map);
  }

  // tslint:disable-next-line:no-reserved-keywords
  public getSetObserver(set: Set<any>): ICollectionObserver<CollectionKind.set>  {
    return getSetObserver(this.changeSet, set);
  }

  private getOrCreateObserversLookup(obj: IObservable): Record<string, AccessorOrObserver | IBindingTargetObserver> {
    return obj.$observers || this.createObserversLookup(obj);
  }

  private createObserversLookup(obj: IObservable): Record<string, IBindingTargetObserver> {
    const value: Record<string, IBindingTargetObserver> = {};
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

  private getAdapterObserver(obj: any, propertyName: string, descriptor: PropertyDescriptor): IBindingTargetObserver | null {
    for (let i = 0, ii = this.adapters.length; i < ii; i++) {
      const adapter = this.adapters[i];
      const observer = adapter.getObserver(obj, propertyName, descriptor);
      if (observer) {
        return observer;
      }
    }
    return null;
  }

  private createPropertyObserver(obj: any, propertyName: string): AccessorOrObserver | IBindingTargetObserver {
    if (!(obj instanceof Object)) {
      return new PrimitiveObserver(obj, propertyName);
    }

    if (DOM.isNodeInstance(obj)) {
      if (propertyName === 'class') {
        return new ClassObserver(this.changeSet, obj);
      }

      if (propertyName === 'style' || propertyName === 'css') {
        return new StyleObserver(this.changeSet, <HTMLElement>obj, propertyName);
      }

      const handler = this.eventManager.getElementHandler(obj, propertyName);
      if (propertyName === 'value' && DOM.normalizedTagName(obj) === 'select') {
        return new SelectValueObserver(<HTMLSelectElement>obj, handler, this.changeSet, this);
      }

      if (propertyName === 'checked' && DOM.normalizedTagName(obj) === 'input') {
        return new CheckedObserver(this.changeSet, <HTMLInputElement>obj, handler, this);
      }

      if (handler) {
        return new ValueAttributeObserver(this.changeSet, obj, propertyName, handler);
      }

      const xlinkResult = /^xlink:(.+)$/.exec(propertyName);
      if (xlinkResult) {
        return new XLinkAttributeObserver(this.changeSet, obj, propertyName, xlinkResult[1]);
      }

      if (propertyName === 'role'
        || /^\w+:|^data-|^aria-/.test(propertyName)
        || this.svgAnalyzer.isStandardSvgAttribute(obj, propertyName)) {
        return new DataAttributeObserver(this.changeSet, obj, propertyName);
      }
    }

    const descriptor: any = getPropertyDescriptor(obj, propertyName);

    if (descriptor) {
      if (descriptor.get || descriptor.set) {
        if (descriptor.get && descriptor.get.getObserver) {
          return descriptor.get.getObserver(obj);
        }

        // attempt to use an adapter before resorting to dirty checking.
        const adapterObserver = this.getAdapterObserver(obj, propertyName, descriptor);
        if (adapterObserver) {
          return adapterObserver;
        }

        return createComputedObserver(this, this.dirtyChecker, this.changeSet, obj, propertyName, descriptor);
      }
    }

    if (obj instanceof Array) {
      if (propertyName === 'length') {
        //return this.getArrayObserver(obj).getLengthObserver();
      }

      return this.dirtyChecker.createProperty(obj, propertyName);
    } else if (obj instanceof Map) {
      if (propertyName === 'size') {
        //return this.getMapObserver(obj).getLengthObserver();
      }

      return this.dirtyChecker.createProperty(obj, propertyName);
    } else if (obj instanceof Set) {
      if (propertyName === 'size') {
        //return this.getSetObserver(obj).getLengthObserver();
      }

      return this.dirtyChecker.createProperty(obj, propertyName);
    }

    return new SetterObserver(this.changeSet, obj, propertyName);
  }
}
