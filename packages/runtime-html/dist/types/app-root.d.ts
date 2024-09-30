import { InstanceProvider } from '@aurelia/kernel';
import type { Constructable, IContainer, IDisposable } from '@aurelia/kernel';
import type { ICustomElementViewModel, ICustomElementController } from './templating/controller';
import { IPlatform } from './platform';
export interface IAppRootConfig<T extends object = object> {
    host: HTMLElement;
    component: T | Constructable<T>;
    /**
     * When a HTML form is submitted, the default behavior is to "redirect" the page to the action of the form
     * This is not desirable for SPA applications, so by default, this behavior is prevented.
     *
     * This option re-enables the default behavior of HTML forms.
     */
    allowActionlessForm?: boolean;
    /**
     * Indicates strictness of expression evaluation.
     *
     * When strictBinding is true, standard JS behavior applies, which means accessing a property of undefined will throw an error.
     * Use optional syntaxes (?./?.()/?.[]) to prevent errors.
     *
     * When strictBinding is false (default), the behavior is more lenient, which means accessing a property of undefined will return undefined.
     * In this mode, calling an undefined function will return undefined as well.
     */
    strictBinding?: boolean;
}
export interface IAppRoot<C extends object = object> extends IDisposable {
    readonly config: IAppRootConfig<C>;
    /**
     * The host element of an application
     */
    readonly host: HTMLElement;
    /**
     * The root container of an application
     */
    readonly container: IContainer;
    /**
     * The controller of the root custom element of an application
     */
    readonly controller: ICustomElementController<C>;
    /**
     * The platform of an application for providing globals & DOM APIs
     */
    readonly platform: IPlatform;
    activate(): void | Promise<void>;
    deactivate(): void | Promise<void>;
}
export declare const IAppRoot: import("@aurelia/kernel").InterfaceSymbol<IAppRoot<object>>;
export declare class AppRoot<T extends object, K extends ICustomElementViewModel = ICustomElementViewModel & (T extends Constructable<infer R> ? R : T)> implements IAppRoot<K> {
    readonly config: IAppRootConfig<K>;
    readonly container: IContainer;
    readonly host: HTMLElement;
    readonly platform: IPlatform;
    get controller(): ICustomElementController<K>;
    constructor(config: IAppRootConfig<K>, container: IContainer, rootProvider: InstanceProvider<IAppRoot>, enhance?: boolean);
    activate(): void | Promise<void>;
    deactivate(): void | Promise<void>;
    dispose(): void;
}
//# sourceMappingURL=app-root.d.ts.map