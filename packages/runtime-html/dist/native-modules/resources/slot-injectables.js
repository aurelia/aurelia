// A specific file for primitive of au slot to avoid circular dependencies
import { DI } from '../../../../kernel/dist/native-modules/index.js';
export const IProjections = DI.createInterface("IProjections");
export const IAuSlotsInfo = DI.createInterface('IAuSlotsInfo');
export class AuSlotsInfo {
    /**
     * @param {string[]} projectedSlots - Name of the slots to which content are projected.
     */
    constructor(projectedSlots) {
        this.projectedSlots = projectedSlots;
    }
}
//# sourceMappingURL=slot-injectables.js.map