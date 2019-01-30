import { ICustomElementType } from '@aurelia/runtime';
import { NavRoute } from './nav-route';
import { Router } from './router';
export interface IViewportComponent {
    viewport?: string;
    component: string | Partial<ICustomElementType>;
}
export declare type NavComponent = string | Partial<ICustomElementType> | IViewportComponent;
export interface INavRoute {
    components: NavComponent | NavComponent[];
    consideredActive?: NavComponent | NavComponent[];
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