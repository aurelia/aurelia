import { IContainer, InterfaceSymbol } from '@aurelia/kernel';
import { ICustomElementType, IRenderContext } from '@aurelia/runtime';
import { HistoryBrowser, IHistoryOptions, INavigationInstruction } from './history-browser';
import { AnchorEventInfo, LinkHandler } from './link-handler';
import { INavRoute, Nav } from './nav';
import { IComponentViewport, Scope } from './scope';
import { IViewportOptions, Viewport } from './viewport';
export interface IRouterOptions extends IHistoryOptions {
    separators?: IRouteSeparators;
    reportCallback?(instruction: INavigationInstruction): void;
    transformFromUrl?(path: string, router: Router): string;
    transformToUrl?(states: IComponentViewportParameters[], router: Router): string;
}
export interface IComponentViewportParameters {
    component: ICustomElementType | string;
    viewport?: Viewport | string;
    parameters?: Record<string, unknown>;
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
    static readonly inject: ReadonlyArray<InterfaceSymbol>;
    rootScope: Scope;
    scopes: Scope[];
    separators: IRouteSeparators;
    historyBrowser: HistoryBrowser;
    linkHandler: LinkHandler;
    navs: Record<string, Nav>;
    activeComponents: string[];
    addedViewports: IComponentViewport[];
    private options;
    private isActive;
    private isRedirecting;
    private readonly pendingNavigations;
    private processingNavigation;
    private lastNavigation;
    constructor(container: IContainer);
    readonly isNavigating: boolean;
    activate(options?: IRouterOptions): Promise<void>;
    deactivate(): void;
    linkCallback: (info: AnchorEventInfo) => void;
    historyCallback(instruction: INavigationInstruction): void;
    processNavigations(): Promise<void>;
    addProcessingViewport(component: string | ICustomElementType, viewport: Viewport | string): void;
    findViews(path: string): Record<string, string>;
    findScope(element: Element): Scope;
    addViewport(name: string, element: Element, context: IRenderContext, options?: IViewportOptions): Viewport;
    removeViewport(viewport: Viewport, element: Element, context: IRenderContext): void;
    allViewports(): Viewport[];
    removeScope(scope: Scope): void;
    goto(pathOrViewports: string | Record<string, Viewport>, title?: string, data?: Record<string, unknown>): Promise<void>;
    replace(pathOrViewports: string | Record<string, Viewport>, title?: string, data?: Record<string, unknown>): Promise<void>;
    refresh(): Promise<void>;
    back(): Promise<void>;
    forward(): Promise<void>;
    statesToString(states: IComponentViewportParameters[]): string;
    statesFromString(statesString: string): IComponentViewportParameters[];
    setNav(name: string, routes: INavRoute[]): void;
    addNav(name: string, routes: INavRoute[]): void;
    findNav(name: string): Nav;
    private cancelNavigation;
    private ensureRootScope;
    private closestScope;
    private removeStateDuplicates;
    private replacePaths;
}
//# sourceMappingURL=router.d.ts.map