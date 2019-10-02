import { IContainer } from '@aurelia/kernel';
/**
 * A DI configuration object containing html-specific, jsdom-specific registrations:
 * - `RuntimeHtmlJsdomConfiguration` from `@aurelia/runtime-html-jsdom`
 * - `DefaultComponents` from `@aurelia/jit`
 * - `DefaultBindingSyntax` from `@aurelia/jit`
 * - `DefaultBindingLanguage` from `@aurelia/jit`
 * - `DefaultComponents` from `@aurelia/jit-html`
 * - `DefaultBindingLanguage` from `@aurelia/jit-html`
 */
export declare const JitHtmlJsdomConfiguration: {
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