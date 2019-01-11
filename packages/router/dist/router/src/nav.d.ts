import { ICustomElementType } from '@aurelia/runtime';
import { NavRoute } from './nav-route';
import { Router } from './router';
export interface INavRoute {
    components: string | ICustomElementType | Object;
    link?: string;
    title: string;
    children?: NavRoute[];
    meta?: Object;
}
export declare class Nav {
    name: string;
    routes: NavRoute[];
    router: Router;
    constructor(router: Router, name: string);
    addRoutes(routes: INavRoute[]): void;
    addRoute(routes: NavRoute[], route: INavRoute): void;
}
//# sourceMappingURL=nav.d.ts.map