import { ICustomElementType } from '@aurelia/runtime';
import { NavComponent, NavRoute } from './nav-route';
import { Router } from './router';
export interface INavRoute {
    components: string | ICustomElementType | Record<string, unknown>;
    consideredActive?: NavComponent;
    link?: string;
    title: string;
    children?: INavRoute[];
    meta?: Record<string, unknown>;
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