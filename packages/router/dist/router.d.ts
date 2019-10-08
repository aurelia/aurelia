import { IContainer, Key } from '@aurelia/kernel';
import { IRenderContext } from '@aurelia/runtime';
import { BrowserNavigator } from './browser-navigator';
import { Guardian } from './guardian';
import { InstructionResolver, IRouteSeparators } from './instruction-resolver';
import { INavigatorInstruction, IRouteableComponent, NavigationInstruction } from './interfaces';
import { AnchorEventInfo, LinkHandler } from './link-handler';
import { INavRoute, Nav } from './nav';
import { INavigatorOptions, INavigatorViewerEvent, IStoredNavigatorEntry, Navigator } from './navigator';
import { QueueItem } from './queue';
import { INavClasses } from './resources/nav';
import { IViewportOptions, Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
export interface IRouteTransformer {
    transformFromUrl?(route: string, router: IRouter): string | ViewportInstruction[];
    transformToUrl?(instructions: ViewportInstruction[], router: IRouter): string | ViewportInstruction[];
}
export declare const IRouteTransformer: import("@aurelia/kernel").InterfaceSymbol<IRouteTransformer>;
export interface IGotoOptions {
    title?: string;
    query?: string;
    data?: Record<string, unknown>;
    replace?: boolean;
    append?: boolean;
    origin?: IRouteableComponent | Element;
}
export interface IRouterOptions extends INavigatorOptions, IRouteTransformer {
    separators?: IRouteSeparators;
    useUrlFragmentHash?: boolean;
    useHref?: boolean;
    statefulHistoryLength?: number;
    reportCallback?(instruction: INavigatorInstruction): void;
}
export interface IRouter {
    readonly isNavigating: boolean;
    activeComponents: ViewportInstruction[];
    readonly container: IContainer;
    readonly instructionResolver: InstructionResolver;
    navigator: Navigator;
    readonly navigation: BrowserNavigator;
    readonly guardian: Guardian;
    readonly navs: Readonly<Record<string, Nav>>;
    readonly options: IRouterOptions;
    readonly statefulHistory: boolean;
    activate(options?: IRouterOptions): void;
    loadUrl(): Promise<void>;
    deactivate(): void;
    linkCallback(info: AnchorEventInfo): void;
    processNavigations(qInstruction: QueueItem<INavigatorInstruction>): Promise<void>;
    getViewport(name: string): Viewport | null;
    connectViewport(name: string, element: Element, context: IRenderContext, options?: IViewportOptions): Viewport;
    disconnectViewport(viewport: Viewport, element: Element | null, context: IRenderContext | null): void;
    allViewports(includeDisabled?: boolean): Viewport[];
    findScope(element: Element | null): Viewport;
    goto(instructions: NavigationInstruction | NavigationInstruction[], options?: IGotoOptions): Promise<void>;
    refresh(): Promise<void>;
    back(): Promise<void>;
    forward(): Promise<void>;
    setNav(name: string, routes: INavRoute[], classes?: INavClasses): void;
    addNav(name: string, routes: INavRoute[], classes?: INavClasses): void;
    updateNav(name?: string): void;
    findNav(name: string): Nav;
    closestViewport(element: Element): Viewport | null;
}
export declare const IRouter: import("@aurelia/kernel").InterfaceSymbol<IRouter>;
export declare class Router implements IRouter {
    readonly container: IContainer;
    navigator: Navigator;
    navigation: BrowserNavigator;
    private readonly routeTransformer;
    linkHandler: LinkHandler;
    instructionResolver: InstructionResolver;
    static readonly inject: readonly Key[];
    rootScope: Viewport | null;
    guardian: Guardian;
    navs: Record<string, Nav>;
    activeComponents: ViewportInstruction[];
    addedViewports: ViewportInstruction[];
    options: IRouterOptions;
    private isActive;
    private loadedFirst;
    private processingNavigation;
    private lastNavigation;
    constructor(container: IContainer, navigator: Navigator, navigation: BrowserNavigator, routeTransformer: IRouteTransformer, linkHandler: LinkHandler, instructionResolver: InstructionResolver);
    readonly isNavigating: boolean;
    readonly statefulHistory: boolean;
    activate(options?: IRouterOptions): void;
    loadUrl(): Promise<void>;
    deactivate(): void;
    linkCallback: (info: AnchorEventInfo) => void;
    navigatorCallback: (instruction: INavigatorInstruction) => void;
    navigatorSerializeCallback: (entry: IStoredNavigatorEntry, preservedEntries: IStoredNavigatorEntry[]) => Promise<IStoredNavigatorEntry>;
    browserNavigatorCallback: (browserNavigationEvent: INavigatorViewerEvent) => void;
    processNavigations: (qInstruction: QueueItem<INavigatorInstruction>) => Promise<void>;
    findScope(element: Element): Viewport;
    getViewport(name: string): Viewport | null;
    connectViewport(name: string, element: Element, context: IRenderContext, options?: IViewportOptions): Viewport;
    disconnectViewport(viewport: Viewport, element: Element | null, context: IRenderContext | null): void;
    allViewports(includeDisabled?: boolean): Viewport[];
    goto(instructions: NavigationInstruction | NavigationInstruction[], options?: IGotoOptions): Promise<void>;
    refresh(): Promise<void>;
    back(): Promise<void>;
    forward(): Promise<void>;
    setNav(name: string, routes: INavRoute[], classes?: INavClasses): void;
    addNav(name: string, routes: INavRoute[], classes?: INavClasses): void;
    updateNav(name?: string): void;
    findNav(name: string): Nav;
    /**
     * Finds the closest ancestor viewport.
     *
     * @param element - The element to search upward from. The element is not searched.
     * @returns The Viewport that is the closest ancestor.
     */
    closestViewport(element: Element): Viewport | null;
    private findViewports;
    private cancelNavigation;
    private ensureRootScope;
    private closestScope;
    private replacePaths;
    private freeComponents;
}
//# sourceMappingURL=router.d.ts.map