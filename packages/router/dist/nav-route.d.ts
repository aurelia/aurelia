import { INavRoute, Nav } from './nav';
import { ViewportInstruction } from './viewport-instruction';
export declare class NavRoute {
    nav: Nav;
    instructions: ViewportInstruction[];
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
    _link(instructions: ViewportInstruction[]): string;
    private parseRoute;
    private activeChild;
}
//# sourceMappingURL=nav-route.d.ts.map