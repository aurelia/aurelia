import { noop } from '@aurelia/kernel';
import { subscriberCollection, AccessorType, LifecycleFlags } from '@aurelia/runtime';

import type { IIndexable } from '@aurelia/kernel';
import type { InterceptorFunc, IObserver, ISubscriber, ILifecycle, ISubscriberCollection, IBatchable } from '@aurelia/runtime';
import type { IController } from '../templating/controller';

export interface BindableObserver extends IObserver, ISubscriberCollection, IBatchable {}

interface IMayHavePropertyChangedCallback {
  propertyChanged?(name: string, newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void;
}

type HasPropertyChangedCallback = Required<IMayHavePropertyChangedCallback>;

export class BindableObserver {
  public currentValue: unknown = void 0;
  public oldValue: unknown = void 0;

  public inBatch: boolean = false;
  public observing: boolean;
  public type: AccessorType = AccessorType.Obj;

  private readonly lifecycle: ILifecycle;
  private readonly callback?: (newValue: unknown, oldValue: unknown, flags: LifecycleFlags) => void;
  private readonly propertyChangedCallback?: HasPropertyChangedCallback['propertyChanged'];
  private readonly hasPropertyChangedCallback: boolean;
  private readonly shouldInterceptSet: boolean;

  public constructor(
    public readonly obj: IIndexable,
    public readonly propertyKey: string,
    cbName: string,
    private readonly $set: InterceptorFunc,
    public readonly $controller: IController,
  ) {
    this.callback = this.obj[cbName] as typeof BindableObserver.prototype.callback;
    this.lifecycle = $controller.lifecycle;

    const propertyChangedCallback = this.propertyChangedCallback = (this.obj as IMayHavePropertyChangedCallback).propertyChanged;
    const hasPropertyChangedCallback = this.hasPropertyChangedCallback = typeof propertyChangedCallback === 'function';

    const shouldInterceptSet = this.shouldInterceptSet = $set !== noop;
    // when user declare @bindable({ set })
    // it's expected to work from the start,
    // regardless where the assignment comes from: either direct view model assignment or from binding during render
    // so if either getter/setter config is present, alter the accessor straight await
    if (this.callback === void 0 && !hasPropertyChangedCallback && !shouldInterceptSet) {
      this.observing = false;
    } else {
      this.observing = true;

      const currentValue = obj[propertyKey];
      this.currentValue = shouldInterceptSet && currentValue !== void 0
        ? $set(currentValue)
        : currentValue;
      this.createGetterSetter();
    }
  }

  public handleChange(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void {
    this.setValue(newValue, flags);
  }

  public getValue(): unknown {
    return this.currentValue;
  }

  public setValue(newValue: unknown, flags: LifecycleFlags): void {
    if (this.shouldInterceptSet) {
      newValue = this.$set(newValue);
    }

    if (this.observing) {
      const currentValue = this.currentValue;
      if (Object.is(newValue, currentValue)) {
        return;
      }
      this.currentValue = newValue;
      if (this.lifecycle.batch.depth === 0) {
        this.subs.notify(newValue, currentValue, flags);
        if ((flags & LifecycleFlags.fromBind) === 0 || (flags & LifecycleFlags.updateSource) > 0) {
          this.callback?.call(this.obj, newValue, currentValue, flags);

          if (this.hasPropertyChangedCallback) {
            this.propertyChangedCallback!.call(this.obj, this.propertyKey, newValue, currentValue, flags);
          }
        }
      } else if (!this.inBatch) {
        this.inBatch = true;
        this.oldValue = currentValue;
        this.lifecycle.batch.add(this);
      }
    } else {
      // See SetterObserver.setValue for explanation
      this.obj[this.propertyKey] = newValue;
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    if (this.observing === false) {
      this.observing = true;
      const currentValue = this.obj[this.propertyKey];
      this.currentValue = this.shouldInterceptSet
        ? this.$set(currentValue)
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

subscriberCollection()(BindableObserver);
