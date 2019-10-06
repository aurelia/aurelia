import { BindingMode } from './flags';
export class InterpolationInstruction {
    constructor(from, to) {
        this.type = "rf" /* interpolation */;
        this.from = from;
        this.to = to;
    }
}
export class OneTimeBindingInstruction {
    constructor(from, to) {
        this.type = "rg" /* propertyBinding */;
        this.from = from;
        this.mode = BindingMode.oneTime;
        this.oneTime = true;
        this.to = to;
    }
}
export class ToViewBindingInstruction {
    constructor(from, to) {
        this.type = "rg" /* propertyBinding */;
        this.from = from;
        this.mode = BindingMode.toView;
        this.oneTime = false;
        this.to = to;
    }
}
export class FromViewBindingInstruction {
    constructor(from, to) {
        this.type = "rg" /* propertyBinding */;
        this.from = from;
        this.mode = BindingMode.fromView;
        this.oneTime = false;
        this.to = to;
    }
}
export class TwoWayBindingInstruction {
    constructor(from, to) {
        this.type = "rg" /* propertyBinding */;
        this.from = from;
        this.mode = BindingMode.twoWay;
        this.oneTime = false;
        this.to = to;
    }
}
export class IteratorBindingInstruction {
    constructor(from, to) {
        this.type = "rk" /* iteratorBinding */;
        this.from = from;
        this.to = to;
    }
}
export class CallBindingInstruction {
    constructor(from, to) {
        this.type = "rh" /* callBinding */;
        this.from = from;
        this.to = to;
    }
}
export class RefBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = "rj" /* refBinding */;
    }
}
export class SetPropertyInstruction {
    constructor(value, to) {
        this.type = "re" /* setProperty */;
        this.to = to;
        this.value = value;
    }
}
export class HydrateElementInstruction {
    constructor(res, instructions, parts) {
        this.type = "ra" /* hydrateElement */;
        this.instructions = instructions;
        this.parts = parts;
        this.res = res;
    }
}
export class HydrateAttributeInstruction {
    constructor(res, instructions) {
        this.type = "rb" /* hydrateAttribute */;
        this.instructions = instructions;
        this.res = res;
    }
}
export class HydrateTemplateController {
    constructor(def, res, instructions, link, parts) {
        this.type = "rc" /* hydrateTemplateController */;
        this.def = def;
        this.instructions = instructions;
        this.link = link;
        this.parts = parts;
        this.res = res;
    }
}
export class LetElementInstruction {
    constructor(instructions, toBindingContext) {
        this.type = "rd" /* hydrateLetElement */;
        this.instructions = instructions;
        this.toBindingContext = toBindingContext;
    }
}
export class LetBindingInstruction {
    constructor(from, to) {
        this.type = "ri" /* letBinding */;
        this.from = from;
        this.to = to;
    }
}
//# sourceMappingURL=instructions.js.map