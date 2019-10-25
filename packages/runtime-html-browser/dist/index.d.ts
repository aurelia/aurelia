import { IContainer, IRegistry, IResolver, Key } from '@aurelia/kernel';
import { IDOM, IDOMInitializer, ISinglePageApp } from '@aurelia/runtime';
import { BrowserScheduler } from './browser-scheduler';
declare class BrowserDOMInitializer implements IDOMInitializer {
    static readonly inject: readonly Key[];
    private readonly container;
    constructor(container: IContainer);
    static register(container: IContainer): IResolver<IDOMInitializer>;
    initialize(config?: ISinglePageApp<Node>): IDOM;
}
export declare const IDOMInitializerRegistration: IRegistry;
export declare const IBrowserSchedulerRegistration: IRegistry;
/**
 * Default HTML-specific, browser-specific implementations for the following interfaces:
 * - `IDOMInitializer`
 */
export declare const DefaultComponents: IRegistry[];
/**
 * A DI configuration object containing html-specific, browser-specific registrations:
 * - `RuntimeHtmlConfiguration` from `@aurelia/runtime-html`
 * - `DefaultComponents`
 */
export declare const RuntimeHtmlBrowserConfiguration: {
    /**
     * Apply this configuration to the provided container.
     */
    register(container: IContainer): IContainer;
    /**
     * Create a new container with this configuration applied to it.
     */
    createContainer(): IContainer;
};
export { BrowserDOMInitializer, BrowserScheduler, };
//# sourceMappingURL=index.d.ts.map