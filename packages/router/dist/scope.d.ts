import { IViewportScopeOptions, ViewportScope } from './viewport-scope';
import { IContainer } from '@aurelia/kernel';
import { CustomElementType } from '@aurelia/runtime';
import { IRoute, ComponentAppellation, INavigatorInstruction } from './interfaces';
import { FoundRoute } from './found-route';
import { IRouter } from './router';
import { ViewportInstruction } from './viewport-instruction';
import { Viewport, IViewportOptions } from './viewport';
export interface IFindViewportsResult {
    foundViewports: ViewportInstruction[];
    remainingInstructions: ViewportInstruction[];
}
export interface IScopeOwnerOptions {
    noHistory?: boolean;
}
export interface IScopeOwner {
    connectedScope: Scope;
    scope: Scope;
    owningScope: Scope;
    enabled: boolean;
    path: string | null;
    options: IScopeOwnerOptions;
    isViewport: boolean;
    isViewportScope: boolean;
    isEmpty: boolean;
    setNextContent(content: ComponentAppellation | ViewportInstruction, instruction: INavigatorInstruction): boolean;
    canLeave(): Promise<boolean>;
    canEnter(): Promise<boolean | ViewportInstruction[]>;
    enter(): Promise<boolean>;
    loadContent(): Promise<boolean>;
    finalizeContentChange(): void;
    abortContentChange(): Promise<void>;
    getRoutes(): IRoute[] | null;
}
export declare class Scope {
    readonly router: IRouter;
    readonly hasScope: boolean;
    owningScope: Scope | null;
    viewport: Viewport | null;
    viewportScope: ViewportScope | null;
    rootComponentType: CustomElementType | null;
    id: string;
    scope: Scope;
    parent: Scope | null;
    children: Scope[];
    replacedChildren: Scope[];
    path: string | null;
    enabled: boolean;
    childCollections: Record<string, unknown[]>;
    constructor(router: IRouter, hasScope: boolean, owningScope: Scope | null, viewport?: Viewport | null, viewportScope?: ViewportScope | null, rootComponentType?: CustomElementType | null);
    get isViewport(): boolean;
    get isViewportScope(): boolean;
    get passThroughScope(): boolean;
    get owner(): IScopeOwner | null;
    get enabledChildren(): Scope[];
    get hoistedChildren(): Scope[];
    get enabledViewports(): Viewport[];
    get viewportInstruction(): ViewportInstruction | null;
    getEnabledViewports(viewportScopes: Scope[]): Record<string, Viewport>;
    getOwnedViewports(includeDisabled?: boolean): Viewport[];
    getOwnedScopes(includeDisabled?: boolean): Scope[];
    findViewports(instructions: ViewportInstruction[], alreadyFound: ViewportInstruction[], disregardViewports?: boolean): IFindViewportsResult;
    foundViewportScope(instruction: ViewportInstruction, viewportScope: ViewportScope): ViewportInstruction[];
    foundViewport(instruction: ViewportInstruction, viewport: Viewport, withoutViewports: boolean, doesntNeedViewportDescribed?: boolean): ViewportInstruction[];
    addViewport(name: string, element: Element | null, container: IContainer | null, options?: IViewportOptions): Viewport;
    removeViewport(viewport: Viewport, element: Element | null, container: IContainer | null): boolean;
    addViewportScope(name: string, element: Element | null, options?: IViewportScopeOptions): ViewportScope;
    removeViewportScope(viewportScope: ViewportScope): boolean;
    addChild(scope: Scope): void;
    removeChild(scope: Scope): void;
    clearReplacedChildren(): void;
    disableReplacedChildren(): void;
    reenableReplacedChildren(): void;
    allViewports(includeDisabled?: boolean, includeReplaced?: boolean): Viewport[];
    allScopes(includeDisabled?: boolean, includeReplaced?: boolean): Scope[];
    reparentViewportInstructions(): ViewportInstruction[] | null;
    findMatchingRoute(path: string): FoundRoute | null;
    canLeave(): Promise<boolean>;
    private findMatchingRouteInRoutes;
    private ensureProperRoute;
}
//# sourceMappingURL=scope.d.ts.map