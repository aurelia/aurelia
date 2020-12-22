import { Navigation } from './navigation.js';
import { OpenPromise } from './open-promise.js';
export declare class Entity<T, S> {
    entity: T;
    running: boolean;
    states: S[];
    checkedStates: S[];
    syncState: S | null;
    syncPromise: OpenPromise | null;
    constructor(entity: T);
}
export declare class StateCoordinator<T, S> {
    protected readonly entities: Entity<T, S>[];
    protected hasAllEntities: boolean;
    protected readonly syncStates: Map<S, OpenPromise>;
    protected readonly checkedSyncStates: Set<S>;
    addSyncState(state: S): void;
    addEntity(entity: T): Entity<T, S>;
    addEntityState(entity: T, state: S): void;
    syncState(state: S, entity?: T | null): void | Promise<void>;
    checkingSyncState(state: S): boolean;
    finalEntity(): void;
    finalize(): void;
    cancel(): void;
    cancelReplaced(navigation: Navigation): void;
    protected checkSyncState(state: S): void;
    protected resetSyncStates(): void;
}
//# sourceMappingURL=state-coordinator.d.ts.map