(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./guard"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const guard_1 = require("./guard");
    // Only one so far, but it's easier to support more from the start
    var GuardTypes;
    (function (GuardTypes) {
        GuardTypes["Before"] = "before";
    })(GuardTypes = exports.GuardTypes || (exports.GuardTypes = {}));
    class Guardian {
        constructor() {
            this.guards = { before: [] };
            this.lastIdentity = 0;
        }
        addGuard(guardFunction, options) {
            const guard = new guard_1.Guard(guardFunction, options || {}, ++this.lastIdentity);
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
    exports.Guardian = Guardian;
});
//# sourceMappingURL=guardian.js.map