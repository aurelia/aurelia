import { INavigatorInstruction, ComponentAppellation, IComponentAndOrViewportOrNothing } from './interfaces';
import { ViewportInstruction } from './viewport-instruction';
/**
 * Public API
 */
export declare const enum HookTypes {
    BeforeNavigation = "beforeNavigation",
    TransformFromUrl = "transformFromUrl",
    TransformToUrl = "transformToUrl"
}
/**
 * Public API
 */
export declare type BeforeNavigationHookFunction = (viewportInstructions: ViewportInstruction[], navigationInstruction: INavigatorInstruction) => Promise<boolean | ViewportInstruction[]>;
/**
 * Public API
 */
export declare type TransformFromUrlHookFunction = (url: string, navigationInstruction: INavigatorInstruction) => Promise<string | ViewportInstruction[]>;
/**
 * Public API
 */
export declare type TransformToUrlHookFunction = (state: string | ViewportInstruction[], navigationInstruction: INavigatorInstruction) => Promise<string | ViewportInstruction[]>;
export declare type HookTarget = ComponentAppellation | IComponentAndOrViewportOrNothing;
/**
 * Public API
 */
export declare type HookIdentity = number;
/**
 * Public API
 */
export interface IHookOptions {
    /**
     * What event/when to hook. Defaults to BeforeNavigation
     */
    type?: HookTypes;
    /**
     * What to hook. If omitted, everything is included
     */
    include?: HookTarget[];
    /**
     * What not to hook. If omitted, nothing is excluded
     */
    exclude?: HookTarget[];
}
/**
 * Public API
 */
export interface IHookDefinition {
    hook: HookFunction;
    options: IHookOptions;
}
//# sourceMappingURL=hook-manager.d.ts.map