import { Primitive, isArrayIndex, ILogger, resolve, isFunction, isObject, isSet, isArray, isMap, optional } from '@aurelia/kernel';
import { ArrayObserver, getArrayObserver } from './array-observer';
import { ComputedGetterFn, ComputedObserver } from './computed-observer';
import { IDirtyChecker } from './dirty-checker';
import { MapObserver, getMapObserver } from './map-observer';
import { PrimitiveObserver } from './primitive-observer';
import { PropertyAccessor } from './property-accessor';
import { SetObserver, getSetObserver } from './set-observer';
import { SetterObserver } from './setter-observer';
import { rtDef, hasOwnProp, rtCreateInterface, rtObjectAssign, getOwnPropDesc, getProto } from './utilities';

import type {
  Collection,
  IAccessor,
  ICollectionObserver,
  IObservable,
  IObserver,
  AccessorOrObserver,
  CollectionObserver,
} from './interfaces';
import { ErrorNames, createMappedError } from './errors';
import { computedPropInfo } from './object-property-info';
import { getObserverLookup } from './observation-utils';
import { IExpressionParser } from '@aurelia/expression-parser';
import { ExpressionObserver } from './expression-observer';
import { ControlledComputedObserver } from './controlled-computed-observer';

const propertyAccessor = new PropertyAccessor();

export interface IObjectObservationAdapter {
  getObserver(object: unknown, key: PropertyKey, descriptor: PropertyDescriptor, requestor: IObserverLocator): IObserver | null;
}

export interface IObserverLocator extends ObserverLocator {}
export const IObserverLocator = /*@__PURE__*/rtCreateInterface<IObserverLocator>('IObserverLocator', x => x.singleton(ObserverLocator));

export interface INodeObserverLocator {
  handles(obj: unknown, key: PropertyKey, requestor: IObserverLocator): boolean;
  getObserver(obj: object, key: PropertyKey, requestor: IObserverLocator): IAccessor | IObserver;
  getAccessor(obj: object, key: PropertyKey, requestor: IObserverLocator): IAccessor | IObserver;
}
export const INodeObserverLocator = /*@__PURE__*/rtCreateInterface<INodeObserverLocator>('INodeObserverLocator', x => x.cachedCallback(handler => {
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
};
export type ObservableGetter = PropertyDescriptor['get'] & {
  getObserver?(obj: unknown, requestor: IObserverLocator): IObserver;
};

export class ObserverLocator {
  /** @internal */ private readonly _adapters: IObjectObservationAdapter[] = [];
  /** @internal */ private readonly _dirtyChecker = resolve(IDirtyChecker);
  /** @internal */ private readonly _nodeObserverLocator = resolve(INodeObserverLocator);
  // /** @internal */ private readonly _computedObserverLocator = resolve(IComputedObserverLocator);
  /** @internal */ private readonly _expressionParser = resolve(optional(IExpressionParser));

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
      return new ComputedObserver(obj, key, void 0, this);
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

  public getExpressionObserver(
    obj: object,
    expression: string,
  ): IObserver {
    if (this._expressionParser == null) {
      throw createMappedError(ErrorNames.observing_expression_no_parser, expression);
    }

    return new ExpressionObserver(
      obj,
      this,
      this._expressionParser.parse(expression, 'IsProperty'),
    );
  }

  public getComputedObserver(obj: object, key: PropertyKey, pd: ExtendedPropertyDescriptor): IObserver {
    const info = computedPropInfo.get(obj, key);
    if (info?.deps == null || info.deps.length === 0) {
      const observer = new ComputedObserver(
        obj,
        pd.get!,
        pd.set,
        this,
        info?.flush
      );
      rtDef(obj, key, {
        enumerable: pd.enumerable,
        configurable: true,
        get: rtObjectAssign(((/* Computed Observer */) => observer.getValue()) as ObservableGetter, { getObserver: () => observer }),
        set: (/* Computed Observer */v) => {
          observer.setValue(v);
        },
      });

      return observer;
    }

    return new ControlledComputedObserver(
      obj,
      key,
      pd.get!,
      this,
      info.deps,
      info.flush ?? 'async',
      info.deep === true
    );
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
        obs = (pd.get?.getObserver)?.(obj, this);
      }

      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      return obs == null
        ? pd.configurable
          // ? this._createComputedObserver(obj, key, pd, true)
          ? this.getComputedObserver(obj, key, pd)
          : this._dirtyChecker.createProperty(obj, key)
        : obs;
    }

    // Ordinary get/set observation (the common use case)
    // TODO: think about how to handle a data property that does not sit on the instance (should we do anything different?)
    return new SetterObserver(obj, key);
  }

  // /** @internal */
  // private _createComputedObserver(obj: object, key: PropertyKey, pd: PropertyDescriptor, useProxy?: boolean) {
  //   const observer = new ComputedObserver(obj, pd.get!, pd.set, this, !!useProxy);
  //   def(obj, key, {
  //     enumerable: pd.enumerable,
  //     configurable: true,
  //     get: objectAssign(((/* Computed Observer */) => observer.getValue()) as ObservableGetter, { getObserver: () => observer }),
  //     set: (/* Computed Observer */v) => {
  //       observer.setValue(v);
  //     },
  //   });

  //   return observer;
  // }

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
// T extends unknown[]
//   ? ArrayObserver
//   : T extends Map<unknown, unknown>
//     ? MapObserver
//     : T extends Set<unknown>
//       ? SetObserver
//       :
export const getCollectionObserver: {
  (array: unknown[]): ArrayObserver;
  (map: Map<unknown, unknown>): MapObserver;
  (set: Set<unknown>): SetObserver;
  (collection: RepeatableCollection): CollectionObserver | undefined;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
} = (collection: RepeatableCollection): any => {
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

