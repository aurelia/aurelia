(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "tslib", "@aurelia/runtime", "./binding-command", "./semantic-model"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const runtime_1 = require("@aurelia/runtime");
    const binding_command_1 = require("./binding-command");
    const semantic_model_1 = require("./semantic-model");
    let OneTimeBindingCommand = class OneTimeBindingCommand {
        constructor() {
            this.bindingType = 49 /* OneTimeCommand */;
        }
        compile(binding) {
            return new runtime_1.OneTimeBindingInstruction(binding.expression, binding_command_1.getTarget(binding, false));
        }
    };
    OneTimeBindingCommand = tslib_1.__decorate([
        binding_command_1.bindingCommand('one-time')
    ], OneTimeBindingCommand);
    exports.OneTimeBindingCommand = OneTimeBindingCommand;
    let ToViewBindingCommand = class ToViewBindingCommand {
        constructor() {
            this.bindingType = 50 /* ToViewCommand */;
        }
        compile(binding) {
            return new runtime_1.ToViewBindingInstruction(binding.expression, binding_command_1.getTarget(binding, false));
        }
    };
    ToViewBindingCommand = tslib_1.__decorate([
        binding_command_1.bindingCommand('to-view')
    ], ToViewBindingCommand);
    exports.ToViewBindingCommand = ToViewBindingCommand;
    let FromViewBindingCommand = class FromViewBindingCommand {
        constructor() {
            this.bindingType = 51 /* FromViewCommand */;
        }
        compile(binding) {
            return new runtime_1.FromViewBindingInstruction(binding.expression, binding_command_1.getTarget(binding, false));
        }
    };
    FromViewBindingCommand = tslib_1.__decorate([
        binding_command_1.bindingCommand('from-view')
    ], FromViewBindingCommand);
    exports.FromViewBindingCommand = FromViewBindingCommand;
    let TwoWayBindingCommand = class TwoWayBindingCommand {
        constructor() {
            this.bindingType = 52 /* TwoWayCommand */;
        }
        compile(binding) {
            return new runtime_1.TwoWayBindingInstruction(binding.expression, binding_command_1.getTarget(binding, false));
        }
    };
    TwoWayBindingCommand = tslib_1.__decorate([
        binding_command_1.bindingCommand('two-way')
    ], TwoWayBindingCommand);
    exports.TwoWayBindingCommand = TwoWayBindingCommand;
    let DefaultBindingCommand = class DefaultBindingCommand {
        constructor() {
            this.bindingType = 53 /* BindCommand */;
        }
        compile(binding) {
            let mode = runtime_1.BindingMode.default;
            if (binding instanceof semantic_model_1.BindingSymbol) {
                mode = binding.bindable.mode;
            }
            else {
                const command = binding.syntax.command;
                switch (command) {
                    case 'bind':
                    case 'to-view':
                        mode = runtime_1.BindingMode.toView;
                        break;
                    case 'one-time':
                        mode = runtime_1.BindingMode.oneTime;
                        break;
                    case 'from-view':
                        mode = runtime_1.BindingMode.fromView;
                        break;
                    case 'two-way':
                        mode = runtime_1.BindingMode.twoWay;
                        break;
                }
            }
            switch (mode) {
                case runtime_1.BindingMode.default:
                case runtime_1.BindingMode.toView:
                    return ToViewBindingCommand.prototype.compile(binding);
                case runtime_1.BindingMode.oneTime:
                    return OneTimeBindingCommand.prototype.compile(binding);
                case runtime_1.BindingMode.fromView:
                    return FromViewBindingCommand.prototype.compile(binding);
                case runtime_1.BindingMode.twoWay:
                    return TwoWayBindingCommand.prototype.compile(binding);
            }
        }
    };
    DefaultBindingCommand = tslib_1.__decorate([
        binding_command_1.bindingCommand('bind')
    ], DefaultBindingCommand);
    exports.DefaultBindingCommand = DefaultBindingCommand;
    let CallBindingCommand = class CallBindingCommand {
        constructor() {
            this.bindingType = 153 /* CallCommand */;
        }
        compile(binding) {
            return new runtime_1.CallBindingInstruction(binding.expression, binding_command_1.getTarget(binding, true));
        }
    };
    CallBindingCommand = tslib_1.__decorate([
        binding_command_1.bindingCommand('call')
    ], CallBindingCommand);
    exports.CallBindingCommand = CallBindingCommand;
    let ForBindingCommand = class ForBindingCommand {
        constructor() {
            this.bindingType = 539 /* ForCommand */;
        }
        compile(binding) {
            return new runtime_1.IteratorBindingInstruction(binding.expression, binding_command_1.getTarget(binding, false));
        }
    };
    ForBindingCommand = tslib_1.__decorate([
        binding_command_1.bindingCommand('for')
    ], ForBindingCommand);
    exports.ForBindingCommand = ForBindingCommand;
});
//# sourceMappingURL=binding-commands.js.map