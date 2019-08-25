import { Guard } from './guard';
// Only one so far, but it's easier to support more from the start
export var GuardTypes;
(function (GuardTypes) {
    GuardTypes["Before"] = "before";
})(GuardTypes || (GuardTypes = {}));
export class Guardian {
    constructor() {
        this.guards = { before: [] };
        this.lastIdentity = 0;
    }
    addGuard(guardFunction, options) {
        const guard = new Guard(guardFunction, options || {}, ++this.lastIdentity);
        this.guards[guard.type].push(guard);
        return this.lastIdentity;
    }
    removeGuard(id) {
        for (const type in this.guards) {
            const index = this.guards[type].findIndex(guard => guard.id === id);
            if (index > -1) {
                this.guards[type].splice(index, 1);
            }
        }
    }
    passes(type, viewportInstructions, navigationInstruction) {
        let modified = false;
        for (const guard of this.guards[type]) {
            if (guard.matches(viewportInstructions)) {
                const outcome = guard.check(viewportInstructions, navigationInstruction);
                if (typeof outcome === 'boolean') {
                    if (!outcome) {
                        return false;
                    }
                }
                else {
                    viewportInstructions = outcome;
                    modified = true;
                }
            }
        }
        return modified ? viewportInstructions : true;
    }
}
//# sourceMappingURL=guardian.js.map