import { DI, inject, Primitive, Reporter } from '@aurelia/kernel';
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
  IObservedSet
} from '../observation';
import { getArrayObserver } from './array-observer';
import { createComputedObserver } from './computed-observer';
import { IDirtyChecker } from './dirty-checker';
import { getMapObserver } from './map-observer';
import { PrimitiveObserver } from './primitive-observer';
import { PropertyAccessor } from './property-accessor';
import { getSetObserver } from './set-observer';
import { SetterObserver } from './setter-observer';

const toStringTag = Object.prototype.toString;

export interface IObjectObservationAdapter {
  getObserver(object: unknown, propertyName: string, descriptor: PropertyDescriptor): IBindingTargetObserver;
}

export interface IObserverLocator {
  getObserver(obj: unknown, propertyName: string): AccessorOrObserver;
  getAccessor(obj: unknown, propertyName: string): IBindingTargetAccessor;
  addAdapter(adapter: IObjectObservationAdapter): void;
  getArrayObserver(observedArray: unknown[]): ICollectionObserver<CollectionKind.array>;
  getMapObserver(observedMap: Map<unknown, unknown>): ICollectionObserver<CollectionKind.map>;
  getSetObserver(observedSet: Set<unknown>): ICollectionObserver<CollectionKind.set>;
}

export const IObserverLocator = DI.createInterface<IObserverLocator>().noDefault();

export interface ITargetObserverLocator {
  getObserver(lifecycle: ILifecycle, observerLocator: IObserverLocator, obj: unknown, propertyName: string): IBindingTargetAccessor | IBindingTargetObserver;
  overridesAccessor(obj: unknown, propertyName: string): boolean;
  handles(obj: unknown): boolean;
}
export const ITargetObserverLocator = DI.createInterface<ITargetObserverLocator>().noDefault();

export interface ITargetAccessorLocator {
  getAccessor(lifecycle: ILifecycle, obj: unknown, propertyName: string): IBindingTargetAccessor;
  handles(obj: unknown): boolean;
}
export const ITargetAccessorLocator = DI.createInterface<ITargetAccessorLocator>().noDefault();

function getPropertyDescriptor(subject: object, name: string): PropertyDescriptor {
  let pd = Object.getOwnPropertyDescriptor(subject, name);
  let proto = Object.getPrototypeOf(subject);

  while (pd === undefined && proto !== null) {
    pd = Object.getOwnPropertyDescriptor(proto, name);
    proto = Object.getPrototypeOf(proto);
  }

  return pd;
}

@inject(ILifecycle, IDirtyChecker, ITargetObserverLocator, ITargetAccessorLocator)
/** @internal */
export class ObserverLocator implements IObserverLocator {
  private adapters: IObjectObservationAdapter[];
  private dirtyChecker: IDirtyChecker;
  private lifecycle: ILifecycle;
  private targetObserverLocator: ITargetObserverLocator;
  private targetAccessorLocator: ITargetAccessorLocator;

  constructor(
    lifecycle: ILifecycle,
    dirtyChecker: IDirtyChecker,
    targetObserverLocator: ITargetObserverLocator,
    targetAccessorLocator: ITargetAccessorLocator
  ) {
    this.adapters = [];
    this.dirtyChecker = dirtyChecker;
    this.lifecycle = lifecycle;
    this.targetObserverLocator = targetObserverLocator;
    this.targetAccessorLocator = targetAccessorLocator;
  }

  public getObserver(obj: unknown, propertyName: string): AccessorOrObserver {
    if (isBindingContext(obj)) {
      return obj.getObservers().getOrCreate(obj, propertyName);
    }
    let observersLookup = (obj as IObservable).$observers;
    let observer: AccessorOrObserver & { doNotCache?: boolean };

    if (observersLookup && propertyName in observersLookup) {
      return observersLookup[propertyName];
    }

    observer = this.createPropertyObserver(obj as IObservable, propertyName);

    if (!observer.doNotCache) {
      if (observersLookup === undefined) {
        observersLookup = this.getOrCreateObserversLookup(obj as IObservable);
      }

      observersLookup[propertyName] = observer;
    }

    return observer;
  }

  public addAdapter(adapter: IObjectObservationAdapter): void {
    this.adapters.push(adapter);
  }

  public getAccessor(obj: IObservable, propertyName: string): IBindingTargetAccessor {
    if (this.targetAccessorLocator.handles(obj)) {
      if (this.targetObserverLocator.overridesAccessor(obj, propertyName)) {
        return this.getObserver(obj, propertyName);
      }
      return this.targetAccessorLocator.getAccessor(this.lifecycle, obj, propertyName);
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
      return new PrimitiveObserver(obj as unknown as Primitive, propertyName) as IBindingTargetAccessor;
    }

    if (this.targetObserverLocator.handles(obj)) {
      const observer = this.targetObserverLocator.getObserver(this.lifecycle, this, obj, propertyName);
      if (observer !== null) {
        return observer;
      }
      // TODO: use MutationObserver
      return this.dirtyChecker.createProperty(obj, propertyName);
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

function isBindingContext(obj: unknown): obj is IBindingContext {
  return (obj as IBindingContext).$synthetic === true;
}
