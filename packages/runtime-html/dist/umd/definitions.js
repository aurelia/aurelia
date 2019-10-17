(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var HTMLTargetedInstructionType;
    (function (HTMLTargetedInstructionType) {
        HTMLTargetedInstructionType["textBinding"] = "ha";
        HTMLTargetedInstructionType["listenerBinding"] = "hb";
        HTMLTargetedInstructionType["attributeBinding"] = "hc";
        HTMLTargetedInstructionType["stylePropertyBinding"] = "hd";
        HTMLTargetedInstructionType["setAttribute"] = "he";
        HTMLTargetedInstructionType["setClassAttribute"] = "hf";
        HTMLTargetedInstructionType["setStyleAttribute"] = "hg";
    })(HTMLTargetedInstructionType = exports.HTMLTargetedInstructionType || (exports.HTMLTargetedInstructionType = {}));
    function isHTMLTargetedInstruction(value) {
        const type = value.type;
        return typeof type === 'string' && type.length === 2;
    }
    exports.isHTMLTargetedInstruction = isHTMLTargetedInstruction;
});
//# sourceMappingURL=definitions.js.map