import { IIndexable, Reporter, Tracer } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { IPropertyObserver, ISubscriber } from '../observation';
import { ProxyObserver } from './proxy-observer';
import { subscriberCollection } from './subscriber-collection';

const slice = Array.prototype.slice;

export interface SelfObserver extends IPropertyObserver<IIndexable, string> {}

@subscriberCollection()
export class SelfObserver {
  public observing: boolean;
  public readonly persistentFlags: LifecycleFlags;
  public obj: IIndexable;
  public propertyKey: string;
  public currentValue: unknown;

  private readonly callback?: (newValue: unknown, oldValue: unknown, flags: LifecycleFlags) => void;

  constructor(
    flags: LifecycleFlags,
    instance: IIndexable,
    propertyName: string,
    cbName: string
  ) {
    if (Tracer.enabled) { Tracer.enter('SelfObserver', 'constructor', slice.call(arguments)); }

    this.observing = false;
    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;
    if (ProxyObserver.isProxy(instance)) {
      instance.$observer.subscribe(this, propertyName);
      this.obj = instance.$raw;
    } else {
      this.obj = instance;
    }
    this.propertyKey = propertyName;
    this.currentValue = this.obj[propertyName];
    this.callback = this.obj[cbName] as typeof SelfObserver.prototype.callback;

    if (Tracer.enabled) { Tracer.leave(); }
  }

  public handleChange(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void {
    this.setValue(newValue, flags);
  }

  public getValue(): unknown {
    return this.currentValue;
  }

  public setValue(newValue: unknown, flags: LifecycleFlags): void {
    if (newValue !== this.currentValue) {
      if ((flags & LifecycleFlags.fromBind) === 0) {
        const oldValue = this.currentValue;
        flags |= this.persistentFlags;
        this.currentValue = newValue;
        this.callSubscribers(newValue, oldValue, flags | LifecycleFlags.allowPublishRoundtrip);
        if (this.callback != null) {
          this.callback.call(this.obj, newValue, oldValue, flags);
        }
      } else {
        this.currentValue = newValue;
      }
    }
  }

  public subscribe(subscriber: ISubscriber): void {
    if (this.observing === false) {
      this.observing = true;
      this.currentValue = this.obj[this.propertyKey];
      if (
        !Reflect.defineProperty(
          this.obj,
          this.propertyKey,
          {
            enumerable: true,
            configurable: true,
            get: () => {
              return this.getValue();
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

    this.addSubscriber(subscriber);
  }
}
