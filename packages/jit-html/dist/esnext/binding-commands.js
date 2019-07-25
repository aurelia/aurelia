import * as tslib_1 from "tslib";
import { bindingCommand, getTarget, } from '@aurelia/jit';
import { AttributeBindingInstruction, CaptureBindingInstruction, DelegateBindingInstruction, TriggerBindingInstruction } from '@aurelia/runtime-html';
/**
 * Trigger binding command. Compile attr with binding symbol with command `trigger` to `TriggerBindingInstruction`
 */
let TriggerBindingCommand = class TriggerBindingCommand {
    /**
     * Trigger binding command. Compile attr with binding symbol with command `trigger` to `TriggerBindingInstruction`
     */
    constructor() {
        this.bindingType = 86 /* TriggerCommand */;
    }
    compile(binding) {
        return new TriggerBindingInstruction(binding.expression, getTarget(binding, false));
    }
};
TriggerBindingCommand = tslib_1.__decorate([
    bindingCommand('trigger')
], TriggerBindingCommand);
export { TriggerBindingCommand };
/**
 * Delegate binding command. Compile attr with binding symbol with command `delegate` to `DelegateBindingInstruction`
 */
let DelegateBindingCommand = class DelegateBindingCommand {
    /**
     * Delegate binding command. Compile attr with binding symbol with command `delegate` to `DelegateBindingInstruction`
     */
    constructor() {
        this.bindingType = 88 /* DelegateCommand */;
    }
    compile(binding) {
        return new DelegateBindingInstruction(binding.expression, getTarget(binding, false));
    }
};
DelegateBindingCommand = tslib_1.__decorate([
    bindingCommand('delegate')
], DelegateBindingCommand);
export { DelegateBindingCommand };
/**
 * Capture binding command. Compile attr with binding symbol with command `capture` to `CaptureBindingInstruction`
 */
let CaptureBindingCommand = class CaptureBindingCommand {
    /**
     * Capture binding command. Compile attr with binding symbol with command `capture` to `CaptureBindingInstruction`
     */
    constructor() {
        this.bindingType = 87 /* CaptureCommand */;
    }
    compile(binding) {
        return new CaptureBindingInstruction(binding.expression, getTarget(binding, false));
    }
};
CaptureBindingCommand = tslib_1.__decorate([
    bindingCommand('capture')
], CaptureBindingCommand);
export { CaptureBindingCommand };
/**
 * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
 */
let AttrBindingCommand = class AttrBindingCommand {
    /**
     * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
     */
    constructor() {
        this.bindingType = 32 /* IsProperty */;
    }
    compile(binding) {
        const target = getTarget(binding, false);
        return new AttributeBindingInstruction(target, binding.expression, target);
    }
};
AttrBindingCommand = tslib_1.__decorate([
    bindingCommand('attr')
], AttrBindingCommand);
export { AttrBindingCommand };
/**
 * Style binding command. Compile attr with binding symbol with command `style` to `AttributeBindingInstruction`
 */
let StyleBindingCommand = class StyleBindingCommand {
    /**
     * Style binding command. Compile attr with binding symbol with command `style` to `AttributeBindingInstruction`
     */
    constructor() {
        this.bindingType = 32 /* IsProperty */;
    }
    compile(binding) {
        return new AttributeBindingInstruction('style', binding.expression, getTarget(binding, false));
    }
};
StyleBindingCommand = tslib_1.__decorate([
    bindingCommand('style')
], StyleBindingCommand);
export { StyleBindingCommand };
/**
 * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
 */
let ClassBindingCommand = class ClassBindingCommand {
    /**
     * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
     */
    constructor() {
        this.bindingType = 32 /* IsProperty */;
    }
    compile(binding) {
        return new AttributeBindingInstruction('class', binding.expression, getTarget(binding, false));
    }
};
ClassBindingCommand = tslib_1.__decorate([
    bindingCommand('class')
], ClassBindingCommand);
export { ClassBindingCommand };
//# sourceMappingURL=binding-commands.js.map