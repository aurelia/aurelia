import { IContainer, InstanceProvider, IDisposable } from '@aurelia/kernel';
import { IPlatform } from './platform.js';
import type { ICustomElementController } from './templating/controller.js';
export interface ISinglePageApp {
    host: HTMLElement;
    component: unknown;
}
export interface IAppRoot extends AppRoot {
}
export declare const IAppRoot: import("@aurelia/kernel").InterfaceSymbol<IAppRoot>;
export declare class AppRoot implements IDisposable {
    readonly config: ISinglePageApp;
    readonly platform: IPlatform;
    readonly container: IContainer;
    readonly host: HTMLElement;
    controller: ICustomElementController;
    private hydratePromise;
    private readonly enhanceDefinition;
    constructor(config: ISinglePageApp, platform: IPlatform, container: IContainer, rootProvider: InstanceProvider<IAppRoot>, enhance?: boolean);
    activate(): void | Promise<void>;
    deactivate(): void | Promise<void>;
    dispose(): void;
}
//# sourceMappingURL=app-root.d.ts.map