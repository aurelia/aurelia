import { IContainer } from '@aurelia/kernel';
import { ICustomElementType, IRenderContext } from '@aurelia/runtime';
import { Router } from './router';
import { IFindViewportsResult } from './scope';
import { IViewportOptions, Viewport } from './viewport';
export interface IViewportCustomElementType extends ICustomElementType {
    viewport?: string;
}
export interface IComponentViewport {
    component: ICustomElementType | string;
    viewport: Viewport;
}
export interface IFindViewportsResult {
    componentViewports?: IComponentViewport[];
    viewportsRemaining?: boolean;
}
export declare type ChildContainer = IContainer & {
    parent?: ChildContainer;
};
export declare class Scope {
    element: Element;
    context: IRenderContext;
    parent: Scope;
    viewport: Viewport;
    children: Scope[];
    viewports: Viewport[];
    private readonly router;
    private scopeViewportParts;
    private availableViewports;
    constructor(router: Router, element: Element, context: IRenderContext, parent: Scope);
    getEnabledViewports(): Record<string, Viewport>;
    findViewports(viewports?: Record<string, string | Viewport>): IFindViewportsResult;
    foundViewport(viewports: Record<string, string | Viewport>, scopeViewportParts: Record<string, string[][]>, viewportPart: string, component: ICustomElementType | string, viewport: Viewport): IFindViewportsResult;
    addViewport(name: string, element: Element, context: IRenderContext, options?: IViewportOptions): Viewport;
    removeViewport(viewport: Viewport, element: Element, context: IRenderContext): number;
    removeScope(): void;
    renderViewport(viewport: Viewport): Promise<boolean>;
    addChild(child: Scope): void;
    removeChild(child: Scope): void;
    viewportStates(full?: boolean, active?: boolean): string[];
    allViewports(): Viewport[];
    scopeContext(full?: boolean): string;
    private closestViewport;
}
//# sourceMappingURL=scope.d.ts.map