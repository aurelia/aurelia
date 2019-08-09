import { IContainer, Key } from '@aurelia/kernel';
import { ICustomElementType, IRenderContext } from '@aurelia/runtime';
import { BrowserNavigation, INavigationViewerEvent } from './browser-navigation';
import { Guardian } from './guardian';
import { InstructionResolver, IRouteSeparators } from './instruction-resolver';
import { AnchorEventInfo, LinkHandler } from './link-handler';
import { INavRoute, Nav } from './nav';
import { INavigationInstruction, INavigatorOptions, Navigator } from './navigator';
import { QueueItem } from './queue';
import { INavClasses } from './resources/nav';
import { Scope } from './scope';
import { IViewportOptions, Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
export interface IRouteTransformer {
    transformFromUrl?(route: string, router: IRouter): string | ViewportInstruction[];
    transformToUrl?(instructions: ViewportInstruction[], router: IRouter): string | ViewportInstruction[];
}
export declare const IRouteTransformer: import("@aurelia/kernel").InterfaceSymbol<IRouteTransformer>;
export interface IRouterOptions extends INavigatorOptions, IRouteTransformer {
    separators?: IRouteSeparators;
    reportCallback?(instruction: INavigationInstruction): void;
}
export interface IRouteViewport {
    name: string;
    component: Partial<ICustomElementType> | string;
}
export interface IRouter {
    readonly isNavigating: boolean;
    activeComponents: string[];
    readonly container: IContainer;
    readonly scopes: Scope[];
    readonly instructionResolver: InstructionResolver;
    navigator: Navigator;
    readonly navigation: BrowserNavigation;
    readonly guardian: Guardian;
    readonly navs: Readonly<Record<string, Nav>>;
    activate(options?: IRouterOptions): void;
    loadUrl(): Promise<void>;
    deactivate(): void;
    linkCallback(info: AnchorEventInfo): void;
    processNavigations(qInstruction: QueueItem<INavigationInstruction>): Promise<void>;
    addProcessingViewport(componentOrInstruction: string | Partial<ICustomElementType> | ViewportInstruction, viewport?: Viewport | string, onlyIfProcessingStatus?: boolean): void;
    addViewport(name: string, element: Element, context: IRenderContext, options?: IViewportOptions): Viewport;
    removeViewport(viewport: Viewport, element: Element, context: IRenderContext): void;
    allViewports(): Viewport[];
    findScope(element: Element): Scope;
    removeScope(scope: Scope): void;
    goto(pathOrViewports: string | Record<string, Viewport>, title?: string, data?: Record<string, unknown>): Promise<void>;
    replace(pathOrViewports: string | Record<string, Viewport>, title?: string, data?: Record<string, unknown>): Promise<void>;
    refresh(): Promise<void>;
    back(): Promise<void>;
    forward(): Promise<void>;
    setNav(name: string, routes: INavRoute[], classes?: INavClasses): void;
    addNav(name: string, routes: INavRoute[], classes?: INavClasses): void;
    updateNav(name?: string): void;
    findNav(name: string): Nav;
}
export declare const IRouter: import("@aurelia/kernel").InterfaceSymbol<IRouter>;
export declare class Router implements IRouter {
    static readonly inject: readonly Key[];
    readonly container: IContainer;
    rootScope: Scope;
    scopes: Scope[];
    navigator: Navigator;
    navigation: BrowserNavigation;
    linkHandler: LinkHandler;
    instructionResolver: InstructionResolver;
    guardian: Guardian;
    navs: Record<string, Nav>;
    activeComponents: string[];
    addedViewports: ViewportInstruction[];
    private options;
    private isActive;
    private readonly routeTransformer;
    private processingNavigation;
    private lastNavigation;
    constructor(container: IContainer, navigator: Navigator, navigation: BrowserNavigation, routeTransformer: IRouteTransformer, linkHandler: LinkHandler, instructionResolver: InstructionResolver);
    readonly isNavigating: boolean;
    activate(options?: IRouterOptions): void;
    loadUrl(): Promise<void>;
    deactivate(): void;
    linkCallback: (info: AnchorEventInfo) => void;
    navigatorCallback: (instruction: INavigationInstruction) => void;
    navigationCallback: (navigation: INavigationViewerEvent) => void;
    processNavigations: (qInstruction: QueueItem<INavigationInstruction>) => Promise<void>;
    addProcessingViewport(componentOrInstruction: string | Partial<ICustomElementType> | ViewportInstruction, viewport?: Viewport | string, onlyIfProcessingStatus?: boolean): void;
    findScope(element: Element): Scope;
    getViewport(name: string): Viewport;
    addViewport(name: string, element: Element, context: IRenderContext, options?: IViewportOptions): Viewport;
    removeViewport(viewport: Viewport, element: Element, context: IRenderContext): void;
    allViewports(): Viewport[];
    removeScope(scope: Scope): void;
    goto(pathOrViewports: string | Record<string, Viewport>, title?: string, data?: Record<string, unknown>, replace?: boolean): Promise<void>;
    replace(pathOrViewports: string | Record<string, Viewport>, title?: string, data?: Record<string, unknown>): Promise<void>;
    refresh(): Promise<void>;
    back(): Promise<void>;
    forward(): Promise<void>;
    setNav(name: string, routes: INavRoute[], classes?: INavClasses): void;
    addNav(name: string, routes: INavRoute[], classes?: INavClasses): void;
    updateNav(name?: string): void;
    findNav(name: string): Nav;
    private cancelNavigation;
    private ensureRootScope;
    private closestScope;
    private replacePaths;
}
//# sourceMappingURL=router.d.ts.map