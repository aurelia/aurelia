"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuSlotsInfo = exports.IAuSlotsInfo = exports.IProjections = void 0;
// A specific file for primitive of au slot to avoid circular dependencies
const kernel_1 = require("@aurelia/kernel");
exports.IProjections = kernel_1.DI.createInterface("IProjections");
exports.IAuSlotsInfo = kernel_1.DI.createInterface('IAuSlotsInfo');
class AuSlotsInfo {
    /**
     * @param {string[]} projectedSlots - Name of the slots to which content are projected.
     */
    constructor(projectedSlots) {
        this.projectedSlots = projectedSlots;
    }
}
exports.AuSlotsInfo = AuSlotsInfo;
//# sourceMappingURL=slot-injectables.js.map