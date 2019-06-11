import { QueuedBrowserHistory } from './queued-browser-history';
export interface IHistoryEntry {
    path: string;
    fullStatePath: string;
    index?: number;
    firstEntry?: boolean;
    title?: string;
    query?: string;
    parameters?: Record<string, string>;
    parameterList?: string[];
    data?: Record<string, unknown>;
}
export interface IHistoryOptions {
    callback?(instruction: INavigationInstruction): void;
}
export interface INavigationFlags {
    isFirst?: boolean;
    isNew?: boolean;
    isRefresh?: boolean;
    isForward?: boolean;
    isBack?: boolean;
    isReplace?: boolean;
    isRepeat?: boolean;
}
export interface INavigationInstruction extends IHistoryEntry, INavigationFlags {
    previous?: IHistoryEntry;
}
export declare class HistoryBrowser {
    currentEntry: IHistoryEntry;
    historyEntries: IHistoryEntry[];
    historyOffset: number;
    replacedEntry: IHistoryEntry;
    history: QueuedBrowserHistory;
    location: Location;
    private activeEntry;
    private options;
    private isActive;
    private lastHistoryMovement;
    private isReplacing;
    private isRefreshing;
    constructor();
    activate(options?: IHistoryOptions): Promise<void>;
    deactivate(): void;
    goto(path: string, title?: string, data?: Record<string, unknown>): Promise<void>;
    replace(path: string, title?: string, data?: Record<string, unknown>): Promise<void>;
    refresh(): Promise<void>;
    back(): Promise<void>;
    forward(): Promise<void>;
    cancel(): Promise<void>;
    pop(): Promise<void>;
    setState(key: string | Record<string, unknown>, value?: Record<string, unknown>): Promise<void>;
    getState(key: string): Record<string, unknown>;
    setEntryTitle(title: string): Promise<void>;
    replacePath(path: string, fullStatePath: string, entry: INavigationInstruction): Promise<void>;
    setHash(hash: string): void;
    readonly titles: string[];
    pathChanged: () => Promise<void>;
    private getPath;
    private setPath;
    private getSearch;
    private callback;
}
//# sourceMappingURL=history-browser.d.ts.map