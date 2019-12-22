import { HookFunction, HookTarget, HookIdentity, HookTypes, IHookOptions, HookResult, HookParameter } from './hook-manager';
import { INavigatorInstruction, RouteableComponentType } from './interfaces';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
export declare class Hook {
    hook: HookFunction;
    id: HookIdentity;
    type: HookTypes;
    includeTargets: Target[];
    excludeTargets: Target[];
    constructor(hook: HookFunction, options: IHookOptions, id: HookIdentity);
    get wantsMatch(): boolean;
    matches(viewportInstructions: HookParameter): boolean;
    invoke(navigationInstruction: INavigatorInstruction, arg: HookParameter): Promise<HookResult>;
}
declare class Target {
    componentType: RouteableComponentType | null;
    componentName: string | null;
    viewport: Viewport | null;
    viewportName: string | null;
    constructor(target: HookTarget);
    matches(viewportInstructions: ViewportInstruction[]): boolean;
}
export {};
//# sourceMappingURL=hook.d.ts.map