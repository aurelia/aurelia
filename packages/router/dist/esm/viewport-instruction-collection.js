import { arrayRemove } from './utils.js';
/**
 * @internal - Shouldn't be used directly
 */
export class ViewportInstructionCollection extends Array {
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
        arrayRemove(this, value => value === instruction);
    }
}
//# sourceMappingURL=viewport-instruction-collection.js.map