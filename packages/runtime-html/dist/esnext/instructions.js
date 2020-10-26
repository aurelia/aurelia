import { BindingMode, DelegationStrategy, } from '@aurelia/runtime';
/**
 * InstructionType enum values become the property names for the associated renderers when they are injected
 * into the `Composer`.
 *
 * Additional instruction types can be added as long as they are 2 characters long and do not clash with existing ones.
 *
 * By convention, the instruction types for a particular runtime start with the same first letter, and the second letter
 * starts counting from letter `a`. The standard runtime instruction types all start with the letter `r`.
 */
export var InstructionType;
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
})(InstructionType || (InstructionType = {}));
export function isInstruction(value) {
    const type = value.type;
    return typeof type === 'string' && type.length === 2;
}
export class InterpolationInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = "rf" /* interpolation */;
    }
}
export class OneTimeBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = "rg" /* propertyBinding */;
        this.mode = BindingMode.oneTime;
        this.oneTime = true;
    }
}
export class ToViewBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = "rg" /* propertyBinding */;
        this.mode = BindingMode.toView;
        this.oneTime = false;
    }
}
export class FromViewBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = "rg" /* propertyBinding */;
        this.mode = BindingMode.fromView;
        this.oneTime = false;
    }
}
export class TwoWayBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = "rg" /* propertyBinding */;
        this.mode = BindingMode.twoWay;
        this.oneTime = false;
    }
}
export class IteratorBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = "rk" /* iteratorBinding */;
    }
}
export class CallBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = "rh" /* callBinding */;
    }
}
export class RefBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = "rj" /* refBinding */;
        this.type = "rj" /* refBinding */;
    }
}
export class SetPropertyInstruction {
    constructor(value, to) {
        this.value = value;
        this.to = to;
        this.type = "re" /* setProperty */;
    }
}
export class HydrateElementInstruction {
    constructor(res, instructions, slotInfo) {
        this.res = res;
        this.instructions = instructions;
        this.slotInfo = slotInfo;
        this.type = "ra" /* composeElement */;
    }
}
export class HydrateAttributeInstruction {
    constructor(res, instructions) {
        this.res = res;
        this.instructions = instructions;
        this.type = "rb" /* composeAttribute */;
    }
}
export class HydrateTemplateController {
    constructor(def, res, instructions) {
        this.def = def;
        this.res = res;
        this.instructions = instructions;
        this.type = "rc" /* composeTemplateController */;
    }
}
export class HydrateLetElementInstruction {
    constructor(instructions, toBindingContext) {
        this.instructions = instructions;
        this.toBindingContext = toBindingContext;
        this.type = "rd" /* composeLetElement */;
    }
}
export class LetBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = "ri" /* letBinding */;
    }
}
export class TextBindingInstruction {
    constructor(from) {
        this.from = from;
        this.type = "ha" /* textBinding */;
    }
}
export class TriggerBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = "hb" /* listenerBinding */;
        this.preventDefault = true;
        this.strategy = DelegationStrategy.none;
    }
}
export class DelegateBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = "hb" /* listenerBinding */;
        this.preventDefault = false;
        this.strategy = DelegationStrategy.bubbling;
    }
}
export class CaptureBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = "hb" /* listenerBinding */;
        this.preventDefault = false;
        this.strategy = DelegationStrategy.capturing;
    }
}
export class StylePropertyBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = "hd" /* stylePropertyBinding */;
    }
}
export class SetAttributeInstruction {
    constructor(value, to) {
        this.value = value;
        this.to = to;
        this.type = "he" /* setAttribute */;
    }
}
export class SetClassAttributeInstruction {
    constructor(value) {
        this.value = value;
        this.type = "hf" /* setClassAttribute */;
    }
}
export class SetStyleAttributeInstruction {
    constructor(value) {
        this.value = value;
        this.type = "hg" /* setStyleAttribute */;
    }
}
export class AttributeBindingInstruction {
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
//# sourceMappingURL=instructions.js.map