import { IContainer } from '@aurelia/kernel';
import { IRenderContext } from '@aurelia/runtime';
import { ComponentAppellation, ComponentParameters, IRouteableComponent, RouteableComponentType, ViewportHandle } from './interfaces';
import { IRouter } from './router';
import { Viewport } from './viewport';
export declare class ViewportInstruction {
    ownsScope: boolean;
    nextScopeInstructions: ViewportInstruction[] | null;
    componentName: string | null;
    componentType: RouteableComponentType | null;
    componentInstance: IRouteableComponent | null;
    viewportName: string | null;
    viewport: Viewport | null;
    parametersString: string | null;
    parameters: Record<string, unknown> | null;
    parametersList: string[] | null;
    scope: Viewport | null;
    needsViewportDescribed: boolean;
    constructor(component: ComponentAppellation, viewport?: ViewportHandle, parameters?: ComponentParameters, ownsScope?: boolean, nextScopeInstructions?: ViewportInstruction[] | null);
    setComponent(component: ComponentAppellation): void;
    setViewport(viewport?: ViewportHandle | null): void;
    setParameters(parameters?: ComponentParameters | null): void;
    isEmpty(): boolean;
    isComponentName(): boolean;
    isComponentType(): boolean;
    isComponentInstance(): boolean;
    toComponentType(context: IRenderContext | IContainer): RouteableComponentType | null;
    toComponentInstance(context: IRenderContext | IContainer): IRouteableComponent | null;
    toViewportInstance(router: IRouter): Viewport | null;
    sameComponent(other: ViewportInstruction, compareParameters?: boolean, compareType?: boolean): boolean;
    sameParameters(other: ViewportInstruction): boolean;
    sameViewport(other: ViewportInstruction): boolean;
}
//# sourceMappingURL=viewport-instruction.d.ts.map