import { ICustomElementType } from '@aurelia/runtime';
import { Guard } from './guard';
import { INavigatorInstruction } from './navigator';
import { Viewport } from './viewport';
import { ViewportInstruction } from './viewport-instruction';
export interface IGuardTarget {
    component?: Partial<ICustomElementType>;
    componentName?: string;
    viewport?: Viewport;
    viewportName?: string;
}
export declare const enum GuardTypes {
    Before = "before"
}
export declare type GuardFunction = (viewportInstructions?: ViewportInstruction[], navigationInstruction?: INavigatorInstruction) => boolean | ViewportInstruction[];
export declare type GuardTarget = IGuardTarget | Partial<ICustomElementType> | string;
export declare type GuardIdentity = number;
export interface IGuardOptions {
    type?: GuardTypes;
    include?: GuardTarget[];
    exclude?: GuardTarget[];
}
export declare class Guardian {
    guards: Record<GuardTypes, Guard[]>;
    private lastIdentity;
    constructor();
    addGuard(guardFunction: GuardFunction, options?: IGuardOptions): GuardIdentity;
    removeGuard(id: GuardIdentity): Guard;
    passes(type: GuardTypes, viewportInstructions: ViewportInstruction[], navigationInstruction: INavigatorInstruction): boolean | ViewportInstruction[];
}
//# sourceMappingURL=guardian.d.ts.map