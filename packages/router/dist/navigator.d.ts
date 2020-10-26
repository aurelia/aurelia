import { IRoute } from './interfaces';
import { ViewportInstruction } from './viewport-instruction';
import { Scope } from './scope';
import { ICustomElementViewModel } from '@aurelia/runtime-html';
import { Navigation } from './navigation';
export interface IStoredNavigatorEntry {
    instruction: string | ViewportInstruction[];
    fullStateInstruction: string | ViewportInstruction[];
    scope?: Scope | null;
    index?: number;
    firstEntry?: boolean;
    route?: IRoute;
    path?: string;
    title?: string;
    query?: string;
    parameters?: Record<string, unknown>;
    data?: Record<string, unknown>;
}
export interface INavigatorEntry extends IStoredNavigatorEntry {
    fromBrowser?: boolean;
    origin?: ICustomElementViewModel | Element;
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
    callback?(instruction: Navigation): void;
    serializeCallback?(entry: Navigation, entries: Navigation[]): Promise<IStoredNavigatorEntry>;
}
/**
 * Public API - part of INavigationInstruction
 */
export interface INavigationFlags {
    first: boolean;
    new: boolean;
    refresh: boolean;
    forward: boolean;
    back: boolean;
    replace: boolean;
}
//# sourceMappingURL=navigator.d.ts.map