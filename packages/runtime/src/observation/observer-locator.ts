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
  IBindingTargetAccessor,
  IBindingTargetObserver,
  ICollectionObserver,
  IObservable,
  IObservedArray,
  IObservedMap,
  IObservedSet,
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

export interface IObserverLocator extends ObserverLocator {}

export const IObserverLocator = DI.createInterface<IObserverLocator>('IObserverLocator').withDefault(x => x.singleton(ObserverLocator));

export interface ITargetObserverLocator {
  getObserver(
    flags: LifecycleFlags,
    scheduler: IScheduler,
    lifecycle: ILifecycle,
    observerLocator: IObserverLocator,
    obj: unknown,
    propertyName: string,
  ): IBindingTargetAccessor | IBindingTargetObserver | null;
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
export class ObserverLocator {
  private readonly adapters: IObjectObservationAdapter[] = [];

  public constructor(
    @ILifecycle private readonly lifecycle: ILifecycle,
    @IScheduler private readonly scheduler: IScheduler,
    @IDirtyChecker private readonly dirtyChecker: IDirtyChecker,
    @ITargetObserverLocator private readonly targetObserverLocator: ITargetObserverLocator,
    @ITargetAccessorLocator private readonly targetAccessorLocator: ITargetAccessorLocator,
  ) {}

  public addAdapter(adapter: IObjectObservationAdapter): void {
    this.adapters.push(adapter);
  }

  public getObserver(flags: LifecycleFlags, obj: IObservable, key: string): AccessorOrObserver {
    return obj.$observers?.[key] as AccessorOrObserver | undefined
      ?? this.cache(obj, key, this.createObserver(flags, obj, key));
  }

  public getAccessor(flags: LifecycleFlags, obj: IObservable, key: string): IBindingTargetAccessor {
    const cached = obj.$observers?.[key] as AccessorOrObserver | undefined;
    if (cached !== void 0) {
      return cached;
    }
    if (this.targetAccessorLocator.handles(flags, obj)) {
      if (this.targetObserverLocator.overridesAccessor(flags, obj, key)) {
        const observer = this.targetObserverLocator.getObserver(flags, this.scheduler, this.lifecycle, this, obj, key);
        if (observer !== null) {
          return this.cache(obj, key, observer);
        }
      }
      return this.targetAccessorLocator.getAccessor(flags, this.scheduler, this.lifecycle, obj, key);
    }

    if ((flags & LifecycleFlags.proxyStrategy) > 0) {
      return ProxyObserver.getOrCreate(obj, key) as unknown as AccessorOrObserver;
    }
    return new PropertyAccessor(obj, key);
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

  private createObserver(flags: LifecycleFlags, obj: IObservable, key: string): AccessorOrObserver {
    if (!(obj instanceof Object)) {
      return new PrimitiveObserver(obj as unknown as Primitive, key) as IBindingTargetAccessor;
    }

    let isNode = false;
    // Never use proxies for observing nodes, so check target observer first and only then evaluate proxy strategy
    if (this.targetObserverLocator.handles(flags, obj)) {
      const observer = this.targetObserverLocator.getObserver(flags, this.scheduler, this.lifecycle, this, obj, key);
      if (observer !== null) {
        return observer;
      }
      isNode = true;
    } else if ((flags & LifecycleFlags.proxyStrategy) > 0) {
      // TODO: fix typings (and ensure proper contracts ofc)
      return ProxyObserver.getOrCreate(obj, key) as unknown as AccessorOrObserver;
    }

    switch (key) {
      case 'length':
        if (obj instanceof Array) {
          return getArrayObserver(flags, this.lifecycle, obj).getLengthObserver();
        }
        break;
      case 'size':
        if (obj instanceof Map) {
          return getMapObserver(flags, this.lifecycle, obj).getLengthObserver();
        } else if (obj instanceof Set) {
          return getSetObserver(flags, this.lifecycle, obj).getLengthObserver();
        }
        break;
      default:
        if (obj instanceof Array && isArrayIndex(key)) {
          return getArrayObserver(flags, this.lifecycle, obj).getIndexObserver(Number(key));
        }
        break;
    }

    let pd = Object.getOwnPropertyDescriptor(obj, key);
    // Only instance properties will yield a descriptor here, otherwise walk up the proto chain
    if (pd === void 0) {
      let proto = Object.getPrototypeOf(obj) as object | null;
      while (proto !== null) {
        pd = Object.getOwnPropertyDescriptor(proto, key);
        if (pd === void 0) {
          proto = Object.getPrototypeOf(proto) as object | null;
        } else {
          break;
        }
      }
    }

    // If the descriptor does not have a 'value' prop, it must have a getter and/or setter
    if (pd !== void 0 && !(Object.prototype.hasOwnProperty.call(pd, 'value') as boolean)) {
      if (pd.get === void 0) {
        // The user could decide to read from a different prop, so don't assume the absense of a setter won't work for custom adapters
        const obs = this.getAdapterObserver(flags, obj, key, pd);
        if (obs !== null) {
          return obs;
        }
        // None of our built-in stuff can read a setter-only without throwing, so just throw right away
        throw new Error(`You cannot observe a setter only property: '${key}'`);
      }

      // Check custom getter-specific override first
      if ((pd as ExtendedPropertyDescriptor).get.getObserver !== void 0) {
        return (pd as ExtendedPropertyDescriptor).get.getObserver(obj);
      }

      // Then check if any custom adapter handles it (the obj could be any object, including a node )
      const obs = this.getAdapterObserver(flags, obj, key, pd);
      if (obs !== null) {
        return obs;
      }

      if (isNode) {
        // TODO: use MutationObserver
        return this.dirtyChecker.createProperty(obj, key);
      }

      return createComputedObserver(flags, this, this.dirtyChecker, this.lifecycle, obj, key, pd);
    }

    // Ordinary get/set observation (the common use case)
    // TODO: think about how to handle a data property that does not sit on the instance (should we do anything different?)
    return new SetterObserver(this.lifecycle, flags, obj, key);
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

  private cache(obj: IObservable, key: string, observer: AccessorOrObserver): AccessorOrObserver {
    if (observer.doNotCache === true) {
      return observer;
    }
    if (obj.$observers === void 0) {
      Reflect.defineProperty(obj, '$observers', { value: { [key]: observer } });
      return observer;
    }
    return obj.$observers[key] = observer;
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
