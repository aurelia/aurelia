import { HookName, MaybeHookName } from './hook-invocation-tracker.js';
export type ComponentTimings = Map<HookName, number>;
export type TransitionComponent = {
    component: string;
    timings: ComponentTimings;
};
export declare class Component {
    viewport: string;
    static Empty: Component;
    name: string;
    timings: ComponentTimings;
    constructor(transition: string | TransitionComponent | Component, viewport: string);
    get isEmpty(): boolean;
    get isLifecycleSync(): boolean;
    getTiming(hook: HookName): number | undefined;
    getTimed(...names: HookName[]): MaybeHookName[];
    getTimedHook(name: HookName, timing: number): MaybeHookName[];
}
//# sourceMappingURL=component.d.ts.map