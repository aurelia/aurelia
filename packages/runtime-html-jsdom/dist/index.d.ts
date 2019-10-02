import { IContainer, IRegistry } from '@aurelia/kernel';
export declare const IDOMInitializerRegistration: IRegistry;
/**
 * Default HTML-specific, jsdom-specific implementations for the following interfaces:
 * - `IDOMInitializer`
 */
export declare const DefaultComponents: IRegistry[];
/**
 * A DI configuration object containing html-specific, jsdom-specific registrations:
 * - `RuntimeHtmlConfiguration` from `@aurelia/runtime-html`
 * - `DefaultComponents`
 */
export declare const RuntimeHtmlJsdomConfiguration: {
    /**
     * Apply this configuration to the provided container.
     */
    register(container: IContainer): IContainer;
    /**
     * Create a new container with this configuration applied to it.
     */
    createContainer(): IContainer;
};
//# sourceMappingURL=index.d.ts.map