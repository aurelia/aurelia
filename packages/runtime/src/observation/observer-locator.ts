import { DI, Primitive, isArrayIndex, ILogger } from '@aurelia/kernel';
import { getArrayObserver } from './array-observer';
import { ComputedObserver } from './computed-observer';
import { IDirtyChecker } from './dirty-checker';
import { getMapObserver } from './map-observer';
import { PrimitiveObserver } from './primitive-observer';
import { PropertyAccessor } from './property-accessor';
import { getSetObserver } from './set-observer';
import { SetterObserver } from './setter-observer';
import { convertToString, createLookup, def, hasOwnProp, isArray } from '../utilities-objects';

import type {
  Collection,
  IAccessor,
  ICollectionObserver,
  IObservable,
  IObserver,
  AccessorOrObserver,
  CollectionKind,
  CollectionObserver,
} from '../observation';

export const propertyAccessor = new PropertyAccessor();

export interface IObjectObservationAdapter {
  getObserver(object: unknown, key: PropertyKey, descriptor: PropertyDescriptor, requestor: IObserverLocator): IObserver | null;
}

export interface IObserverLocator extends ObserverLocator {}
export const IObserverLocator = DI.createInterface<IObserverLocator>('IObserverLocator', x => x.singleton(ObserverLocator));

export interface INodeObserverLocator {
  handles(obj: unknown, key: PropertyKey, requestor: IObserverLocator): boolean;
  getObserver(obj: object, key: PropertyKey, requestor: IObserverLocator): IAccessor | IObserver;
  getAccessor(obj: object, key: PropertyKey, requestor: IObserverLocator): IAccessor | IObserver;
}
export const INodeObserverLocator = DI
  .createInterface<INodeObserverLocator>('INodeObserverLocator', x => x.cachedCallback(handler => {
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

  public getObserver(obj: unknown, key: PropertyKey): IObserver {
    if (obj == null) {
      throw nullObjectError(key);
    }
    if (!(obj instanceof Object)) {
      return new PrimitiveObserver(obj as Primitive, key);
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

  public getArrayObserver(observedArray: unknown[]): ICollectionObserver<CollectionKind.array> {
    return getArrayObserver(observedArray);
  }

  public getMapObserver(observedMap: Map<unknown, unknown>): ICollectionObserver<CollectionKind.map>  {
    return getMapObserver(observedMap);
  }

  public getSetObserver(observedSet: Set<unknown>): ICollectionObserver<CollectionKind.set>  {
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
        if (obj instanceof Map) {
          return getMapObserver(obj).getLengthObserver();
        } else if (obj instanceof Set) {
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
          ? ComputedObserver.create(obj, key, pd, this, /* AOT: not true for IE11 */ true)
          : this._dirtyChecker.createProperty(obj, key)
        : obs;
    }

    // Ordinary get/set observation (the common use case)
    // TODO: think about how to handle a data property that does not sit on the instance (should we do anything different?)
    return new SetterObserver(obj, key);
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
  } else if (collection instanceof Map) {
    obs = getMapObserver(collection);
  } else if (collection instanceof Set) {
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

const nullObjectError = (key: PropertyKey) =>
  __DEV__
    ? new Error(`AUR0199: trying to observe property ${convertToString(key)} on null/undefined`)
    : new Error(`AUR0199:${convertToString(key)}`);
