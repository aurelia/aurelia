import { IIndexable, Tracer } from '@aurelia/kernel';
import { LifecycleFlags } from '../flags';
import { IPropertyObserver } from '../observation';
import { propertyObserver } from './property-observer';
import { ProxyObserver } from './proxy-observer';

const slice = Array.prototype.slice;

export interface SelfObserver extends IPropertyObserver<IIndexable, string> {}

@propertyObserver()
export class SelfObserver implements SelfObserver {
  public readonly persistentFlags: LifecycleFlags;
  public obj: object;
  public propertyKey: string;
  public currentValue: unknown;

  private readonly callback: ((newValue: unknown, oldValue: unknown, flags: LifecycleFlags) => void) | null;

  constructor(
    flags: LifecycleFlags,
    instance: object,
    propertyName: string,
    cbName: string
  ) {
    if (Tracer.enabled) { Tracer.enter('SelfObserver', 'constructor', slice.call(arguments)); }
    this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;
    if (ProxyObserver.isProxy(instance)) {
      instance.$observer.subscribe(this, propertyName);
      this.obj = instance.$raw;
    } else {
      this.obj = instance;
    }
    this.propertyKey = propertyName;
    this.currentValue = this.obj[propertyName];
    this.callback = this.obj[cbName] === undefined ? null : this.obj[cbName];
    if (flags & LifecycleFlags.patchStrategy) {
      this.getValue = this.getValueDirect;
    }
    if (Tracer.enabled) { Tracer.leave(); }
  }

  public handleChange(newValue: unknown, oldValue: unknown, flags: LifecycleFlags): void {
    this.setValue(newValue, flags);
  }

  public getValue(): unknown {
    return this.currentValue;
  }
  public getValueDirect(): unknown {
    return this.obj[this.propertyKey];
  }

  public setValue(newValue: unknown, flags: LifecycleFlags): void {
    if (newValue !== this.currentValue || (flags & LifecycleFlags.patchStrategy) > 0) {
      if ((flags & LifecycleFlags.fromBind) === 0) {
        const oldValue = this.currentValue;
        flags |= this.persistentFlags;
        this.currentValue = newValue;
        this.callSubscribers(newValue, oldValue, flags | LifecycleFlags.allowPublishRoundtrip);
        if (this.callback !== null) {
          this.callback.call(this.obj, newValue, oldValue, flags);
        }
      } else {
        this.currentValue = newValue;
      }
    }
  }
  public $patch(flags: LifecycleFlags): void {
    const oldValue = this.currentValue;
    const newValue = this.obj[this.propertyKey];
    flags |= this.persistentFlags;
    this.currentValue = newValue;
    this.callSubscribers(newValue, oldValue, flags);
    if (this.callback !== null) {
      this.callback.call(this.obj, newValue, oldValue, flags);
    }
  }
}
