import { Guard } from './guard';
import { GuardFunction, GuardTarget, INavigatorInstruction } from './interfaces';
import { ViewportInstruction } from './viewport-instruction';
export declare const enum GuardTypes {
    Before = "before"
}
export declare type GuardIdentity = number;
export interface IGuardOptions {
    /**
     * What event/when to guard. Defaults to Before
     */
    type?: GuardTypes;
    /**
     * What to guard. If omitted, everything is included
     */
    include?: GuardTarget[];
    /**
     * What not to guard. If omitted, nothing is excluded
     */
    exclude?: GuardTarget[];
}
export declare class Guardian {
    guards: Record<GuardTypes, Guard[]>;
    private lastIdentity;
    addGuard(guardFunction: GuardFunction, options?: IGuardOptions): GuardIdentity;
    removeGuard(id: GuardIdentity): void;
    passes(type: GuardTypes, viewportInstructions: ViewportInstruction[], navigationInstruction: INavigatorInstruction): boolean | ViewportInstruction[];
}
//# sourceMappingURL=guardian.d.ts.map