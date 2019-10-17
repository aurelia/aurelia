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
    const runtime_1 = require("@aurelia/runtime");
    class TextBindingInstruction {
        constructor(from) {
            this.type = "ha" /* textBinding */;
            this.from = from;
        }
    }
    exports.TextBindingInstruction = TextBindingInstruction;
    class TriggerBindingInstruction {
        constructor(from, to) {
            this.type = "hb" /* listenerBinding */;
            this.from = from;
            this.preventDefault = true;
            this.strategy = runtime_1.DelegationStrategy.none;
            this.to = to;
        }
    }
    exports.TriggerBindingInstruction = TriggerBindingInstruction;
    class DelegateBindingInstruction {
        constructor(from, to) {
            this.type = "hb" /* listenerBinding */;
            this.from = from;
            this.preventDefault = false;
            this.strategy = runtime_1.DelegationStrategy.bubbling;
            this.to = to;
        }
    }
    exports.DelegateBindingInstruction = DelegateBindingInstruction;
    class CaptureBindingInstruction {
        constructor(from, to) {
            this.type = "hb" /* listenerBinding */;
            this.from = from;
            this.preventDefault = false;
            this.strategy = runtime_1.DelegationStrategy.capturing;
            this.to = to;
        }
    }
    exports.CaptureBindingInstruction = CaptureBindingInstruction;
    class StylePropertyBindingInstruction {
        constructor(from, to) {
            this.type = "hd" /* stylePropertyBinding */;
            this.from = from;
            this.to = to;
        }
    }
    exports.StylePropertyBindingInstruction = StylePropertyBindingInstruction;
    class SetAttributeInstruction {
        constructor(value, to) {
            this.type = "he" /* setAttribute */;
            this.to = to;
            this.value = value;
        }
    }
    exports.SetAttributeInstruction = SetAttributeInstruction;
    class SetClassAttributeInstruction {
        constructor(value) {
            this.type = "hf" /* setClassAttribute */;
            this.value = value;
        }
    }
    exports.SetClassAttributeInstruction = SetClassAttributeInstruction;
    class SetStyleAttributeInstruction {
        constructor(value) {
            this.type = "hg" /* setStyleAttribute */;
            this.value = value;
        }
    }
    exports.SetStyleAttributeInstruction = SetStyleAttributeInstruction;
    class AttributeBindingInstruction {
        constructor(attr, from, to) {
            this.type = "hc" /* attributeBinding */;
            this.from = from;
            this.attr = attr;
            this.to = to;
        }
    }
    exports.AttributeBindingInstruction = AttributeBindingInstruction;
});
//# sourceMappingURL=instructions.js.map