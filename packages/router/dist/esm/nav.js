import { NavRoute } from './nav-route.js';
/**
 * Public API - Used by au-nav and Router add/setNav
 */
export class Nav {
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
        const newRoute = new NavRoute(this, route);
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
//# sourceMappingURL=nav.js.map