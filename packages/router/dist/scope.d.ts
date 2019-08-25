import { IContainer } from '@aurelia/kernel';
import { IRenderContext } from '@aurelia/runtime';
import { IRouter } from './router';
import { IViewportOptions, Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
export interface IFindViewportsResult {
    viewportInstructions: ViewportInstruction[];
    viewportsRemaining: boolean;
}
export declare type ChildContainer = IContainer & {
    parent?: ChildContainer;
};
export declare class Scope {
    private readonly router;
    element: Element | null;
    context: IRenderContext | IContainer | null;
    parent: Scope | null;
    viewport: Viewport | null;
    children: Scope[];
    viewports: Viewport[];
    private viewportInstructions;
    private availableViewports;
    constructor(router: IRouter, element: Element | null, context: IRenderContext | IContainer | null, parent: Scope | null);
    getEnabledViewports(): Record<string, Viewport>;
    findViewports(viewportInstructions?: ViewportInstruction[]): IFindViewportsResult;
    foundViewport(instruction: ViewportInstruction, viewport: Viewport): IFindViewportsResult;
    addViewport(name: string, element: Element | null, context: IRenderContext | IContainer | null, options?: IViewportOptions): Viewport;
    removeViewport(viewport: Viewport, element: Element | null, context: IRenderContext | IContainer | null): number;
    removeScope(): void;
    addChild(child: Scope): void;
    removeChild(child: Scope): void;
    viewportStates(full?: boolean, active?: boolean): string[];
    allViewports(): Viewport[];
    scopeContext(full?: boolean): string;
    private closestViewport;
}
//# sourceMappingURL=scope.d.ts.map