var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Reporter } from '@aurelia/kernel';
import { ISignaler } from '../../observation/signaler';
import { bindingBehavior } from '../binding-behavior';
let SignalBindingBehavior = class SignalBindingBehavior {
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
            const names = Array.prototype.slice.call(args.length + 3, 3);
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
};
SignalBindingBehavior = __decorate([
    bindingBehavior('signal'),
    __param(0, ISignaler),
    __metadata("design:paramtypes", [Object])
], SignalBindingBehavior);
export { SignalBindingBehavior };
//# sourceMappingURL=signals.js.map