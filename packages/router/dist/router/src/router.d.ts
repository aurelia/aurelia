import { IContainer } from '@aurelia/kernel';
import { ICustomElementType } from '@aurelia/runtime';
import { HistoryBrowser, IHistoryEntry, IHistoryOptions, INavigationInstruction } from './history-browser';
import { AnchorEventInfo, LinkHandler } from './link-handler';
import { INavRoute, Nav } from './nav';
import { Scope } from './scope';
import { IViewportOptions, Viewport } from './viewport';
export interface IRouterOptions extends IHistoryOptions {
    reportCallback?: Function;
    separators?: IRouteSeparators;
}
export interface IRoute {
    name?: string;
    path: string;
    redirect?: string;
    title?: string;
    viewports?: Record<string, string>;
    meta?: Record<string, string>;
}
export interface IRouteViewport {
    name: string;
    component: ICustomElementType | string;
}
export interface IRouteSeparators {
    viewport: string;
    sibling: string;
    scope: string;
    ownsScope: string;
    parameters: string;
    add: string;
    clear: string;
    action: string;
}
export declare class Router {
    container: IContainer;
    static readonly inject: ReadonlyArray<Function>;
    routes: IRoute[];
    viewports: Record<string, Viewport>;
    rootScope: Scope;
    scopes: Scope[];
    separators: IRouteSeparators;
    historyBrowser: HistoryBrowser;
    linkHandler: LinkHandler;
    navs: Record<string, Nav>;
    activeComponents: string[];
    private options;
    private isActive;
    private isRedirecting;
    private readonly pendingNavigations;
    private processingNavigation;
    constructor(container: IContainer);
    activate(options?: IRouterOptions): Promise<void>;
    deactivate(): void;
    linkCallback: (info: AnchorEventInfo) => void;
    historyCallback(instruction: INavigationInstruction): void;
    processNavigations(): Promise<void>;
    findRoute(entry: IHistoryEntry): IRoute;
    resolveRedirect(route: IRoute, data?: Record<string, unknown>): IRoute;
    findViews(entry: IHistoryEntry): Record<string, string>;
    findScope(element: Element): Scope;
    addViewport(name: string, element: Element, options?: IViewportOptions): Viewport;
    removeViewport(viewport: Viewport): void;
    removeScope(scope: Scope): void;
    addRoute(route: IRoute): void;
    goto(pathOrViewports: string | Object, title?: string, data?: Record<string, unknown>): void;
    replace(pathOrViewports: string | Object, title?: string, data?: Record<string, unknown>): void;
    refresh(): void;
    back(): void;
    forward(): void;
    addNav(name: string, routes: INavRoute[]): void;
    findNav(name: string): Nav;
    private closestScope;
    private removeStateDuplicates;
    private replacePaths;
}
//# sourceMappingURL=router.d.ts.map