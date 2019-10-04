import { INavigatorInstruction } from './interfaces';
import { QueueItem } from './queue';
import { IRouter } from './router';
import { ViewportInstruction } from './viewport-instruction';
export interface INavigatorStore {
    length: number;
    state: Record<string, unknown>;
    go(delta?: number, suppressPopstate?: boolean): Promise<void>;
    pushNavigatorState(state: INavigatorState): Promise<void>;
    replaceNavigatorState(state: INavigatorState): Promise<void>;
    popNavigatorState(): Promise<void>;
}
export interface INavigatorViewer {
    activate(options: INavigatorViewerOptions): void;
    deactivate(): void;
}
export interface INavigatorViewerOptions {
    callback(ev: INavigatorViewerEvent): void;
}
export interface INavigatorViewerState {
    path: string;
    query: string;
    hash: string;
    instruction: string;
}
export interface INavigatorViewerEvent extends INavigatorViewerState {
    event: PopStateEvent;
    state?: INavigatorState;
}
export interface IStoredNavigatorEntry {
    instruction: string | ViewportInstruction[];
    fullStateInstruction: string | ViewportInstruction[];
    index?: number;
    firstEntry?: boolean;
    path?: string;
    title?: string;
    query?: string;
    parameters?: Record<string, string>;
    parameterList?: string[];
    data?: Record<string, unknown>;
}
export interface INavigatorEntry extends IStoredNavigatorEntry {
    fromBrowser?: boolean;
    replacing?: boolean;
    refreshing?: boolean;
    repeating?: boolean;
    untracked?: boolean;
    historyMovement?: number;
    resolve?: ((value?: void | PromiseLike<void>) => void);
    reject?: ((value?: void | PromiseLike<void>) => void);
}
export interface INavigatorOptions {
    viewer?: INavigatorViewer;
    store?: INavigatorStore;
    statefulHistoryLength?: number;
    callback?(instruction: INavigatorInstruction): void;
    serializeCallback?(entry: IStoredNavigatorEntry, entries: IStoredNavigatorEntry[]): Promise<IStoredNavigatorEntry>;
}
export interface INavigatorFlags {
    first?: boolean;
    new?: boolean;
    refresh?: boolean;
    forward?: boolean;
    back?: boolean;
    replace?: boolean;
}
export interface INavigatorState {
    state?: Record<string, unknown>;
    entries: IStoredNavigatorEntry[];
    currentEntry: IStoredNavigatorEntry;
}
export declare class Navigator {
    currentEntry: INavigatorInstruction;
    entries: IStoredNavigatorEntry[];
    private readonly pendingNavigations;
    private options;
    private isActive;
    private router;
    private readonly uninitializedEntry;
    constructor();
    readonly queued: number;
    activate(router: IRouter, options?: INavigatorOptions): void;
    deactivate(): void;
    navigate(entry: INavigatorEntry): Promise<void>;
    processNavigations: (qEntry: QueueItem<INavigatorInstruction>) => void;
    refresh(): Promise<void>;
    go(movement: number): Promise<void>;
    setEntryTitle(title: string): Promise<void>;
    readonly titles: string[];
    getState(): INavigatorState;
    loadState(): void;
    saveState(push?: boolean): Promise<void>;
    toStoredEntry(entry: INavigatorInstruction): IStoredNavigatorEntry;
    finalize(instruction: INavigatorInstruction): Promise<void>;
    cancel(instruction: INavigatorInstruction): Promise<void>;
    private invokeCallback;
    private toStoreableEntry;
}
//# sourceMappingURL=navigator.d.ts.map