import { IScheduler } from '@aurelia/runtime';
import { HTMLDOM } from '@aurelia/runtime-html';
import { INavigatorState, INavigatorStore, INavigatorViewer, INavigatorViewerOptions, INavigatorViewerState } from './navigator';
import { QueueTask } from './task-queue';
interface IAction {
    execute(task: QueueTask<IAction>, resolve?: ((value?: void | PromiseLike<void>) => void) | null | undefined, suppressEvent?: boolean): void;
}
interface IForwardedState {
    eventTask: QueueTask<IAction> | null;
    suppressPopstate: boolean;
}
export interface IBrowserViewerStoreOptions extends INavigatorViewerOptions {
    useUrlFragmentHash?: boolean;
}
export declare class BrowserViewerStore implements INavigatorStore, INavigatorViewer {
    readonly scheduler: IScheduler;
    window: Window;
    history: History;
    location: Location;
    allowedExecutionCostWithinTick: number;
    private readonly pendingCalls;
    private isActive;
    private options;
    private forwardedState;
    constructor(scheduler: IScheduler, dom: HTMLDOM);
    activate(options: IBrowserViewerStoreOptions): void;
    deactivate(): void;
    get length(): number;
    get state(): Record<string, unknown>;
    get viewerState(): INavigatorViewerState;
    go(delta: number, suppressPopstateEvent?: boolean): Promise<void>;
    pushNavigatorState(state: INavigatorState): Promise<void>;
    replaceNavigatorState(state: INavigatorState): Promise<void>;
    popNavigatorState(): Promise<void>;
    readonly handlePopstate: (event: PopStateEvent) => Promise<void>;
    popState(doneTask: QueueTask<IAction>): Promise<void>;
    forwardState(state: IForwardedState): void;
    popstate(ev: PopStateEvent, eventTask: QueueTask<IAction> | null, suppressPopstate?: boolean): Promise<void>;
}
export {};
//# sourceMappingURL=browser-viewer-store.d.ts.map