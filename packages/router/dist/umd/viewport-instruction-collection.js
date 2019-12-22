(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./utils"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const utils_1 = require("./utils");
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
            utils_1.arrayRemove(this, value => value === instruction);
        }
    }
    exports.ViewportInstructionCollection = ViewportInstructionCollection;
});
//# sourceMappingURL=viewport-instruction-collection.js.map