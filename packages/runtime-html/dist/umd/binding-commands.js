var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/runtime", "./binding-command", "./instructions", "./semantic-model"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RefBindingCommand = exports.ClassBindingCommand = exports.StyleBindingCommand = exports.AttrBindingCommand = exports.CaptureBindingCommand = exports.DelegateBindingCommand = exports.TriggerBindingCommand = exports.ForBindingCommand = exports.CallBindingCommand = exports.DefaultBindingCommand = exports.TwoWayBindingCommand = exports.FromViewBindingCommand = exports.ToViewBindingCommand = exports.OneTimeBindingCommand = void 0;
    const runtime_1 = require("@aurelia/runtime");
    const binding_command_1 = require("./binding-command");
    const instructions_1 = require("./instructions");
    const semantic_model_1 = require("./semantic-model");
    let OneTimeBindingCommand = class OneTimeBindingCommand {
        constructor() {
            this.bindingType = 49 /* OneTimeCommand */;
        }
        compile(binding) {
            return new instructions_1.OneTimeBindingInstruction(binding.expression, binding_command_1.getTarget(binding, false));
        }
    };
    OneTimeBindingCommand = __decorate([
        binding_command_1.bindingCommand('one-time')
    ], OneTimeBindingCommand);
    exports.OneTimeBindingCommand = OneTimeBindingCommand;
    let ToViewBindingCommand = class ToViewBindingCommand {
        constructor() {
            this.bindingType = 50 /* ToViewCommand */;
        }
        compile(binding) {
            return new instructions_1.ToViewBindingInstruction(binding.expression, binding_command_1.getTarget(binding, false));
        }
    };
    ToViewBindingCommand = __decorate([
        binding_command_1.bindingCommand('to-view')
    ], ToViewBindingCommand);
    exports.ToViewBindingCommand = ToViewBindingCommand;
    let FromViewBindingCommand = class FromViewBindingCommand {
        constructor() {
            this.bindingType = 51 /* FromViewCommand */;
        }
        compile(binding) {
            return new instructions_1.FromViewBindingInstruction(binding.expression, binding_command_1.getTarget(binding, false));
        }
    };
    FromViewBindingCommand = __decorate([
        binding_command_1.bindingCommand('from-view')
    ], FromViewBindingCommand);
    exports.FromViewBindingCommand = FromViewBindingCommand;
    let TwoWayBindingCommand = class TwoWayBindingCommand {
        constructor() {
            this.bindingType = 52 /* TwoWayCommand */;
        }
        compile(binding) {
            return new instructions_1.TwoWayBindingInstruction(binding.expression, binding_command_1.getTarget(binding, false));
        }
    };
    TwoWayBindingCommand = __decorate([
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
    DefaultBindingCommand = __decorate([
        binding_command_1.bindingCommand('bind')
    ], DefaultBindingCommand);
    exports.DefaultBindingCommand = DefaultBindingCommand;
    let CallBindingCommand = class CallBindingCommand {
        constructor() {
            this.bindingType = 153 /* CallCommand */;
        }
        compile(binding) {
            return new instructions_1.CallBindingInstruction(binding.expression, binding_command_1.getTarget(binding, true));
        }
    };
    CallBindingCommand = __decorate([
        binding_command_1.bindingCommand('call')
    ], CallBindingCommand);
    exports.CallBindingCommand = CallBindingCommand;
    let ForBindingCommand = class ForBindingCommand {
        constructor() {
            this.bindingType = 539 /* ForCommand */;
        }
        compile(binding) {
            return new instructions_1.IteratorBindingInstruction(binding.expression, binding_command_1.getTarget(binding, false));
        }
    };
    ForBindingCommand = __decorate([
        binding_command_1.bindingCommand('for')
    ], ForBindingCommand);
    exports.ForBindingCommand = ForBindingCommand;
    /**
     * Trigger binding command. Compile attr with binding symbol with command `trigger` to `TriggerBindingInstruction`
     */
    let TriggerBindingCommand = class TriggerBindingCommand {
        constructor() {
            this.bindingType = 4182 /* TriggerCommand */;
        }
        compile(binding) {
            return new instructions_1.TriggerBindingInstruction(binding.expression, binding_command_1.getTarget(binding, false));
        }
    };
    TriggerBindingCommand = __decorate([
        binding_command_1.bindingCommand('trigger')
    ], TriggerBindingCommand);
    exports.TriggerBindingCommand = TriggerBindingCommand;
    /**
     * Delegate binding command. Compile attr with binding symbol with command `delegate` to `DelegateBindingInstruction`
     */
    let DelegateBindingCommand = class DelegateBindingCommand {
        constructor() {
            this.bindingType = 4184 /* DelegateCommand */;
        }
        compile(binding) {
            return new instructions_1.DelegateBindingInstruction(binding.expression, binding_command_1.getTarget(binding, false));
        }
    };
    DelegateBindingCommand = __decorate([
        binding_command_1.bindingCommand('delegate')
    ], DelegateBindingCommand);
    exports.DelegateBindingCommand = DelegateBindingCommand;
    /**
     * Capture binding command. Compile attr with binding symbol with command `capture` to `CaptureBindingInstruction`
     */
    let CaptureBindingCommand = class CaptureBindingCommand {
        constructor() {
            this.bindingType = 4183 /* CaptureCommand */;
        }
        compile(binding) {
            return new instructions_1.CaptureBindingInstruction(binding.expression, binding_command_1.getTarget(binding, false));
        }
    };
    CaptureBindingCommand = __decorate([
        binding_command_1.bindingCommand('capture')
    ], CaptureBindingCommand);
    exports.CaptureBindingCommand = CaptureBindingCommand;
    /**
     * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
     */
    let AttrBindingCommand = class AttrBindingCommand {
        constructor() {
            this.bindingType = 32 /* IsProperty */;
        }
        compile(binding) {
            const target = binding_command_1.getTarget(binding, false);
            return new instructions_1.AttributeBindingInstruction(target, binding.expression, target);
        }
    };
    AttrBindingCommand = __decorate([
        binding_command_1.bindingCommand('attr')
    ], AttrBindingCommand);
    exports.AttrBindingCommand = AttrBindingCommand;
    /**
     * Style binding command. Compile attr with binding symbol with command `style` to `AttributeBindingInstruction`
     */
    let StyleBindingCommand = class StyleBindingCommand {
        constructor() {
            this.bindingType = 32 /* IsProperty */;
        }
        compile(binding) {
            return new instructions_1.AttributeBindingInstruction('style', binding.expression, binding_command_1.getTarget(binding, false));
        }
    };
    StyleBindingCommand = __decorate([
        binding_command_1.bindingCommand('style')
    ], StyleBindingCommand);
    exports.StyleBindingCommand = StyleBindingCommand;
    /**
     * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
     */
    let ClassBindingCommand = class ClassBindingCommand {
        constructor() {
            this.bindingType = 32 /* IsProperty */;
        }
        compile(binding) {
            return new instructions_1.AttributeBindingInstruction('class', binding.expression, binding_command_1.getTarget(binding, false));
        }
    };
    ClassBindingCommand = __decorate([
        binding_command_1.bindingCommand('class')
    ], ClassBindingCommand);
    exports.ClassBindingCommand = ClassBindingCommand;
    /**
     * Binding command to refer different targets (element, custom element/attribute view models, controller) afterAttachChildren to an element
     */
    let RefBindingCommand = class RefBindingCommand {
        constructor() {
            this.bindingType = 32 /* IsProperty */ | 4096 /* IgnoreCustomAttr */;
        }
        compile(binding) {
            return new instructions_1.RefBindingInstruction(binding.expression, binding_command_1.getTarget(binding, false));
        }
    };
    RefBindingCommand = __decorate([
        binding_command_1.bindingCommand('ref')
    ], RefBindingCommand);
    exports.RefBindingCommand = RefBindingCommand;
});
//# sourceMappingURL=binding-commands.js.map