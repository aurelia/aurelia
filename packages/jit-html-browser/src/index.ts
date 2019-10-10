import {
  DefaultBindingLanguage as JitDefaultBindingLanguage,
  DefaultBindingSyntax as JitDefaultBindingSyntax,
  DefaultComponents as JitDefaultComponents
} from '@aurelia/jit';
import {
  DefaultBindingLanguage as JitHtmlDefaultBindingLanguage,
  DefaultComponents as JitHtmlDefaultComponents
} from '@aurelia/jit-html';
import { DI, IContainer, Profiler } from '@aurelia/kernel';
import { RuntimeHtmlBrowserConfiguration } from '@aurelia/runtime-html-browser';

const { enter, leave } = Profiler.createTimer('JitHtmlBrowserConfiguration');

/**
 * A DI configuration object containing html-specific, browser-specific registrations:
 * - `RuntimeHtmlBrowserConfiguration` from `@aurelia/runtime-html-browser`
 * - `DefaultComponents` from `@aurelia/jit`
 * - `DefaultBindingSyntax` from `@aurelia/jit`
 * - `DefaultBindingLanguage` from `@aurelia/jit`
 * - `DefaultComponents` from `@aurelia/jit-html`
 * - `DefaultBindingLanguage` from `@aurelia/jit-html`
 */
export const JitHtmlBrowserConfiguration = {
  /**
   * Apply this configuration to the provided container.
   */
  register(container: IContainer): IContainer {
    RuntimeHtmlBrowserConfiguration
      .register(container)
      .register(
        ...JitDefaultBindingLanguage,
        ...JitDefaultBindingSyntax,
        ...JitDefaultComponents,
        ...JitHtmlDefaultBindingLanguage,
        ...JitHtmlDefaultComponents
      );
    return container;
  },
  /**
   * Create a new container with this configuration applied to it.
   */
  createContainer(): IContainer {
    const container = this.register(DI.createContainer());
    return container;
  }
};
