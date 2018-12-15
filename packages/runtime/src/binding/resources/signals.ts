import { inject, IRegistry, Reporter } from '../../../kernel';
import { IScope, LifecycleFlags } from '../../observation';
import { Binding } from '../binding';
import { bindingBehavior } from '../binding-behavior';
import { ISignaler } from '../signaler';

export type SignalableBinding = Binding & {
  signal: string | string[];
};

@bindingBehavior('signal')
@inject(ISignaler)
export class SignalBindingBehavior {
  public static register: IRegistry['register'];

  constructor(private signaler: ISignaler) {}

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
    binding.signal = null;

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
