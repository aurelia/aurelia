import {
  DefaultBindingLanguage as JitDefaultBindingLanguage,
  DefaultBindingSyntax as JitDefaultBindingSyntax,
  DefaultComponents as JitDefaultComponents
} from '@aurelia/jit';
import {
  DefaultBindingLanguage as JitHtmlDefaultBindingLanguage,
  DefaultComponents as JitHtmlDefaultComponents
} from '@aurelia/jit-html';
import { DI, IContainer } from '@aurelia/kernel';
import { BasicConfiguration as RuntimeHtmlBrowserBasicConfiguration } from '@aurelia/runtime-html-browser';

/**
 * A DI configuration object containing html-specific, browser-specific registrations:
 * - `BasicConfiguration` from `@aurelia/runtime-html-browser`
 * - `DefaultComponents` from `@aurelia/jit`
 * - `DefaultBindingSyntax` from `@aurelia/jit`
 * - `DefaultBindingLanguage` from `@aurelia/jit`
 * - `DefaultComponents` from `@aurelia/jit-html`
 * - `DefaultBindingLanguage` from `@aurelia/jit-html`
 */
export const BasicConfiguration = {
  /**
   * Apply this configuration to the provided container.
   */
  register(container: IContainer): IContainer {
    return RuntimeHtmlBrowserBasicConfiguration
      .register(container)
      .register(
        ...JitDefaultBindingLanguage,
        ...JitDefaultBindingSyntax,
        ...JitDefaultComponents,
        ...JitHtmlDefaultBindingLanguage,
        ...JitHtmlDefaultComponents
      );
  },
  /**
   * Create a new container with this configuration applied to it.
   */
  createContainer(): IContainer {
    return this.register(DI.createContainer());
  }
};
