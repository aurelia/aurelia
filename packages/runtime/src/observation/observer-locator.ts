import { Primitive, isArrayIndex, ILogger } from '@aurelia/kernel';
import { getArrayObserver } from './array-observer';
import { ComputedGetterFn, ComputedObserver } from './computed-observer';
import { IDirtyChecker } from './dirty-checker';
import { getMapObserver } from './map-observer';
import { PrimitiveObserver } from './primitive-observer';
import { PropertyAccessor } from './property-accessor';
import { getSetObserver } from './set-observer';
import { SetterObserver } from './setter-observer';
import { createLookup, def, hasOwnProp, isArray, createInterface, isMap, isSet, isObject, objectAssign, isFunction } from '../utilities';

import type {
  Collection,
  IAccessor,
  ICollectionObserver,
  IObservable,
  IObserver,
  AccessorOrObserver,
  CollectionObserver,
} from '../observation';
import { ErrorNames, createMappedError } from '../errors';

export const propertyAccessor = new PropertyAccessor();

export interface IObjectObservationAdapter {
  getObserver(object: unknown, key: PropertyKey, descriptor: PropertyDescriptor, requestor: IObserverLocator): IObserver | null;
}

export interface IObserverLocator extends ObserverLocator {}
export const IObserverLocator = /*@__PURE__*/createInterface<IObserverLocator>('IObserverLocator', x => x.singleton(ObserverLocator));

export interface INodeObserverLocator {
  handles(obj: unknown, key: PropertyKey, requestor: IObserverLocator): boolean;
  getObserver(obj: object, key: PropertyKey, requestor: IObserverLocator): IAccessor | IObserver;
  getAccessor(obj: object, key: PropertyKey, requestor: IObserverLocator): IAccessor | IObserver;
}
export const INodeObserverLocator = /*@__PURE__*/createInterface<INodeObserverLocator>('INodeObserverLocator', x => x.cachedCallback(handler => {
  if (__DEV__) {
    handler.getAll(ILogger).forEach(logger => {
      logger.error('Using default INodeObserverLocator implementation. Will not be able to observe nodes (HTML etc...).');
    });
  }
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

export type ExtendedPropertyDescriptor = PropertyDescriptor & {
  get?: ObservableGetter;
  set?: ObservableSetter;
};
export type ObservableGetter = PropertyDescriptor['get'] & {
  getObserver?(obj: unknown, requestor: IObserverLocator): IObserver;
};
export type ObservableSetter = PropertyDescriptor['set'] & {
  getObserver?(obj: unknown, requestor: IObserverLocator): IObserver;
};

export class ObserverLocator {
  /** @internal */ protected static readonly inject = [IDirtyChecker, INodeObserverLocator];
  /** @internal */ private readonly _adapters: IObjectObservationAdapter[] = [];
  /** @internal */ private readonly _dirtyChecker: IDirtyChecker;
  /** @internal */ private readonly _nodeObserverLocator: INodeObserverLocator;

  public constructor(
    dirtyChecker: IDirtyChecker,
    nodeObserverLocator: INodeObserverLocator,
  ) {
    this._dirtyChecker = dirtyChecker;
    this._nodeObserverLocator = nodeObserverLocator;
  }

  public addAdapter(adapter: IObjectObservationAdapter): void {
    this._adapters.push(adapter);
  }

  public getObserver(obj: unknown, key: PropertyKey): IObserver;
  public getObserver<T, R>(obj: T, key: ComputedGetterFn<T, R>): IObserver<R>;
  public getObserver(obj: unknown, key: PropertyKey | ComputedGetterFn): IObserver {
    if (obj == null) {
      throw createMappedError(ErrorNames.observing_null_undefined, key);
    }
    if (!isObject(obj)) {
      return new PrimitiveObserver(obj as Primitive, isFunction(key) ? '' : key);
    }
    if (isFunction(key)) {
      return new ComputedObserver(obj, key, void 0, this, true);
    }
    const lookup = getObserverLookup(obj);
    let observer = lookup[key];
    if (observer === void 0) {
      observer = this.createObserver((obj as IObservable), key);
      if (!observer.doNotCache) {
        lookup[key] = observer;
      }
    }
    return observer;
  }

  public getAccessor(obj: object, key: PropertyKey): AccessorOrObserver {
    const cached = (obj as IObservable).$observers?.[key];
    if (cached !== void 0) {
      return cached;
    }
    if (this._nodeObserverLocator.handles(obj, key, this)) {
      return this._nodeObserverLocator.getAccessor(obj, key, this) as AccessorOrObserver;
    }

    return propertyAccessor;
  }

  public getArrayObserver(observedArray: unknown[]): ICollectionObserver<'array'> {
    return getArrayObserver(observedArray);
  }

  public getMapObserver(observedMap: Map<unknown, unknown>): ICollectionObserver<'map'>  {
    return getMapObserver(observedMap);
  }

  public getSetObserver(observedSet: Set<unknown>): ICollectionObserver<'set'>  {
    return getSetObserver(observedSet);
  }

  private createObserver(obj: IObservable, key: PropertyKey): IObserver {
    if (this._nodeObserverLocator.handles(obj, key, this)) {
      return this._nodeObserverLocator.getObserver(obj, key, this) as IObserver;
    }

    switch (key) {
      case 'length':
        if (isArray(obj)) {
          return getArrayObserver(obj).getLengthObserver();
        }
        break;
      case 'size':
        if (isMap(obj)) {
          return getMapObserver(obj).getLengthObserver();
        } else if (isSet(obj)) {
          return getSetObserver(obj).getLengthObserver();
        }
        break;
      default:
        if (isArray(obj) && isArrayIndex(key)) {
          return getArrayObserver(obj).getIndexObserver(Number(key));
        }
        break;
    }

    let pd = getOwnPropDesc(obj, key) as ExtendedPropertyDescriptor;
    // Only instance properties will yield a descriptor here, otherwise walk up the proto chain
    if (pd === void 0) {
      let proto = getProto(obj) as object | null;
      while (proto !== null) {
        pd = getOwnPropDesc(proto, key) as ExtendedPropertyDescriptor;
        if (pd === void 0) {
          proto = getProto(proto) as object | null;
        } else {
          break;
        }
      }
    }

    // If the descriptor does not have a 'value' prop, it must have a getter and/or setter
    if (pd !== void 0 && !hasOwnProp.call(pd, 'value')) {
      let obs: IObserver | undefined | null = this._getAdapterObserver(obj, key, pd);
      if (obs == null) {
        obs = (pd.get?.getObserver ?? pd.set?.getObserver)?.(obj, this);
      }

      return obs == null
        ? pd.configurable
          ? this._createComputedObserver(obj, key, pd, true)
          : this._dirtyChecker.createProperty(obj, key)
        : obs;
    }

    // Ordinary get/set observation (the common use case)
    // TODO: think about how to handle a data property that does not sit on the instance (should we do anything different?)
    return new SetterObserver(obj, key);
  }

  /** @internal */
  private _createComputedObserver(obj: object, key: PropertyKey, pd: PropertyDescriptor, useProxy?: boolean) {
    const observer = new ComputedObserver(obj, pd.get!, pd.set, this, !!useProxy);
    def(obj, key, {
      enumerable: pd.enumerable,
      configurable: true,
      get: objectAssign(((/* Computed Observer */) => observer.getValue()) as ObservableGetter, { getObserver: () => observer }),
      set: (/* Computed Observer */v) => {
        observer.setValue(v);
      },
    });

    return observer;
  }

  /** @internal */
  private _getAdapterObserver(obj: IObservable, key: PropertyKey, pd: PropertyDescriptor): IObserver | null {
    if (this._adapters.length > 0) {
      for (const adapter of this._adapters) {
        const observer = adapter.getObserver(obj, key, pd, this);
        if (observer != null) {
          return observer;
        }
      }
    }
    return null;
  }
}

export type RepeatableCollection = Collection | null | undefined | number;

export const getCollectionObserver = (collection: RepeatableCollection): CollectionObserver | undefined => {
  let obs: CollectionObserver | undefined;
  if (isArray(collection)) {
    obs = getArrayObserver(collection);
  } else if (isMap(collection)) {
    obs = getMapObserver(collection);
  } else if (isSet(collection)) {
    obs = getSetObserver(collection);
  }
  return obs;
};

const getProto = Object.getPrototypeOf;
const getOwnPropDesc = Object.getOwnPropertyDescriptor;

export const getObserverLookup = <T extends IObserver>(instance: object): Record<PropertyKey, T> => {
  let lookup = (instance as IObservable).$observers as Record<PropertyKey, T>;
  if (lookup === void 0) {
    def(instance, '$observers', {
      enumerable: false,
      value: lookup = createLookup(),
    });
  }
  return lookup;
};
