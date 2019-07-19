(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./nav-route"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const nav_route_1 = require("./nav-route");
    class Nav {
        constructor(router, name, routes = [], classes = {}) {
            this.router = router;
            this.name = name;
            this.routes = routes;
            this.classes = classes;
        }
        addRoutes(routes) {
            for (const route of routes) {
                this.addRoute(this.routes, route);
            }
        }
        addRoute(routes, route) {
            const newRoute = new nav_route_1.NavRoute(this, route);
            routes.push(newRoute);
            if (route.children) {
                newRoute.children = [];
                for (const child of route.children) {
                    this.addRoute(newRoute.children, child);
                }
            }
        }
    }
    exports.Nav = Nav;
});
//# sourceMappingURL=nav.js.map