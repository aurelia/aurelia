export interface StateHistory<T> {
    past: T[];
    present: T;
    future: T[];
}
export interface HistoryOptions {
    undoable: boolean;
    limit?: number;
}
export declare function jump<T>(state: StateHistory<T>, n: number): StateHistory<T>;
export declare function nextStateHistory<T>(presentStateHistory: StateHistory<T>, nextPresent: T): StateHistory<T>;
export declare function applyLimits<T>(state: T, limit: number): T;
export declare function isStateHistory<T>(history: Partial<StateHistory<T>>): history is StateHistory<T>;
//# sourceMappingURL=history.d.ts.map