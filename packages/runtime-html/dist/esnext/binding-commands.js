var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { BindingMode, } from '@aurelia/runtime';
import { bindingCommand, getTarget } from './binding-command';
import { AttributeBindingInstruction, CaptureBindingInstruction, DelegateBindingInstruction, OneTimeBindingInstruction, TriggerBindingInstruction, CallBindingInstruction, FromViewBindingInstruction, IteratorBindingInstruction, ToViewBindingInstruction, TwoWayBindingInstruction, RefBindingInstruction, } from './instructions';
import { BindingSymbol } from './semantic-model';
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
/**
 * Trigger binding command. Compile attr with binding symbol with command `trigger` to `TriggerBindingInstruction`
 */
let TriggerBindingCommand = class TriggerBindingCommand {
    constructor() {
        this.bindingType = 4182 /* TriggerCommand */;
    }
    compile(binding) {
        return new TriggerBindingInstruction(binding.expression, getTarget(binding, false));
    }
};
TriggerBindingCommand = __decorate([
    bindingCommand('trigger')
], TriggerBindingCommand);
export { TriggerBindingCommand };
/**
 * Delegate binding command. Compile attr with binding symbol with command `delegate` to `DelegateBindingInstruction`
 */
let DelegateBindingCommand = class DelegateBindingCommand {
    constructor() {
        this.bindingType = 4184 /* DelegateCommand */;
    }
    compile(binding) {
        return new DelegateBindingInstruction(binding.expression, getTarget(binding, false));
    }
};
DelegateBindingCommand = __decorate([
    bindingCommand('delegate')
], DelegateBindingCommand);
export { DelegateBindingCommand };
/**
 * Capture binding command. Compile attr with binding symbol with command `capture` to `CaptureBindingInstruction`
 */
let CaptureBindingCommand = class CaptureBindingCommand {
    constructor() {
        this.bindingType = 4183 /* CaptureCommand */;
    }
    compile(binding) {
        return new CaptureBindingInstruction(binding.expression, getTarget(binding, false));
    }
};
CaptureBindingCommand = __decorate([
    bindingCommand('capture')
], CaptureBindingCommand);
export { CaptureBindingCommand };
/**
 * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
 */
let AttrBindingCommand = class AttrBindingCommand {
    constructor() {
        this.bindingType = 32 /* IsProperty */;
    }
    compile(binding) {
        const target = getTarget(binding, false);
        return new AttributeBindingInstruction(target, binding.expression, target);
    }
};
AttrBindingCommand = __decorate([
    bindingCommand('attr')
], AttrBindingCommand);
export { AttrBindingCommand };
/**
 * Style binding command. Compile attr with binding symbol with command `style` to `AttributeBindingInstruction`
 */
let StyleBindingCommand = class StyleBindingCommand {
    constructor() {
        this.bindingType = 32 /* IsProperty */;
    }
    compile(binding) {
        return new AttributeBindingInstruction('style', binding.expression, getTarget(binding, false));
    }
};
StyleBindingCommand = __decorate([
    bindingCommand('style')
], StyleBindingCommand);
export { StyleBindingCommand };
/**
 * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
 */
let ClassBindingCommand = class ClassBindingCommand {
    constructor() {
        this.bindingType = 32 /* IsProperty */;
    }
    compile(binding) {
        return new AttributeBindingInstruction('class', binding.expression, getTarget(binding, false));
    }
};
ClassBindingCommand = __decorate([
    bindingCommand('class')
], ClassBindingCommand);
export { ClassBindingCommand };
/**
 * Binding command to refer different targets (element, custom element/attribute view models, controller) afterAttachChildren to an element
 */
let RefBindingCommand = class RefBindingCommand {
    constructor() {
        this.bindingType = 32 /* IsProperty */ | 4096 /* IgnoreCustomAttr */;
    }
    compile(binding) {
        return new RefBindingInstruction(binding.expression, getTarget(binding, false));
    }
};
RefBindingCommand = __decorate([
    bindingCommand('ref')
], RefBindingCommand);
export { RefBindingCommand };
//# sourceMappingURL=binding-commands.js.map