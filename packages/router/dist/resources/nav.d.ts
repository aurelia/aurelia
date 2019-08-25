import { NavRoute } from '../nav-route';
import { IRouter } from '../router';
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
    readonly navRoutes: NavRoute[];
    readonly navClasses: INavClasses;
    active(route: NavRoute): string;
}
//# sourceMappingURL=nav.d.ts.map