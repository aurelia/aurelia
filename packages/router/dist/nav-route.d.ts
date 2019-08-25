import { NavigationInstruction } from './interfaces';
import { INavRoute, Nav } from './nav';
import { ViewportInstruction } from './viewport-instruction';
export declare class NavRoute {
    nav: Nav;
    instructions: ViewportInstruction[];
    title: string;
    link: string | null;
    execute?: ((route: NavRoute) => void);
    linkVisible: boolean | ((route: NavRoute) => boolean) | null;
    linkActive: NavigationInstruction | NavigationInstruction[] | ((route: NavRoute) => boolean) | null;
    compareParameters: boolean;
    children: NavRoute[] | null;
    meta?: Record<string, unknown>;
    visible: boolean;
    active: string;
    constructor(nav: Nav, route: INavRoute);
    readonly hasChildren: string;
    update(): void;
    executeAction(event: Event): void;
    toggleActive(): void;
    private parseRoute;
    private computeVisible;
    private computeActive;
    private computeLink;
    private activeChild;
}
//# sourceMappingURL=nav-route.d.ts.map