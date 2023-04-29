import { Constructable, noop } from '@aurelia/kernel';
import { subscriberCollection, AccessorType, IObserverLocator, ICoercionConfiguration } from '@aurelia/runtime';
import { areEqual, isFunction, safeString } from '../utilities';

import type { IIndexable } from '@aurelia/kernel';
import type {
  InterceptorFunc,
  IObserver,
  ISubscriber,
  ISubscriberCollection,
} from '@aurelia/runtime';
import type { IComponentController, ICustomElementViewModel } from '../templating/controller';
import type { BindableDefinition } from '../bindable';

export interface BindableObserver extends IObserver, ISubscriberCollection {}

interface IMayHavePropertyChangedCallback {
  propertyChanged?(name: string, newValue: unknown, oldValue: unknown): void;
}

export class BindableObserver {
  public get type(): AccessorType { return AccessorType.Observer; }

  /** @internal */
  private _value: unknown = void 0;
  /** @internal */
  private _oldValue: unknown = void 0;

  /** @internal */
  private _observing: boolean;

  /** @internal */
  private readonly cb: (newValue: unknown, oldValue: unknown) => void;

  /** @internal */
  private readonly _cbAll: NonNullable<IMayHavePropertyChangedCallback['propertyChanged']>;

  /** @internal */
  private readonly _hasCb: boolean;

  /** @internal */
  private readonly _hasCbAll: boolean;

  /** @internal */
  private readonly _hasSetter: boolean;

  /** @internal */
  private readonly _obj: IIndexable;

  /** @internal */
  private readonly _key: string;

  public constructor(
    obj: IIndexable,
    key: string,
    cbName: string,
    private readonly set: InterceptorFunc,
    // todo: a future feature where the observer is not instantiated via a controller
    // this observer can become more static, as in immediately available when used
    // in the form of a decorator
    public readonly $controller: IComponentController | null,
  ) {
    const cb = obj[cbName] as typeof BindableObserver.prototype.cb;
    const cbAll = (obj as IMayHavePropertyChangedCallback).propertyChanged!;
    const hasCb = this._hasCb = isFunction(cb);
    const hasCbAll = this._hasCbAll = isFunction(cbAll);
    const hasSetter = this._hasSetter = set !== noop;
    let val: unknown;

    this._obj = obj;
    this._key = key;
    this._cbAll = hasCbAll ? cbAll : noop;
    this.cb = hasCb ? cb : noop;
    // when user declare @bindable({ set })
    // it's expected to work from the start,
    // regardless where the assignment comes from: either direct view model assignment or from binding during render
    // so if either getter/setter config is present, alter the accessor straight await
    if (this.cb === void 0 && !hasCbAll && !hasSetter) {
      this._observing = false;
    } else {
      this._observing = true;

      val = obj[key];
      this._value = hasSetter && val !== void 0 ? set(val, this.$controller?.coercion) : val;
      this._createGetterSetter();
    }
  }

  public getValue(): unknown {
    return this._value;
  }

  public setValue(newValue: unknown): void {
    if (this._hasSetter) {
      newValue = this.set(newValue, this.$controller?.coercion);
    }

    const currentValue = this._value;
    if (this._observing) {
      if (areEqual(newValue, currentValue)) {
        return;
      }
      this._value = newValue;
      this._oldValue = currentValue;
      // todo: controller (if any) state should determine the invocation instead
      if (/* either not instantiated via a controller */this.$controller == null
        /* or the controller instantiating this is bound */|| this.$controller.isBound
      ) {
        if (this._hasCb) {
          this.cb.call(this._obj, newValue, currentValue);
        }
        if (this._hasCbAll) {
          this._cbAll.call(this._obj, this._key, newValue, currentValue);
        }
      }
      this.subs.notify(this._value, this._oldValue);
    } else {
      // See SetterObserver.setValue for explanation
      this._obj[this._key] = newValue;
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    if (!this._observing === false) {
      this._observing = true;
      this._value = this._hasSetter
        ? this.set(this._obj[this._key], this.$controller?.coercion)
        : this._obj[this._key];
      this._createGetterSetter();
    }

    this.subs.add(subscriber);
  }

  /** @internal */
  private _createGetterSetter(): void {
    Reflect.defineProperty(
      this._obj,
      this._key,
      {
        enumerable: true,
        configurable: true,
        get: (/* Bindable Observer */) => this._value,
        set: (/* Bindable Observer */value: unknown) => {
          this.setValue(value);
        }
      }
    );
  }
}

subscriberCollection(BindableObserver);

export function createBindableGetterSetter(
  Type: Constructable,
  key: PropertyKey,
  bindable: BindableDefinition,
  // coercer: InterceptorFunc,
  // handler: string | symbol,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  instance: IIndexable<ICustomElementViewModel, any>,
  observerLocator: IObserverLocator,
  coercion?: ICoercionConfiguration,
) {
  const obs = observerLocator.getObserver(instance, key);
  if (bindable.set !== noop) {
    if (obs.useCoercer?.(bindable.set, coercion) !== true) {
      throw new Error(`AURxxxx: observer for property ${safeString(key)} does not support coercion.`);
    }
  }
  const handler = bindable.callback;
  if (instance[handler] != null || 'propertyChanged' in instance) {
    const callback = (newValue: unknown, oldValue: unknown) => {
      if (instance.$controller == null || instance.$controller.isBound) {
        // eslint-disable-next-line
        instance[handler]?.(newValue, oldValue);
        instance.propertyChanged?.(key, newValue, oldValue);
      }
    };
    if (obs.useCallback?.(callback) !== true) {
      throw new Error(`AURxxxx: observer for property ${safeString(key)} does not support change handler.`);
    }
  }
  // const coercer = bindable.set === noop ? identity : bindable.set;
  // const ownProto = getPrototypeOf(instance);
  // let pd = getOwnPropertyDescriptor(ownProto, key);
  // // Only instance properties will yield a descriptor here, otherwise walk up the proto chain
  // if (pd === void 0) {
  //   let proto: object | null = getPrototypeOf(ownProto);
  //   while (proto !== null) {
  //     pd = getOwnPropertyDescriptor(proto, key);
  //     if (pd === void 0) {
  //       proto = getPrototypeOf(proto);
  //     } else {
  //       break;
  //     }
  //   }
  // }
  // let get: (() => unknown);
  // let set: ((v: unknown) => void | unknown) | undefined;
  // const isField = pd == null || hasOwnProperty.call(pd, 'value');
  // if (isField) {
  //   let v: unknown = coercer(instance[key], coercion);
  //   get = () => v;
  //   set = ($v: unknown) => v = coercer($v, coercion);
  // } else {
  //   if (!pd!.get) {
  //     throw new Error(`AURxxxx: bindable ${safeString(key)} is write only`);
  //   }
  //   get = pd!.get;
  //   set = pd!.set == null ? void 0 : (v: unknown) => pd!.set?.call(instance, coercer(v, coercion));
  // }
  // const observer = new ComputedObserver(
  //   instance,
  //   // if it's a field then can reuse the getter setter
  //   get,
  //   set,
  //   observerLocator,
  //   !isField,
  // );

  // if (instance[handler] != null || 'propertyChanged' in instance) {
  //   observer.useCallback((newValue, oldValue) => {
  //     if (instance.$controller == null || instance.$controller.isBound) {
  //       // eslint-disable-next-line
  //       instance[handler]?.(newValue, oldValue);
  //       instance.propertyChanged?.(key, newValue, oldValue);
  //     }
  //   });
  // }
  // def(instance, key, {
  //   enumerable: true,
  //   configurable: true,
  //   get: objectAssign(() => observer.getValue(), { getObserver: () => observer }),
  //   set: (v: unknown) => observer.setValue(v),
  // });
}
