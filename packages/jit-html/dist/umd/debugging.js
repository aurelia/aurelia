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
    function stringifyDOM(node, depth) {
        const indent = ' '.repeat(depth);
        let output = indent;
        output += `Node: ${node.nodeName}`;
        if (node.nodeType === 3 /* Text */) {
            output += ` "${node.textContent}"`;
        }
        if (node.nodeType === 1 /* Element */) {
            let i = 0;
            let attr;
            const attributes = node.attributes;
            const len = attributes.length;
            for (; i < len; ++i) {
                attr = attributes[i];
                output += ` ${attr.name}=${attr.value}`;
            }
        }
        output += '\n';
        if (node.nodeType === 1 /* Element */) {
            let i = 0;
            let childNodes = node.childNodes;
            let len = childNodes.length;
            for (; i < len; ++i) {
                output += stringifyDOM(childNodes[i], depth + 1);
            }
            if (node.nodeName === 'TEMPLATE') {
                i = 0;
                childNodes = node.content.childNodes;
                len = childNodes.length;
                for (; i < len; ++i) {
                    output += stringifyDOM(childNodes[i], depth + 1);
                }
            }
        }
        return output;
    }
    exports.stringifyDOM = stringifyDOM;
    function stringifyInstructions(instruction, depth) {
        const indent = ' '.repeat(depth);
        let output = indent;
        switch (instruction.type) {
            case "ha" /* textBinding */:
                output += 'textBinding\n';
                break;
            case "rh" /* callBinding */:
                output += 'callBinding\n';
                break;
            case "rk" /* iteratorBinding */:
                output += 'iteratorBinding\n';
                break;
            case "hb" /* listenerBinding */:
                output += 'listenerBinding\n';
                break;
            case "rg" /* propertyBinding */:
                output += 'propertyBinding\n';
                break;
            case "rj" /* refBinding */:
                output += 'refBinding\n';
                break;
            case "hd" /* stylePropertyBinding */:
                output += 'stylePropertyBinding\n';
                break;
            case "re" /* setProperty */:
                output += 'setProperty\n';
                break;
            case "he" /* setAttribute */:
                output += 'setAttribute\n';
                break;
            case "rf" /* interpolation */:
                output += 'interpolation\n';
                break;
            case "rd" /* hydrateLetElement */:
                output += 'hydrateLetElement\n';
                instruction.instructions.forEach(i => {
                    output += stringifyInstructions(i, depth + 1);
                });
                break;
            case "rb" /* hydrateAttribute */:
                output += `hydrateAttribute: ${instruction.res}\n`;
                instruction.instructions.forEach(i => {
                    output += stringifyInstructions(i, depth + 1);
                });
                break;
            case "ra" /* hydrateElement */:
                output += `hydrateElement: ${instruction.res}\n`;
                instruction.instructions.forEach(i => {
                    output += stringifyInstructions(i, depth + 1);
                });
                break;
            case "rc" /* hydrateTemplateController */:
                output += `hydrateTemplateController: ${instruction.res}\n`;
                output += stringifyTemplateDefinition(instruction.def, depth + 1);
                instruction.instructions.forEach(i => {
                    output += stringifyInstructions(i, depth + 1);
                });
        }
        return output;
    }
    exports.stringifyInstructions = stringifyInstructions;
    function stringifyTemplateDefinition(def, depth) {
        const indent = ' '.repeat(depth);
        let output = indent;
        output += `CustomElementDefinition: ${def.name}\n`;
        output += stringifyDOM(def.template, depth + 1);
        output += `${indent} Instructions:\n`;
        def.instructions.forEach(row => {
            output += `${indent}  Row:\n`;
            row.forEach(i => {
                output += stringifyInstructions(i, depth + 3);
            });
        });
        return output;
    }
    exports.stringifyTemplateDefinition = stringifyTemplateDefinition;
});
//# sourceMappingURL=debugging.js.map