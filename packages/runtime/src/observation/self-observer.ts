import { IIndexable, PLATFORM, Tracer } from '@aurelia/kernel';
import { IPropertyObserver, LifecycleFlags } from '../observation';
import { propertyObserver } from './property-observer';
import { ProxyObserver } from './proxy-observer';

const slice = Array.prototype.slice;
const noop = PLATFORM.noop;

export interface SelfObserver extends IPropertyObserver<IIndexable, string> {}

@propertyObserver()
export class SelfObserver implements SelfObserver {
  public readonly persistentFlags: LifecycleFlags;
  public obj: IIndexable;
  public propertyKey: string;
  public currentValue: unknown;

  private readonly callback: (newValue: unknown, oldValue: unknown, flags?: LifecycleFlags) => unknown;

  constructor(
    flags: LifecycleFlags,
    instance: object,
    propertyName: string,
    callbackName: string
  ) {
    if (Tracer.enabled) { Tracer.enter('SelfObserver.constructor', slice.call(arguments)); }
    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;
    if (ProxyObserver.isProxy(instance)) {
      instance.$observer.subscribe(this, propertyName);
      this.obj = instance.$raw;
      this.propertyKey = propertyName;
      this.currentValue = instance.$raw[propertyName];
      this.callback = callbackName in instance.$raw
        ? instance[callbackName].bind(instance)
        : noop;
    } else {
      this.obj = instance;
      this.propertyKey = propertyName;
      this.currentValue = instance[propertyName];
      this.callback = callbackName in instance
        ? instance[callbackName].bind(instance)
        : noop;
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public handleChange(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void {
    this.setValue(newValue, flags);
  }

  public getValue(): unknown {
    return this.currentValue;
  }

  public setValue(newValue: unknown, flags: LifecycleFlags): void {
    const currentValue = this.currentValue;

    if (currentValue !== newValue) {
      this.currentValue = newValue;

      if (!(flags & LifecycleFlags.fromBind)) {
        const coercedValue = this.callback(newValue, currentValue, flags);

        if (coercedValue !== undefined) {
          this.currentValue = newValue = coercedValue;
        }

        this.callSubscribers(newValue, currentValue, flags);
      }
    }
  }
}
