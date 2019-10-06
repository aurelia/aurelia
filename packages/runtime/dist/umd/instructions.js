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
            this.type = "rf" /* interpolation */;
            this.from = from;
            this.to = to;
        }
    }
    exports.InterpolationInstruction = InterpolationInstruction;
    class OneTimeBindingInstruction {
        constructor(from, to) {
            this.type = "rg" /* propertyBinding */;
            this.from = from;
            this.mode = flags_1.BindingMode.oneTime;
            this.oneTime = true;
            this.to = to;
        }
    }
    exports.OneTimeBindingInstruction = OneTimeBindingInstruction;
    class ToViewBindingInstruction {
        constructor(from, to) {
            this.type = "rg" /* propertyBinding */;
            this.from = from;
            this.mode = flags_1.BindingMode.toView;
            this.oneTime = false;
            this.to = to;
        }
    }
    exports.ToViewBindingInstruction = ToViewBindingInstruction;
    class FromViewBindingInstruction {
        constructor(from, to) {
            this.type = "rg" /* propertyBinding */;
            this.from = from;
            this.mode = flags_1.BindingMode.fromView;
            this.oneTime = false;
            this.to = to;
        }
    }
    exports.FromViewBindingInstruction = FromViewBindingInstruction;
    class TwoWayBindingInstruction {
        constructor(from, to) {
            this.type = "rg" /* propertyBinding */;
            this.from = from;
            this.mode = flags_1.BindingMode.twoWay;
            this.oneTime = false;
            this.to = to;
        }
    }
    exports.TwoWayBindingInstruction = TwoWayBindingInstruction;
    class IteratorBindingInstruction {
        constructor(from, to) {
            this.type = "rk" /* iteratorBinding */;
            this.from = from;
            this.to = to;
        }
    }
    exports.IteratorBindingInstruction = IteratorBindingInstruction;
    class CallBindingInstruction {
        constructor(from, to) {
            this.type = "rh" /* callBinding */;
            this.from = from;
            this.to = to;
        }
    }
    exports.CallBindingInstruction = CallBindingInstruction;
    class RefBindingInstruction {
        constructor(from, to) {
            this.from = from;
            this.to = to;
            this.type = "rj" /* refBinding */;
        }
    }
    exports.RefBindingInstruction = RefBindingInstruction;
    class SetPropertyInstruction {
        constructor(value, to) {
            this.type = "re" /* setProperty */;
            this.to = to;
            this.value = value;
        }
    }
    exports.SetPropertyInstruction = SetPropertyInstruction;
    class HydrateElementInstruction {
        constructor(res, instructions, parts) {
            this.type = "ra" /* hydrateElement */;
            this.instructions = instructions;
            this.parts = parts;
            this.res = res;
        }
    }
    exports.HydrateElementInstruction = HydrateElementInstruction;
    class HydrateAttributeInstruction {
        constructor(res, instructions) {
            this.type = "rb" /* hydrateAttribute */;
            this.instructions = instructions;
            this.res = res;
        }
    }
    exports.HydrateAttributeInstruction = HydrateAttributeInstruction;
    class HydrateTemplateController {
        constructor(def, res, instructions, link, parts) {
            this.type = "rc" /* hydrateTemplateController */;
            this.def = def;
            this.instructions = instructions;
            this.link = link;
            this.parts = parts;
            this.res = res;
        }
    }
    exports.HydrateTemplateController = HydrateTemplateController;
    class LetElementInstruction {
        constructor(instructions, toBindingContext) {
            this.type = "rd" /* hydrateLetElement */;
            this.instructions = instructions;
            this.toBindingContext = toBindingContext;
        }
    }
    exports.LetElementInstruction = LetElementInstruction;
    class LetBindingInstruction {
        constructor(from, to) {
            this.type = "ri" /* letBinding */;
            this.from = from;
            this.to = to;
        }
    }
    exports.LetBindingInstruction = LetBindingInstruction;
});
//# sourceMappingURL=instructions.js.map