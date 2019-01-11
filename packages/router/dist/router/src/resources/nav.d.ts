import { NavRoute } from '../nav-route';
import { Router } from '../router';
export declare class NavCustomElement {
    name: string;
    routes: NavRoute[];
    level: number;
    private readonly router;
    constructor(router: Router);
    readonly navRoutes: NavRoute[];
    active(route: NavRoute): string;
}
//# sourceMappingURL=nav.d.ts.map