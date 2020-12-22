import { INavigatorOptions } from './navigator.js';
import { IHookDefinition } from './hook-manager.js';
import { NavigationState } from './navigation-coordinator.js';
import { Navigation } from './navigation.js';
import { ViewportInstruction } from './viewport-instruction.js';
import { FoundRoute } from './found-route.js';
export declare type SwapStrategy = 'add-first-sequential' | 'add-first-parallel' | 'remove-first-sequential' | 'remove-first-parallel';
export declare type RoutingHookIntegration = 'integrated' | 'separate';
/**
 * Public API
 */
export interface IRouterActivateOptions extends Omit<Partial<RouterOptions>, 'title'> {
    title?: string | IRouterTitle;
}
export interface IRouterTitle extends Partial<ITitleConfiguration> {
}
/**
 * Public API
 */
export interface ITitleConfiguration {
    appTitle: string;
    appTitleSeparator: string;
    componentTitleOrder: 'top-down' | 'bottom-up';
    componentTitleSeparator: string;
    useComponentNames: boolean;
    componentPrefix: string;
    transformTitle?: (title: string, instruction: string | ViewportInstruction | FoundRoute) => string;
}
export interface IRouteSeparators extends Partial<ISeparators> {
}
export interface ISeparators {
    viewport: string;
    sibling: string;
    scope: string;
    scopeStart: string;
    scopeEnd: string;
    noScope: string;
    parameters: string;
    parametersEnd: string;
    parameterSeparator: string;
    parameterKeySeparator: string;
    parameter?: string;
    add: string;
    clear: string;
    action: string;
}
export declare class RouterOptions implements INavigatorOptions {
    separators: ISeparators;
    useUrlFragmentHash: boolean;
    useHref: boolean;
    statefulHistoryLength: number;
    useDirectRoutes: boolean;
    useConfiguredRoutes: boolean;
    additiveInstructionDefault: boolean;
    title: ITitleConfiguration;
    hooks?: IHookDefinition[];
    reportCallback?(instruction: Navigation): void;
    navigationSyncStates: NavigationState[];
    swapStrategy: SwapStrategy;
    routingHookIntegration: RoutingHookIntegration;
}
//# sourceMappingURL=router-options.d.ts.map