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
import { BasicConfiguration as RuntimeJSDOMBrowserBasicConfiguration } from '@aurelia/runtime-html-jsdom';

const { enter, leave } = Profiler.createTimer('BasicConfiguration');

/**
 * A DI configuration object containing html-specific, jsdom-specific registrations:
 * - `BasicConfiguration` from `@aurelia/runtime-html-jsdom`
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
    RuntimeJSDOMBrowserBasicConfiguration
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
