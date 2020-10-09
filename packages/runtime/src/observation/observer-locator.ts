import {
  DI,
  IContainer,
  IResolver,
  Primitive,
  Registration,
  isArrayIndex,
} from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
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
  ObserversLookup,
  PropertyObserver,
} from '../observation';
import { getArrayObserver } from './array-observer';
import { createComputedObserver } from './computed-observer';
import { IDirtyChecker } from './dirty-checker';
import { getMapObserver } from './map-observer';
import { PrimitiveObserver } from './primitive-observer';
import { PropertyAccessor } from './property-accessor';
import { ProxyObserver } from './proxy-observer';
import { getSetObserver } from './set-observer';
import { SetterObserver } from './setter-observer';
import { IScheduler } from '@aurelia/scheduler';

export interface IObjectObservationAdapter {
  getObserver(flags: LifecycleFlags, object: unknown, propertyName: string, descriptor: PropertyDescriptor): IBindingTargetObserver | null;
}

export interface IObserverLocator {
  getObserver(flags: LifecycleFlags, obj: object, propertyName: string): AccessorOrObserver;
  getAccessor(flags: LifecycleFlags, obj: object, propertyName: string): IBindingTargetAccessor;
  addAdapter(adapter: IObjectObservationAdapter): void;
  getArrayObserver(flags: LifecycleFlags, observedArray: unknown[]): ICollectionObserver<CollectionKind.array>;
  getMapObserver(flags: LifecycleFlags, observedMap: Map<unknown, unknown>): ICollectionObserver<CollectionKind.map>;
  getSetObserver(flags: LifecycleFlags, observedSet: Set<unknown>): ICollectionObserver<CollectionKind.set>;
}

export const IObserverLocator = DI.createInterface<IObserverLocator>('IObserverLocator').noDefault();

export interface ITargetObserverLocator {
  getObserver(
    flags: LifecycleFlags,
    scheduler: IScheduler,
    lifecycle: ILifecycle,
    observerLocator: IObserverLocator,
    obj: unknown,
    propertyName: string,
  ): IBindingTargetAccessor | IBindingTargetObserver;
  overridesAccessor(flags: LifecycleFlags, obj: unknown, propertyName: string): boolean;
  handles(flags: LifecycleFlags, obj: unknown): boolean;
}
export const ITargetObserverLocator = DI.createInterface<ITargetObserverLocator>('ITargetObserverLocator').noDefault();

export interface ITargetAccessorLocator {
  getAccessor(
    flags: LifecycleFlags,
    scheduler: IScheduler,
    lifecycle: ILifecycle,
    obj: unknown,
    propertyName: string,
  ): IBindingTargetAccessor;
  handles(flags: LifecycleFlags, obj: unknown): boolean;
}
export const ITargetAccessorLocator = DI.createInterface<ITargetAccessorLocator>('ITargetAccessorLocator').noDefault();

type ExtendedPropertyDescriptor = PropertyDescriptor & {
  get: PropertyDescriptor['get'] & {
    getObserver(obj: IObservable): IBindingTargetObserver;
  };
};

/** @internal */
export class ObserverLocator implements IObserverLocator {
  private readonly adapters: IObjectObservationAdapter[] = [];

  public constructor(
    @ILifecycle private readonly lifecycle: ILifecycle,
    @IScheduler private readonly scheduler: IScheduler,
    @IDirtyChecker private readonly dirtyChecker: IDirtyChecker,
    @ITargetObserverLocator private readonly targetObserverLocator: ITargetObserverLocator,
    @ITargetAccessorLocator private readonly targetAccessorLocator: ITargetAccessorLocator
  ) {}

  public static register(container: IContainer): IResolver<IObserverLocator> {
    return Registration.singleton(IObserverLocator, this).register(container);
  }

  public getObserver(flags: LifecycleFlags, obj: IObservable|IBindingContext, propertyName: string): AccessorOrObserver {
    if (flags & LifecycleFlags.proxyStrategy && typeof obj === 'object') {
      return ProxyObserver.getOrCreate(obj, propertyName) as unknown as AccessorOrObserver; // TODO: fix typings (and ensure proper contracts ofc)
    }
    if (isBindingContext(obj)) {
      return obj.getObservers!(flags).getOrCreate(this.lifecycle, flags, obj, propertyName);
    }
    let observersLookup = obj.$observers as ObserversLookup;

    if (observersLookup && propertyName in observersLookup) {
      return observersLookup[propertyName];
    }

    const observer: AccessorOrObserver & { doNotCache?: boolean } = this.createPropertyObserver(flags, obj, propertyName);

    if (!observer.doNotCache) {
      if (observersLookup === void 0) {
        observersLookup = this.getOrCreateObserversLookup(obj) as ObserversLookup;
      }

      observersLookup[propertyName] = observer as PropertyObserver;
    }

    return observer;
  }

  public addAdapter(adapter: IObjectObservationAdapter): void {
    this.adapters.push(adapter);
  }

  public getAccessor(flags: LifecycleFlags, obj: IObservable, propertyName: string): IBindingTargetAccessor {
    if (this.targetAccessorLocator.handles(flags, obj)) {
      if (this.targetObserverLocator.overridesAccessor(flags, obj, propertyName)) {
        return this.getObserver(flags, obj, propertyName);
      }
      return this.targetAccessorLocator.getAccessor(flags, this.scheduler, this.lifecycle, obj, propertyName);
    }

    if (flags & LifecycleFlags.proxyStrategy) {
      return ProxyObserver.getOrCreate(obj, propertyName) as unknown as AccessorOrObserver;
    }
    return new PropertyAccessor(obj, propertyName);
  }

  public getArrayObserver(flags: LifecycleFlags, observedArray: IObservedArray): ICollectionObserver<CollectionKind.array> {
    return getArrayObserver(flags, this.lifecycle, observedArray);
  }

  public getMapObserver(flags: LifecycleFlags, observedMap: IObservedMap): ICollectionObserver<CollectionKind.map>  {
    return getMapObserver(flags, this.lifecycle, observedMap);
  }

  public getSetObserver(flags: LifecycleFlags, observedSet: IObservedSet): ICollectionObserver<CollectionKind.set>  {
    return getSetObserver(flags, this.lifecycle, observedSet);
  }

  private getOrCreateObserversLookup(obj: IObservable): Record<string, AccessorOrObserver | IBindingTargetObserver> {
    return obj.$observers as ObserversLookup || this.createObserversLookup(obj);
  }

  private createObserversLookup(obj: IObservable): Record<string, IBindingTargetObserver> {
    const value: Record<string, IBindingTargetObserver> = {};
    Reflect.defineProperty(obj, '$observers', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: value
    });
    return value;
  }

  private createPropertyObserver(flags: LifecycleFlags, obj: IObservable, propertyName: string): AccessorOrObserver {
    if (!(obj instanceof Object)) {
      return new PrimitiveObserver(obj as unknown as Primitive, propertyName) as IBindingTargetAccessor;
    }

    let isNode = false;
    if (this.targetObserverLocator.handles(flags, obj)) {
      const observer = this.targetObserverLocator.getObserver(flags, this.scheduler, this.lifecycle, this, obj, propertyName);
      if (observer != null) {
        return observer;
      }
      isNode = true;
    }

    switch (propertyName) {
      case 'length':
        if (obj instanceof Array) {
          return this.getArrayObserver(flags, obj as IObservedArray).getLengthObserver();
        }
        break;
      case 'size':
        if (obj instanceof Map) {
          return this.getMapObserver(flags, obj as IObservedMap).getLengthObserver();
        } else if (obj instanceof Set) {
          return this.getSetObserver(flags, obj as IObservedSet).getLengthObserver();
        }
        break;
      default:
        if (obj instanceof Array && isArrayIndex(propertyName)) {
          return this.getArrayObserver(flags, obj as IObservedArray).getIndexObserver(Number(propertyName));
        }
        break;
    }

    let pd = Object.getOwnPropertyDescriptor(obj, propertyName);
    if (pd === void 0) {
      let proto = Object.getPrototypeOf(obj) as object | null;
      while (proto !== null) {
        pd = Object.getOwnPropertyDescriptor(proto, propertyName);
        if (pd === void 0) {
          proto = Object.getPrototypeOf(proto) as object | null;
        } else {
          break;
        }
      }
    }

    if (pd !== void 0 && !(Object.prototype.hasOwnProperty.call(pd, 'value') as boolean)) {
      if (pd.get === void 0) {
        const obs = this.getAdapterObserver(flags, obj, propertyName, pd);
        if (obs !== null) {
          return obs;
        }
        throw new Error(`You cannot observe a setter only property: '${propertyName}'`);
      }
      if ((pd as ExtendedPropertyDescriptor).get.getObserver !== void 0) {
        return (pd as ExtendedPropertyDescriptor).get.getObserver(obj);
      }
      const obs = this.getAdapterObserver(flags, obj, propertyName, pd);
      if (obs !== null) {
        return obs;
      }

      if (isNode) {
        // TODO: use MutationObserver
        return this.dirtyChecker.createProperty(obj, propertyName);
      }

      return createComputedObserver(flags, this, this.dirtyChecker, this.lifecycle, obj, propertyName, pd);
    }
    return new SetterObserver(this.lifecycle, flags, obj, propertyName);
  }

  private getAdapterObserver(flags: LifecycleFlags, obj: IObservable, propertyName: string, pd: PropertyDescriptor): IBindingTargetObserver | null {
    if (this.adapters.length > 0) {
      for (const adapter of this.adapters) {
        const observer = adapter.getObserver(flags, obj, propertyName, pd);
        if (observer != null) {
          return observer;
        }
      }
    }
    return null;
  }
}

export type RepeatableCollection = IObservedMap | IObservedSet | IObservedArray | null | undefined | number;

export function getCollectionObserver(flags: LifecycleFlags, lifecycle: ILifecycle, collection: RepeatableCollection): CollectionObserver | undefined {
  // If the collection is wrapped by a proxy then `$observer` will return the proxy observer instead of the collection observer, which is not what we want
  // when we ask for getCollectionObserver
  const rawCollection = collection instanceof Object ? ProxyObserver.getRawIfProxy(collection) : collection;
  if (collection instanceof Array) {
    return getArrayObserver(flags, lifecycle, rawCollection as IObservedArray);
  } else if (collection instanceof Map) {
    return getMapObserver(flags, lifecycle, rawCollection as IObservedMap);
  } else if (collection instanceof Set) {
    return getSetObserver(flags, lifecycle, rawCollection as IObservedSet);
  }
  return void 0;
}

function isBindingContext(obj: unknown): obj is IBindingContext {
  return (obj as IBindingContext).$synthetic === true;
}
