import { ICustomElementController } from '@aurelia/runtime-html';
import { HookName } from './_shared/hook-invocation-tracker.js';
import { HookSpecs } from './_shared/view-models.js';
import { DeferralJuncture, IActivityTracker, SwapStrategy } from './_shared/create-fixture.js';
export declare function prepend(prefix: string, component: string, ...calls: (HookName | '')[]): Generator<string, void, unknown>;
export declare function prependDeferrable(prefix: string, component: string, deferUntil: DeferralJuncture, ...calls: (HookName | '')[]): Generator<string, void, unknown>;
export declare function interleave(...generators: Generator<string, void>[]): Generator<string, void, unknown>;
export interface IRouterOptionsSpec {
    deferUntil: DeferralJuncture;
    swapStrategy: SwapStrategy;
    routingMode?: 'configured-first' | 'configured-only' | 'direct-only';
    toString(): string;
}
export interface IComponentSpec {
    kind: 'all-sync' | 'all-async';
    hookSpecs: HookSpecs;
}
export declare abstract class SimpleActivityTrackingVMBase {
    readonly $controller: ICustomElementController;
    readonly tracker: IActivityTracker;
    attached(): void;
    setNonActive(): void;
}
//# sourceMappingURL=config-tests.spec.d.ts.map