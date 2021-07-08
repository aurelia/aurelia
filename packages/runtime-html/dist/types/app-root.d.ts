import { InstanceProvider, ILogger } from '@aurelia/kernel';
import type { IContainer, IDisposable } from '@aurelia/kernel';
import type { ICustomElementController } from './templating/controller.js';
import type { IPlatform } from './platform.js';
export interface ISinglePageApp {
    host: HTMLElement;
    component: unknown;
}
export interface IAppRoot extends AppRoot {
}
export declare const IAppRoot: import("@aurelia/kernel").InterfaceSymbol<IAppRoot>;
export interface IWorkTracker extends WorkTracker {
}
export declare const IWorkTracker: import("@aurelia/kernel").InterfaceSymbol<IWorkTracker>;
export declare class WorkTracker {
    private readonly logger;
    private stack;
    private promise;
    private resolve;
    constructor(logger: ILogger);
    start(): void;
    finish(): void;
    wait(): Promise<void>;
}
export declare class AppRoot implements IDisposable {
    readonly config: ISinglePageApp;
    readonly platform: IPlatform;
    readonly container: IContainer;
    readonly host: HTMLElement;
    controller: ICustomElementController;
    work: IWorkTracker;
    private hydratePromise;
    private readonly enhanceDefinition;
    constructor(config: ISinglePageApp, platform: IPlatform, container: IContainer, rootProvider: InstanceProvider<IAppRoot>, enhance?: boolean);
    activate(): void | Promise<void>;
    deactivate(): void | Promise<void>;
    dispose(): void;
}
//# sourceMappingURL=app-root.d.ts.map