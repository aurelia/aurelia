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
            this.update();
        }
        addRoutes(routes) {
            for (const route of routes) {
                this.addRoute(this.routes, route);
            }
            this.update();
        }
        update() {
            this.updateRoutes(this.routes);
            this.routes = this.routes.slice();
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
        updateRoutes(routes) {
            for (const route of routes) {
                route.update();
                if (route.children && route.children.length) {
                    this.updateRoutes(route.children);
                }
            }
        }
    }
    exports.Nav = Nav;
});
//# sourceMappingURL=nav.js.map