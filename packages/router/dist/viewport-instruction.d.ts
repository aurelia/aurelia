import { IContainer, Key } from '@aurelia/kernel';
import { ComponentAppellation, ComponentParameters, IRouteableComponent, RouteableComponentType, ViewportHandle } from './interfaces.js';
import { IRouter } from './router.js';
import { Viewport } from './viewport.js';
import { IComponentParameter, InstructionResolver } from './instruction-resolver.js';
import { Scope, IScopeOwner } from './scope.js';
import { ViewportScope } from './viewport-scope.js';
import { FoundRoute } from './found-route.js';
export declare type Params = {
    [key: string]: unknown;
};
/**
 * Public API - The viewport instructions are the core of the router's navigations
 */
export declare class ViewportInstruction {
    static readonly inject: readonly Key[];
    componentName: string | null;
    componentType: RouteableComponentType | null;
    componentInstance: IRouteableComponent | null;
    viewportName: string | null;
    viewport: Viewport | null;
    parametersString: string | null;
    parametersRecord: Params | null;
    parametersList: unknown[] | null;
    parametersType: ParametersType;
    ownsScope: boolean;
    nextScopeInstructions: ViewportInstruction[] | null;
    scope: Scope | null;
    context: string;
    viewportScope: ViewportScope | null;
    needsViewportDescribed: boolean;
    route: FoundRoute | string | null;
    default: boolean;
    topInstruction: boolean;
    private instructionResolver;
    static create(instructionResolver: InstructionResolver | null, component: ComponentAppellation | Promise<ComponentAppellation>, viewport?: ViewportHandle, parameters?: ComponentParameters, ownsScope?: boolean, nextScopeInstructions?: ViewportInstruction[] | null): ViewportInstruction;
    get owner(): IScopeOwner | null;
    get typedParameters(): ComponentParameters | null;
    get parameters(): IComponentParameter[];
    get normalizedParameters(): string;
    setComponent(component: ComponentAppellation): void;
    setViewport(viewport?: ViewportHandle | null): void;
    setParameters(parameters?: ComponentParameters | null): void;
    addParameters(parameters: Params): void;
    setInstructionResolver(instructionResolver: InstructionResolver | null): void;
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
    private getNewName;
}
//# sourceMappingURL=viewport-instruction.d.ts.map