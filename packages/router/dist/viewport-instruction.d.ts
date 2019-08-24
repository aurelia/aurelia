import { IRenderContext } from '@aurelia/runtime';
import { ComponentAppellation, ComponentParameters, IRouteableComponentType, ViewportHandle } from './interfaces';
import { IRouter } from './router';
import { Viewport } from './viewport';
export declare class ViewportInstruction {
    component?: IRouteableComponentType;
    componentName?: string;
    viewport?: Viewport;
    viewportName?: string;
    parametersString?: string;
    parameters?: Record<string, unknown>;
    parametersList?: string[];
    ownsScope?: boolean;
    nextScopeInstruction?: ViewportInstruction;
    constructor(component: ComponentAppellation, viewport?: ViewportHandle, parameters?: ComponentParameters, ownsScope?: boolean, nextScopeInstruction?: ViewportInstruction);
    setComponent(component: ComponentAppellation): void;
    setViewport(viewport: ViewportHandle): void;
    setParameters(parameters: ComponentParameters): void;
    componentType(context: IRenderContext): IRouteableComponentType;
    viewportInstance(router: IRouter): Viewport;
    sameComponent(other: ViewportInstruction, compareParameters?: boolean, compareType?: boolean): boolean;
    sameViewport(other: ViewportInstruction): boolean;
}
//# sourceMappingURL=viewport-instruction.d.ts.map