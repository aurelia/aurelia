import { IPlatform } from '@aurelia/runtime-html';
export type HookName = ('binding' | 'bound' | 'attaching' | 'attached' | 'detaching' | 'unbinding' | 'dispose' | 'canLoad' | 'loading' | 'canUnload' | 'unloading');
export type MaybeHookName = HookName | '';
export declare class HookInvocationTracker {
    readonly aggregator: HookInvocationAggregator;
    readonly methodName: HookName;
    get promise(): Promise<void>;
    _promise: Promise<void>;
    timeout: number;
    $resolve: () => void;
    readonly platform: IPlatform;
    readonly notifyHistory: string[];
    constructor(aggregator: HookInvocationAggregator, methodName: HookName);
    notify(componentName: string): void;
    resolve(): void;
    private setTimeout;
    private clearTimeout;
    dispose(): void;
}
export declare const IHIAConfig: import("@aurelia/kernel").InterfaceSymbol<IHIAConfig>;
export interface IHIAConfig extends HIAConfig {
}
export declare class HIAConfig {
    readonly resolveLabels: string[];
    readonly resolveTimeoutMs: number;
    constructor(resolveLabels: string[], resolveTimeoutMs: number);
}
export declare const IHookInvocationAggregator: import("@aurelia/kernel").InterfaceSymbol<IHookInvocationAggregator>;
export interface IHookInvocationAggregator extends HookInvocationAggregator {
}
export declare class HookInvocationAggregator {
    readonly notifyHistory: string[];
    phase: string;
    readonly platform: IPlatform;
    readonly config: IHIAConfig;
    readonly binding: HookInvocationTracker;
    readonly bound: HookInvocationTracker;
    readonly attaching: HookInvocationTracker;
    readonly attached: HookInvocationTracker;
    readonly detaching: HookInvocationTracker;
    readonly unbinding: HookInvocationTracker;
    readonly $$dispose: HookInvocationTracker;
    readonly canLoad: HookInvocationTracker;
    readonly loading: HookInvocationTracker;
    readonly canUnload: HookInvocationTracker;
    readonly unloading: HookInvocationTracker;
    notify(componentName: string, tracker: HookInvocationTracker): void;
    setPhase(label: string): void;
    dispose(): void;
}
//# sourceMappingURL=hook-invocation-tracker.d.ts.map