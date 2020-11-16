import { DI, Primitive, isArrayIndex, ILogger } from '@aurelia/kernel';
import {
  AccessorOrObserver,
  CollectionKind,
  CollectionObserver,
  IAccessor,
  IBindingTargetAccessor,
  IBindingTargetObserver,
  ICollectionObserver,
  ILifecycle,
  IObservable,
  IObservedArray,
  IObservedMap,
  IObservedSet,
  IObserver,
  LifecycleFlags,
} from '../observation.js';
import { getArrayObserver } from './array-observer.js';
import { createComputedObserver } from './computed-observer.js';
import { IDirtyChecker } from './dirty-checker.js';
import { getMapObserver } from './map-observer.js';
import { PrimitiveObserver } from './primitive-observer.js';
import { propertyAccessor } from './property-accessor.js';
import { getSetObserver } from './set-observer.js';
import { SetterObserver } from './setter-observer.js';

export interface IObjectObservationAdapter {
  getObserver(flags: LifecycleFlags, object: unknown, propertyName: string, descriptor: PropertyDescriptor): IBindingTargetObserver | null;
}

export interface IObserverLocator extends ObserverLocator {}
export const IObserverLocator = DI.createInterface<IObserverLocator>('IObserverLocator').withDefault(x => x.singleton(ObserverLocator));

export interface INodeObserverLocator {
  handles(obj: unknown, key: PropertyKey, requestor: IObserverLocator): boolean;
  getObserver(obj: object, key: PropertyKey, requestor: IObserverLocator): IAccessor | IObserver;
  getAccessor(obj: object, key: PropertyKey, requestor: IObserverLocator): IAccessor | IObserver;
}
export const INodeObserverLocator = DI
  .createInterface<INodeObserverLocator>('INodeObserverLocator')
  .withDefault(x => x.cachedCallback(handler => {
    handler.getAll(ILogger).forEach(logger => {
      logger.error('Using default INodeObserverLocator implementation. Will not be able to observe nodes (HTML etc...).');
    });
    return new DefaultNodeObserverLocator();
  }));

class DefaultNodeObserverLocator implements INodeObserverLocator {
  public handles(): boolean {
    return false;
  }
  public getObserver(): IAccessor | IObserver {
    return propertyAccessor;
  }
  public getAccessor(): IAccessor | IObserver {
    return propertyAccessor;
  }
}

type ExtendedPropertyDescriptor = PropertyDescriptor & {
  get: PropertyDescriptor['get'] & {
    getObserver(obj: IObservable): IBindingTargetObserver;
  };
};

export class ObserverLocator {
  private readonly adapters: IObjectObservationAdapter[] = [];

  public constructor(
    @ILifecycle private readonly lifecycle: ILifecycle,
    @IDirtyChecker private readonly dirtyChecker: IDirtyChecker,
    @INodeObserverLocator private readonly nodeObserverLocator: INodeObserverLocator,
  ) {}

  public addAdapter(adapter: IObjectObservationAdapter): void {
    this.adapters.push(adapter);
  }

  public getObserver(flags: LifecycleFlags, obj: object, key: string): AccessorOrObserver {
    return (obj as IObservable).$observers?.[key] as AccessorOrObserver | undefined
      ?? this.cache((obj as IObservable), key, this.createObserver(flags, (obj as IObservable), key));
  }

  public getAccessor(flags: LifecycleFlags, obj: object, key: string): IBindingTargetAccessor {
    const cached = (obj as IObservable).$observers?.[key] as AccessorOrObserver | undefined;
    if (cached !== void 0) {
      return cached;
    }
    if (this.nodeObserverLocator.handles(obj, key, this)) {
      return this.nodeObserverLocator.getAccessor(obj, key, this) as AccessorOrObserver;
    }

    return propertyAccessor as IBindingTargetAccessor;
  }

  public getArrayObserver(flags: LifecycleFlags, observedArray: IObservedArray): ICollectionObserver<CollectionKind.array> {
    return getArrayObserver(this.lifecycle, observedArray);
  }

  public getMapObserver(flags: LifecycleFlags, observedMap: IObservedMap): ICollectionObserver<CollectionKind.map>  {
    return getMapObserver(this.lifecycle, observedMap);
  }

  public getSetObserver(flags: LifecycleFlags, observedSet: IObservedSet): ICollectionObserver<CollectionKind.set>  {
    return getSetObserver(this.lifecycle, observedSet);
  }

  private createObserver(flags: LifecycleFlags, obj: IObservable, key: string): AccessorOrObserver {
    if (!(obj instanceof Object)) {
      return new PrimitiveObserver(obj as unknown as Primitive, key) as IBindingTargetAccessor;
    }

    if (this.nodeObserverLocator.handles(obj, key, this)) {
      return this.nodeObserverLocator.getObserver(obj, key, this) as AccessorOrObserver;
    }

    switch (key) {
      case 'length':
        if (obj instanceof Array) {
          return getArrayObserver(this.lifecycle, obj).getLengthObserver();
        }
        break;
      case 'size':
        if (obj instanceof Map) {
          return getMapObserver(this.lifecycle, obj).getLengthObserver();
        } else if (obj instanceof Set) {
          return getSetObserver(this.lifecycle, obj).getLengthObserver();
        }
        break;
      default:
        if (obj instanceof Array && isArrayIndex(key)) {
          return getArrayObserver(this.lifecycle, obj).getIndexObserver(Number(key));
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

      return createComputedObserver(flags, this, this.dirtyChecker, this.lifecycle, obj, key, pd);
    }

    // Ordinary get/set observation (the common use case)
    // TODO: think about how to handle a data property that does not sit on the instance (should we do anything different?)
    return new SetterObserver(obj, key);
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

export function getCollectionObserver(lifecycle: ILifecycle, collection: RepeatableCollection): CollectionObserver | undefined {
  if (collection instanceof Array) {
    return getArrayObserver(lifecycle, collection as IObservedArray);
  } else if (collection instanceof Map) {
    return getMapObserver(lifecycle, collection as IObservedMap);
  } else if (collection instanceof Set) {
    return getSetObserver(lifecycle, collection as IObservedSet);
  }
  return void 0;
}
