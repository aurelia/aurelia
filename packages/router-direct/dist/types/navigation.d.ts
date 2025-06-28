import { ICustomElementViewModel } from '@aurelia/runtime-html';
import { RoutingInstruction } from './instructions/routing-instruction';
import { RoutingScope } from './routing-scope';
import { OpenPromise } from './utilities/open-promise';
export interface IStoredNavigation extends Omit<StoredNavigation, 'toStoredNavigation'> {
}
/**
 * The stored navigation holds the part of a navigation that's stored
 * in history. Note that the data might not be json serializable and
 * therefore might not be able to be stored as-is.
 */
export declare class StoredNavigation {
    /**
     * The routing instruction for the navigation
     */
    instruction: string | RoutingInstruction[];
    /**
     * A routing instruction describing the full navigational state once
     * this navigation has been performed. Used when restoring a previous
     * state.
     */
    fullStateInstruction: string | RoutingInstruction[];
    /**
     * The starting scope of the navigation
     */
    scope?: RoutingScope | null;
    /**
     * The historical index of the navigation
     */
    index?: number;
    /**
     * Whether the navigation is the first in the sesseion. Index might change
     * to not require first === 0, firstEntry should be reliable
     */
    firstEntry?: boolean;
    /**
     * The URL (Location) path of the navigation
     */
    path?: string;
    /**
     * The (resulting) title of the navigation
     */
    title?: string;
    /**
     * The query of the navigation
     */
    query?: string;
    /**
     * The fragment of the navigation
     */
    fragment?: string;
    /**
     * The parameters of the navigation
     */
    parameters?: Record<string, unknown>;
    /**
     * The data of the navigation
     */
    data?: Record<string, unknown>;
    constructor(entry?: IStoredNavigation);
    toStoredNavigation(): IStoredNavigation;
}
export declare class NavigationFlags {
    first: boolean;
    new: boolean;
    refresh: boolean;
    forward: boolean;
    back: boolean;
    replace: boolean;
}
export interface INavigation extends Partial<Omit<Navigation, 'instruction' | 'fullStateInstruction' | 'navigation' | 'toStoredNavigation' | 'useFullStateInstruction' | 'process' | 'timestamp'>> {
    instruction: string | RoutingInstruction[];
    fullStateInstruction: string | RoutingInstruction[];
}
/**
 * The navigation
 */
export declare class Navigation extends StoredNavigation {
    /**
     * The navigation in a historical context (back, forward, etc)
     */
    navigation: NavigationFlags;
    /**
     * Whether this is a repeating navigation, in other words the same navigation run again
     */
    repeating: boolean;
    /**
     * The previous navigation
     */
    previous: Navigation | null;
    /**
     * Whether the navigation originates from a browser action (back, forward)
     */
    fromBrowser: boolean;
    /**
     * The origin of the navigation, a view model or element
     */
    origin: ICustomElementViewModel | Element | null;
    /**
     * Whether this navigation is fully replacing a previous one
     */
    replacing: boolean;
    /**
     * Whether this navigation is a refresh/reload with the same parameters
     */
    refreshing: boolean;
    /**
     * Whether this navigation is untracked and shouldn't be added to history
     */
    untracked: boolean;
    /**
     * How the navigation has moved in history compared to previous navigation
     */
    historyMovement?: number;
    /**
     * The process of the navigation, to be resolved or rejected
     */
    process: OpenPromise<boolean> | null;
    /**
     * When the navigation is created. Only used within session so no need to
     * persist it.
     */
    timestamp: number;
    /**
     * Whether the navigation is completed
     */
    completed?: boolean;
    constructor(entry?: INavigation | Navigation);
    get useFullStateInstruction(): boolean;
    static create(entry?: INavigation): Navigation;
}
//# sourceMappingURL=navigation.d.ts.map