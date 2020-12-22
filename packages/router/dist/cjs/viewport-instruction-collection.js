"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewportInstructionCollection = void 0;
const utils_js_1 = require("./utils.js");
/**
 * @internal - Shouldn't be used directly
 */
class ViewportInstructionCollection extends Array {
    get empty() {
        return this.length === 0;
    }
    get first() {
        return this[0];
    }
    getDefaults() {
        return new ViewportInstructionCollection(...this.filter(instruction => instruction.default));
    }
    getNonDefaults() {
        return new ViewportInstructionCollection(...this.filter(instruction => !instruction.default));
    }
    getScopeOwners(configuredRoutePath) {
        return this
            .filter(instr => instr.owner !== null && instr.owner.path === configuredRoutePath)
            .map(instr => instr.owner)
            .filter((value, index, arr) => arr.indexOf(value) === index);
    }
    remove(instruction) {
        utils_js_1.arrayRemove(this, value => value === instruction);
    }
}
exports.ViewportInstructionCollection = ViewportInstructionCollection;
//# sourceMappingURL=viewport-instruction-collection.js.map