import { IContainer, Key } from '@aurelia/kernel';
import { ICustomElementViewModel } from '@aurelia/runtime-html';
import { InstructionResolver } from './instruction-resolver.js';
import { NavigationInstruction, IRoute, ComponentAppellation, ViewportHandle, ComponentParameters } from './interfaces.js';
import { LinkHandler } from './link-handler.js';
import { INavRoute, Nav } from './nav.js';
import { Navigator } from './navigator.js';
import { INavClasses } from './resources/nav.js';
import { Viewport } from './viewport.js';
import { ViewportInstruction } from './viewport-instruction.js';
import { HookManager, IHookDefinition, HookIdentity, HookFunction, IHookOptions, BeforeNavigationHookFunction, TransformFromUrlHookFunction, TransformToUrlHookFunction, SetTitleHookFunction } from './hook-manager.js';
import { ViewportScope } from './viewport-scope.js';
import { BrowserViewerStore } from './browser-viewer-store.js';
import { IConnectedCustomElement } from './resources/viewport.js';
import { IRouterActivateOptions, RouterOptions } from './router-options.js';
import { OpenPromise } from './open-promise.js';
/**
 * Public API
 */
export interface ILoadOptions {
    title?: string;
    query?: string;
    data?: Record<string, unknown>;
    replace?: boolean;
    append?: boolean;
    origin?: ICustomElementViewModel | Element;
}
/**
 * Public API
 */
export declare const IRouter: import("@aurelia/kernel").InterfaceSymbol<IRouter>;
export interface IRouter extends Router {
}
export declare class Router implements IRouter {
    navigation: BrowserViewerStore;
    options: RouterOptions;
    static readonly inject: readonly Key[];
    rootScope: ViewportScope | null;
    /**
     * Public API
     */
    activeComponents: ViewportInstruction[];
    /**
     * Public API
     */
    activeRoute?: IRoute;
    isActive: boolean;
    pendingConnects: Map<IConnectedCustomElement, OpenPromise>;
    private loadedFirst;
    private lastNavigation;
    private staleChecks;
    constructor(
    /**
     * @internal - Shouldn't be used directly.
     */
    container: IContainer, 
    /**
     * @internal - Shouldn't be used directly.
     */
    navigator: Navigator, navigation: BrowserViewerStore, 
    /**
     * @internal - Shouldn't be used directly.
     */
    linkHandler: LinkHandler, 
    /**
     * @internal - Shouldn't be used directly. Probably.
     */
    instructionResolver: InstructionResolver, 
    /**
     * @internal - Shouldn't be used directly. Probably.
     */
    hookManager: HookManager, options: RouterOptions);
    /**
     * Public API
     */
    get isNavigating(): boolean;
    get isRestrictedNavigation(): boolean;
    starters: any[];
    /**
     * Public API
     */
    start(options?: IRouterActivateOptions): void;
    /**
     * Public API
     */
    loadUrl(): Promise<void>;
    /**
     * Public API
     */
    stop(): void;
    /**
     * Public API - Get viewport by name
     */
    getViewport(name: string): Viewport | null;
    /**
     * Public API (not yet implemented)
     */
    addViewport(...args: unknown[]): unknown;
    /**
     * Public API (not yet implemented)
     */
    findViewportScope(...args: unknown[]): unknown;
    /**
     * Public API (not yet implemented)
     */
    addViewportScope(...args: unknown[]): unknown;
    allViewports(includeDisabled?: boolean, includeReplaced?: boolean): Viewport[];
    /**
     * Public API - THE navigation API
     */
    goto(instructions: NavigationInstruction | NavigationInstruction[], options?: ILoadOptions): Promise<void>;
    load(instructions: NavigationInstruction | NavigationInstruction[], options?: ILoadOptions): Promise<void>;
    /**
     * Public API
     */
    refresh(): Promise<void>;
    /**
     * Public API
     */
    back(): Promise<void>;
    /**
     * Public API
     */
    forward(): Promise<void>;
    /**
     * Public API
     */
    go(delta: number): Promise<void>;
    /**
     * Public API
     */
    checkActive(instructions: ViewportInstruction[]): boolean;
    /**
     * Public API
     */
    setNav(name: string, routes: INavRoute[], classes?: INavClasses): void;
    /**
     * Public API
     */
    addNav(name: string, routes: INavRoute[], classes?: INavClasses): void;
    /**
     * Public API
     */
    updateNav(name?: string): void;
    /**
     * Public API
     */
    findNav(name: string): Nav;
    /**
     * Public API
     */
    addRoutes(routes: IRoute[], context?: ICustomElementViewModel | Element): IRoute[];
    /**
     * Public API
     */
    removeRoutes(routes: IRoute[] | string[], context?: ICustomElementViewModel | Element): void;
    /**
     * Public API
     */
    addHooks(hooks: IHookDefinition[]): HookIdentity[];
    /**
     * Public API
     */
    addHook(beforeNavigationHookFunction: BeforeNavigationHookFunction, options?: IHookOptions): HookIdentity;
    addHook(transformFromUrlHookFunction: TransformFromUrlHookFunction, options?: IHookOptions): HookIdentity;
    addHook(transformToUrlHookFunction: TransformToUrlHookFunction, options?: IHookOptions): HookIdentity;
    addHook(setTitleHookFunction: SetTitleHookFunction, options?: IHookOptions): HookIdentity;
    addHook(hookFunction: HookFunction, options?: IHookOptions): HookIdentity;
    /**
     * Public API
     */
    removeHooks(hooks: HookIdentity[]): void;
    /**
     * Public API - The right way to create ViewportInstructions
     */
    createViewportInstruction(component: ComponentAppellation, viewport?: ViewportHandle, parameters?: ComponentParameters, ownsScope?: boolean, nextScopeInstructions?: ViewportInstruction[] | null): ViewportInstruction;
    hasSiblingInstructions(instructions: ViewportInstruction[] | null): boolean;
    private appendInstructions;
    private checkStale;
    private unknownRoute;
    private findViewports;
    private cancelNavigation;
    private ensureRootScope;
    private replacePaths;
    private getTitle;
    private stringifyTitles;
    private stringifyTitle;
    private resolveTitle;
    private freeComponents;
    private getClosestContainer;
    private getContainer;
    private CustomElementFor;
}
//# sourceMappingURL=router.d.ts.map