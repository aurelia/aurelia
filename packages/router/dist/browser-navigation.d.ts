import { Key } from '@aurelia/kernel';
import { ILifecycle } from '@aurelia/runtime';
import { HTMLDOM } from '@aurelia/runtime-html';
import { IStoredNavigationEntry } from './navigator';
export interface INavigationStore {
    length: number;
    state: Record<string, unknown>;
    go(delta?: number, suppressPopstate?: boolean): Promise<void>;
    pushNavigationState(state: INavigationState): Promise<void>;
    replaceNavigationState(state: INavigationState): Promise<void>;
    popNavigationState(): Promise<void>;
}
export interface INavigationViewer {
    activate(callback: (ev?: INavigationViewerEvent) => void): Promise<void>;
    deactivate(): void;
}
export interface INavigationViewerEvent {
    event: PopStateEvent;
    state?: INavigationState;
    path: string;
    data: string;
    hash: string;
    instruction: string;
}
export interface INavigationState {
    NavigationEntries: IStoredNavigationEntry[];
    NavigationEntry: IStoredNavigationEntry;
}
export declare class BrowserNavigation implements INavigationStore, INavigationViewer {
    static readonly inject: readonly Key[];
    readonly lifecycle: ILifecycle;
    window: Window;
    history: History;
    location: Location;
    useHash: boolean;
    allowedExecutionCostWithinTick: number;
    private readonly pendingCalls;
    private isActive;
    private callback;
    private forwardedState;
    constructor(lifecycle: ILifecycle, dom: HTMLDOM);
    activate(callback: (ev?: INavigationViewerEvent) => void): Promise<void>;
    deactivate(): void;
    readonly length: number;
    readonly state: Record<string, unknown>;
    go(delta?: number, suppressPopstate?: boolean): Promise<void>;
    pushNavigationState(state: INavigationState): Promise<void>;
    replaceNavigationState(state: INavigationState): Promise<void>;
    popNavigationState(): Promise<void>;
    readonly handlePopstate: (ev: PopStateEvent) => Promise<void>;
    private popstate;
    private popState;
    private forwardState;
    private enqueue;
    private readonly processCalls;
}
//# sourceMappingURL=browser-navigation.d.ts.map