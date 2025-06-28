import { HookName, HookInvocationTracker } from './hook-invocation-tracker.js';
import { ITestRouteViewModel } from './view-models.js';
export interface IHookSpec<T extends HookName> {
    name: T;
    type: string;
    ticks: number;
    invoke(vm: ITestRouteViewModel, getValue: () => ReturnType<ITestRouteViewModel[T]>, tracker?: HookInvocationTracker): ReturnType<ITestRouteViewModel[T]>;
}
export declare const hookSpecsMap: {
    binding: {
        sync: IHookSpec<"binding">;
        async(count: number): IHookSpec<"binding">;
        setTimeout_0: IHookSpec<"binding">;
    };
    bound: {
        sync: IHookSpec<"bound">;
        async(count: number): IHookSpec<"bound">;
        setTimeout_0: IHookSpec<"bound">;
    };
    attaching: {
        sync: IHookSpec<"attaching">;
        async(count: number): IHookSpec<"attaching">;
        setTimeout_0: IHookSpec<"attaching">;
    };
    attached: {
        sync: IHookSpec<"attached">;
        async(count: number): IHookSpec<"attached">;
        setTimeout_0: IHookSpec<"attached">;
    };
    detaching: {
        sync: IHookSpec<"detaching">;
        async(count: number): IHookSpec<"detaching">;
        setTimeout_0: IHookSpec<"detaching">;
    };
    unbinding: {
        sync: IHookSpec<"unbinding">;
        async(count: number): IHookSpec<"unbinding">;
        setTimeout_0: IHookSpec<"unbinding">;
    };
    dispose: IHookSpec<"dispose">;
    canLoad: {
        sync: IHookSpec<"canLoad">;
        async(count: number): IHookSpec<"canLoad">;
        setTimeout_0: IHookSpec<"canLoad">;
    };
    loading: {
        sync: IHookSpec<"loading">;
        async(count: number): IHookSpec<"loading">;
        setTimeout_0: IHookSpec<"loading">;
    };
    canUnload: {
        sync: IHookSpec<"canUnload">;
        async(count: number): IHookSpec<"canUnload">;
        setTimeout_0: IHookSpec<"canUnload">;
    };
    unloading: {
        sync: IHookSpec<"unloading">;
        async(count: number): IHookSpec<"unloading">;
        setTimeout_0: IHookSpec<"unloading">;
    };
};
export declare function verifyInvocationsEqual(actualIn: string[], expectedIn: string[]): void;
//# sourceMappingURL=hook-spec.d.ts.map