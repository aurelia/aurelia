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