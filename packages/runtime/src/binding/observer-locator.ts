import { DI, inject, Reporter } from '@aurelia/kernel';
import { DOM } from '../dom';
import { getArrayObserver } from './array-observer';
import { IChangeSet } from './change-set';
import { createComputedObserver } from './computed-observer';
import { IDirtyChecker } from './dirty-checker';
import { CheckedObserver, SelectValueObserver, ValueAttributeObserver } from './element-observation';
import { IEventManager } from './event-manager';
import { getMapObserver } from './map-observer';
import { AccessorOrObserver, CollectionKind, IBindingTargetAccessor, IBindingTargetObserver, ICollectionObserver, IObservable } from './observation';
import { PrimitiveObserver, SetterObserver } from './property-observation';
import { getSetObserver } from './set-observer';
import { ISVGAnalyzer } from './svg-analyzer';
import { ClassAttributeAccessor, DataAttributeAccessor, PropertyAccessor, StyleAttributeAccessor, XLinkAttributeAccessor } from './target-accessors';

export interface ObjectObservationAdapter {
  getObserver(object: any, propertyName: string, descriptor: PropertyDescriptor): IBindingTargetObserver;
}

export interface IObserverLocator {
  getObserver(obj: any, propertyName: string): AccessorOrObserver;
  getAccessor(obj: any, propertyName: string): IBindingTargetAccessor;
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

  public getAccessor(obj: any, propertyName: string): IBindingTargetAccessor {
    if (DOM.isNodeInstance(obj)) {
      const tagName = obj['tagName'];

      if (propertyName === 'class' || propertyName === 'style' || propertyName === 'css'
        || propertyName === 'value' && (tagName === 'INPUT' || tagName === 'SELECT')
        || propertyName === 'checked' && tagName === 'INPUT'
        || propertyName === 'model' && tagName === 'INPUT'
        || /^xlink:.+$/.exec(propertyName)) {
        return <any>this.getObserver(obj, propertyName);
      }

      if (/^\w+:|^data-|^aria-/.test(propertyName)
        || this.svgAnalyzer.isStandardSvgAttribute(obj, propertyName)
        || tagName === 'IMG' && propertyName === 'src'
        || tagName === 'A' && propertyName === 'href'
      ) {
        return new DataAttributeAccessor(this.changeSet, obj, propertyName);
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

  private createPropertyObserver(obj: any, propertyName: string): AccessorOrObserver {
    if (!(obj instanceof Object)) {
      return new PrimitiveObserver(obj, propertyName) as any;
    }

    if (DOM.isNodeInstance(obj)) {
      if (propertyName === 'class') {
        return new ClassAttributeAccessor(this.changeSet, obj);
      }

      if (propertyName === 'style' || propertyName === 'css') {
        return new StyleAttributeAccessor(this.changeSet, <HTMLElement>obj);
      }

      const tagName = obj['tagName'];
      const handler = this.eventManager.getElementHandler(obj, propertyName);
      if (propertyName === 'value' && tagName === 'SELECT') {
        return new SelectValueObserver(this.changeSet, <HTMLSelectElement>obj, handler, this);
      }

      if (propertyName === 'checked' && tagName === 'INPUT') {
        return new CheckedObserver(this.changeSet, <HTMLInputElement>obj, handler, this);
      }

      if (handler) {
        return new ValueAttributeObserver(this.changeSet, obj, propertyName, handler);
      }

      const xlinkResult = /^xlink:(.+)$/.exec(propertyName);
      if (xlinkResult) {
        return new XLinkAttributeAccessor(this.changeSet, <Element>obj, propertyName, xlinkResult[1]);
      }

      if (propertyName === 'role'
        || /^\w+:|^data-|^aria-/.test(propertyName)
        || this.svgAnalyzer.isStandardSvgAttribute(obj, propertyName)) {
        return new DataAttributeAccessor(this.changeSet, obj, propertyName);
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

        return createComputedObserver(this, this.dirtyChecker, this.changeSet, obj, propertyName, descriptor) as any;
      }
    }

    if (obj instanceof Array) {
      if (propertyName === 'length') {
        // TODO: implement length observation via proxy
        //return this.getArrayObserver(obj).getLengthObserver();
      }

      // TODO: get rid of dirty checker and use proxy instead
      return this.dirtyChecker.createProperty(obj, propertyName) as any;
    } else if (obj instanceof Map) {
      if (propertyName === 'size') {
        //return this.getMapObserver(obj).getLengthObserver();
      }

      return this.dirtyChecker.createProperty(obj, propertyName) as any;
    } else if (obj instanceof Set) {
      if (propertyName === 'size') {
        //return this.getSetObserver(obj).getLengthObserver();
      }

      return this.dirtyChecker.createProperty(obj, propertyName) as any;
    }

    return new SetterObserver(this.changeSet, obj, propertyName);
  }
}
