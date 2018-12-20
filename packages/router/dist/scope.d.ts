import { ICustomElementType } from '@aurelia/runtime';
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
export declare class Scope {
    private router;
    element: Element;
    parent: Scope;
    viewport: Viewport;
    children: Scope[];
    viewports: Object;
    private scopeViewportParts;
    private availableViewports;
    constructor(router: Router, element: Element, parent: Scope);
    findViewports(viewports?: Object): IFindViewportsResult;
    foundViewport(viewports: Object, scopeViewportParts: Object, viewportPart: string, component: ICustomElementType | string, viewport: Viewport): IFindViewportsResult;
    addViewport(name: string, element: Element, options?: IViewportOptions): Viewport;
    removeViewport(viewport: Viewport): number;
    removeScope(): void;
    renderViewport(viewport: Viewport): Promise<boolean>;
    addChild(child: Scope): void;
    removeChild(child: Scope): void;
    viewportStates(full?: boolean): string[];
    allViewports(): Viewport[];
    context(full?: boolean): string;
    private resolveComponent;
    private closestViewport;
}
//# sourceMappingURL=scope.d.ts.map