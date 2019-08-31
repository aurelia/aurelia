import { IContainer } from '@aurelia/kernel';
import { IRenderContext } from '@aurelia/runtime';
import { ComponentAppellation, ComponentParameters, IRouteableComponentType, ViewportHandle } from './interfaces';
import { IRouter } from './router';
import { Viewport } from './viewport';
export declare class ViewportInstruction {
    ownsScope: boolean;
    nextScopeInstructions: ViewportInstruction[] | null;
    componentType: IRouteableComponentType | null;
    componentName: string | null;
    viewport: Viewport | null;
    viewportName: string | null;
    parametersString: string | null;
    parameters: Record<string, unknown> | null;
    parametersList: string[] | null;
    constructor(component: ComponentAppellation, viewport?: ViewportHandle, parameters?: ComponentParameters, ownsScope?: boolean, nextScopeInstructions?: ViewportInstruction[] | null);
    setComponent(component: ComponentAppellation): void;
    setViewport(viewport?: ViewportHandle | null): void;
    setParameters(parameters?: ComponentParameters | null): void;
    toComponentType(context: IRenderContext | IContainer): IRouteableComponentType | null;
    toViewportInstance(router: IRouter): Viewport | null;
    sameComponent(other: ViewportInstruction, compareParameters?: boolean, compareType?: boolean): boolean;
    sameViewport(other: ViewportInstruction): boolean;
}
//# sourceMappingURL=viewport-instruction.d.ts.map