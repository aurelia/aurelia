import { noop } from '@aurelia/kernel';
import { subscriberCollection, AccessorType, LifecycleFlags } from '@aurelia/runtime';

import type { IIndexable } from '@aurelia/kernel';
import type { InterceptorFunc, IObserver, ISubscriber, ISubscriberCollection } from '@aurelia/runtime';
import type { IController } from '../templating/controller';

export interface BindableObserver extends IObserver, ISubscriberCollection {}

interface IMayHavePropertyChangedCallback {
  propertyChanged?(name: string, newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void;
}

type HasPropertyChangedCallback = Required<IMayHavePropertyChangedCallback>;

export class BindableObserver {
  public type: AccessorType = AccessorType.Observer;
  public currentValue: unknown = void 0;
  public oldValue: unknown = void 0;

  public observing: boolean;

  private readonly cb: (newValue: unknown, oldValue: unknown, flags: LifecycleFlags) => void;
  private readonly cbAll: HasPropertyChangedCallback['propertyChanged'];
  private readonly hasCb: boolean;
  private readonly hasCbAll: boolean;
  private readonly hasSetter: boolean;

  public constructor(
    public readonly obj: IIndexable,
    public readonly propertyKey: string,
    cbName: string,
    private readonly set: InterceptorFunc,
    public readonly $controller: IController,
  ) {
    const cb = obj[cbName] as typeof BindableObserver.prototype.cb;
    const cbAll = (obj as IMayHavePropertyChangedCallback).propertyChanged!;
    const hasCb = this.hasCb = typeof cb === 'function';
    const hasCbAll = this.hasCbAll = typeof cbAll === 'function';
    const hasSetter = this.hasSetter = set !== noop;

    this.cb = hasCb ? cb : noop;
    this.cbAll = this.hasCbAll ? cbAll : noop;
    // when user declare @bindable({ set })
    // it's expected to work from the start,
    // regardless where the assignment comes from: either direct view model assignment or from binding during render
    // so if either getter/setter config is present, alter the accessor straight await
    if (this.cb === void 0 && !hasCbAll && !hasSetter) {
      this.observing = false;
    } else {
      this.observing = true;

      const val = obj[propertyKey];
      this.currentValue = hasSetter && val !== void 0 ? set(val) : val;
      this.createGetterSetter();
    }
  }

  public getValue(): unknown {
    return this.currentValue;
  }

  public setValue(newValue: unknown, flags: LifecycleFlags): void {
    if (this.hasSetter) {
      newValue = this.set(newValue);
    }

    if (this.observing) {
      const currentValue = this.currentValue;
      // eslint-disable-next-line compat/compat
      if (Object.is(newValue, currentValue)) {
        return;
      }
      this.currentValue = newValue;
      // todo: controller (if any) state should determine the invocation instead
      if ((flags & LifecycleFlags.fromBind) === 0 || (flags & LifecycleFlags.updateSource) > 0) {
        if (this.hasCb) {
          this.cb!.call(this.obj, newValue, currentValue, flags);
        }
        if (this.hasCbAll) {
          this.cbAll!.call(this.obj, this.propertyKey, newValue, currentValue, flags);
        }
      }
      this.subs.notify(newValue, currentValue, flags);
    } else {
      // See SetterObserver.setValue for explanation
      this.obj[this.propertyKey] = newValue;
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    if (!this.observing === false) {
      this.observing = true;
      const currentValue = this.obj[this.propertyKey];
      this.currentValue = this.hasSetter
        ? this.set(currentValue)
        : currentValue;
      this.createGetterSetter();
    }

    this.subs.add(subscriber);
  }

  private createGetterSetter(): void {
    Reflect.defineProperty(
      this.obj,
      this.propertyKey,
      {
        enumerable: true,
        configurable: true,
        get: (/* Bindable Observer */) => this.currentValue,
        set: (/* Bindable Observer */value: unknown) => {
          this.setValue(value, LifecycleFlags.none);
        }
      }
    );
  }
}

subscriberCollection(BindableObserver);
