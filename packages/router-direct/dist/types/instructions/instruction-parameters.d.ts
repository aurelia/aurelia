/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import { IRouter, IRouterConfiguration } from '../index';
import { RouteableComponentType } from '../interfaces';
import { IContainer } from '@aurelia/kernel';
export type Parameters = {
    [key: string]: unknown;
};
export interface IComponentParameter {
    key?: string | undefined;
    value: unknown;
}
/**
 * Public API - The routing instructions are the core of the router's navigations
 */
export type ComponentParameters = string | Record<string, unknown> | unknown[];
export declare class InstructionParameters {
    parametersString: string | null;
    parametersRecord: Parameters | null;
    parametersList: unknown[] | null;
    parametersType: ParametersType;
    get none(): boolean;
    static create(componentParameters?: ComponentParameters): InstructionParameters;
    static parse(context: IRouterConfiguration | IRouter | IContainer, parameters: ComponentParameters | null, uriComponent?: boolean): IComponentParameter[];
    get typedParameters(): ComponentParameters | null;
    static stringify(context: IRouterConfiguration | IRouter | IContainer, parameters: IComponentParameter[], uriComponent?: boolean): string;
    /**
     * Whether a record of instruction parameters contains another record of
     * instruction parameters.
     *
     * @param parametersToSearch - Parameters that should contain (superset)
     * @param parametersToFind - Parameters that should be contained (subset)
     */
    static contains(parametersToSearch: Parameters, parametersToFind: Parameters): boolean;
    parameters(context: IRouterConfiguration | IRouter | IContainer): IComponentParameter[];
    set(parameters?: ComponentParameters | null): void;
    get(context: IRouterConfiguration | IRouter | IContainer, name?: string): unknown;
    addParameters(parameters: Parameters): void;
    toSpecifiedParameters(context: IRouterConfiguration | IRouter | IContainer, specifications: string[] | null | undefined): Record<string, unknown>;
    toSortedParameters(context: IRouterConfiguration | IRouter | IContainer, specifications?: string[] | null | undefined): IComponentParameter[];
    same(context: IRouterConfiguration | IRouter | IContainer, other: InstructionParameters, componentType: RouteableComponentType | null): boolean;
}
//# sourceMappingURL=instruction-parameters.d.ts.map