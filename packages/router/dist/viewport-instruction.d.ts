import { ICustomElementType, IRenderContext } from '@aurelia/runtime';
import { Router } from './router';
import { Viewport } from './viewport';
import { IRouteableCustomElementType } from './viewport-content';
export declare class ViewportInstruction {
    component?: Partial<ICustomElementType>;
    componentName?: string;
    viewport?: Viewport;
    viewportName?: string;
    parametersString?: string;
    parameters?: Record<string, unknown>;
    parametersList?: string[];
    ownsScope?: boolean;
    nextScopeInstruction?: ViewportInstruction;
    constructor(component: Partial<ICustomElementType> | string, viewport?: Viewport | string, parameters?: Record<string, unknown> | string, ownsScope?: boolean, nextScopeInstruction?: ViewportInstruction);
    setComponent(component: Partial<ICustomElementType> | string): void;
    setViewport(viewport: Viewport | string): void;
    setParameters(parameters: Record<string, unknown> | string): void;
    componentType(context: IRenderContext): IRouteableCustomElementType;
    viewportInstance(router: Router): Viewport;
    sameComponent(other: ViewportInstruction, compareParameters?: boolean, compareType?: boolean): boolean;
}
//# sourceMappingURL=viewport-instruction.d.ts.map