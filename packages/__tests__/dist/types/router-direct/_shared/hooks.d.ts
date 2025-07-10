import { HookName } from './hook-invocation-tracker.js';
import { TransitionViewport } from './transition-viewport.js';
export declare const routingHooks: HookName[];
export declare const addHooks: HookName[];
export declare const removeHooks: HookName[];
export declare function getStartHooks(root: string): Generator<string, void, unknown>;
export declare function getStopHooks(root: string, p: string, c?: string, c3?: string, c4?: string): Generator<string, void, unknown>;
export declare function getHooks(deferUntil: any, swapStrategy: any, phase: any, ...siblingTransitions: any[]): string[];
export declare function getNonSiblingHooks(deferUntil: any, swapStrategy: any, phase: any, transitionComponents: any): any[];
export declare function getInterweaved(...viewports: TransitionViewport[] | string[][]): string[];
export declare function getPrepended(prefix: string, component: string, ...hooks: (HookName | '')[]): string[];
export declare function getSingleHooks(deferUntil: any, swapStrategy: any, componentKind: any, phase: any, from: any, to: any): Generator<string, void, unknown>;
export declare function getParentChildHooks(deferUntil: any, swapStrategy: any, componentKind: any, phase: any, from: any, to: any): Generator<string, void, unknown>;
export declare function assertHooks(actual: any, expected: any): void;
//# sourceMappingURL=hooks.d.ts.map