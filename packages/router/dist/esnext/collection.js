import { arrayRemove } from './utils.js';
/**
 * @internal - Helper class
 */
export class Collection extends Array {
    constructor() {
        super(...arguments);
        this.currentIndex = -1;
    }
    next() {
        if (this.length > this.currentIndex + 1) {
            return this[++this.currentIndex];
        }
        else {
            this.currentIndex = -1;
            return null;
        }
    }
    removeCurrent() {
        this.splice(this.currentIndex--, 1);
    }
    remove(instruction) {
        arrayRemove(this, value => value === instruction);
    }
}
//# sourceMappingURL=collection.js.map