import { GuardIdentity, GuardTypes, IGuardOptions } from './guardian';
import { GuardFunction, GuardTarget, INavigatorInstruction, IRouteableComponentType } from './interfaces';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
export declare class Guard {
    type: GuardTypes;
    includeTargets: Target[];
    excludeTargets: Target[];
    guard: GuardFunction;
    id: GuardIdentity;
    constructor(guard: GuardFunction, options: IGuardOptions, id: GuardIdentity);
    matches(viewportInstructions: ViewportInstruction[]): boolean;
    check(viewportInstructions: ViewportInstruction[], navigationInstruction: INavigatorInstruction): boolean | ViewportInstruction[];
}
declare class Target {
    component?: IRouteableComponentType;
    componentName?: string;
    viewport?: Viewport;
    viewportName?: string;
    constructor(target: GuardTarget);
    matches(viewportInstructions: ViewportInstruction[]): boolean;
}
export {};
//# sourceMappingURL=guard.d.ts.map