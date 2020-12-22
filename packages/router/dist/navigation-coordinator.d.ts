import { IScopeOwner } from './scope.js';
import { IRouter } from './router.js';
import { Navigation } from './navigation.js';
import { StateCoordinator, Entity } from './state-coordinator.js';
export declare type NavigationState = 'guardedUnload' | // fulfilled when canUnload has been called
'guardedLoad' | // fulfilled when canLoad has been called
'guarded' | // fulfilled when check hooks canUnload and canLoad (if any) have been called
'routed' | // fulfilled when initial routing hooks (if any) have been called
'loaded' | // fulfilled when load has been called
'swapped' | 'unloaded' | // fulfilled when unload has been called
'completed';
export declare type NavigationStep = 'checkUnload' | // can't be controlled
'checkLoad' | 'route' | // run routing hooks (if any)
'load' | 'swap' | 'unload' | 'complete';
export declare class NavigationCoordinatorOptions {
    syncStates: NavigationState[];
    constructor(input: Partial<NavigationCoordinatorOptions>);
}
export declare class NavigationCoordinator extends StateCoordinator<IScopeOwner, NavigationState> {
    private router;
    private navigation;
    private running;
    static create(router: IRouter, navigation: Navigation, options: NavigationCoordinatorOptions): StateCoordinator<IScopeOwner, NavigationState>;
    run(): void;
    addEntity(entity: IScopeOwner): Entity<IScopeOwner, NavigationState>;
    finalize(): void;
    cancel(): void;
    cancelReplaced(navigation: Navigation): void;
}
//# sourceMappingURL=navigation-coordinator.d.ts.map