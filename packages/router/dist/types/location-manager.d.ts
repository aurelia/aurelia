export interface IPopStateEvent extends PopStateEvent {
}
export interface IHashChangeEvent extends HashChangeEvent {
}
export declare const IBaseHref: import("@aurelia/kernel").InterfaceSymbol<URL>;
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
    constructor();
    startListening(): void;
    stopListening(): void;
    handleEvent(event: IPopStateEvent | IHashChangeEvent): void;
    pushState(state: {} | null, title: string, url: string): void;
    replaceState(state: {} | null, title: string, url: string): void;
    getPath(): string;
    addBaseHref(path: string): string;
    removeBaseHref(path: string): string;
}
//# sourceMappingURL=location-manager.d.ts.map