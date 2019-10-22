import { GuardIdentity, GuardTypes, IGuardOptions } from './guardian';
import { GuardFunction, GuardTarget, INavigatorInstruction, RouteableComponentType } from './interfaces';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
export declare class Guard {
    guard: GuardFunction;
    id: GuardIdentity;
    type: GuardTypes;
    includeTargets: Target[];
    excludeTargets: Target[];
    constructor(guard: GuardFunction, options: IGuardOptions, id: GuardIdentity);
    matches(viewportInstructions: ViewportInstruction[]): boolean;
    check(viewportInstructions: ViewportInstruction[], navigationInstruction: INavigatorInstruction): boolean | ViewportInstruction[];
}
declare class Target {
    componentType: RouteableComponentType | null;
    componentName: string | null;
    viewport: Viewport | null;
    viewportName: string | null;
    constructor(target: GuardTarget);
    matches(viewportInstructions: ViewportInstruction[]): boolean;
}
export {};
//# sourceMappingURL=guard.d.ts.map