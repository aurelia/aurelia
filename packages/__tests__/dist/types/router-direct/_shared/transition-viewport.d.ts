import { DeferralJuncture, SwapStrategy } from './create-fixture.js';
import { Component } from './component.js';
import { HookName } from './hook-invocation-tracker.js';
import { Transition } from './transition.js';
export declare class TransitionViewport {
    readonly transition: Transition;
    readonly isTop: boolean;
    hooks: string[];
    canUnload: boolean;
    canLoad: boolean;
    unloading: boolean;
    loading: boolean;
    deactivate: boolean;
    static routingHooks: HookName[];
    static addHooks: HookName[];
    static removeHooks: HookName[];
    static getPrepended(prefix: string, component: string, ...hooks: (HookName | '')[]): string[];
    static getInterweaved(...lists: any[]): any[];
    static applyDelays(deferUntil: DeferralJuncture, viewports: TransitionViewport[], addViewports: TransitionViewport[], removeViewports: TransitionViewport[]): void;
    static delayHook(earlierViewport: TransitionViewport | string[], laterViewport: TransitionViewport | string[], hook: HookName): boolean;
    constructor(transition: Transition, isTop: boolean);
    get from(): Component;
    get to(): Component;
    get isAdd(): boolean;
    get isRemove(): boolean;
    retrieveHooks(): string[];
    setRoutingHooks(deferUntil: DeferralJuncture, phase: string, routingStep: boolean, topViewport: TransitionViewport, removeViewports: TransitionViewport[]): void;
    setLifecycleHooks(deferUntil: DeferralJuncture, swapStrategy: SwapStrategy, phase: string, topViewport: TransitionViewport, removeViewports: TransitionViewport[]): void;
    private setRoutingHook;
    private setDeactivateHook;
    private static getRemoveHooks;
    private static getDeactivateHooks;
    private static ensureConfiguredHookOrder;
    private static ensureViewportHookOrder;
    private static delayHooks;
    private static findLastIndex;
    private static getTick;
}
//# sourceMappingURL=transition-viewport.d.ts.map