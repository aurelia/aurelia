import { IContainer, InstanceProvider, IDisposable } from '@aurelia/kernel';
import { BindingStrategy } from '@aurelia/runtime';
import { IPlatform } from './platform';
import type { ICustomElementController } from './templating/controller';
export interface ISinglePageApp {
    strategy?: BindingStrategy;
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
    private readonly strategy;
    constructor(config: ISinglePageApp, platform: IPlatform, container: IContainer, rootProvider: InstanceProvider<IAppRoot>, enhance?: boolean);
    activate(): void | Promise<void>;
    deactivate(): void | Promise<void>;
    dispose(): void;
}
//# sourceMappingURL=app-root.d.ts.map