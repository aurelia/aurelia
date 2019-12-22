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
    class FoundRoute {
        constructor(match = null, matching = '', instructions = [], remaining = '') {
            this.match = match;
            this.matching = matching;
            this.instructions = instructions;
            this.remaining = remaining;
        }
        get foundConfiguration() {
            return this.match !== null;
        }
        get foundInstructions() {
            return this.instructions.length > 0;
        }
        get hasRemaining() {
            return this.remaining !== null && this.remaining.length > 0;
        }
    }
    exports.FoundRoute = FoundRoute;
});
//# sourceMappingURL=found-route.js.map