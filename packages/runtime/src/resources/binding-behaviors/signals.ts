import { IRegistry, Key, Reporter } from '@aurelia/kernel';
import { PropertyBinding } from '../../binding/property-binding';
import { LifecycleFlags } from '../../flags';
import { IScope } from '../../observation';
import { ISignaler } from '../../observation/signaler';
import { BindingBehavior } from '../binding-behavior';

export type SignalableBinding = PropertyBinding & {
  signal: string | string[];
};

export class SignalBindingBehavior {
  public static readonly inject: readonly Key[] = [ISignaler];

  public static register: IRegistry['register'];

  private readonly signaler: ISignaler;

  constructor(signaler: ISignaler) {
    this.signaler = signaler;
  }

  public bind(flags: LifecycleFlags, scope: IScope, binding: SignalableBinding, ...args: string[]): void {
    if (!binding.updateTarget) {
      throw Reporter.error(11);
    }

    if (arguments.length === 4) {
      const name = args[0];
      this.signaler.addSignalListener(name, binding);
      binding.signal = name;
    } else if (arguments.length > 4) {
      const names = Array.prototype.slice.call(arguments, 3);
      let i = names.length;

      while (i--) {
        const name = names[i];
        this.signaler.addSignalListener(name, binding);
      }

      binding.signal = names;
    } else {
      throw Reporter.error(12);
    }
  }

  public unbind(flags: LifecycleFlags, scope: IScope, binding: SignalableBinding): void {
    const name = binding.signal;
    binding.signal = null! as string | string[];

    if (Array.isArray(name)) {
      const names = name;
      let i = names.length;

      while (i--) {
        this.signaler.removeSignalListener(names[i], binding);
      }
    } else {
      this.signaler.removeSignalListener(name, binding);
    }
  }
}
BindingBehavior.define('signal', SignalBindingBehavior);
