import { DI, Primitive, isArrayIndex, ILogger } from '@aurelia/kernel';
import { getArrayObserver } from './array-observer.js';
import { ComputedObserver } from './computed-observer.js';
import { IDirtyChecker } from './dirty-checker.js';
import { getMapObserver } from './map-observer.js';
import { PrimitiveObserver } from './primitive-observer.js';
import { PropertyAccessor } from './property-accessor.js';
import { getSetObserver } from './set-observer.js';
import { SetterObserver } from './setter-observer.js';
import { def } from '../utilities-objects.js';

import type {
  Collection,
  IAccessor,
  ICollectionObserver,
  IObservable,
  IObserver,
  AccessorOrObserver,
  CollectionKind,
  CollectionObserver,
} from '../observation.js';

export const propertyAccessor = new PropertyAccessor();

export interface IObjectObservationAdapter {
  getObserver(object: unknown, propertyName: string, descriptor: PropertyDescriptor, requestor: IObserverLocator): AccessorOrObserver | null;
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
  protected static readonly inject = [IDirtyChecker, INodeObserverLocator];

  private readonly _adapters: IObjectObservationAdapter[] = [];

  public constructor(
    private readonly _dirtyChecker: IDirtyChecker,
    private readonly _nodeObserverLocator: INodeObserverLocator,
  ) {}

  public addAdapter(adapter: IObjectObservationAdapter): void {
    this._adapters.push(adapter);
  }

  public getObserver(obj: object, key: PropertyKey): IObserver {
    return (obj as IObservable).$observers?.[key as string] as IObserver | undefined
      ?? this._cache((obj as IObservable), key as string, this.createObserver((obj as IObservable), key as string)) as IObserver;
  }

  public getAccessor(obj: object, key: string): AccessorOrObserver {
    const cached = (obj as IObservable).$observers?.[key] as AccessorOrObserver | undefined;
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

  private createObserver(obj: IObservable, key: string): AccessorOrObserver {
    if (!(obj instanceof Object)) {
      return new PrimitiveObserver(obj as unknown as Primitive, key);
    }

    if (this._nodeObserverLocator.handles(obj, key, this)) {
      return this._nodeObserverLocator.getObserver(obj, key, this) as AccessorOrObserver;
    }

    switch (key) {
      case 'length':
        if (obj instanceof Array) {
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
        if (obj instanceof Array && isArrayIndex(key)) {
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
      let obs: AccessorOrObserver | undefined | null = this._getAdapterObserver(obj, key, pd);
      if (obs == null) {
        obs = (pd.get?.getObserver ?? pd.set?.getObserver)?.(obj, this) as AccessorOrObserver;
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

  private _getAdapterObserver(obj: IObservable, propertyName: string, pd: PropertyDescriptor): AccessorOrObserver | null {
    if (this._adapters.length > 0) {
      for (const adapter of this._adapters) {
        const observer = adapter.getObserver(obj, propertyName, pd, this);
        if (observer != null) {
          return observer;
        }
      }
    }
    return null;
  }

  private _cache(obj: IObservable, key: string, observer: AccessorOrObserver): AccessorOrObserver {
    if (observer.doNotCache === true) {
      return observer;
    }
    if (obj.$observers === void 0) {
      def(obj, '$observers', { value: { [key]: observer } });
      return observer;
    }
    return obj.$observers[key] = observer;
  }
}

export type RepeatableCollection = Collection | null | undefined | number;

export function getCollectionObserver(collection: RepeatableCollection): CollectionObserver | undefined {
  let obs: CollectionObserver | undefined;
  if (collection instanceof Array) {
    obs = getArrayObserver(collection);
  } else if (collection instanceof Map) {
    obs = getMapObserver(collection);
  } else if (collection instanceof Set) {
    obs = getSetObserver(collection);
  }
  return obs;
}

const getProto = Object.getPrototypeOf;
const getOwnPropDesc = Object.getOwnPropertyDescriptor;
const hasOwnProp = Object.prototype.hasOwnProperty;
