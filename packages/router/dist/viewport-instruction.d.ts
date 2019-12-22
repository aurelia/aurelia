import { IContainer } from '@aurelia/kernel';
import { ComponentAppellation, ComponentParameters, IRouteableComponent, RouteableComponentType, ViewportHandle } from './interfaces';
import { IRouter } from './router';
import { Viewport } from './viewport';
import { IComponentParameter, InstructionResolver } from './instruction-resolver';
import { Scope, IScopeOwner } from './scope';
import { ViewportScope } from './viewport-scope';
export declare const enum ParametersType {
    none = "none",
    string = "string",
    array = "array",
    object = "object"
}
export declare class ViewportInstruction {
    ownsScope: boolean;
    nextScopeInstructions: ViewportInstruction[] | null;
    componentName: string | null;
    componentType: RouteableComponentType | null;
    componentInstance: IRouteableComponent | null;
    viewportName: string | null;
    viewport: Viewport | null;
    parametersString: string | null;
    parametersRecord: Record<string, unknown> | null;
    parametersList: unknown[] | null;
    parametersType: ParametersType;
    scope: Scope | null;
    context: string;
    viewportScope: ViewportScope | null;
    needsViewportDescribed: boolean;
    route: string | null;
    default: boolean;
    private instructionResolver;
    constructor(component: ComponentAppellation, viewport?: ViewportHandle, parameters?: ComponentParameters, ownsScope?: boolean, nextScopeInstructions?: ViewportInstruction[] | null);
    get owner(): IScopeOwner | null;
    get typedParameters(): ComponentParameters | null;
    get parameters(): IComponentParameter[];
    get normalizedParameters(): string;
    setComponent(component: ComponentAppellation): void;
    setViewport(viewport?: ViewportHandle | null): void;
    setParameters(parameters?: ComponentParameters | null): void;
    addParameters(parameters: Record<string, unknown>): void;
    setInstructionResolver(instructionResolver: InstructionResolver): void;
    isEmpty(): boolean;
    isComponentName(): boolean;
    isComponentType(): boolean;
    isComponentInstance(): boolean;
    toComponentType(container: IContainer): RouteableComponentType | null;
    toComponentInstance(container: IContainer): IRouteableComponent | null;
    toViewportInstance(router: IRouter): Viewport | null;
    toSpecifiedParameters(specifications?: string[] | null | undefined): Record<string, unknown>;
    toSortedParameters(specifications?: string[] | null | undefined): IComponentParameter[];
    sameComponent(other: ViewportInstruction, compareParameters?: boolean, compareType?: boolean): boolean;
    sameParameters(other: ViewportInstruction, compareType?: boolean): boolean;
    sameViewport(other: ViewportInstruction): boolean;
}
//# sourceMappingURL=viewport-instruction.d.ts.map