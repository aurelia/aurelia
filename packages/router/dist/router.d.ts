import { IContainer } from '@aurelia/kernel';
import { ICustomElementType } from '@aurelia/runtime';
import { HistoryBrowser, IHistoryEntry, IHistoryOptions, INavigationInstruction } from './history-browser';
import { AnchorEventInfo, LinkHandler } from './link-handler';
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
    viewports?: Object;
    meta?: Object;
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
    routes: IRoute[];
    viewports: Object;
    rootScope: Scope;
    scopes: Scope[];
    separators: IRouteSeparators;
    historyBrowser: HistoryBrowser;
    linkHandler: LinkHandler;
    private options;
    private isActive;
    private isRedirecting;
    constructor(container: IContainer);
    activate(options?: IRouterOptions): Promise<void>;
    deactivate(): void;
    linkCallback: (info: AnchorEventInfo) => void;
    historyCallback(instruction: INavigationInstruction): Promise<void>;
    findRoute(entry: IHistoryEntry): IRoute;
    resolveRedirect(route: IRoute, data?: Object): IRoute;
    findViews(entry: IHistoryEntry): Object;
    findScope(element: Element): Scope;
    addViewport(name: string, element: Element, options?: IViewportOptions): Viewport;
    removeViewport(viewport: Viewport): void;
    removeScope(scope: Scope): void;
    addRoute(route: IRoute): void;
    goto(pathOrViewports: string | Object, title?: string, data?: Object): void;
    replace(pathOrViewports: string | Object, title?: string, data?: Object): void;
    refresh(): void;
    back(): void;
    forward(): void;
    private closestScope;
    private removeStateDuplicates;
    private replacePaths;
}
//# sourceMappingURL=router.d.ts.map