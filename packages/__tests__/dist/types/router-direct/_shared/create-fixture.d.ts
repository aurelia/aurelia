import { Constructable, LogLevel } from '@aurelia/kernel';
import { Aurelia } from '@aurelia/runtime-html';
import { IRouter, IRouterOptions } from '@aurelia/router-direct';
import { TestContext } from '@aurelia/testing';
import { IHIAConfig, IHookInvocationAggregator } from './hook-invocation-tracker.js';
export interface IRouterOptionsSpec {
    resolutionMode?: ResolutionMode;
    deferUntil?: DeferralJuncture;
    swapStrategy?: SwapStrategy;
    routingMode?: 'configured-first' | 'configured-only' | 'direct-only';
    toString(): string;
}
export type SwapStrategy = 'sequential-add-first' | 'sequential-remove-first' | 'parallel-remove-first';
export type DeferralJuncture = 'guard-hooks' | 'load-hooks' | 'none';
export type ResolutionMode = 'dynamic' | 'static';
export declare function translateOptions(routerOptionsSpec: IRouterOptionsSpec): IRouterOptions;
export declare const IActivityTracker: import("@aurelia/kernel").InterfaceSymbol<IActivityTracker>;
export interface IActivityTracker extends ActivityTracker {
}
export declare class ActivityTracker {
    readonly activeVMs: string[];
    setActive(vm: string): void;
    setNonActive(vm: string): void;
}
export declare function createFixture<T extends Constructable>(Component: T, deps?: Constructable[], createHIAConfig?: () => IHIAConfig, createRouterOptions?: () => IRouterOptions, level?: LogLevel): Promise<{
    ctx: TestContext;
    container: import("@aurelia/kernel").IContainer;
    au: Aurelia;
    host: HTMLDivElement;
    hia: IHookInvocationAggregator;
    component: import("@aurelia/kernel").Resolved<T>;
    platform: import("@aurelia/runtime-html").IPlatform;
    router: IRouter;
    activityTracker: IActivityTracker;
    startTracing(): void;
    stopTracing(): void;
    tearDown(): Promise<void>;
    logTicks(callback: (tick: number) => void): () => void;
}>;
export declare function clearBrowserState(platform: any, router?: IRouter | null): Promise<void>;
export declare function wait(milliseconds: number): Promise<void>;
//# sourceMappingURL=create-fixture.d.ts.map