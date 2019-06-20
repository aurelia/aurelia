import { INavigationStore, INavigationViewer } from './browser-navigation';
import { QueueItem } from './queue';
export interface IStoredNavigationEntry {
    instruction: string;
    fullStateInstruction: string;
    index?: number;
    firstEntry?: boolean;
    path?: string;
    title?: string;
    query?: string;
    parameters?: Record<string, string>;
    parameterList?: string[];
    data?: Record<string, unknown>;
}
export interface INavigationEntry extends IStoredNavigationEntry {
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
    viewer?: INavigationViewer;
    store?: INavigationStore;
    callback?(instruction: INavigationInstruction): void;
}
export interface INavigationFlags {
    first?: boolean;
    new?: boolean;
    refresh?: boolean;
    forward?: boolean;
    back?: boolean;
    replace?: boolean;
}
export interface INavigationInstruction extends INavigationEntry {
    navigation?: INavigationFlags;
    previous?: IStoredNavigationEntry;
    repeating?: boolean;
}
interface INavigatorState {
    state: Record<string, unknown>;
    entries: IStoredNavigationEntry[];
    currentEntry: IStoredNavigationEntry;
}
export declare class Navigator {
    currentEntry: INavigationInstruction;
    entries: IStoredNavigationEntry[];
    private readonly pendingNavigations;
    private options;
    private isActive;
    constructor();
    readonly queued: number;
    activate(options?: INavigatorOptions): void;
    deactivate(): void;
    navigate(entry: INavigationEntry): Promise<void>;
    processNavigations: (qEntry: QueueItem<INavigationInstruction>) => void;
    refresh(): Promise<void>;
    go(movement: number): Promise<void>;
    setEntryTitle(title: string): Promise<void>;
    readonly titles: string[];
    getState(): INavigatorState;
    loadState(): void;
    saveState(push?: boolean): Promise<void>;
    toStorableEntry(entry: INavigationInstruction): IStoredNavigationEntry;
    finalize(instruction: INavigationInstruction): Promise<void>;
    cancel(instruction: INavigationInstruction): Promise<void>;
    private invokeCallback;
}
export {};
//# sourceMappingURL=navigator.d.ts.map