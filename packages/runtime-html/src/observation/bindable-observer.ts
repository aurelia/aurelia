import { noop } from '@aurelia/kernel';
import { subscriberCollection, AccessorType } from '@aurelia/runtime';
import { areEqual, isFunction } from '../utilities';

import type { IIndexable } from '@aurelia/kernel';
import type {
  InterceptorFunc,
  IObserver,
  ISubscriber,
  ISubscriberCollection,
} from '@aurelia/runtime';
import type { IComponentController } from '../templating/controller';

export interface BindableObserver extends IObserver, ISubscriberCollection {}

interface IMayHavePropertyChangedCallback {
  propertyChanged?(name: string, newValue: unknown, oldValue: unknown): void;
}

// for new decorator, if bindable was declared on a field, it would require a pair of getter/setter to be reinstalled on the instance
//                  it'll also required the observer to initialize to the field existing value
// in case of @bindable on accessor, bindable setup needs to return get, set and optionally the init-transformer of the initial value,
//                  this init-transformer will be the set function
// in case of @bindable on setter, bindable setup needs to somehow links the getter (if any) with the setter
// in case of @bindable on getter, bindable setup needs to somehow links the setter (if any) with the getter
// ... and more for static, private, proxy etc..
// ...
// these conditions will likely make the bindable observation setup explode
// a new strategy for handling bindable is required
// ...
// bindable observation isn't too special, it requires:
//    - metadata correctly declared on the custom element definition for binding compilation
//    - ability to invoke the right callbacks on value changes
//    - ability to intercept the incoming value, as it often has to deal with html literal string, but normally meant boolean/number etc...
// ...
// maybe the controller can just get whatever existing observer, and add some special subscription on top to turn it into a "bindable" observer
// doing this requires the existing observer to open more API to understand some special needs too
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
    // private readonly _coercionConfig: ICoercionConfiguration | null,
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
