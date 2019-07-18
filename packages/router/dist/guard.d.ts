import { ICustomElementType } from '@aurelia/runtime';
import { GuardFunction, GuardIdentity, GuardTarget, GuardTypes, IGuardOptions } from './guardian';
import { INavigationInstruction } from './navigator';
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
    check(viewportInstructions: ViewportInstruction[], navigationInstruction: INavigationInstruction): boolean | ViewportInstruction[];
}
declare class Target {
    component?: Partial<ICustomElementType>;
    componentName?: string;
    viewport?: Viewport;
    viewportName?: string;
    constructor(target: GuardTarget);
    matches(viewportInstructions: ViewportInstruction[]): boolean;
}
export {};
//# sourceMappingURL=guard.d.ts.map