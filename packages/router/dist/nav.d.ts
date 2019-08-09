import { ICustomElementType } from '@aurelia/runtime';
import { NavRoute } from './nav-route';
import { INavClasses } from './resources/nav';
import { IRouter } from './router';
import { ViewportInstruction } from './viewport-instruction';
export interface IViewportComponent {
    component: string | Partial<ICustomElementType>;
    viewport?: string;
    parameters?: Record<string, unknown> | string;
}
export declare type NavInstruction = string | Partial<ICustomElementType> | IViewportComponent | ViewportInstruction;
export interface INavRoute {
    route?: NavInstruction | NavInstruction[];
    execute?: ((route: NavRoute) => void);
    condition?: boolean | ((route: NavRoute) => boolean);
    consideredActive?: NavInstruction | NavInstruction[] | ((route: NavRoute) => boolean);
    compareParameters?: boolean;
    link?: string;
    title: string;
    children?: INavRoute[];
    meta?: Record<string, unknown>;
}
export declare class Nav {
    name: string;
    routes: NavRoute[];
    classes: INavClasses;
    router: IRouter;
    constructor(router: IRouter, name: string, routes?: NavRoute[], classes?: INavClasses);
    addRoutes(routes: INavRoute[]): void;
    update(): void;
    private addRoute;
    private updateRoutes;
}
//# sourceMappingURL=nav.d.ts.map