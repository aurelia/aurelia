import { INavRoute, Nav, NavComponent } from './nav';
export declare class NavRoute {
    nav: Nav;
    components: NavComponent | NavComponent[];
    title: string;
    link?: string;
    linkActive?: string;
    children?: NavRoute[];
    meta?: Record<string, unknown>;
    active: string;
    private readonly observerLocator;
    private readonly observer;
    constructor(nav: Nav, route?: INavRoute);
    readonly hasChildren: string;
    handleChange(): void;
    _active(): string;
    toggleActive(): void;
    _link(components: NavComponent | NavComponent[]): string;
    private activeChild;
    private linkName;
}
//# sourceMappingURL=nav-route.d.ts.map