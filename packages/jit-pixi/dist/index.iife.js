this.au = this.au || {};
this.au.jitPixi = (function (exports, jit, jitHtml, kernel, runtimePixi) {
  'use strict';

  /**
   * A DI configuration object containing html-, pixi- and browser-specific registrations:
   * - `BasicConfiguration` from `@aurelia/runtime-pixi`
   * - `DefaultComponents` from `@aurelia/jit`
   * - `DefaultBindingSyntax` from `@aurelia/jit`
   * - `DefaultBindingLanguage` from `@aurelia/jit`
   * - `DefaultComponents` from `@aurelia/jit-html`
   * - `DefaultBindingLanguage` from `@aurelia/jit-html`
   */
  const BasicConfiguration = {
      /**
       * Apply this configuration to the provided container.
       */
      register(container) {
          return runtimePixi.BasicConfiguration
              .register(container)
              .register(...jit.DefaultBindingLanguage, ...jit.DefaultBindingSyntax, ...jit.DefaultComponents, ...jitHtml.DefaultBindingLanguage, ...jitHtml.DefaultComponents);
      },
      /**
       * Create a new container with this configuration applied to it.
       */
      createContainer() {
          return this.register(kernel.DI.createContainer());
      }
  };

  exports.BasicConfiguration = BasicConfiguration;

  return exports;

}({}, jit, jitHtml, kernel, runtimePixi));
//# sourceMappingURL=index.iife.js.map
