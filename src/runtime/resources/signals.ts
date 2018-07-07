import { IScope } from '../binding/binding-context';
import { inject } from '../../kernel/di';
import { Binding } from '../binding/binding';
import { bindingBehavior } from '../templating/binding-behavior';
import { Reporter } from '../../kernel/reporter';
import { ISignaler } from '../binding/signaler';

type SignalableBinding = Binding & {
  signal: string | string[];
};

@bindingBehavior('signal')
@inject(ISignaler)
export class SignalBindingBehavior {
  constructor(private signaler: ISignaler) {}

  bind(binding: SignalableBinding, scope: IScope) {
    if (!binding.updateTarget) {
      throw Reporter.error(11);
    }

    if (arguments.length === 3) {
      let name = arguments[2];
      this.signaler.addSignalListener(name, binding);
      binding.signal = name;
    } else if (arguments.length > 3) {
      let names = Array.prototype.slice.call(arguments, 2);
      let i = names.length;

      while (i--) {
        let name = names[i];
        this.signaler.addSignalListener(name, binding);
      }

      binding.signal = names;
    } else {
      throw Reporter.error(12);
    }
  }

  unbind(binding: SignalableBinding, scope: IScope) {
    let name = binding.signal;
    binding.signal = null;

    if (Array.isArray(name)) {
      let names = name;
      let i = names.length;

      while (i--) {
        this.signaler.removeSignalListener(names[i], binding);
      }
    } else {
      this.signaler.removeSignalListener(name, binding);
    }
  }
}
