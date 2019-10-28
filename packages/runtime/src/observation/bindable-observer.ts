import { IIndexable, Reporter } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { ILifecycle } from '../lifecycle';
import { IPropertyObserver, ISubscriber } from '../observation';
import { ProxyObserver } from './proxy-observer';
import { subscriberCollection } from './subscriber-collection';

export interface BindableObserver extends IPropertyObserver<IIndexable, string> {}

export interface IMayHavePropertyChangedCallback {
  propertyChanged?(name: string, newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void;
}

type HasPropertyChangedCallback = Required<IMayHavePropertyChangedCallback>;

@subscriberCollection()
export class BindableObserver {
  public currentValue: unknown = void 0;
  public oldValue: unknown = void 0;

  public readonly persistentFlags: LifecycleFlags;
  public inBatch: boolean = false;
  public observing: boolean;

  private readonly callback?: (newValue: unknown, oldValue: unknown, flags: LifecycleFlags) => void;
  private readonly hasPropertyChangedCallback: boolean;

  public constructor(
    public readonly lifecycle: ILifecycle,
    flags: LifecycleFlags,
    public readonly obj: IIndexable & IMayHavePropertyChangedCallback,
    public readonly propertyKey: string,
    cbName: string,
  ) {
    let isProxy = false;
    if (ProxyObserver.isProxy(obj)) {
      isProxy = true;
      obj.$observer.subscribe(this, propertyKey);
      this.obj = obj.$raw;
    } else {
      this.obj = obj;
    }

    this.callback = this.obj[cbName] as typeof BindableObserver.prototype.callback;
    const hasPropertyChangedCallback = this.hasPropertyChangedCallback = typeof this.obj.propertyChanged === 'function';

    if (this.callback === void 0 || !hasPropertyChangedCallback) {
      this.observing = false;
    } else {
      this.observing = true;
      this.currentValue = obj[propertyKey];
      if (!isProxy) {
        this.createGetterSetter();
      }
    }
    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;
  }

  public handleChange(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void {
    this.setValue(newValue, flags);
  }

  public getValue(): unknown {
    return this.currentValue;
  }

  public setValue(newValue: unknown, flags: LifecycleFlags): void {
    if (this.observing) {
      const currentValue = this.currentValue;
      this.currentValue = newValue;
      if (this.lifecycle.batch.depth === 0) {
        this.callSubscribers(newValue, currentValue, this.persistentFlags | flags);
        // eslint-disable-next-line sonarjs/no-collapsible-if
        if ((flags & LifecycleFlags.fromBind) === 0 || (flags & LifecycleFlags.updateSourceExpression) > 0) {
          const callback = this.callback;
          if (callback !== void 0) {
            callback.call(this.obj, newValue, currentValue, this.persistentFlags | flags);
          }
          if (this.hasPropertyChangedCallback) {
            (this.obj as HasPropertyChangedCallback).propertyChanged(this.propertyKey, newValue, currentValue, this.persistentFlags | flags);
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
      this.currentValue = this.obj[this.propertyKey];
      this.createGetterSetter();
    }

    this.addSubscriber(subscriber);
  }

  private createGetterSetter(): void {
    if (
      !Reflect.defineProperty(
        this.obj,
        this.propertyKey,
        {
          enumerable: true,
          configurable: true,
          get: () => {
            return this.currentValue;
          },
          set: value => {
            this.setValue(value, LifecycleFlags.none);
          },
        }
      )
    ) {
      Reporter.write(1, this.propertyKey, this.obj);
    }
  }
}
