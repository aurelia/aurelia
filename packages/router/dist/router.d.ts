import { IContainer, InjectArray } from '@aurelia/kernel';
import { ICustomElementType, IRenderContext } from '@aurelia/runtime';
import { HistoryBrowser, IHistoryOptions, INavigationInstruction } from './history-browser';
import { InstructionResolver, IRouteSeparators } from './instruction-resolver';
import { AnchorEventInfo, LinkHandler } from './link-handler';
import { INavRoute, Nav } from './nav';
import { IComponentViewport, Scope } from './scope';
import { IViewportOptions, Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
export interface IRouterOptions extends IHistoryOptions {
    separators?: IRouteSeparators;
    reportCallback?(instruction: INavigationInstruction): void;
    transformFromUrl?(path: string, router: Router): string;
    transformToUrl?(instructions: ViewportInstruction[], router: Router): string;
}
export interface IRouteViewport {
    name: string;
    component: Partial<ICustomElementType> | string;
}
export declare class Router {
    container: IContainer;
    static readonly inject: InjectArray;
    rootScope: Scope;
    scopes: Scope[];
    historyBrowser: HistoryBrowser;
    linkHandler: LinkHandler;
    instructionResolver: InstructionResolver;
    navs: Record<string, Nav>;
    activeComponents: string[];
    addedViewports: IComponentViewport[];
    private options;
    private isActive;
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
    addProcessingViewport(component: string | Partial<ICustomElementType>, viewport: Viewport | string): void;
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
    setNav(name: string, routes: INavRoute[]): void;
    addNav(name: string, routes: INavRoute[]): void;
    findNav(name: string): Nav;
    private cancelNavigation;
    private ensureRootScope;
    private closestScope;
    private replacePaths;
}
//# sourceMappingURL=router.d.ts.map