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
import { BasicConfiguration as RuntimeHtmlBrowserBasicConfiguration } from '@aurelia/runtime-html-browser';

const { enter, leave } = Profiler.createTimer('BasicConfiguration');

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
    if (Profiler.enabled) { enter(); }
    RuntimeHtmlBrowserBasicConfiguration
      .register(container)
      .register(
        ...JitDefaultBindingLanguage,
        ...JitDefaultBindingSyntax,
        ...JitDefaultComponents,
        ...JitHtmlDefaultBindingLanguage,
        ...JitHtmlDefaultComponents
      );
    if (Profiler.enabled) { leave(); }
    return container;
  },
  /**
   * Create a new container with this configuration applied to it.
   */
  createContainer(): IContainer {
    if (Profiler.enabled) { enter(); }
    const container = this.register(DI.createContainer());
    if (Profiler.enabled) { leave(); }
    return container;
  }
};
