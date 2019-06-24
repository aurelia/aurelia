import { BindingCommandResource, getTarget } from '@aurelia/jit';
import { AttributeBindingInstruction, CaptureBindingInstruction, DelegateBindingInstruction, TriggerBindingInstruction } from '@aurelia/runtime-html';
/**
 * Trigger binding command. Compile attr with binding symbol with command `trigger` to `TriggerBindingInstruction`
 */
export class TriggerBindingCommand {
    constructor() {
        this.bindingType = 86 /* TriggerCommand */;
    }
    compile(binding) {
        return new TriggerBindingInstruction(binding.expression, getTarget(binding, false));
    }
}
BindingCommandResource.define('trigger', TriggerBindingCommand);
/**
 * Delegate binding command. Compile attr with binding symbol with command `delegate` to `DelegateBindingInstruction`
 */
export class DelegateBindingCommand {
    constructor() {
        this.bindingType = 88 /* DelegateCommand */;
    }
    compile(binding) {
        return new DelegateBindingInstruction(binding.expression, getTarget(binding, false));
    }
}
BindingCommandResource.define('delegate', DelegateBindingCommand);
/**
 * Capture binding command. Compile attr with binding symbol with command `capture` to `CaptureBindingInstruction`
 */
export class CaptureBindingCommand {
    constructor() {
        this.bindingType = 87 /* CaptureCommand */;
    }
    compile(binding) {
        return new CaptureBindingInstruction(binding.expression, getTarget(binding, false));
    }
}
BindingCommandResource.define('capture', CaptureBindingCommand);
/**
 * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
 */
export class AttrBindingCommand {
    constructor() {
        this.bindingType = 32 /* IsProperty */;
    }
    compile(binding) {
        const target = getTarget(binding, false);
        return new AttributeBindingInstruction(target, binding.expression, target);
    }
}
BindingCommandResource.define('attr', AttrBindingCommand);
/**
 * Style binding command. Compile attr with binding symbol with command `style` to `AttributeBindingInstruction`
 */
export class StyleBindingCommand {
    constructor() {
        this.bindingType = 32 /* IsProperty */;
    }
    compile(binding) {
        return new AttributeBindingInstruction('style', binding.expression, getTarget(binding, false));
    }
}
BindingCommandResource.define('style', StyleBindingCommand);
/**
 * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
 */
export class ClassBindingCommand {
    constructor() {
        this.bindingType = 32 /* IsProperty */;
    }
    compile(binding) {
        return new AttributeBindingInstruction('class', binding.expression, getTarget(binding, false));
    }
}
BindingCommandResource.define('class', ClassBindingCommand);
//# sourceMappingURL=binding-command.js.map