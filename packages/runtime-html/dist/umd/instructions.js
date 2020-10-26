(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "@aurelia/runtime"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.AttributeBindingInstruction = exports.SetStyleAttributeInstruction = exports.SetClassAttributeInstruction = exports.SetAttributeInstruction = exports.StylePropertyBindingInstruction = exports.CaptureBindingInstruction = exports.DelegateBindingInstruction = exports.TriggerBindingInstruction = exports.TextBindingInstruction = exports.LetBindingInstruction = exports.HydrateLetElementInstruction = exports.HydrateTemplateController = exports.HydrateAttributeInstruction = exports.HydrateElementInstruction = exports.SetPropertyInstruction = exports.RefBindingInstruction = exports.CallBindingInstruction = exports.IteratorBindingInstruction = exports.TwoWayBindingInstruction = exports.FromViewBindingInstruction = exports.ToViewBindingInstruction = exports.OneTimeBindingInstruction = exports.InterpolationInstruction = exports.isInstruction = exports.InstructionType = void 0;
    const runtime_1 = require("@aurelia/runtime");
    /**
     * InstructionType enum values become the property names for the associated renderers when they are injected
     * into the `Composer`.
     *
     * Additional instruction types can be added as long as they are 2 characters long and do not clash with existing ones.
     *
     * By convention, the instruction types for a particular runtime start with the same first letter, and the second letter
     * starts counting from letter `a`. The standard runtime instruction types all start with the letter `r`.
     */
    var InstructionType;
    (function (InstructionType) {
        InstructionType["composeElement"] = "ra";
        InstructionType["composeAttribute"] = "rb";
        InstructionType["composeTemplateController"] = "rc";
        InstructionType["composeLetElement"] = "rd";
        InstructionType["setProperty"] = "re";
        InstructionType["interpolation"] = "rf";
        InstructionType["propertyBinding"] = "rg";
        InstructionType["callBinding"] = "rh";
        InstructionType["letBinding"] = "ri";
        InstructionType["refBinding"] = "rj";
        InstructionType["iteratorBinding"] = "rk";
        InstructionType["textBinding"] = "ha";
        InstructionType["listenerBinding"] = "hb";
        InstructionType["attributeBinding"] = "hc";
        InstructionType["stylePropertyBinding"] = "hd";
        InstructionType["setAttribute"] = "he";
        InstructionType["setClassAttribute"] = "hf";
        InstructionType["setStyleAttribute"] = "hg";
    })(InstructionType = exports.InstructionType || (exports.InstructionType = {}));
    function isInstruction(value) {
        const type = value.type;
        return typeof type === 'string' && type.length === 2;
    }
    exports.isInstruction = isInstruction;
    class InterpolationInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
            this.type = "rf" /* interpolation */;
        }
    }
    exports.InterpolationInstruction = InterpolationInstruction;
    class OneTimeBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
            this.type = "rg" /* propertyBinding */;
            this.mode = runtime_1.BindingMode.oneTime;
            this.oneTime = true;
        }
    }
    exports.OneTimeBindingInstruction = OneTimeBindingInstruction;
    class ToViewBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
            this.type = "rg" /* propertyBinding */;
            this.mode = runtime_1.BindingMode.toView;
            this.oneTime = false;
        }
    }
    exports.ToViewBindingInstruction = ToViewBindingInstruction;
    class FromViewBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
            this.type = "rg" /* propertyBinding */;
            this.mode = runtime_1.BindingMode.fromView;
            this.oneTime = false;
        }
    }
    exports.FromViewBindingInstruction = FromViewBindingInstruction;
    class TwoWayBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
            this.type = "rg" /* propertyBinding */;
            this.mode = runtime_1.BindingMode.twoWay;
            this.oneTime = false;
        }
    }
    exports.TwoWayBindingInstruction = TwoWayBindingInstruction;
    class IteratorBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
            this.type = "rk" /* iteratorBinding */;
        }
    }
    exports.IteratorBindingInstruction = IteratorBindingInstruction;
    class CallBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
            this.type = "rh" /* callBinding */;
        }
    }
    exports.CallBindingInstruction = CallBindingInstruction;
    class RefBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
            this.type = "rj" /* refBinding */;
            this.type = "rj" /* refBinding */;
        }
    }
    exports.RefBindingInstruction = RefBindingInstruction;
    class SetPropertyInstruction {
        constructor(value, to) {
            this.value = value;
            this.to = to;
            this.type = "re" /* setProperty */;
        }
    }
    exports.SetPropertyInstruction = SetPropertyInstruction;
    class HydrateElementInstruction {
        constructor(res, instructions, slotInfo) {
            this.res = res;
            this.instructions = instructions;
            this.slotInfo = slotInfo;
            this.type = "ra" /* composeElement */;
        }
    }
    exports.HydrateElementInstruction = HydrateElementInstruction;
    class HydrateAttributeInstruction {
        constructor(res, instructions) {
            this.res = res;
            this.instructions = instructions;
            this.type = "rb" /* composeAttribute */;
        }
    }
    exports.HydrateAttributeInstruction = HydrateAttributeInstruction;
    class HydrateTemplateController {
        constructor(def, res, instructions) {
            this.def = def;
            this.res = res;
            this.instructions = instructions;
            this.type = "rc" /* composeTemplateController */;
        }
    }
    exports.HydrateTemplateController = HydrateTemplateController;
    class HydrateLetElementInstruction {
        constructor(instructions, toBindingContext) {
            this.instructions = instructions;
            this.toBindingContext = toBindingContext;
            this.type = "rd" /* composeLetElement */;
        }
    }
    exports.HydrateLetElementInstruction = HydrateLetElementInstruction;
    class LetBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
            this.type = "ri" /* letBinding */;
        }
    }
    exports.LetBindingInstruction = LetBindingInstruction;
    class TextBindingInstruction {
        constructor(from) {
            this.from = from;
            this.type = "ha" /* textBinding */;
        }
    }
    exports.TextBindingInstruction = TextBindingInstruction;
    class TriggerBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
            this.type = "hb" /* listenerBinding */;
            this.preventDefault = true;
            this.strategy = runtime_1.DelegationStrategy.none;
        }
    }
    exports.TriggerBindingInstruction = TriggerBindingInstruction;
    class DelegateBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
            this.type = "hb" /* listenerBinding */;
            this.preventDefault = false;
            this.strategy = runtime_1.DelegationStrategy.bubbling;
        }
    }
    exports.DelegateBindingInstruction = DelegateBindingInstruction;
    class CaptureBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
            this.type = "hb" /* listenerBinding */;
            this.preventDefault = false;
            this.strategy = runtime_1.DelegationStrategy.capturing;
        }
    }
    exports.CaptureBindingInstruction = CaptureBindingInstruction;
    class StylePropertyBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
            this.type = "hd" /* stylePropertyBinding */;
        }
    }
    exports.StylePropertyBindingInstruction = StylePropertyBindingInstruction;
    class SetAttributeInstruction {
        constructor(value, to) {
            this.value = value;
            this.to = to;
            this.type = "he" /* setAttribute */;
        }
    }
    exports.SetAttributeInstruction = SetAttributeInstruction;
    class SetClassAttributeInstruction {
        constructor(value) {
            this.value = value;
            this.type = "hf" /* setClassAttribute */;
        }
    }
    exports.SetClassAttributeInstruction = SetClassAttributeInstruction;
    class SetStyleAttributeInstruction {
        constructor(value) {
            this.value = value;
            this.type = "hg" /* setStyleAttribute */;
        }
    }
    exports.SetStyleAttributeInstruction = SetStyleAttributeInstruction;
    class AttributeBindingInstruction {
        constructor(
        /**
         * `attr` and `to` have the same value on a normal attribute
         * Will be different on `class` and `style`
         * on `class`: attr = `class` (from binding command), to = attribute name
         * on `style`: attr = `style` (from binding command), to = attribute name
         */
        attr, from, to) {
            this.attr = attr;
            this.from = from;
            this.to = to;
            this.type = "hc" /* attributeBinding */;
        }
    }
    exports.AttributeBindingInstruction = AttributeBindingInstruction;
});
//# sourceMappingURL=instructions.js.map