import { Key } from '@aurelia/kernel';
import { ILifecycle } from '@aurelia/runtime';
import { HTMLDOM } from '@aurelia/runtime-html';
import { INavigatorState, INavigatorStore, INavigatorViewer, INavigatorViewerOptions, INavigatorViewerState } from './navigator';
export interface IBrowserNavigatorOptions extends INavigatorViewerOptions {
    useUrlFragmentHash?: boolean;
}
export declare class BrowserNavigator implements INavigatorStore, INavigatorViewer {
    readonly lifecycle: ILifecycle;
    static readonly inject: readonly Key[];
    window: Window;
    history: History;
    location: Location;
    allowedExecutionCostWithinTick: number;
    private readonly pendingCalls;
    private isActive;
    private options;
    private forwardedState;
    constructor(lifecycle: ILifecycle, dom: HTMLDOM);
    activate(options: IBrowserNavigatorOptions): void;
    deactivate(): void;
    readonly length: number;
    readonly state: Record<string, unknown>;
    readonly viewerState: INavigatorViewerState;
    go(delta?: number, suppressPopstate?: boolean): Promise<void>;
    pushNavigatorState(state: INavigatorState): Promise<void>;
    replaceNavigatorState(state: INavigatorState): Promise<void>;
    popNavigatorState(): Promise<void>;
    readonly handlePopstate: (ev: PopStateEvent | null) => Promise<void>;
    private popstate;
    private popState;
    private forwardState;
    private enqueue;
    private readonly processCalls;
}
//# sourceMappingURL=browser-navigator.d.ts.map