import { ICustomElementType } from '@aurelia/runtime';
import { NavRoute } from './nav-route';
import { INavClasses } from './resources/nav';
import { Router } from './router';
import { ViewportInstruction } from './viewport-instruction';
export interface IViewportComponent {
    component: string | Partial<ICustomElementType>;
    viewport?: string;
    parameters?: Record<string, unknown> | string;
}
export declare type NavInstruction = string | Partial<ICustomElementType> | IViewportComponent | ViewportInstruction;
export interface INavRoute {
    route: NavInstruction | NavInstruction[];
    consideredActive?: NavInstruction | NavInstruction[];
    link?: string;
    title: string;
    children?: INavRoute[];
    meta?: Record<string, unknown>;
}
export declare class Nav {
    name: string;
    routes: NavRoute[];
    classes: INavClasses;
    router: Router;
    constructor(router: Router, name: string, routes?: NavRoute[], classes?: INavClasses);
    addRoutes(routes: INavRoute[]): void;
    addRoute(routes: NavRoute[], route: INavRoute): void;
}
//# sourceMappingURL=nav.d.ts.map