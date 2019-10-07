import { IContainer } from '@aurelia/kernel';
import { IRenderContext, LifecycleFlags } from '@aurelia/runtime';
import { ComponentAppellation, INavigatorInstruction, IRouteableComponent } from './interfaces';
import { IRouter } from './router';
import { ViewportContent } from './viewport-content';
import { ViewportInstruction } from './viewport-instruction';
export interface IFindViewportsResult {
    foundViewports: ViewportInstruction[];
    remainingInstructions: ViewportInstruction[];
}
export interface IViewportOptions {
    scope?: boolean;
    usedBy?: string | string[];
    default?: string;
    noLink?: boolean;
    noHistory?: boolean;
    stateful?: boolean;
    forceDescription?: boolean;
}
export declare class Viewport {
    readonly router: IRouter;
    name: string;
    element: Element | null;
    context: IRenderContext | IContainer | null;
    owningScope: Viewport | null;
    options: IViewportOptions;
    scope: Viewport | null;
    content: ViewportContent;
    nextContent: ViewportContent | null;
    enabled: boolean;
    forceRemove: boolean;
    parent: Viewport | null;
    children: Viewport[];
    private clear;
    private elementResolve?;
    private previousViewportState;
    private cache;
    private historyCache;
    constructor(router: IRouter, name: string, element: Element | null, context: IRenderContext | IContainer | null, owningScope: Viewport | null, scope: boolean, options?: IViewportOptions);
    readonly doForceRemove: boolean;
    setNextContent(content: ComponentAppellation | ViewportInstruction, instruction: INavigatorInstruction): boolean;
    setElement(element: Element, context: IRenderContext | IContainer, options: IViewportOptions): void;
    remove(element: Element | null, context: IRenderContext | IContainer | null): Promise<boolean>;
    canLeave(): Promise<boolean>;
    canEnter(): Promise<boolean | ViewportInstruction[]>;
    enter(): Promise<boolean>;
    loadContent(): Promise<boolean>;
    clearTaggedNodes(): void;
    finalizeContentChange(): void;
    abortContentChange(): Promise<void>;
    wantComponent(component: ComponentAppellation): boolean;
    acceptComponent(component: ComponentAppellation): boolean;
    binding(flags: LifecycleFlags): void;
    attaching(flags: LifecycleFlags): Promise<void>;
    detaching(flags: LifecycleFlags): Promise<void>;
    unbinding(flags: LifecycleFlags): Promise<void>;
    addChild(viewport: Viewport): void;
    removeChild(viewport: Viewport): void;
    getEnabledViewports(): Record<string, Viewport>;
    findViewports(instructions: ViewportInstruction[], alreadyFound: ViewportInstruction[], disregardViewports?: boolean): IFindViewportsResult;
    foundViewport(instruction: ViewportInstruction, viewport: Viewport, withoutViewports: boolean, doesntNeedViewportDescribed?: boolean): ViewportInstruction[];
    addViewport(name: string, element: Element | null, context: IRenderContext | IContainer | null, options?: IViewportOptions): Viewport;
    removeViewport(viewport: Viewport, element: Element | null, context: IRenderContext | IContainer | null): boolean;
    allViewports(includeDisabled?: boolean): Viewport[];
    reparentViewportInstructions(): ViewportInstruction[] | null;
    freeContent(component: IRouteableComponent): Promise<void>;
    private unloadContent;
    private clearState;
    private waitForElement;
}
//# sourceMappingURL=viewport.d.ts.map