import { __decorate } from "tslib";
import { BindingMode, CallBindingInstruction, FromViewBindingInstruction, IteratorBindingInstruction, OneTimeBindingInstruction, ToViewBindingInstruction, TwoWayBindingInstruction, } from '@aurelia/runtime';
import { bindingCommand, getTarget, } from './binding-command';
import { BindingSymbol, } from './semantic-model';
let OneTimeBindingCommand = class OneTimeBindingCommand {
    constructor() {
        this.bindingType = 49 /* OneTimeCommand */;
    }
    compile(binding) {
        return new OneTimeBindingInstruction(binding.expression, getTarget(binding, false));
    }
};
OneTimeBindingCommand = __decorate([
    bindingCommand('one-time')
], OneTimeBindingCommand);
export { OneTimeBindingCommand };
let ToViewBindingCommand = class ToViewBindingCommand {
    constructor() {
        this.bindingType = 50 /* ToViewCommand */;
    }
    compile(binding) {
        return new ToViewBindingInstruction(binding.expression, getTarget(binding, false));
    }
};
ToViewBindingCommand = __decorate([
    bindingCommand('to-view')
], ToViewBindingCommand);
export { ToViewBindingCommand };
let FromViewBindingCommand = class FromViewBindingCommand {
    constructor() {
        this.bindingType = 51 /* FromViewCommand */;
    }
    compile(binding) {
        return new FromViewBindingInstruction(binding.expression, getTarget(binding, false));
    }
};
FromViewBindingCommand = __decorate([
    bindingCommand('from-view')
], FromViewBindingCommand);
export { FromViewBindingCommand };
let TwoWayBindingCommand = class TwoWayBindingCommand {
    constructor() {
        this.bindingType = 52 /* TwoWayCommand */;
    }
    compile(binding) {
        return new TwoWayBindingInstruction(binding.expression, getTarget(binding, false));
    }
};
TwoWayBindingCommand = __decorate([
    bindingCommand('two-way')
], TwoWayBindingCommand);
export { TwoWayBindingCommand };
let DefaultBindingCommand = class DefaultBindingCommand {
    constructor() {
        this.bindingType = 53 /* BindCommand */;
    }
    compile(binding) {
        let mode = BindingMode.default;
        if (binding instanceof BindingSymbol) {
            mode = binding.bindable.mode;
        }
        else {
            const command = binding.syntax.command;
            switch (command) {
                case 'bind':
                case 'to-view':
                    mode = BindingMode.toView;
                    break;
                case 'one-time':
                    mode = BindingMode.oneTime;
                    break;
                case 'from-view':
                    mode = BindingMode.fromView;
                    break;
                case 'two-way':
                    mode = BindingMode.twoWay;
                    break;
            }
        }
        switch (mode) {
            case BindingMode.default:
            case BindingMode.toView:
                return ToViewBindingCommand.prototype.compile(binding);
            case BindingMode.oneTime:
                return OneTimeBindingCommand.prototype.compile(binding);
            case BindingMode.fromView:
                return FromViewBindingCommand.prototype.compile(binding);
            case BindingMode.twoWay:
                return TwoWayBindingCommand.prototype.compile(binding);
        }
    }
};
DefaultBindingCommand = __decorate([
    bindingCommand('bind')
], DefaultBindingCommand);
export { DefaultBindingCommand };
let CallBindingCommand = class CallBindingCommand {
    constructor() {
        this.bindingType = 153 /* CallCommand */;
    }
    compile(binding) {
        return new CallBindingInstruction(binding.expression, getTarget(binding, true));
    }
};
CallBindingCommand = __decorate([
    bindingCommand('call')
], CallBindingCommand);
export { CallBindingCommand };
let ForBindingCommand = class ForBindingCommand {
    constructor() {
        this.bindingType = 539 /* ForCommand */;
    }
    compile(binding) {
        return new IteratorBindingInstruction(binding.expression, getTarget(binding, false));
    }
};
ForBindingCommand = __decorate([
    bindingCommand('for')
], ForBindingCommand);
export { ForBindingCommand };
//# sourceMappingURL=binding-commands.js.map