import { Hook } from './hook';
import { INavigatorInstruction, ComponentAppellation, IComponentAndOrViewportOrNothing } from './interfaces';
import { ViewportInstruction } from './viewport-instruction';
export declare const enum HookTypes {
    BeforeNavigation = "beforeNavigation",
    TransformFromUrl = "transformFromUrl",
    TransformToUrl = "transformToUrl"
}
export declare type BeforeNavigationHookFunction = (viewportInstructions: ViewportInstruction[], navigationInstruction: INavigatorInstruction) => Promise<boolean | ViewportInstruction[]>;
export declare type TransformFromUrlHookFunction = (url: string, navigationInstruction: INavigatorInstruction) => Promise<string | ViewportInstruction[]>;
export declare type TransformToUrlHookFunction = (state: string | ViewportInstruction[], navigationInstruction: INavigatorInstruction) => Promise<string | ViewportInstruction[]>;
export declare type HookFunction = BeforeNavigationHookFunction | TransformFromUrlHookFunction | TransformToUrlHookFunction;
export declare type HookParameter = string | ViewportInstruction[];
export declare type HookResult = boolean | string | ViewportInstruction[];
export declare type HookTarget = ComponentAppellation | IComponentAndOrViewportOrNothing;
export declare type HookIdentity = number;
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
export interface IHookDefinition {
    hook: HookFunction;
    options: IHookOptions;
}
export declare class HookManager {
    hooks: Record<HookTypes, Hook[]>;
    private lastIdentity;
    addHook(beforeNavigationHookFunction: BeforeNavigationHookFunction, options?: IHookOptions): HookIdentity;
    addHook(transformFromUrlHookFunction: TransformFromUrlHookFunction, options?: IHookOptions): HookIdentity;
    addHook(transformToUrlHookFunction: TransformToUrlHookFunction, options?: IHookOptions): HookIdentity;
    addHook(hookFunction: HookFunction, options?: IHookOptions): HookIdentity;
    removeHook(id: HookIdentity): void;
    invokeBeforeNavigation(viewportInstructions: ViewportInstruction[], navigationInstruction: INavigatorInstruction): Promise<boolean | ViewportInstruction[]>;
    invokeTransformFromUrl(url: string, navigationInstruction: INavigatorInstruction): Promise<string | ViewportInstruction[]>;
    invokeTransformToUrl(state: string | ViewportInstruction[], navigationInstruction: INavigatorInstruction): Promise<string | ViewportInstruction[]>;
    invoke(type: HookTypes, navigationInstruction: INavigatorInstruction, arg: HookParameter): Promise<HookResult>;
}
//# sourceMappingURL=hook-manager.d.ts.map