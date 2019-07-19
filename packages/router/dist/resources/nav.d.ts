import { NavRoute } from '../nav-route';
import { Router } from '../router';
export interface INavClasses {
    nav?: string;
    ul?: string;
    li?: string;
    a?: string;
    ulActive?: string;
    liActive?: string;
    aActive?: string;
}
export declare class NavCustomElement {
    name: string;
    routes: NavRoute[];
    level: number;
    classes: INavClasses;
    private readonly router;
    constructor(router: Router);
    readonly navRoutes: NavRoute[];
    readonly navClasses: INavClasses;
    active(route: NavRoute): string;
}
//# sourceMappingURL=nav.d.ts.map