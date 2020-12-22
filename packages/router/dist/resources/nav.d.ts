import { NavRoute } from '../nav-route.js';
import { IRouter } from '../router.js';
export interface INavClasses {
    nav?: string;
    ul?: string;
    li?: string;
    a?: string;
    span?: string;
    ulActive?: string;
    liActive?: string;
    aActive?: string;
}
export declare class NavCustomElement {
    private readonly router;
    name: string | null;
    routes: NavRoute[] | null;
    level: number;
    classes: INavClasses;
    constructor(router: IRouter);
    get navRoutes(): NavRoute[];
    get navClasses(): INavClasses;
    active(route: NavRoute): string;
}
//# sourceMappingURL=nav.d.ts.map