import { INavigatorState } from './navigator';
export declare class NavigatorStateChangeEvent {
    readonly eventName: string;
    readonly viewerState: NavigatorViewerState;
    readonly event: PopStateEvent;
    readonly state: INavigatorState;
    static eventName: string;
    constructor(eventName: string, viewerState: NavigatorViewerState, event: PopStateEvent, state: INavigatorState);
    static create(viewerState: NavigatorViewerState, ev: PopStateEvent, navigatorState: INavigatorState): NavigatorStateChangeEvent;
}
//# sourceMappingURL=browser-viewer-store.d.ts.map