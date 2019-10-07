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
    /**
     * Class that handles routes configured in a route table
     */
    class RouteTable {
        constructor() {
            /**
             * Check a route against the route table and return the appropriate viewport instructions.
             *
             * @param route - The route to match.
             * @param router - The application router.
             * @returns The viewport instructions for a found route or the route if not found.
             */
            this.transformFromUrl = (route, router) => {
                // TODO: Implement route recognizing to transform a configured route to a set of viewport instructions
                return route;
            };
            /**
             * Find the route in the route table for a set of viewport instructions.
             *
             * @param instructions - The set of viewport instructions to match.
             * @param router - The application router.
             * @returns The route for a found set of viewport instructions or the viewport instructions if not found.
             */
            this.transformToUrl = (instructions, router) => {
                // TODO: Implement mapping from set of viewport instructions to a configured route
                return instructions;
            };
        }
    }
    exports.RouteTable = RouteTable;
});
//# sourceMappingURL=route-table.js.map