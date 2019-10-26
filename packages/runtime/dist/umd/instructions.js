(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./flags"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const flags_1 = require("./flags");
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
            this.mode = flags_1.BindingMode.oneTime;
            this.oneTime = true;
        }
    }
    exports.OneTimeBindingInstruction = OneTimeBindingInstruction;
    class ToViewBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
            this.type = "rg" /* propertyBinding */;
            this.mode = flags_1.BindingMode.toView;
            this.oneTime = false;
        }
    }
    exports.ToViewBindingInstruction = ToViewBindingInstruction;
    class FromViewBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
            this.type = "rg" /* propertyBinding */;
            this.mode = flags_1.BindingMode.fromView;
            this.oneTime = false;
        }
    }
    exports.FromViewBindingInstruction = FromViewBindingInstruction;
    class TwoWayBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
            this.type = "rg" /* propertyBinding */;
            this.mode = flags_1.BindingMode.twoWay;
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
        constructor(res, instructions, parts) {
            this.res = res;
            this.instructions = instructions;
            this.parts = parts;
            this.type = "ra" /* hydrateElement */;
        }
    }
    exports.HydrateElementInstruction = HydrateElementInstruction;
    class HydrateAttributeInstruction {
        constructor(res, instructions) {
            this.res = res;
            this.instructions = instructions;
            this.type = "rb" /* hydrateAttribute */;
        }
    }
    exports.HydrateAttributeInstruction = HydrateAttributeInstruction;
    class HydrateTemplateController {
        constructor(def, res, instructions, link, parts) {
            this.def = def;
            this.res = res;
            this.instructions = instructions;
            this.link = link;
            this.parts = parts;
            this.type = "rc" /* hydrateTemplateController */;
        }
    }
    exports.HydrateTemplateController = HydrateTemplateController;
    class LetElementInstruction {
        constructor(instructions, toBindingContext) {
            this.instructions = instructions;
            this.toBindingContext = toBindingContext;
            this.type = "rd" /* hydrateLetElement */;
        }
    }
    exports.LetElementInstruction = LetElementInstruction;
    class LetBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
            this.type = "ri" /* letBinding */;
        }
    }
    exports.LetBindingInstruction = LetBindingInstruction;
});
//# sourceMappingURL=instructions.js.map