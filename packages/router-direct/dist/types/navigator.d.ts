import { Navigation, INavigation } from './navigation';
export declare class NavigatorNavigateEvent {
    readonly eventName: string;
    readonly navigation: Navigation;
    static eventName: string;
    constructor(eventName: string, navigation: Navigation);
    static create(navigation: INavigation): NavigatorNavigateEvent;
}
export interface INavigatorOptions {
    viewer?: INavigatorViewer;
    store?: INavigatorStore;
    statefulHistoryLength?: number;
}
//# sourceMappingURL=navigator.d.ts.map