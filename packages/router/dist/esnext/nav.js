import { NavRoute } from './nav-route';
export class Nav {
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
        const newRoute = new NavRoute(this, route);
        routes.push(newRoute);
        if (route.children) {
            newRoute.children = [];
            for (const child of route.children) {
                this.addRoute(newRoute.children, child);
            }
        }
    }
}
//# sourceMappingURL=nav.js.map