export var HTMLTargetedInstructionType;
(function (HTMLTargetedInstructionType) {
    HTMLTargetedInstructionType["textBinding"] = "ha";
    HTMLTargetedInstructionType["listenerBinding"] = "hb";
    HTMLTargetedInstructionType["attributeBinding"] = "hc";
    HTMLTargetedInstructionType["stylePropertyBinding"] = "hd";
    HTMLTargetedInstructionType["setAttribute"] = "he";
    HTMLTargetedInstructionType["setClassAttribute"] = "hf";
    HTMLTargetedInstructionType["setStyleAttribute"] = "hg";
})(HTMLTargetedInstructionType || (HTMLTargetedInstructionType = {}));
export function isHTMLTargetedInstruction(value) {
    const type = value.type;
    return typeof type === 'string' && type.length === 2;
}
//# sourceMappingURL=definitions.js.map