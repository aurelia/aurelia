(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/jit", "@aurelia/runtime-html"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const jit_1 = require("@aurelia/jit");
    const runtime_html_1 = require("@aurelia/runtime-html");
    /**
     * Trigger binding command. Compile attr with binding symbol with command `trigger` to `TriggerBindingInstruction`
     */
    class TriggerBindingCommand {
        constructor() {
            this.bindingType = 86 /* TriggerCommand */;
        }
        compile(binding) {
            return new runtime_html_1.TriggerBindingInstruction(binding.expression, jit_1.getTarget(binding, false));
        }
    }
    exports.TriggerBindingCommand = TriggerBindingCommand;
    jit_1.BindingCommandResource.define('trigger', TriggerBindingCommand);
    /**
     * Delegate binding command. Compile attr with binding symbol with command `delegate` to `DelegateBindingInstruction`
     */
    class DelegateBindingCommand {
        constructor() {
            this.bindingType = 88 /* DelegateCommand */;
        }
        compile(binding) {
            return new runtime_html_1.DelegateBindingInstruction(binding.expression, jit_1.getTarget(binding, false));
        }
    }
    exports.DelegateBindingCommand = DelegateBindingCommand;
    jit_1.BindingCommandResource.define('delegate', DelegateBindingCommand);
    /**
     * Capture binding command. Compile attr with binding symbol with command `capture` to `CaptureBindingInstruction`
     */
    class CaptureBindingCommand {
        constructor() {
            this.bindingType = 87 /* CaptureCommand */;
        }
        compile(binding) {
            return new runtime_html_1.CaptureBindingInstruction(binding.expression, jit_1.getTarget(binding, false));
        }
    }
    exports.CaptureBindingCommand = CaptureBindingCommand;
    jit_1.BindingCommandResource.define('capture', CaptureBindingCommand);
    /**
     * Attr binding command. Compile attr with binding symbol with command `attr` to `AttributeBindingInstruction`
     */
    class AttrBindingCommand {
        constructor() {
            this.bindingType = 32 /* IsProperty */;
        }
        compile(binding) {
            const target = jit_1.getTarget(binding, false);
            return new runtime_html_1.AttributeBindingInstruction(target, binding.expression, target);
        }
    }
    exports.AttrBindingCommand = AttrBindingCommand;
    jit_1.BindingCommandResource.define('attr', AttrBindingCommand);
    /**
     * Style binding command. Compile attr with binding symbol with command `style` to `AttributeBindingInstruction`
     */
    class StyleBindingCommand {
        constructor() {
            this.bindingType = 32 /* IsProperty */;
        }
        compile(binding) {
            return new runtime_html_1.AttributeBindingInstruction('style', binding.expression, jit_1.getTarget(binding, false));
        }
    }
    exports.StyleBindingCommand = StyleBindingCommand;
    jit_1.BindingCommandResource.define('style', StyleBindingCommand);
    /**
     * Class binding command. Compile attr with binding symbol with command `class` to `AttributeBindingInstruction`
     */
    class ClassBindingCommand {
        constructor() {
            this.bindingType = 32 /* IsProperty */;
        }
        compile(binding) {
            return new runtime_html_1.AttributeBindingInstruction('class', binding.expression, jit_1.getTarget(binding, false));
        }
    }
    exports.ClassBindingCommand = ClassBindingCommand;
    jit_1.BindingCommandResource.define('class', ClassBindingCommand);
});
//# sourceMappingURL=binding-command.js.map