import { DI, IIndexable, inject, Primitive, Reporter } from '../../kernel';
import { DOM, IHTMLElement, IInputElement } from '../dom';
import { ILifecycle } from '../lifecycle';
import {
  AccessorOrObserver, CollectionKind, CollectionObserver, IBindingContext,
  IBindingTargetAccessor, IBindingTargetObserver, ICollectionObserver,
  IObservable,  IObservedArray, IObservedMap, IObservedSet, IOverrideContext
} from '../observation';
import { getArrayObserver } from './array-observer';
import { createComputedObserver } from './computed-observer';
import { IDirtyChecker } from './dirty-checker';
import { CheckedObserver, ISelectElement, SelectValueObserver, ValueAttributeObserver } from './element-observation';
import { IEventManager } from './event-manager';
import { getMapObserver } from './map-observer';
import { PrimitiveObserver, SetterObserver } from './property-observation';
import { getSetObserver } from './set-observer';
import { ISVGAnalyzer } from './svg-analyzer';
import { ClassAttributeAccessor, DataAttributeAccessor, ElementPropertyAccessor, PropertyAccessor, StyleAttributeAccessor, XLinkAttributeAccessor } from './target-accessors';
import { FabricDOM, IFabricNode } from '../fabric-dom';
import { FabricPropertyObserver } from './fabric-observer';
import { IFabricVNode } from 'runtime/fabric-vnode';
import { VNode } from 'dom/node';

const toStringTag = Object.prototype.toString;

export interface IObjectObservationAdapter {
  getObserver(object: IObservable, propertyName: string, descriptor: PropertyDescriptor): IBindingTargetObserver;
}

export interface IObserverLocator {
  getObserver(obj: IObservable, propertyName: string): AccessorOrObserver;
  getAccessor(obj: IObservable, propertyName: string): IBindingTargetAccessor;
  addAdapter(adapter: IObjectObservationAdapter): void;
  getArrayObserver(observedArray: (IIndexable | Primitive)[]): ICollectionObserver<CollectionKind.array>;
  getMapObserver(observedMap: Map<IIndexable | Primitive, IIndexable | Primitive>): ICollectionObserver<CollectionKind.map>;
  getSetObserver(observedSet: Set<IIndexable | Primitive>): ICollectionObserver<CollectionKind.set>;
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

@inject(ILifecycle, IEventManager, IDirtyChecker, ISVGAnalyzer)
/*@internal*/
export class ObserverLocator implements IObserverLocator {
  private adapters: IObjectObservationAdapter[] = [];

  constructor(
    private lifecycle: ILifecycle,
    private eventManager: IEventManager,
    private dirtyChecker: IDirtyChecker,
    private svgAnalyzer: ISVGAnalyzer
  ) {}

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
    if (obj instanceof VNode && FabricDOM.isNodeInstance(obj.nativeObject)) {
      return new FabricPropertyAccessor(obj, propertyName);
    }
    if (DOM.isNodeInstance(obj)) {
      const tagName = obj['tagName'];
      // this check comes first for hot path optimization
      if (propertyName === 'textContent') {
        return new ElementPropertyAccessor(this.lifecycle, obj, propertyName);
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
        return new DataAttributeAccessor(this.lifecycle, obj, propertyName);
      }
      return new ElementPropertyAccessor(this.lifecycle, obj, propertyName);
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

  private createPropertyObserver(obj: IObservable, propertyName: string): AccessorOrObserver {
    if (!(obj instanceof Object)) {
      return new PrimitiveObserver(obj as any, propertyName) as IBindingTargetAccessor;
    }

    if (obj instanceof VNode && FabricDOM.isNodeInstance(obj.nativeObject)) {
      if (propertyName === 'x'
        || propertyName === 'top'
        || propertyName === 'y'
        || propertyName === 'left'
        || propertyName === 'width'
        || propertyName === 'height'
        || propertyName === 'rx'
        || propertyName === 'ry'
      ) {
        return new FabricPropertyObserver(this.lifecycle, obj, propertyName);
      }
    }

    let isNode: boolean;
    if (DOM.isNodeInstance(obj)) {
      if (propertyName === 'class') {
        return new ClassAttributeAccessor(this.lifecycle, obj);
      }

      if (propertyName === 'style' || propertyName === 'css') {
        return new StyleAttributeAccessor(this.lifecycle, <IHTMLElement>obj);
      }

      const tagName = obj['tagName'];
      const handler = this.eventManager.getElementHandler(obj, propertyName);
      if (propertyName === 'value' && tagName === 'SELECT') {
        return new SelectValueObserver(this.lifecycle, <ISelectElement>obj, handler, this);
      }

      if (propertyName === 'checked' && tagName === 'INPUT') {
        return new CheckedObserver(this.lifecycle, <IInputElement>obj, handler, this);
      }

      if (handler) {
        return new ValueAttributeObserver(this.lifecycle, obj, propertyName, handler);
      }

      const xlinkResult = /^xlink:(.+)$/.exec(propertyName);
      if (xlinkResult) {
        return new XLinkAttributeAccessor(this.lifecycle, <IHTMLElement>obj, propertyName, xlinkResult[1]);
      }

      if (propertyName === 'role'
        || /^\w+:|^data-|^aria-/.test(propertyName)
        || this.svgAnalyzer.isStandardSvgAttribute(obj, propertyName)) {
        return new DataAttributeAccessor(this.lifecycle, obj, propertyName);
      }
      isNode = true;
    }

    const tag = toStringTag.call(obj);
    switch (tag) {
      case '[object Array]':
        if (propertyName === 'length') {
          return this.getArrayObserver(<IObservedArray>obj).getLengthObserver();
        }
        return this.dirtyChecker.createProperty(obj, propertyName);
      case '[object Map]':
        if (propertyName === 'size') {
          return this.getMapObserver(<IObservedMap>obj).getLengthObserver();
        }
        return this.dirtyChecker.createProperty(obj, propertyName);
      case '[object Set]':
        if (propertyName === 'size') {
          return this.getSetObserver(<IObservedSet>obj).getLengthObserver();
        }
        return this.dirtyChecker.createProperty(obj, propertyName);
    }

    const descriptor = getPropertyDescriptor(obj, propertyName) as PropertyDescriptor & {
      // tslint:disable-next-line:no-reserved-keywords
      get: PropertyDescriptor['get'] & { getObserver(obj: IObservable): IBindingTargetObserver };
    };

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
        if (isNode) {
          // TODO: use MutationObserver
          return this.dirtyChecker.createProperty(obj, propertyName);
        }

        return createComputedObserver(this, this.dirtyChecker, this.lifecycle, obj, propertyName, descriptor);
      }
    }
    return new SetterObserver(obj, propertyName);
  }
}

export function getCollectionObserver(lifecycle: ILifecycle, collection: IObservedMap | IObservedSet | IObservedArray): CollectionObserver {
  switch (toStringTag.call(collection)) {
    case '[object Array]':
      return getArrayObserver(lifecycle, <IObservedArray>collection);
    case '[object Map]':
      return getMapObserver(lifecycle, <IObservedMap>collection);
    case '[object Set]':
      return getSetObserver(lifecycle, <IObservedSet>collection);
  }
  return null;
}


interface FabricPropertyAccessor extends IBindingTargetAccessor<IIndexable, string, Primitive | IIndexable> {}
class FabricPropertyAccessor implements PropertyAccessor {
  constructor(public obj: IFabricVNode, public propertyKey: string) {
    const nativeObject = obj.nativeObject;
    const type = nativeObject.type;
    if (type === 'canvas' || type === 'canvas') {
      if (propertyKey === 'width' || propertyKey === 'height') {
        this.getValue = this[`getCanvas${propertyKey}`];
      }
    }
  }

  public getValue(): Primitive | IIndexable {
    return this.obj.nativeObject[this.propertyKey];
  }

  public setValue(value: Primitive | IIndexable): void {
    this.obj.nativeObject[this.propertyKey] = value;
  }

  public getCanvasWidth() {
    return (this.obj.nativeObject as any as fabric.StaticCanvas).getWidth();
  }

  public setCanvasWidth(value: Primitive | IIndexable): void {
    (this.obj.nativeObject as any as fabric.StaticCanvas).setWidth(value as number);
  }

  public getCanvasHeight() {
    return (this.obj.nativeObject as any as fabric.StaticCanvas).getHeight();
  }
  
  public setCanvasHeight(value: Primitive | IIndexable): void {
    (this.obj.nativeObject as any as fabric.StaticCanvas).setHeight(value as number);
  }
}