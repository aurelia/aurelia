import { NavigationInstruction } from './interfaces.js';
import { NavRoute } from './nav-route.js';
import { INavClasses } from './resources/nav.js';
import { IRouter } from './router.js';
/**
 * Public API - Used by au-nav and Router add/setNav
 */
export interface INavRoute {
    route?: NavigationInstruction | NavigationInstruction[];
    execute?: ((route: NavRoute) => void);
    condition?: boolean | ((route: NavRoute) => boolean);
    consideredActive?: NavigationInstruction | NavigationInstruction[] | ((route: NavRoute) => boolean);
    compareParameters?: boolean;
    link?: string;
    title: string;
    children?: INavRoute[];
    meta?: Record<string, unknown>;
}
/**
 * Public API - Used by au-nav and Router add/setNav
 */
export declare class Nav {
    router: IRouter;
    name: string;
    routes: NavRoute[];
    classes: INavClasses;
    constructor(router: IRouter, name: string, routes?: NavRoute[], classes?: INavClasses);
    addRoutes(routes: INavRoute[]): void;
    update(): void;
    private addRoute;
    private updateRoutes;
}
//# sourceMappingURL=nav.d.ts.map