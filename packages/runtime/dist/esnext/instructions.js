import { BindingMode } from './flags';
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
    constructor(res, instructions, parts) {
        this.res = res;
        this.instructions = instructions;
        this.parts = parts;
        this.type = "ra" /* hydrateElement */;
    }
}
export class HydrateAttributeInstruction {
    constructor(res, instructions) {
        this.res = res;
        this.instructions = instructions;
        this.type = "rb" /* hydrateAttribute */;
    }
}
export class HydrateTemplateController {
    constructor(def, res, instructions, link, parts) {
        this.def = def;
        this.res = res;
        this.instructions = instructions;
        this.link = link;
        this.parts = parts;
        this.type = "rc" /* hydrateTemplateController */;
    }
}
export class LetElementInstruction {
    constructor(instructions, toBindingContext) {
        this.instructions = instructions;
        this.toBindingContext = toBindingContext;
        this.type = "rd" /* hydrateLetElement */;
    }
}
export class LetBindingInstruction {
    constructor(from, to) {
        this.from = from;
        this.to = to;
        this.type = "ri" /* letBinding */;
    }
}
//# sourceMappingURL=instructions.js.map