import { DI, inject, Reporter } from '@aurelia/kernel';
import { DOM } from '../dom';
import { IElement, IHTMLElement } from '../dom.interfaces';
import { ILifecycle } from '../lifecycle';
import {
  AccessorOrObserver,
  CollectionKind,
  CollectionObserver,
  IBindingContext,
  IBindingTargetAccessor,
  IBindingTargetObserver,
  ICollectionObserver,
  IObservable,
  IObservedArray,
  IObservedMap,
  IObservedSet,
  IOverrideContext
} from '../observation';
import { getArrayObserver } from './array-observer';
import { createComputedObserver } from './computed-observer';
import { IDirtyChecker } from './dirty-checker';
import { CheckedObserver, IInputElement, ISelectElement, SelectValueObserver, ValueAttributeObserver } from './element-observation';
import { IEventManager } from './event-manager';
import { getMapObserver } from './map-observer';
import { PrimitiveObserver, SetterObserver } from './property-observation';
import { getSetObserver } from './set-observer';
import { ISVGAnalyzer } from './svg-analyzer';
import {
  ClassAttributeAccessor,
  DataAttributeAccessor,
  ElementPropertyAccessor,
  PropertyAccessor,
  StyleAttributeAccessor,
  XLinkAttributeAccessor
} from './target-accessors';

const toStringTag = Object.prototype.toString;

export interface IObjectObservationAdapter {
  getObserver(object: IObservable, propertyName: string, descriptor: PropertyDescriptor): IBindingTargetObserver;
}

export interface IObserverLocator {
  getObserver(obj: IObservable, propertyName: string): AccessorOrObserver;
  getAccessor(obj: IObservable, propertyName: string): IBindingTargetAccessor;
  addAdapter(adapter: IObjectObservationAdapter): void;
  getArrayObserver(observedArray: unknown[]): ICollectionObserver<CollectionKind.array>;
  getMapObserver(observedMap: Map<unknown, unknown>): ICollectionObserver<CollectionKind.map>;
  getSetObserver(observedSet: Set<unknown>): ICollectionObserver<CollectionKind.set>;
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

@inject(DOM, ILifecycle, IEventManager, IDirtyChecker, ISVGAnalyzer)
/** @internal */
export class ObserverLocator implements IObserverLocator {
  private dom: DOM;
  private adapters: IObjectObservationAdapter[];
  private dirtyChecker: IDirtyChecker;
  private eventManager: IEventManager;
  private lifecycle: ILifecycle;
  private svgAnalyzer: ISVGAnalyzer;

  constructor(
    dom: DOM,
    lifecycle: ILifecycle,
    eventManager: IEventManager,
    dirtyChecker: IDirtyChecker,
    svgAnalyzer: ISVGAnalyzer
  ) {
    this.dom = dom;
    this.adapters = [];
    this.dirtyChecker = dirtyChecker;
    this.eventManager = eventManager;
    this.lifecycle = lifecycle;
    this.svgAnalyzer = svgAnalyzer;
  }

  public getObserver(obj: IObservable | IBindingContext | IOverrideContext, propertyName: string): AccessorOrObserver {
    if (obj.$synthetic === true) {
      return obj.getObservers().getOrCreate(obj, propertyName);
    }
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

  public addAdapter(adapter: IObjectObservationAdapter): void {
    this.adapters.push(adapter);
  }

  public getAccessor(obj: IObservable, propertyName: string): IBindingTargetAccessor {
    if (this.dom.isNodeInstance(obj)) {
      const tagName = obj['tagName'];
      // this check comes first for hot path optimization
      if (propertyName === 'textContent') {
        return new ElementPropertyAccessor(this.dom, this.lifecycle, obj, propertyName);
      }

      // TODO: optimize and make pluggable
      if (propertyName === 'class' || propertyName === 'style' || propertyName === 'css'
        || propertyName === 'value' && (tagName === 'INPUT' || tagName === 'SELECT')
        || propertyName === 'checked' && tagName === 'INPUT'
        || propertyName === 'model' && tagName === 'INPUT'
        || /^xlink:.+$/.exec(propertyName)) {
        return this.getObserver(obj, propertyName);
      }

      if (/^\w+:|^data-|^aria-/.test(propertyName)
        || this.svgAnalyzer.isStandardSvgAttribute(obj, propertyName)
        || tagName === 'IMG' && propertyName === 'src'
        || tagName === 'A' && propertyName === 'href'
      ) {
        return new DataAttributeAccessor(this.dom, this.lifecycle, obj as IHTMLElement, propertyName);
      }
      return new ElementPropertyAccessor(this.dom, this.lifecycle, obj, propertyName);
    }

    return new PropertyAccessor(obj, propertyName);
  }

  public getArrayObserver(observedArray: IObservedArray): ICollectionObserver<CollectionKind.array> {
    return getArrayObserver(this.lifecycle, observedArray);
  }

  public getMapObserver(observedMap: IObservedMap): ICollectionObserver<CollectionKind.map>  {
    return getMapObserver(this.lifecycle, observedMap);
  }

  public getSetObserver(observedSet: IObservedSet): ICollectionObserver<CollectionKind.set>  {
    return getSetObserver(this.lifecycle, observedSet);
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

  private getAdapterObserver(obj: IObservable, propertyName: string, descriptor: PropertyDescriptor): IBindingTargetObserver | null {
    for (let i = 0, ii = this.adapters.length; i < ii; i++) {
      const adapter = this.adapters[i];
      const observer = adapter.getObserver(obj, propertyName, descriptor);
      if (observer) {
        return observer;
      }
    }
    return null;
  }

  // TODO: Reduce complexity (currently at 37)
  private createPropertyObserver(obj: IObservable, propertyName: string): AccessorOrObserver {
    if (!(obj instanceof Object)) {
      return new PrimitiveObserver(obj, propertyName) as IBindingTargetAccessor;
    }

    let isNode: boolean;
    if (this.dom.isNodeInstance(obj)) {
      if (propertyName === 'class') {
        return new ClassAttributeAccessor(this.dom, this.lifecycle, obj as IHTMLElement);
      }

      if (propertyName === 'style' || propertyName === 'css') {
        return new StyleAttributeAccessor(this.dom, this.lifecycle, obj as IHTMLElement);
      }

      const tagName = obj['tagName'];
      const handler = this.eventManager.getElementHandler(this.dom, obj, propertyName);
      if (propertyName === 'value' && tagName === 'SELECT') {
        return new SelectValueObserver(this.dom, this.lifecycle, obj as ISelectElement, handler, this);
      }

      if (propertyName === 'checked' && tagName === 'INPUT') {
        return new CheckedObserver(this.dom, this.lifecycle, obj as IInputElement, handler, this);
      }

      if (handler) {
        return new ValueAttributeObserver(this.dom, this.lifecycle, obj, propertyName, handler);
      }

      const xlinkResult = /^xlink:(.+)$/.exec(propertyName);
      if (xlinkResult) {
        return new XLinkAttributeAccessor(this.dom, this.lifecycle, obj as IHTMLElement, propertyName, xlinkResult[1]);
      }

      if (propertyName === 'role'
        || /^\w+:|^data-|^aria-/.test(propertyName)
        || this.svgAnalyzer.isStandardSvgAttribute(obj, propertyName)) {
        return new DataAttributeAccessor(this.dom, this.lifecycle, obj as IHTMLElement, propertyName);
      }
      isNode = true;
    }

    const tag = toStringTag.call(obj);
    switch (tag) {
      case '[object Array]':
        if (propertyName === 'length') {
          return this.getArrayObserver(obj as IObservedArray).getLengthObserver();
        }
        return this.dirtyChecker.createProperty(obj, propertyName);
      case '[object Map]':
        if (propertyName === 'size') {
          return this.getMapObserver(obj as IObservedMap).getLengthObserver();
        }
        return this.dirtyChecker.createProperty(obj, propertyName);
      case '[object Set]':
        if (propertyName === 'size') {
          return this.getSetObserver(obj as IObservedSet).getLengthObserver();
        }
        return this.dirtyChecker.createProperty(obj, propertyName);
    }

    const descriptor = getPropertyDescriptor(obj, propertyName) as PropertyDescriptor & {
      get: PropertyDescriptor['get'] & { getObserver(obj: IObservable): IBindingTargetObserver };
    };

    if (descriptor && (descriptor.get || descriptor.set)) {
      if (descriptor.get && descriptor.get.getObserver) {
        return descriptor.get.getObserver(obj);
      }

      // attempt to use an adapter before resorting to dirty checking.
      const adapterObserver = this.getAdapterObserver(obj, propertyName, descriptor);
      if (adapterObserver) {
        return adapterObserver;
      }
      if (isNode) {
        // TODO: use MutationObserver
        return this.dirtyChecker.createProperty(obj, propertyName);
      }

      return createComputedObserver(this, this.dirtyChecker, this.lifecycle, obj, propertyName, descriptor);
    }
    return new SetterObserver(obj, propertyName);
  }
}

export function getCollectionObserver(lifecycle: ILifecycle, collection: IObservedMap | IObservedSet | IObservedArray): CollectionObserver {
  switch (toStringTag.call(collection)) {
    case '[object Array]':
      return getArrayObserver(lifecycle, collection as IObservedArray);
    case '[object Map]':
      return getMapObserver(lifecycle, collection as IObservedMap);
    case '[object Set]':
      return getSetObserver(lifecycle, collection as IObservedSet);
  }
  return null;
}
