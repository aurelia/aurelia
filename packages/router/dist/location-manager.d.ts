import { ILogger } from '@aurelia/kernel';
import { IHistory, ILocation, IWindow } from '@aurelia/runtime-html';
import { IRouterEvents } from './router-events.js';
export interface IPopStateEvent extends PopStateEvent {
}
export interface IHashChangeEvent extends HashChangeEvent {
}
export declare const IBaseHrefProvider: import("@aurelia/kernel").InterfaceSymbol<IBaseHrefProvider>;
export interface IBaseHrefProvider extends BrowserBaseHrefProvider {
}
export declare class BaseHref {
    readonly path: string;
    readonly rootedPath: string;
    constructor(path: string, rootedPath: string);
}
/**
 * Default browser base href provider.
 *
 * Retrieves the base href based on the `<base>` element from `window.document.head`
 *
 * This is internal API for the moment. The shape of this API (as well as in which package it resides) is also likely temporary.
 */
export declare class BrowserBaseHrefProvider {
    private readonly window;
    constructor(window: IWindow);
    getBaseHref(): BaseHref | null;
}
export declare const ILocationManager: import("@aurelia/kernel").InterfaceSymbol<ILocationManager>;
export interface ILocationManager extends BrowserLocationManager {
}
/**
 * Default browser location manager.
 *
 * Encapsulates all DOM interactions (`window`, `location` and `history` apis) and exposes them in an environment-agnostic manner.
 *
 * This is internal API for the moment. The shape of this API (as well as in which package it resides) is also likely temporary.
 */
export declare class BrowserLocationManager {
    private readonly logger;
    private readonly events;
    private readonly history;
    private readonly location;
    private readonly window;
    private readonly baseHrefProvider;
    private readonly baseHref;
    private eventId;
    constructor(logger: ILogger, events: IRouterEvents, history: IHistory, location: ILocation, window: IWindow, baseHrefProvider: IBaseHrefProvider);
    startListening(): void;
    stopListening(): void;
    private onPopState;
    private onHashChange;
    pushState(state: {} | null, title: string, url: string): void;
    replaceState(state: {} | null, title: string, url: string): void;
    getPath(): string;
    currentPathEquals(path: string): boolean;
    addBaseHref(path: string): string;
    removeBaseHref(path: string): string;
}
//# sourceMappingURL=location-manager.d.ts.map