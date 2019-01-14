import { ICustomElementType } from '@aurelia/runtime';
import { INavRoute, Nav } from './nav';
export interface IViewportComponent {
    viewport?: string;
    component: string | ICustomElementType;
}
export declare class NavRoute {
    nav: Nav;
    components: string | ICustomElementType | IViewportComponent;
    title: string;
    link?: string;
    linkActive?: string;
    children?: NavRoute[];
    meta?: Object;
    active: string;
    private readonly observerLocator;
    private readonly observer;
    constructor(nav: Nav, route?: INavRoute);
    readonly hasChildren: string;
    handleChange(): void;
    _active(): string;
    toggleActive(): void;
    _link(components: string | ICustomElementType | IViewportComponent): string;
    private activeChild;
    private linkName;
}
//# sourceMappingURL=nav-route.d.ts.map