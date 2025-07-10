/**
 *
 * NOTE: This file is still WIP and will go through at least one more iteration of refactoring, commenting and clean up!
 * In its current state, it is NOT a good source for learning about the inner workings and design of the router.
 *
 */
import { ComponentAppellation, IComponentAndOrViewportOrNothing } from './interfaces';
import { RoutingInstruction } from './instructions/routing-instruction';
import { Navigation } from './navigation';
/**
 * Public API
 */
export type RoutingHookType = 'beforeNavigation' | 'transformFromUrl' | 'transformToUrl' | 'transformTitle';
/**
 * Public API
 */
export type BeforeNavigationHookFunction = (routingInstructions: RoutingInstruction[], navigationInstruction: Navigation) => Promise<boolean | RoutingInstruction[]>;
/**
 * Public API
 */
export type TransformFromUrlHookFunction = (url: string, navigationInstruction: Navigation) => Promise<string | RoutingInstruction[]>;
/**
 * Public API
 */
export type TransformToUrlHookFunction = (state: string | RoutingInstruction[], navigationInstruction: Navigation) => Promise<string | RoutingInstruction[]>;
/**
 * Public API
 */
export type TransformTitleHookFunction = (title: string | RoutingInstruction[], navigationInstruction: Navigation) => Promise<string | RoutingInstruction[]>;
export type RoutingHookTarget = ComponentAppellation | IComponentAndOrViewportOrNothing;
/**
 * Public API
 */
export type RoutingHookIdentity = number;
/**
 * Public API
 */
export interface IRoutingHookOptions {
    /**
     * What event/when to hook. Defaults to BeforeNavigation
     */
    type?: RoutingHookType;
    /**
     * What to hook. If omitted, everything is included
     */
    include?: RoutingHookTarget[];
    /**
     * What not to hook. If omitted, nothing is excluded
     */
    exclude?: RoutingHookTarget[];
}
/**
 * Public API
 */
export interface IRoutingHookDefinition {
    hook: RoutingHookFunction;
    options: IRoutingHookOptions;
}
//# sourceMappingURL=routing-hook.d.ts.map