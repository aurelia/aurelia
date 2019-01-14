import { IIndexable, PLATFORM } from '@aurelia/kernel';
import { IPropertyObserver, LifecycleFlags } from '../observation';
import { propertyObserver } from './property-observer';

const noop = PLATFORM.noop;

export interface SelfObserver extends IPropertyObserver<IIndexable, string> {}

@propertyObserver()
export class SelfObserver implements SelfObserver {
  public readonly persistentFlags: LifecycleFlags;
  public obj: IIndexable;
  public propertyKey: string;
  public currentValue: unknown;

  private readonly callback: (newValue: unknown, oldValue: unknown) => unknown;

  constructor(
    flags: LifecycleFlags,
    instance: object,
    propertyName: string,
    callbackName: string
  ) {
      this.persistentFlags = flags & LifecycleFlags.persistentBindingFlags;
      this.obj = instance;
      this.propertyKey = propertyName;
      this.currentValue = instance[propertyName];
      this.callback = callbackName in instance
        ? instance[callbackName].bind(instance)
        : noop;
  }

  public getValue(): unknown {
    return this.currentValue;
  }

  public setValue(newValue: unknown, flags: LifecycleFlags): void {
    const currentValue = this.currentValue;

    if (currentValue !== newValue) {
      this.currentValue = newValue;

      if (!(flags & LifecycleFlags.fromBind)) {
        const coercedValue = this.callback(newValue, currentValue);

        if (coercedValue !== undefined) {
          this.currentValue = newValue = coercedValue;
        }

        this.callSubscribers(newValue, currentValue, flags);
      }
    }
  }
}
