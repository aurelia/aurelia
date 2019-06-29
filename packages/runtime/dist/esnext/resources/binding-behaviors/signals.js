import { Reporter } from '@aurelia/kernel';
import { ISignaler } from '../../observation/signaler';
import { BindingBehavior } from '../binding-behavior';
export class SignalBindingBehavior {
    constructor(signaler) {
        this.signaler = signaler;
    }
    bind(flags, scope, binding, ...args) {
        if (!binding.updateTarget) {
            throw Reporter.error(11);
        }
        if (arguments.length === 4) {
            const name = args[0];
            this.signaler.addSignalListener(name, binding);
            binding.signal = name;
        }
        else if (arguments.length > 4) {
            const names = Array.prototype.slice.call(arguments, 3);
            let i = names.length;
            while (i--) {
                const name = names[i];
                this.signaler.addSignalListener(name, binding);
            }
            binding.signal = names;
        }
        else {
            throw Reporter.error(12);
        }
    }
    unbind(flags, scope, binding) {
        const name = binding.signal;
        binding.signal = null;
        if (Array.isArray(name)) {
            const names = name;
            let i = names.length;
            while (i--) {
                this.signaler.removeSignalListener(names[i], binding);
            }
        }
        else {
            this.signaler.removeSignalListener(name, binding);
        }
    }
}
SignalBindingBehavior.inject = [ISignaler];
BindingBehavior.define('signal', SignalBindingBehavior);
//# sourceMappingURL=signals.js.map